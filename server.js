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

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve data files with proper MIME type
app.get('/data/*.json', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Handle routes
const routes = {
    '/about': 'about.html',
    '/donate': 'donate.html',
    '/insult': 'index.html'
};

// Handle specific routes
Object.entries(routes).forEach(([route, file]) => {
    app.get(route, function(req, res) {
        res.sendFile(path.join(__dirname, file));
    });
});

// Catch-all route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/donate', (req, res) => {
    res.sendFile(path.join(__dirname, 'donate.html'));
});

app.get('/insult', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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