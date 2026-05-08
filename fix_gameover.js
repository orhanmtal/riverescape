const fs = require('fs');
const path = require('path');

const transPath = path.join(__dirname, 'www', 'translations.js');
let transContent = fs.readFileSync(transPath, 'utf8');
transContent = transContent.replace(/scoreLabel: "SKOR:"/g, 'scoreLabel: ""'); 
transContent = transContent.replace(/goldLabel: "ALTIN:"/g, 'goldLabel: "ALTIN"'); 
transContent = transContent.replace(/scoreLabel: "SCORE:"/g, 'scoreLabel: ""'); 
transContent = transContent.replace(/goldLabel: "GOLD:"/g, 'goldLabel: "GOLD"');
fs.writeFileSync(transPath, transContent, 'utf8');

const indexPath = path.join(__dirname, 'www', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
indexContent = indexContent.replace(/YENÄ°DEN\s*BAÃ…ÂžLA\s*âš ï¸ â€ž/g, 'YENİDEN BAŞLA 🔄');
indexContent = indexContent.replace(/ANA\s*MENÃœYE\s*DÃ–N\s*ÄŸÅ¸Â Â /g, 'ANA MENÜYE DÖN 🏠');
indexContent = indexContent.replace(/OYUN\s*BÄ°TTÄ°/g, 'OYUN BİTTİ');

// Fix the Reset Confirm Modal Emoji
indexContent = indexContent.replace(/<div id="reset-confirm-emoji"[\s\S]*?<\/div>/, '<div id="reset-confirm-emoji" style="font-size: 60px; margin-bottom: 10px; text-shadow: 0 0 20px rgba(255,0,0,0.5);">⚠️</div>');

// In case the ID is different (it might be inside the settings modal)
indexContent = indexContent.replace(/Ã¢Å¡Â¡Â Ã¯Â¸Â/g, '⚠️');
indexContent = indexContent.replace(/âš ï¸/g, '⚠️');
indexContent = indexContent.replace(/ğŸ›¡ï¸ Â/g, '🛡️');

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✅ [ELITE ENCODING FIX] Completed successfully.');
