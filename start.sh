#!/usr/bin/env bash
#
# Start the OpticFeed app on your own machine.
#
# Checks that everything the app needs is in place before starting it, so a
# missing tool or a skipped install gives you a sentence to read instead of a
# stack trace.
#
#   ./start.sh              start the app on http://localhost:3000
#   ./start.sh --dev        restart automatically when you save a file
#   ./start.sh --port 4000  listen somewhere other than port 3000
#   ./start.sh --help       show this message
#
# This is for development. On a server, systemd starts the app instead --
# see deploy/setup-ec2.sh and deploy/optic-feed.service.
#
# Works on macOS and Linux. On Windows, Git Bash can be used for this script,
# but it is recommended to use WSL with an Ubuntu instance if issues occur



# Bash "strict mode": stop on the first error (-e), stop on an undefined
# variable (-u), and let a failure anywhere in a pipeline fail the whole
# pipeline (-o pipefail). Without these, a script keeps going after a step
# fails and leaves you guessing about what went wrong.
set -euo pipefail

# The package.json "engines" field asks for this too. Keep the two in step.
REQUIRED_NODE_MAJOR=22

DEV_MODE="false"
PORT_OVERRIDE=""

# --- helpers ----------------------------------------------------------------

say() {
    printf '==> %s\n' "$1"
}

die() {
    printf 'ERROR: %s\n' "$1" >&2
    exit 1
}

usage() {
    # Print this file's own comment block as the help text, so the help and the
    # documentation can never drift apart.
    awk 'NR>1 { if (/^#/) { sub(/^# ?/, ""); print } else { exit } }' "$0"
    exit 0
}

start_mysql() {
    local os="unknown"

    # Detect the operating system
    case "$(uname -s)" in
        Linux*)
            os="linux"
            ;;
        Darwin*)
            os="macos"
            ;;
        MINGW*|MSYS*)
            os="windows"
            ;;
        *)
            echo "Unsupported OS: $(uname -s)" >&2
            return 1
            ;;
    esac

    echo "Detected OS: $os"

    # Start MySQL using the appropriate service manager
    case "$os" in
        linux)
            if command -v systemctl >/dev/null 2>&1; then
                if systemctl list-unit-files mysql.service \
                    --no-legend 2>/dev/null | grep -q mysql.service; then
                    sudo systemctl start mysql
                else
                    sudo systemctl start mysqld
                fi
            else
                echo "systemctl is unavailable." >&2
                return 1
            fi
            ;;

        macos)
            if command -v brew >/dev/null 2>&1; then
                brew services start mysql
            else
                echo "Homebrew not found. Start MySQL manually." >&2
                return 1
            fi
            ;;

        windows)
            if sc.exe query "MySQL80" | grep -q "RUNNING"; then
                echo "MySQL Server (MySQL80) is already running, skipping server startup."
            elif net start MySQL80; then
                echo "MySQL started successfully!"
            else
                echo "Could not start MySQL. Try running Git Bash as Administrator."
                return 1
            fi
    esac
}

# --- options ----------------------------------------------------------------

# getopts (the shell builtin) only handles single-letter flags, so the long
# options are parsed by hand. Do NOT reach for the `getopt` command instead:
# macOS ships an old BSD version that does not support them either.
while [ $# -gt 0 ]; do
    case "$1" in
        -d|--dev)
            DEV_MODE="true"
            shift
            ;;
        -p|--port)
            [ $# -ge 2 ] || die "--port needs a number, for example: --port 4000"
            # Check it here, before the script does any real work. Failing on
            # bad input after a two-minute npm install is just rude.
            case "$2" in
                ''|*[!0-9]*) die "--port needs a number, got '$2'" ;;
            esac
            [ "$2" -ge 1 ] && [ "$2" -le 65535 ] \
                || die "Port must be between 1 and 65535."
            PORT_OVERRIDE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            die "unknown option '$1' (try --help)"
            ;;
    esac
done

# Run from the project root no matter where this script was called from.
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# --- checks -----------------------------------------------------------------

command -v node >/dev/null 2>&1 \
    || die "Node.js is not installed. Get it from https://nodejs.org (version ${REQUIRED_NODE_MAJOR} or newer)."

# Let Node compare its own version rather than parsing version strings in bash.
if ! node -e "process.exit(Number(process.versions.node.split('.')[0]) >= ${REQUIRED_NODE_MAJOR} ? 0 : 1)"; then
    die "Node $(node --version) is too old. This app needs version ${REQUIRED_NODE_MAJOR} or newer."
fi

command -v npm >/dev/null 2>&1 || die "npm is not installed, but Node.js is. Reinstall Node from https://nodejs.org."

[ -f package.json ] || die "no package.json here. Run this script from inside the project folder."

command -v mysqld 2>&1 || die "MySQL Server is not installed. Install MySQL Server as instructed in the README."


# Create .env with a random password on first run
if [ ! -f .env ]; then
echo ".env is missing, creating a new .env file with default values"
  # Generates random 64-character string for the password
  password="$(node -p 'require("crypto").randomBytes(32).toString("hex")')"

  cat > .env <<EOF
DB_HOST=localhost
DB_NAME=optic_feed
DB_PORT=3306
DB_USER=root
DB_PASSWORD=${password}
EOF

  echo ".env creation complete. Be sure to change these values later for better security!"

else 
echo ".env file found! Using variables provided in .env"
fi


# Install dependencies on the first run, and again when they change (which is
# what happens right after a git pull).
#
# The marker to compare against is node_modules/.package-lock.json, which npm
# writes at the end of every install. Comparing against the node_modules
# directory itself does not work: npm often leaves its timestamp alone, so the
# check would fire on every single run.
INSTALL_MARKER="node_modules/.package-lock.json"

if [ ! -d node_modules ]; then
    say "Installing dependencies (this happens once, and takes a moment)"
    npm install
elif [ ! -f "$INSTALL_MARKER" ] || [ package-lock.json -nt "$INSTALL_MARKER" ]; then
    say "Dependencies changed since your last install, updating them"
    npm install
fi

# TODO setup MySQL database and populate tables with initial data

# Start the MySQL server and create the database
echo "Starting the MySQL Server..."
start_mysql

echo "Server started. Now creating the database and populating with sample data."
npm run seed

# --- start ------------------------------------------------------------------

if [ -n "$PORT_OVERRIDE" ]; then
    export PORT="$PORT_OVERRIDE"
fi

PORT_IN_USE="${PORT_OVERRIDE:-3000}"
say "Starting Next.js on http://localhost:${PORT_IN_USE} -- press Ctrl+C to stop"

if [ "$DEV_MODE" = "true" ]; then
    say "Dev mode: the server restarts when you save a file"
    # exec replaces this shell with node, so Ctrl+C reaches node directly
    # instead of killing this wrapper and orphaning the server.
    exec npm run dev -- --port "${PORT_IN_USE}"
fi

npm run build
exec npm run start -- --port "${PORT_IN_USE}"