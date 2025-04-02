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

// Handle insult callback URLs
app.get('/insult', function(req, res) {
    // Send the main page
    res.sendFile(path.join(__dirname, 'index.html'));
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