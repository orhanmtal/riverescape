const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'www', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    [/Ä°/g, 'İ'],
    [/Ã–/g, 'Ö'],
    [/Ãœ/g, 'Ü'],
    [/Ã‡/g, 'Ç'],
    [/ÅŸ/g, 'ş'],
    [/ÄŸ/g, 'ğ'],
    [/Ã§/g, 'ç'],
    [/Ã¶/g, 'ö'],
    [/Ã¼/g, 'ü'],
    [/Ä±/g, 'ı'],
    [/ğŸ’°/g, '💰'],
    [/ğŸ’/g, '💎'],
    [/ğŸ“½/g, '📽️'],
    [/ğŸ”/g, '⚠️'],
    [/ğŸ🏠/g, '🏠'],
    [/ğŸ†/g, '🏆'],
    [/Ã–N/g, 'ÖN'],
    [/ÃœCRETSÄ°Z/g, 'ÜCRETSİZ'],
    [/Ã‡IKIÅ?/g, 'ÇIKIŞ']
];

replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
});

// Final check for double button tag if any
content = content.replace(/<button <button/g, '<button');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ [ELITE ENCODING FIX] Completed successfully.');
