const fs = require('fs');
const path = require('path');

// Fix index.html Shop Emojis and Text
const indexPath = path.join(__dirname, 'www', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

indexContent = indexContent.replace(/ÄŸÅ¸Â§Â²/g, '🧲');
indexContent = indexContent.replace(/🛡️ Â /g, '🛡️');
indexContent = indexContent.replace(/Ã¢Ëœâ€žÃ¯Â¸Â/g, '💣');
indexContent = indexContent.replace(/⚠️ â€¹/g, '💎');
indexContent = indexContent.replace(/GELÄ°Ã…ÂžTÄ°R/g, 'GELİŞTİR');
indexContent = indexContent.replace(/GERÄ° DÃ–N/g, 'GERİ DÖN');
indexContent = indexContent.replace(/REKLAM Ä°ZLE ğŸ“½ï¸ /g, 'REKLAM İZLE 🎥');
indexContent = indexContent.replace(/REKLAM Ä°ZLE/g, 'REKLAM İZLE');
indexContent = indexContent.replace(/GÃœNLÃœK HEDÄ°YE/g, 'GÜNLÜK HEDİYE');
indexContent = indexContent.replace(/ZIRH Ã…ÂžARJI/g, 'ZIRH ŞARJI');
indexContent = indexContent.replace(/ZÄ±rh Birimi/g, 'Zırh Birimi');

fs.writeFileSync(indexPath, indexContent, 'utf8');

// Fix translations.js Balance Colon
const transPath = path.join(__dirname, 'www', 'translations.js');
let transContent = fs.readFileSync(transPath, 'utf8');

transContent = transContent.replace(/balance: "BAKİYE:"/g, 'balance: "BAKİYE"');
transContent = transContent.replace(/balance: "BALANCE:"/g, 'balance: "BALANCE"');

fs.writeFileSync(transPath, transContent, 'utf8');

console.log('✅ [ELITE SHOP FIX] Completed successfully.');
