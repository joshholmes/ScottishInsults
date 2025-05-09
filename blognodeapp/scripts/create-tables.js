const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTables() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'marlin@22',
        database: process.env.DB_NAME || 'scottishinsults'
    };

    const pool = mysql.createPool(dbConfig);

    try {
        // Create blog_posts table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS blog_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                author_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users(id)
            )
        `);

        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        await pool.end();
    }
}

createTables(); 