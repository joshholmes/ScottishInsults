require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Handle insult callback URLs
app.get('/insult', (req, res) => {
    // Send the main page
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all route to handle any other paths
app.get('*', (req, res) => {
    // For any other route, send the main page
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 