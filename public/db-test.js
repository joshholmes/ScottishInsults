require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function createTableIfNotExists(connection) {
    try {
        // Check if table exists
        const [tables] = await connection.execute('SHOW TABLES LIKE "blog_posts"');
        
        if (tables.length === 0) {
            console.log('Blog posts table does not exist. Creating it...');
            
            // Read and execute the SQL file
            const sqlFile = await fs.readFile(path.join(__dirname, 'create-blog-tables.sql'), 'utf8');
            await connection.execute(sqlFile);
            
            console.log('Blog posts table created successfully!');
        } else {
            console.log('Blog posts table already exists.');
        }
    } catch (error) {
        console.error('Error creating table:', error.message);
        throw error;
    }
}

async function testConnection() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('Successfully connected to the database!');
        
        // Check and create table if needed
        await createTableIfNotExists(connection);
        
        // Test query to show table structure
        const [columns] = await connection.execute('DESCRIBE blog_posts');
        console.log('\nTable structure:');
        console.table(columns);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testConnection(); 