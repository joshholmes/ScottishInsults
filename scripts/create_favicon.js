const sharp = require('sharp');
const fs = require('fs');

// Create multiple sizes for the favicon
const sizes = [16, 32, 48];

// Read the SVG file
const svgBuffer = fs.readFileSync('./images/favicon.svg');

// Create ICO file with multiple sizes
sharp(svgBuffer)
    .resize(32, 32) // Largest size
    .toBuffer()
    .then(buffer => {
        // Save as ICO
        fs.writeFileSync('./favicon.ico', buffer);
        console.log('Favicon created successfully!');
    })
    .catch(err => {
        console.error('Error creating favicon:', err);
    }); 