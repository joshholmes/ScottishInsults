require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Add error handling middleware
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

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

// Add specific routes for JSON files
app.get('/data/:file', function(req, res) {
    const filePath = path.join(__dirname, 'data', req.params.file);
    if (fs.existsSync(filePath) && filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json');
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Handle insult callback URLs
app.get('/insult', function(req, res) {
    // Send the main page
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle about page
app.get('/about', function(req, res) {
    // Send the about page
    res.sendFile(path.join(__dirname, 'about.html'));
});

// Handle donate page
app.get('/donate', function(req, res) {
    res.sendFile(path.join(__dirname, 'donate.html'));
});

// Catch-all route to handle any other paths
app.get('*', function(req, res) {
    // For any other route, send the main page
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, function() {
    console.log('Server running at http://localhost:' + port);
}); 