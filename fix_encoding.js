const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'www', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove non-compliant elements
content = content.replace(/<button id="google-login-btn"[\s\S]*?<\/button>/g, '');
content = content.replace(/<div id="auth-status-text"[\s\S]*?<\/div>/g, '');

// 2. Fix character corruption patterns globally
const corruptionMap = [
    [/ğŸš©/g, '🚩'],
    [/ğŸ›°ï¸/g, '🛰️'],
    [/ğŸŒŠ/g, '🌊'],
    [/âš™ï¸/g, '⚙️'],
    [/ğŸŽ¯/g, '🎯'],
    [/ğŸ›’/g, '🛒'],
    [/ğŸ †/g, '🏆'],
    [/ğŸŽ¡/g, '🎡'],
    [/ğŸ›¡ï¸/g, '🛡️'],
    [/â ¸/g, '⏸️'],
    [/Äž/g, 'Ğ'],
    [/Ä±/g, 'ı'],
    [/Ä°/g, 'İ'],
    [/Ã–/g, 'Ö'],
    [/Ãœ/g, 'Ü'],
    [/Ã‡/g, 'Ç'],
    [/ÅŸ/g, 'ş'],
    [/ÄŸ/g, 'ğ'],
    [/Ã§/g, 'ç'],
    [/Ã¶/g, 'ö'],
    [/Ã¼/g, 'ü']
];

corruptionMap.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ [ELITE COMPLIANCE FIX] Completed successfully.');
