#!/bin/bash

# Define database credentials and configuration
DB_USER="root"
DB_PASS="your_secure_password"
DB_HOST="localhost"
DB_NAME="company_db"

# Execute the MySQL commands using a Heredoc
mysql -h "\$DB_HOST" -u "\(DB_USER" -p"\)DB_PASS" <<EOF

-- 1. Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;
USE \`$DB_NAME\`;

-- 2. Drop the table if it already exists (useful for clean testing seeds)
DROP TABLE IF EXISTS accounts;

-- 3. Create the table structure
CREATE TABLE accounts (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    preferences VARCHAR(1000),
    img_path VARCHAR(200)
);

CREATE TABLE topics (
    topic_id INT AUTO_INCREMENT PRIMARY KEY,
    topic_type VARCHAR(20) NOT NULL,
    title VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(10) NOT NULL,
    interested_count INT,
    topic_body VARCHAR(2000)
);

CREATE TABLE posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id int NOT NULL,
    creator_id int NOT NULL,
    title VARCHAR(200) NOT NULL,
    views INT NOT NULL,
    comments int NOT NULL,
    post_body VARCHAR(2000) NOT NULL,
    CONSTRAINT fkey_topics
        FOREIGN KEY (topic_id) REFERENCES topics(topic_id)
);

CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id int,
    post_id int NOT NULL,
    user_id int NOT NULL,
    comment_body VARCHAR(2000) NOT NULL

    CONSTRAINT fkey_comments
        FOREIGN KEY (parent_id) REFERENCES comments(comment_id),

    CONSTRAINT fkey_posts
        FOREIGN KEY (post_id) REFERENCES posts(post_id)
);

-- 4. Insert sample data rows
INSERT INTO accounts (username, email, password) VALUES
('admin', 'admin@admin.com', 'vaz2t45rbha2'),
('CoolUser123', 'john.doe@example.com', 'j24tgfde23g41ja'),

-- 5. Optional verification printout to the terminal
SELECT 'Table successfully created! Current records:' AS '';
SELECT user_id, username, email, FROM accounts;

EOF