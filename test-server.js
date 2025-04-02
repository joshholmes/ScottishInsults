const http = require('http');
const fs = require('fs');
const path = require('path');

// Function to check if a file exists
function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}

// Function to check if a directory exists
function dirExists(dirPath) {
    try {
        return fs.statSync(dirPath).isDirectory();
    } catch (err) {
        return false;
    }
}

// Check critical files and directories
console.log('Checking critical files and directories...');

const criticalFiles = [
    'index.html',
    'server.js',
    'web.config',
    'insultGenerator.js',
    'speech.js',
    'styles.css',
    'theme.css'
];

const criticalDirs = [
    'images',
    'data',
    'bundles'
];

let allFilesExist = true;
let allDirsExist = true;

criticalFiles.forEach(file => {
    const exists = fileExists(path.join(__dirname, file));
    console.log(`${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
    if (!exists) allFilesExist = false;
});

criticalDirs.forEach(dir => {
    const exists = dirExists(path.join(__dirname, dir));
    console.log(`${dir}: ${exists ? 'EXISTS' : 'MISSING'}`);
    if (!exists) allDirsExist = false;
});

// Check image files
console.log('\nChecking image files...');
const imageFiles = [
    'images/speakingboy.svg',
    'images/twitter.svg',
    'images/mastodon.svg',
    'images/bluesky.svg',
    'images/facebook.svg'
];

imageFiles.forEach(file => {
    const exists = fileExists(path.join(__dirname, file));
    console.log(`${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
});

// Check data files
console.log('\nChecking data files...');
const dataFiles = [
    'data/sentences.json',
    'data/adjectives.json',
    'data/nouns.json'
];

dataFiles.forEach(file => {
    const exists = fileExists(path.join(__dirname, file));
    console.log(`${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
});

// Test server connection
console.log('\nTesting server connection...');
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`Server response status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Server response received');
        if (data.includes('Scottish Insults')) {
            console.log('Server is serving the correct content');
        } else {
            console.log('Server response does not contain expected content');
        }
    });
});

req.on('error', (e) => {
    console.error(`Server connection error: ${e.message}`);
});

req.end();

// Summary
console.log('\n=== SUMMARY ===');
console.log(`All critical files exist: ${allFilesExist ? 'YES' : 'NO'}`);
console.log(`All critical directories exist: ${allDirsExist ? 'YES' : 'NO'}`);
console.log('Run this script after deploying to verify the server is working correctly.'); 