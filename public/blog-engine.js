require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database connection pool
let pool;

// Function to set the pool
function setPool(newPool) {
    pool = newPool;
}

// Middleware to check admin access
function requireAdmin(req, res, next) {
    if (!req.session.user || (req.session.user.adminlevel !== 'admin' && req.session.user.adminlevel !== 'superadmin')) {
        return res.status(403).render('blog/forbidden', { title: 'Forbidden', message: 'You do not have permission to access this page.' });
    }
    next();
}

// Blog index page
router.get('/', async (req, res) => {
    try {
        const [posts] = await pool.execute(
            'SELECT id, title, slug, excerpt, published_date FROM blog_posts WHERE status = "published" ORDER BY published_date DESC'
        );
        
        res.render('blog/index', { 
            posts,
            title: 'Blog - Scottish Insults',
            description: 'Read our blog posts about Scottish insults, slang, and cultural insights.'
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).send('Error fetching blog posts');
    }
});

// Individual blog post page
router.get('/:slug', async (req, res, next) => {
    try {
        const [posts] = await pool.execute(
            'SELECT * FROM blog_posts WHERE slug = ? AND status = "published"',
            [req.params.slug]
        );
        
        if (posts.length === 0) {
            return next(); // Pass to 404 handler
        }
        
        const post = posts[0];
        res.render('blog/post', { 
            post,
            title: `${post.title} - Scottish Insults`,
            description: post.meta_description
        });
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).send('Error fetching blog post');
    }
});

// Blog post creation form (GET)
router.get('/create', requireAdmin, (req, res) => {
    res.render('blog/create', { title: 'Create Blog Post', error: null, form: {} });
});

// Blog post creation handler (POST)
router.post('/create', requireAdmin, async (req, res) => {
    const { title, slug, content, excerpt, meta_description, published_date, status } = req.body;
    try {
        if (!title || !slug || !content) {
            return res.render('blog/create', { title: 'Create Blog Post', error: 'Title, slug, and content are required.', form: req.body });
        }
        const pubDate = published_date || new Date();
        await pool.execute(
            'INSERT INTO blog_posts (title, slug, content, excerpt, meta_description, author, published_date, last_modified, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, slug, content, excerpt, meta_description, req.session.user.username, pubDate, pubDate, status || 'draft']
        );
        res.redirect('/blog');
    } catch (err) {
        console.error('Error creating blog post:', err);
        res.render('blog/create', { title: 'Create Blog Post', error: 'Error creating post. Slug may already exist.', form: req.body });
    }
});

// Edit blog post form (GET)
router.get('/edit/:id', requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).send('Post not found');
        }
        const post = rows[0];
        res.render('blog/edit', { title: 'Edit Blog Post', error: null, form: post });
    } catch (err) {
        console.error('Error fetching post for edit:', err);
        res.status(500).send('Error fetching post');
    }
});

// Update blog post (POST)
router.post('/edit/:id', requireAdmin, async (req, res) => {
    const { title, slug, content, excerpt, meta_description, published_date, status } = req.body;
    try {
        if (!title || !slug || !content) {
            return res.render('blog/edit', { title: 'Edit Blog Post', error: 'Title, slug, and content are required.', form: req.body });
        }
        await pool.execute(
            'UPDATE blog_posts SET title = ?, slug = ?, content = ?, excerpt = ?, meta_description = ?, published_date = ?, last_modified = NOW(), status = ? WHERE id = ?',
            [title, slug, content, excerpt, meta_description, published_date, status, req.params.id]
        );
        res.redirect('/blog');
    } catch (err) {
        console.error('Error updating blog post:', err);
        res.render('blog/edit', { title: 'Edit Blog Post', error: 'Error updating post. Slug may already exist.', form: req.body });
    }
});

// Admin page listing all blog posts
router.get('/admin', requireAdmin, async (req, res) => {
    try {
        const [posts] = await pool.execute('SELECT id, title, slug, status, published_date, last_modified FROM blog_posts ORDER BY published_date DESC');
        res.render('blog/admin', { title: 'Admin - Blog Posts', posts });
    } catch (err) {
        console.error('Error fetching posts for admin:', err);
        res.status(500).send('Error fetching posts');
    }
});

module.exports = { router, setPool }; 