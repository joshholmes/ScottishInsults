-- Create blog_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    meta_description VARCHAR(255),
    author VARCHAR(100),
    published_date DATETIME,
    last_modified DATETIME,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    adminlevel ENUM('user', 'admin', 'superadmin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user if not exists
INSERT IGNORE INTO users (firstname, lastname, username, password, adminlevel)
VALUES ('Josh', 'Holmes', 'josh@joshholmes.com', '$2b$10$rmK43osHpk80.RgJeUrgieH6fKbBMQL4wXAwTUku4TjotQoa4J7KK', 'superadmin'); 