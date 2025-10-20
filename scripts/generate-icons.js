const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" fill="#000000" rx="45"/>
  <circle cx="64" cy="96" r="8" fill="#ffffff"/>
  <circle cx="128" cy="96" r="8" fill="#ffffff"/>
</svg>`;

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Save SVG as placeholder
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);

console.log('Icons generated successfully');
