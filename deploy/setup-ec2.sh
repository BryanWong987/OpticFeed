#!/usr/bin/env bash
#
# One-time setup for a fresh EC2 instance.
#
# Copy this whole deploy/ folder to the server and run it once as root:
#
#   scp -i mykey.pem -r deploy ubuntu@<PUBLIC-IP>:~
#   ssh -i mykey.pem ubuntu@<PUBLIC-IP>
#
# (On Amazon Linux the login user is ec2-user instead of ubuntu.)
#   sudo bash deploy/setup-ec2.sh
#
# It installs Node.js and nginx, creates the service account and directories,
# and registers the app with systemd so it starts on boot. After this, use
# deploy/deploy.sh from your laptop to push code.
#
# Works on Amazon Linux 2023 and on Ubuntu 22.04/24.04.

# Bash "strict mode": stop on the first error (-e), stop on an undefined
# variable (-u), and make a failing command inside a pipeline fail the whole
# pipeline (-o pipefail). Without these a script happily keeps going after a
# step fails and leaves you with a half configured server.
set -euo pipefail

APP_NAME="optic-feed"
APP_DIR="/opt/optic-feed"
APP_USER="user1234"
NODE_MAJOR="22"

# The directory this script lives in, so it can find the files next to it no
# matter where it was called from.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# The human who ran `sudo`. They get write access to APP_DIR so that rsync from
# a laptop works without sudo on the far end.
DEPLOY_USER="${SUDO_USER:-root}"

# --- helpers ----------------------------------------------------------------

# Print a step heading so the output is easy to follow.
say() {
    printf '\n==> %s\n' "$1"
}

die() {
    printf 'ERROR: %s\n' "$1" >&2
    exit 1
}

# --- checks -----------------------------------------------------------------

[ "$(id -u)" -eq 0 ] || die "run this with sudo: sudo bash $0"

# /etc/os-release exists on every modern Linux and tells us which distro we are
# on. We need to know because Amazon Linux uses dnf and Ubuntu uses apt.
[ -r /etc/os-release ] || die "cannot read /etc/os-release; unsupported system"
# shellcheck disable=SC1091
. /etc/os-release

case "${ID:-}" in
    amzn|rhel|centos|fedora)
        PKG="dnf"
        ;;
    ubuntu|debian)
        PKG="apt"
        export DEBIAN_FRONTEND=noninteractive
        ;;
    *)
        die "unsupported distribution '${ID:-unknown}'; expected Amazon Linux or Ubuntu"
        ;;
esac

say "Detected ${PRETTY_NAME:-$ID} (package manager: $PKG)"

# --- packages ---------------------------------------------------------------
say "Installing Node.js ${NODE_MAJOR}, nginx, and MySQL"

if [ "$PKG" = "dnf" ]; then
    dnf -y update
    # NodeSource publishes newer Node versions than the distro repositories do.
    curl -fsSL "https://rpm.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
    dnf -y install nodejs nginx rsync mysql-server
else
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg rsync
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
    apt-get install -y nodejs nginx mysql-server
fi

say "Node $(node --version), npm $(npm --version), 'MySQL Server $(mysqld --version)'"

# --- service account and directories ----------------------------------------

say "Creating the '$APP_USER' service account"

# id fails when the user does not exist, which is how we test for it. The app
# never needs to log in, so it gets no shell and no home directory.
if ! id "$APP_USER" >/dev/null 2>&1; then
    useradd --system --no-create-home --shell /usr/sbin/nologin "$APP_USER"
else
    echo "user '$APP_USER' already exists, leaving it alone"
fi

say "Creating $APP_DIR"

mkdir -p "$APP_DIR"

# The person deploying owns the code directory so they can rsync into it.
chown -R "$DEPLOY_USER:$APP_USER" "$APP_DIR"
chmod 770 "$APP_DIR"


# --- systemd ----------------------------------------------------------------

say "Installing the $APP_NAME systemd service"

install -m 644 "$SCRIPT_DIR/${APP_NAME}.service" "/etc/systemd/system/${APP_NAME}.service"
systemctl daemon-reload
systemctl enable "$APP_NAME"

# --- nginx ------------------------------------------------------------------

say "Configuring nginx as a reverse proxy on port 80"

