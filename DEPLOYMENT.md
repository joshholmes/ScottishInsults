# Deployment Guide for Windows Server 2012 with IIS

## Prerequisites

1. Install Node.js
   - Download and install Node.js v12.x LTS from https://nodejs.org/download/release/
   - Choose the Windows x64 MSI installer
   - Make sure to check "Add to PATH" during installation
   - **IMPORTANT**: Use Node.js v12.x LTS for best compatibility with Windows Server 2012

2. Install IIS
   - Open Server Manager
   - Add Roles and Features
   - Select Web Server (IIS)
   - Install the following features:
     - URL Rewrite Module
     - Application Request Routing
     - HTTP Redirection

3. Install iisnode
   - Download iisnode from https://github.com/Azure/iisnode/releases
   - Choose the x64 version compatible with your Windows Server
   - Run the installer
   - Restart IIS after installation

## Deployment Steps

1. Create Application Pool
   - Open IIS Manager
   - Right-click on Application Pools
   - Add Application Pool
   - Name: "ScottishInsults"
   - .NET CLR Version: "No Managed Code"
   - Managed Pipeline Mode: "Integrated"

2. Create Website
   - Right-click on Sites
   - Add Website
   - Site name: "ScottishInsults"
   - Physical path: [path to your application]
   - Application pool: "ScottishInsults"
   - Binding: Configure your desired hostname and port

3. Configure Application
   - Copy all project files to the website directory
   - Run the included `deploy.bat` script to:
     - Install dependencies
     - Set proper permissions
     - Create necessary directories
   - Ensure web.config is in the root directory

4. Environment Variables
   - The deploy.bat script will create a .env file if it doesn't exist
   - You can modify the .env file to add additional environment variables:
     ```
     PORT=3000
     NODE_ENV=production
     ```

5. Start the Application
   - The application will start automatically through iisnode
   - Check the application pool is running
   - Verify the website is started in IIS

## Troubleshooting

1. Check Logs
   - Application logs: `%SystemDrive%\inetpub\logs\LogFiles\W3SVC1`
   - iisnode logs: `%SystemDrive%\inetpub\logs\iisnode`
   - Node.js logs: `[your-app-directory]\iisnode`

2. Common Issues
   - 500 Error: Check iisnode logs for Node.js errors
   - 404 Error: Verify URL Rewrite rules in web.config
   - Application Pool Issues: Check identity permissions
   - SyntaxError: Unexpected token - This usually indicates Node.js version incompatibility

3. Performance Tuning
   - Adjust application pool settings
   - Configure recycling settings
   - Monitor memory usage

4. Specific Error Solutions

   a. Missing Image Files (404 errors for .svg files)
   - Verify all image files are in the correct location
   - Check file permissions on the images directory
   - Run the test-server.js script to verify file existence
   - Ensure the web.config file has the correct MIME type mappings for .svg files

   b. Missing Data Files (404 errors for .json files)
   - Verify all JSON files are in the data directory
   - Check file permissions on the data directory
   - Ensure the server.js file has the correct route for serving JSON files
   - Add the following to web.config if needed:
     ```xml
     <staticContent>
       <mimeMap fileExtension=".json" mimeType="application/json" />
     </staticContent>
     ```

   c. Blocked External Resources (ERR_BLOCKED_BY_CLIENT)
   - These errors are often caused by ad blockers or security software
   - For Google Analytics and Facebook SDK, consider:
     - Adding appropriate CORS headers in web.config
     - Using local copies of these scripts instead of CDN versions
     - Adding appropriate security exceptions in your firewall

   d. SyntaxError: Unexpected token
   - This error typically occurs when using newer JavaScript syntax with an older Node.js version
   - Ensure you're using Node.js v12.x LTS
   - The server.js file has been updated to use older JavaScript syntax for compatibility
   - If you still encounter this error, check for ES6+ syntax in other JavaScript files

5. Testing the Deployment
   - Run the included test-server.js script to verify all files are present
   - Check the browser console for any remaining errors
   - Verify all functionality works as expected

## Security Considerations

1. File Permissions
   - Set appropriate NTFS permissions
   - Use ApplicationPoolIdentity
   - Restrict access to sensitive files

2. SSL/TLS
   - Install SSL certificate
   - Configure HTTPS binding
   - Force HTTPS redirect

3. Firewall
   - Open necessary ports
   - Configure Windows Firewall rules
   - Restrict access to management ports 