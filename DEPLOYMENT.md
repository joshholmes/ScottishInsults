# Deployment Guide for Namecheap Shared Hosting with LiteSpeed

## Prerequisites

1. Namecheap Shared Hosting Account
   - LiteSpeed Web Server
   - Node.js support
   - MySQL database
   - SSH access (optional but recommended)

2. Domain Name
   - Registered with Namecheap
   - DNS configured to point to Namecheap nameservers
   - SSL certificate (Let's Encrypt is included)

## Deployment Steps

1. Prepare Your Application
   - Ensure your project structure matches the following:
     ```
     /
     ├── public_html/           # Static files
     │   ├── .htaccess         # Main .htaccess for static files
     │   ├── *.html            # HTML pages
     │   ├── robots.txt        # Search engine directives
     │   ├── sitemap.xml       # Site map for search engines
     │   └── public/           # Public assets
     │       ├── scripts/      # Client-side JavaScript
     │       ├── images/       # Static images
     │       ├── styles.css    # Main styles
     │       └── theme.css     # Theme styles
     └── blognodeapp/          # Node.js application
         ├── .htaccess         # Node.js specific .htaccess
         ├── app.js            # Main application file
         ├── blog-engine.js    # Blog functionality
         ├── package.json      # Node.js dependencies
         ├── .env              # Environment variables
         ├── views/            # EJS templates
         ├── private/          # Private data
         └── data/             # JSON data files
     ```

2. Database Setup
   - Log in to cPanel
   - Create a new MySQL database
   - Create a database user with strong password
   - Grant all privileges to the user on the database
   - Note down the database credentials

3. Environment Configuration
   - Create `.env` file in `blognodeapp` directory:
     ```
     # Server Configuration
     NODE_ENV=production
     PORT=3000

     # Database Configuration
     DB_HOST=localhost
     DB_USER=your_db_user
     DB_PASSWORD=your_db_password
     DB_NAME=scottishinsults

     # Session Configuration
     SESSION_SECRET=your_session_secret

     # Admin Configuration
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=your_admin_password

     # Security
     CORS_ORIGIN=https://your-domain.com
     ```

4. File Upload
   - Upload all files maintaining the directory structure
   - Use SFTP or cPanel File Manager
   - Set correct permissions:
     ```bash
     chmod 755 public_html
     chmod 644 public_html/.htaccess
     chmod 755 blognodeapp
     chmod 600 blognodeapp/.env
     chmod 755 blognodeapp/app.js
     ```

5. Node.js Setup
   - SSH into your hosting (if available)
   - Navigate to blognodeapp directory
   - Install dependencies:
     ```bash
     npm install --production
     ```
   - Start the application:
     ```bash
     pm2 start app.js --name scottishinsults
     pm2 save
     ```

6. SSL Configuration
   - In cPanel, go to SSL/TLS
   - Install Let's Encrypt certificate
   - Force HTTPS in .htaccess

## Troubleshooting

1. Check Logs
   - Node.js logs: `blognodeapp/logs/`
   - LiteSpeed logs: cPanel > Error Log
   - PM2 logs: `pm2 logs scottishinsults`

2. Common Issues
   - 500 Error: Check Node.js logs
   - 404 Error: Verify .htaccess configuration
   - Database Connection: Verify credentials in .env
   - Permission Issues: Check file permissions

3. Performance Tuning
   - Enable LiteSpeed Cache
   - Configure browser caching
   - Optimize images
   - Minify CSS/JS

4. Security Considerations
   - Keep Node.js and dependencies updated
   - Use strong passwords
   - Enable HTTPS
   - Regular backups
   - Monitor error logs

## Maintenance

1. Regular Updates
   - Check for Node.js updates
   - Update dependencies
   - Monitor security advisories

2. Backup Strategy
   - Database backups
   - File backups
   - Configuration backups

3. Monitoring
   - Check error logs
   - Monitor disk space
   - Monitor database size
   - Check SSL certificate expiration 