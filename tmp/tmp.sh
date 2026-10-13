#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define your desired MySQL root password
DB_ROOT_PASSWORD="YourSecurePassword123!"

echo "Updating package index..."
sudo apt-get update -y

echo "Pre-configuring MySQL root password selections..."
# This prevents the interactive prompt during installation
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password password $DB_ROOT_PASSWORD"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $DB_ROOT_PASSWORD"

echo "Installing MySQL Server non-interactively..."
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server

echo "Starting and enabling MySQL service..."
sudo systemctl start mysql
sudo systemctl enable mysql

echo "Applying root password via MySQL shell..."
# Modern Ubuntu repositories install MySQL 8+, which defaults to 'auth_socket' for local root login.
# This command ensures password authentication is enforced and applies your password.
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_ROOT_PASSWORD'; FLUSH PRIVILEGES;"

echo "Verifying installation status..."
sudo systemctl status mysql --no-pager

echo "MySQL installation complete!"