const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsersTable() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'marlin@22',
        database: process.env.DB_NAME || 'scottishinsults'
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Get table structure
        console.log('\nTable Structure:');
        const [columns] = await connection.query('DESCRIBE users');
        console.table(columns);

        // Get table content
        console.log('\nTable Content:');
        const [users] = await connection.query('SELECT * FROM users');
        console.table(users);

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkUsersTable(); 