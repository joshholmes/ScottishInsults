const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'marlin@22',
    database: process.env.DB_NAME || 'scottishinsults'
};

const pool = mysql.createPool(dbConfig);

const isAuthenticated = async (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/blog/admin/login');
    }

    try {
        // Verify user still exists and get their current role
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.session.user.id]);
        
        if (users.length === 0) {
            req.session.destroy();
            return res.redirect('/blog/admin/login');
        }

        const user = users[0];
        
        // Update session with current user data
        req.session.user = {
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            adminlevel: user.adminlevel
        };

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).render('error', { error: 'Authentication error' });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.session.user || !['admin', 'superadmin'].includes(req.session.user.adminlevel)) {
        return res.status(403).render('error', { error: 'Access denied. Admin privileges required.' });
    }
    next();
};

module.exports = {
    isAuthenticated,
    isAdmin
}; 