const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const fs = require('fs').promises;
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const { isAuthenticated, isAdmin } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.BLOG_PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './'
    }),
    secret: 'your-secret-key', // Change this to a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

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

// Admin credentials (in production, use environment variables)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '$2a$10$YourHashedPasswordHere'; // Use bcrypt to generate this

// Routes
app.get('/', async (req, res) => {
    try {
        const [posts] = await pool.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
        res.render('index', { posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).render('error', { error: 'Failed to load blog posts' });
    }
});

app.get('/post/:slug', async (req, res) => {
    try {
        const [posts] = await pool.query('SELECT * FROM blog_posts WHERE slug = ?', [req.params.slug]);
        if (posts.length === 0) {
            return res.status(404).render('error', { error: 'Post not found' });
        }
        res.render('post', { post: posts[0] });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).render('error', { error: 'Failed to load blog post' });
    }
});

// Admin routes
app.get('/admin/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/blog/admin/dashboard');
    }
    res.render('login', { error: null });
});

app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (users.length === 0) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        // Check if user has admin privileges
        if (!['admin', 'superadmin'].includes(user.adminlevel)) {
            return res.render('login', { error: 'Access denied. Admin privileges required.' });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            adminlevel: user.adminlevel
        };

        res.redirect('/blog/admin/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'An error occurred during login' });
    }
});

app.get('/admin/dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [posts] = await pool.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
        res.render('dashboard', { 
            posts,
            user: req.session.user
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', { error: 'Error loading dashboard' });
    }
});

app.get('/admin/posts/new', isAuthenticated, isAdmin, (req, res) => {
    res.render('post-form', { 
        post: null,
        user: req.session.user,
        error: null
    });
});

app.post('/admin/posts', isAuthenticated, isAdmin, async (req, res) => {
    const { title, content, slug } = req.body;
    const userId = req.session.user.id;

    try {
        await pool.query(
            'INSERT INTO blog_posts (title, content, slug, author, published_date, last_modified, status) VALUES (?, ?, ?, ?, NOW(), NOW(), ?)',
            [title, content, slug, req.session.user.username, 'published']
        );
        res.redirect('/blog/admin/dashboard');
    } catch (error) {
        console.error('Create post error:', error);
        let errorMessage = 'Error creating post';
        
        if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('slug')) {
            errorMessage = 'A post with this slug already exists. Please choose a different slug.';
        }
        
        res.status(500).render('post-form', { 
            post: { title, content, slug },
            user: req.session.user,
            error: errorMessage
        });
    }
});

app.get('/admin/posts/:id/edit', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [posts] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
        
        if (posts.length === 0) {
            return res.status(404).render('error', { error: 'Post not found' });
        }

        res.render('post-form', { 
            post: posts[0],
            user: req.session.user,
            error: null
        });
    } catch (error) {
        console.error('Edit post error:', error);
        res.status(500).render('post-form', { 
            post: null,
            user: req.session.user,
            error: 'Error loading post'
        });
    }
});

app.post('/admin/posts/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { title, content, slug } = req.body;
    const postId = parseInt(req.params.id, 10);

    if (isNaN(postId)) {
        return res.status(400).render('post-form', {
            post: { title, content, slug },
            user: req.session.user,
            error: 'Invalid post ID'
        });
    }

    try {
        await pool.query(
            'UPDATE blog_posts SET title = ?, content = ?, slug = ?, author = ?, last_modified = NOW() WHERE id = ?',
            [title, content, slug, req.session.user.username, postId]
        );
        res.redirect('/blog/admin/dashboard');
    } catch (error) {
        console.error('Update post error:', error);
        let errorMessage = 'Error updating post';
        
        if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('slug')) {
            errorMessage = 'A post with this slug already exists. Please choose a different slug.';
        }
        
        res.status(500).render('post-form', { 
            post: { id: postId, title, content, slug },
            user: req.session.user,
            error: errorMessage
        });
    }
});

app.post('/admin/posts/:id/delete', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
        res.redirect('/blog/admin/dashboard');
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).render('error', { error: 'Error deleting post' });
    }
});

app.post('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/blog/admin/login');
});

// Helper functions
async function getPosts() {
    const postsDir = path.join(__dirname, 'posts');
    const files = await fs.readdir(postsDir);
    const posts = await Promise.all(
        files
            .filter(file => file.endsWith('.json'))
            .map(async file => {
                const content = await fs.readFile(path.join(postsDir, file), 'utf8');
                return JSON.parse(content);
            })
    );
    return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function getPostBySlug(slug) {
    const filePath = path.join(__dirname, 'posts', `${slug}.json`);
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}

async function createPost(post) {
    const { title, slug, excerpt, content } = post;
    const filePath = path.join(__dirname, 'posts', `${slug}.json`);
    const postData = {
        title,
        slug,
        excerpt,
        content,
        created_at: new Date().toISOString()
    };
    await fs.writeFile(filePath, JSON.stringify(postData, null, 2));
}

async function updatePost(oldSlug, post) {
    const { title, slug, excerpt, content } = post;
    const oldPath = path.join(__dirname, 'posts', `${oldSlug}.json`);
    const newPath = path.join(__dirname, 'posts', `${slug}.json`);
    
    // Read the old post to preserve the creation date
    const oldPost = await getPostBySlug(oldSlug);
    if (!oldPost) {
        throw new Error('Post not found');
    }

    const postData = {
        title,
        slug,
        excerpt,
        content,
        created_at: oldPost.created_at,
        updated_at: new Date().toISOString()
    };

    // If the slug has changed, delete the old file
    if (oldSlug !== slug) {
        await fs.unlink(oldPath);
    }

    await fs.writeFile(newPath, JSON.stringify(postData, null, 2));
}

async function deletePost(slug) {
    const filePath = path.join(__dirname, 'posts', `${slug}.json`);
    await fs.unlink(filePath);
}

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
    res.status(500).render('error', { 
        message: 'Something went wrong',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Blog server running at http://localhost:${PORT}`);
}); 