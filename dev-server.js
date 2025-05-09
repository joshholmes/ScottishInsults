const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 8080;
const BLOG_PORT = process.env.BLOG_PORT || 3000;

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

// Serve static files from public_html
app.use(express.static(path.join(__dirname, 'public_html')));

// Serve static files from public_html/public
app.use('/public', express.static(path.join(__dirname, 'public_html', 'public')));

// Serve static files from blognodeapp/public
app.use('/blog', express.static(path.join(__dirname, 'blognodeapp', 'public')));

// Handle clean URLs for static files
app.get('/*', (req, res, next) => {
    if (!req.path.includes('.') && !req.path.startsWith('/blog')) {
        const htmlPath = path.join(__dirname, 'public_html', req.path + '.html');
        res.sendFile(htmlPath, (err) => {
            if (err) {
                next();
            }
        });
    } else {
        next();
    }
});

// Proxy /blog requests to Node.js app
app.use('/blog', createProxyMiddleware({
    target: `http://localhost:${BLOG_PORT}`,
    changeOrigin: true,
    pathRewrite: {
        '^/blog': ''
    },
    logLevel: 'debug',
    timeout: 5000,
    proxyTimeout: 5000,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request: ${req.method} ${req.url} -> ${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`Received response: ${proxyRes.statusCode} for ${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', {
            error: err.message,
            url: req.url,
            method: req.method,
            headers: req.headers
        });
        
        if (err.code === 'ECONNREFUSED') {
            res.status(503).send(`
                <html>
                    <head>
                        <title>Blog Server Not Available</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            .message { color: #666; margin: 20px 0; }
                            .error { color: #cc0000; margin: 20px 0; }
                            .retry { color: #0066cc; text-decoration: none; }
                        </style>
                    </head>
                    <body>
                        <h1>Blog Server Not Available</h1>
                        <p class="error">Unable to connect to blog server at http://localhost:${BLOG_PORT}</p>
                        <p class="message">Please ensure the blog server is running and try again.</p>
                        <a href="/blog" class="retry">Retry</a>
                    </body>
                </html>
            `);
        } else {
            res.status(500).send(`
                <html>
                    <head>
                        <title>Proxy Error</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            .error { color: #cc0000; margin: 20px 0; }
                        </style>
                    </head>
                    <body>
                        <h1>Proxy Error</h1>
                        <p class="error">${err.message}</p>
                    </body>
                </html>
            `);
        }
    }
}));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`
        <html>
            <head>
                <title>Error</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #cc0000; }
                </style>
            </head>
            <body>
                <h1>Something went wrong</h1>
                <p class="error">${err.message}</p>
            </body>
        </html>
    `);
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Development server running at http://localhost:${PORT}`);
    console.log(`Static files served from: ${path.join(__dirname, 'public_html')}`);
    console.log(`Blog requests proxied to: http://localhost:${BLOG_PORT}`);
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
}); 