install -m 644 "$SCRIPT_DIR/nginx-optic-feed.conf" "/etc/nginx/conf.d/${APP_NAME}.conf"

# Ubuntu ships a default site that also claims port 80. Two default servers on
# one port is an error, so remove theirs.
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm -f /etc/nginx/sites-enabled/default
fi

# On SELinux systems nginx is not allowed to open network connections (and so
# cannot proxy to Node) until this switch is flipped.
if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" != "Disabled" ]; then
    setsebool -P httpd_can_network_connect 1 || true
fi

# Always check the config before restarting: a typo here takes the site down.
nginx -t
systemctl enable nginx
systemctl restart nginx

systemctl enable --now mysql

# --- MySQL Credentials Setup -------------
if [ -f .env ]; then
    # Export variables dynamically while ignoring comments
    export $(echo $(grep -v '^#' .env | xargs))
else
    # Create new .env file with random password
    password="$(node -p 'require("crypto").randomBytes(32).toString("hex")')"
    session_secret="$(node -p 'require("crypto").randomBytes(32).toString("hex")')"

    cat > .env <<EOF
DB_HOST=localhost
DB_NAME=optic_feed
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=${password}

SESSION_SECRET=${session_secret}
EOF

    say ".env created with db user \"root\" and random hashed password."
    export $(echo $(grep -v '^#' .env | xargs))
fi

# Validate required variables
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    say "Error: Missing required database variables in .env file."
    exit 1
fi

# Execute MySQL commands as root using a heredoc
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;

USE \`${DB_NAME}\`;

DROP TABLE comments, posts, topics, accounts;

CREATE TABLE IF NOT EXISTS accounts (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    preferences VARCHAR(1000),
    img_path VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS topics (
    topic_id INT AUTO_INCREMENT PRIMARY KEY,
    topic_type VARCHAR(20) NOT NULL,
    title VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    status VARCHAR(10) NOT NULL,
    interested_count INT,
    topic_body VARCHAR(2000)
);

CREATE TABLE IF NOT EXISTS posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id int NOT NULL,
    creator_id int NOT NULL,
    title VARCHAR(200) NOT NULL,
    views INT NOT NULL,
    comments int NOT NULL,
    post_body VARCHAR(2000) NOT NULL,

    CONSTRAINT fkey_topics
        FOREIGN KEY (topic_id) REFERENCES topics(topic_id),

    CONSTRAINT fkey_post_creator
        FOREIGN KEY (creator_id) REFERENCES accounts(user_id)
);

CREATE TABLE IF NOT EXISTS comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id int,
    post_id int NOT NULL,
    user_id int NOT NULL,
    comment_body VARCHAR(2000) NOT NULL,

    CONSTRAINT fkey_comments
        FOREIGN KEY (parent_id) REFERENCES comments(comment_id),

    CONSTRAINT fkey_posts
        FOREIGN KEY (post_id) REFERENCES posts(post_id),

    CONSTRAINT fkey_comment_user
    FOREIGN KEY (user_id) REFERENCES accounts(user_id)
);
EOF

say "Database '${DB_NAME}' and user '${DB_USER}' configured successfully!"
say "Database 'Created accounts, posts, comments, and topics tables"




# --- firewall ---------------------------------------------------------------

# EC2 security groups are the firewall that matters, but Ubuntu images sometimes
# have ufw switched on as well.
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
    say "Opening ports 80 and 22 in ufw"
    ufw allow 80/tcp
    ufw allow 22/tcp
fi

# --- done -------------------------------------------------------------------

cat <<EOF

==> Server setup is complete!

The app is registered but not running yet, because no code has been deployed.
From your laptop, in the project folder, run:

    ./deploy/deploy.sh -h <PUBLIC-IP-OR-DNS> -i ~/path/to/key.pem

Then open http://<PUBLIC-IP> in a browser.

Make sure your EC2 security group allows inbound TCP port 80 from 0.0.0.0/0
and port 22 from your own IP address.

Handy commands on this server:
    sudo systemctl status $APP_NAME
    journalctl -u $APP_NAME -f
    sudo systemctl restart $APP_NAME
    sudo systemctl (start/restart/stop/status) mysql

EOF