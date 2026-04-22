CREATE DATABASE IF NOT EXISTS dms_system;
USE dms_system;

CREATE TABLE IF NOT EXISTS companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_code VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  company_type ENUM('SUPER_ADMIN', 'MANUFACTURER', 'DISTRIBUTOR') NOT NULL DEFAULT 'MANUFACTURER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_code (company_code),
  UNIQUE KEY unique_company_email (email),
  INDEX idx_companies_type (company_type)
);

CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_role_code (code)
);

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  role_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_per_company (company_id, email),
  INDEX idx_users_company_role (company_id, role_id),
  INDEX idx_users_role_id (role_id),
  CONSTRAINT fk_users_company
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS manufacturer_distributor_map (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  distributor_company_id INT NOT NULL,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_manufacturer_distributor (company_id, distributor_company_id),
  INDEX idx_map_company_id (company_id),
  INDEX idx_map_distributor_company_id (distributor_company_id),
  CONSTRAINT fk_map_manufacturer_company
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_map_distributor_company
    FOREIGN KEY (distributor_company_id) REFERENCES companies(id)
    ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS sales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  user_id INT NOT NULL,
  distributor_company_id INT DEFAULT NULL,
  title VARCHAR(160) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  zone VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  status ENUM('pending', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sales_company_created (company_id, created_at),
  INDEX idx_sales_company_user (company_id, user_id, created_at),
  INDEX idx_sales_company_distributor (company_id, distributor_company_id, created_at),
  INDEX idx_sales_company_zone (company_id, zone, created_at),
  INDEX idx_sales_company_state (company_id, state, created_at),
  INDEX idx_sales_status (status),
  CONSTRAINT fk_sales_company
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_sales_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_sales_distributor_company
    FOREIGN KEY (distributor_company_id) REFERENCES companies(id)
    ON DELETE CASCADE
);
CREATE TABLE `api_keys` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key_id` varchar(32) NOT NULL,
  `key_hash` char(64) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `company_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `rate_limit` int(11) DEFAULT 100,
  `is_active` tinyint(1) DEFAULT 1,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_used_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_id` (`key_id`)
)

INSERT INTO roles (id, code, name)
VALUES
  (1, 'SUPER_ADMIN', 'Super Admin'),
  (2, 'MANUFACTURER_ADMIN', 'Manufacturer Admin'),
  (3, 'DISTRIBUTOR_ADMIN', 'Distributor Admin'),
  (4, 'SALESMAN', 'Salesman')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

INSERT INTO companies (id, company_code, name, email, company_type)
VALUES
  (1, 'ACME-MFG', 'Acme Manufacturing', 'hello@acme-mfg.com', 'MANUFACTURER'),
  (2, 'BRIGHT-DIST', 'Bright Distribution', 'hello@bright-dist.com', 'DISTRIBUTOR'),
  (3, 'GLOBAL-HQ', 'Global HQ', 'hello@global-hq.com', 'SUPER_ADMIN')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  company_type = VALUES(company_type);

INSERT INTO users (id, company_id, role_id, name, email, password_hash)
VALUES
  (1, 1, 2, 'Manufacturer Admin', 'admin@acme.com', '$2a$10$2WvXJWAU8cvQNPRAcPuSQexLprsjHeT4sdA/vh8H1aM5vL3uD5SkC'),
  (2, 1, 4, 'Salesman User', 'employee@acme.com', '$2a$10$2WvXJWAU8cvQNPRAcPuSQexLprsjHeT4sdA/vh8H1aM5vL3uD5SkC'),
  (3, 2, 3, 'Distributor Admin', 'admin@bright-dist.com', '$2a$10$2WvXJWAU8cvQNPRAcPuSQexLprsjHeT4sdA/vh8H1aM5vL3uD5SkC'),
  (4, 3, 1, 'Super Admin', 'super@global.com', '$2a$10$2WvXJWAU8cvQNPRAcPuSQexLprsjHeT4sdA/vh8H1aM5vL3uD5SkC')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  role_id = VALUES(role_id);

INSERT INTO manufacturer_distributor_map (company_id, distributor_company_id, status)
VALUES
  (1, 2, 'ACTIVE')
ON DUPLICATE KEY UPDATE
  status = VALUES(status);

INSERT INTO sales (company_id, user_id, distributor_company_id, title, amount, zone, state, status)
VALUES
  (1, 1, 2, 'Enterprise Subscription', 25000.00, 'North', 'Maharashtra', 'paid'),
  (1, 2, 2, 'Support Renewal', 8500.00, 'West', 'Gujarat', 'pending'),
  (1, 1, 2, 'Training Package', 4200.00, 'South', 'Karnataka', 'paid'),
  (2, 3, NULL, 'Distributor Local Order', 3100.00, 'West', 'Gujarat', 'paid');
