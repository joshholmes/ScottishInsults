require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Add logging middleware
app.use(function(req, res, next) {
    console.log(new Date().toISOString() + ' - ' + req.method + ' ' + req.url);
    next();
});

// Define routes
const routes = {
    '/': 'index.html',
    '/about': 'about.html',
    '/donate': 'donate.html',
    '/privacy': 'privacy.html',
    '/terms': 'terms.html',
    '/insult': 'insult.html'
};

// Handle specific routes first
Object.entries(routes).forEach(([route, file]) => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(__dirname, file));
    });
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve data files with proper MIME type
app.get('/data/*.json', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Handle 404 for unknown routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Error handling middleware
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(port, function() {
    console.log('Server running at http://localhost:' + port);
}); 