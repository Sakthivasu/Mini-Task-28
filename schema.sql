CREATE DATABASE IF NOT EXISTS edabip_db;
USE edabip_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    customer_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Completed',
    transaction_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample Data for KPIs and Charts
INSERT INTO users (username, email, password_hash) VALUES 
('admin', 'admin@edabip.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'); -- password: password123

INSERT INTO transactions (user_id, customer_name, category, amount, status, transaction_date) VALUES 
(1, 'Acme Corp', 'SaaS', 1250.00, 'Completed', '2026-09-01'),
(1, 'Global Tech', 'Cloud', 3400.00, 'Completed', '2026-09-05'),
(1, 'Alpha Industries', 'SaaS', 890.00, 'Pending', '2026-09-12'),
(1, 'Beta LLC', 'Support', 450.00, 'Completed', '2026-10-02'),
(1, 'Delta Systems', 'Cloud', 2100.00, 'Completed', '2026-10-05');