const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTable() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'marlin@22',
        database: process.env.DB_NAME || 'scottishinsults'
    };

    const pool = mysql.createPool(dbConfig);

    try {
        // Check if table exists
        const [tables] = await pool.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'blog_posts'
        `, [dbConfig.database]);

        if (tables.length === 0) {
            console.log('Table blog_posts does not exist');
            return;
        }

        // Get table structure
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'blog_posts'
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);

        console.log('Table structure:');
        console.table(columns);
    } catch (error) {
        console.error('Error checking table:', error);
    } finally {
        await pool.end();
    }
}

checkTable(); 