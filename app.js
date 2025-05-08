require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { router: blogRouter, setPool } = require('./public/blog-engine');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static files
// Middleware to block access to private files
app.use((req, res, next) => {
    const reqPath = req.path;
    if (reqPath.includes('/private/') ||
        reqPath.includes('/node_modules/') ||
        reqPath.endsWith('.md') ||
        reqPath.endsWith('package.json') ||
        reqPath.endsWith('package-lock.json') ||
        reqPath.endsWith('.env') ||
        reqPath.endsWith('.gitignore')) {
        return res.status(404).sendFile(path.join(__dirname, '404.html'));
    }
    next();
});

app.use(express.static(path.join(__dirname), {
    dotfiles: 'ignore',
    index: false
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'scottishinsultssecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to expose user info to views
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Database setup
async function setupDatabase() {
    let connection;
    try {
        // Validate environment variables
        const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
        const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingEnvVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
        }

        // Create connection pool
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            multipleStatements: true // Allow executing multiple SQL statements at once
        });

        // Test the connection
        connection = await pool.getConnection();
        console.log('Successfully connected to the database!');
        connection.release();

        // Check if either blog_posts or users table exists
        const [blogPostsTable] = await pool.execute('SHOW TABLES LIKE "blog_posts"');
        const [usersTable] = await pool.execute('SHOW TABLES LIKE "users"');

        if (blogPostsTable.length === 0 || usersTable.length === 0) {
            console.log('One or more required tables do not exist. Creating tables...');
            // Read and execute the SQL file
            const sqlFile = await fsPromises.readFile(path.join(__dirname, 'private/sql/create-blog-tables.sql'), 'utf8');
            await pool.query(sqlFile);
            console.log('Required tables created successfully!');
        } else {
            console.log('Required tables already exist.');
        }

        // Set the pool in the blog engine
        setPool(pool);

        return pool;
    } catch (error) {
        console.error('Error setting up database:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Could not connect to the database. Please check if MySQL is running and the credentials are correct.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Access denied. Please check your database username and password.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('Database does not exist. Please create the database first.');
        }
        throw error;
    }
}

// Routes
app.use('/blog', blogRouter);

// Define static routes
const routes = {
    '/': 'index.html',
    '/about': 'about.html',
    '/donate': 'donate.html',
    '/privacy': 'privacy.html',
    '/terms': 'terms.html',
    '/blog': 'blog/index.html',
    '/blog/top-10-scottish-insults-work': 'blog/top-10-scottish-insults-work.html',
    '/blog/scottish-swearing-etiquette': 'blog/scottish-swearing-etiquette.html',
    '/blog/history-scottish-slang': 'blog/history-scottish-slang.html',
    '/blog/is-bawbag-offensive': 'blog/is-bawbag-offensive.html'
};

// Handle specific routes
Object.entries(routes).forEach(([route, file]) => {
    app.get(route, async (req, res, next) => {
        const filePath = path.join(__dirname, file);
        try {
            await fsPromises.access(filePath);
            res.sendFile(filePath);
        } catch (err) {
            next();
        }
    });
});

// Serve data files with proper MIME type
app.get('/data/*.json', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login', error: null });
});

// Handle login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await app.locals.pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.render('login', { title: 'Login', error: 'Invalid username or password.' });
        }
        const user = rows[0];
        // Use bcrypt for password check
        const bcrypt = require('bcrypt');
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render('login', { title: 'Login', error: 'Invalid username or password.' });
        }
        req.session.user = {
            id: user.id,
            username: user.username,
            adminlevel: user.adminlevel,
            firstname: user.firstname,
            lastname: user.lastname
        };
        res.redirect('/blog/admin');
    } catch (err) {
        console.error('Login error:', err);
        res.render('login', { title: 'Login', error: 'An error occurred. Please try again.' });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3000;
setupDatabase()
    .then((pool) => {
        app.locals.pool = pool;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }); 