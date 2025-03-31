-- ------------------------------
-- USERS TABLE
-- ------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------
-- CHATS TABLE
-- ------------------------------
CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------
-- CHAT_MESSAGES TABLE
-- ------------------------------
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender ENUM('user', 'ai', 'system') NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- ------------------------------
-- MEMORIES TABLE
-- ------------------------------
CREATE TABLE memories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255),
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------
-- MEMORY_TAGS TABLE
-- ------------------------------
CREATE TABLE memory_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    memory_id INT NOT NULL,
    tag VARCHAR(64),
    FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
);

-- File: /database/schema.sql (continued)

-- ------------------------------
-- SQL LOGS TABLE
-- ------------------------------
CREATE TABLE sql_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    severity ENUM('info', 'warning', 'error', 'critical') NOT NULL,
    message TEXT NOT NULL,
    source_file VARCHAR(128),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------
-- JS LOGS TABLE
-- ------------------------------
CREATE TABLE js_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    severity ENUM('info', 'warning', 'error', 'critical') NOT NULL,
    message TEXT NOT NULL,
    file VARCHAR(128),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------
-- GENERAL ERROR LOG ENTRIES
-- ------------------------------
CREATE TABLE error_log_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('php', 'js', 'css', 'html', 'json', 'sql', 'python') NOT NULL,
    message TEXT NOT NULL,
    file VARCHAR(128),
    severity ENUM('info', 'warning', 'error', 'critical') DEFAULT 'error',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------
-- AUDIT LOGS TABLE (optional future use)
-- ------------------------------
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

