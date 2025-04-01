const http = require('http');
const fs = require('fs');
const path = require('path');

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Log the request
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Parse URL to get the pathname
    let pathname = req.url;
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Construct the absolute file path
    const filePath = path.join(process.cwd(), pathname);

    // Extract file extension
    const ext = path.extname(filePath).toLowerCase();
    
    // Get MIME type
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Read and serve the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.error(`File not found: ${filePath}`);
                res.writeHead(404);
                res.end(`File Not Found: ${pathname}`);
            } else {
                console.error(`Server error for ${filePath}:`, error);
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // Set response headers
            const headers = {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
                'Access-Control-Allow-Origin': '*'
            };

            res.writeHead(200, headers);
            res.end(content);
            console.log(`Successfully served ${pathname} as ${contentType}`);
        }
    });
});

const PORT = 8000;

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Serving files from: ${process.cwd()}`);
    console.log('Press Ctrl+C to stop the server');
}); 