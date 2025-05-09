const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.BLOG_PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://pagead2.googlesyndication.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"]
        }
    }
}));

// Compression middleware
app.use(compression());

// Parse JSON bodies
app.use(express.json());

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'scottishinsults'
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Blog routes
app.get('/', async (req, res) => {
    try {
        const [posts] = await pool.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
        res.render('index', { posts });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).send('Error loading blog posts');
    }
});

app.get('/post/:slug', async (req, res) => {
    try {
        const [posts] = await pool.query('SELECT * FROM blog_posts WHERE slug = ?', [req.params.slug]);
        if (posts.length === 0) {
            return res.status(404).send('Post not found');
        }
        res.render('post', { post: posts[0] });
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).send('Error loading blog post');
    }
});

// API routes
app.get('/api/posts', async (req, res) => {
    try {
        const [posts] = await pool.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
});

app.get('/api/post/:slug', async (req, res) => {
    try {
        const [posts] = await pool.query('SELECT * FROM blog_posts WHERE slug = ?', [req.params.slug]);
        if (posts.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(posts[0]);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Error fetching post' });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Blog server running at http://localhost:${PORT}`);
}); 