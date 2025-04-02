const fs = require('fs');
const path = require('path');

// Create bundles directory if it doesn't exist
const bundlesDir = path.join(__dirname, '..', 'bundles');
if (!fs.existsSync(bundlesDir)) {
    fs.mkdirSync(bundlesDir);
}

// Copy files from node_modules to bundles
const files = [
    {
        from: path.join(__dirname, '..', 'node_modules', 'jquery', 'dist', 'jquery.min.js'),
        to: path.join(bundlesDir, 'jquery.min.js')
    },
    {
        from: path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.bundle.min.js'),
        to: path.join(bundlesDir, 'bootstrap.min.js')
    }
];

files.forEach(file => {
    if (fs.existsSync(file.from)) {
        fs.copyFileSync(file.from, file.to);
        console.log(`Copied ${path.basename(file.from)} to bundles directory`);
    } else {
        console.error(`File not found: ${file.from}`);
    }
}); 