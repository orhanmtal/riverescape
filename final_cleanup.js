const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'www', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Remove the now useless Logout Modal
content = content.replace(/<!-- MODERN LOGOUT CONFIRM MODAL [\s\S]*?<\/div>\s*<\/div>/, '');

// 2. Fix the Reset Modal Encodings
content = content.replace(/Ã¢Å¡Â Ã¯Â¸Â/g, '⚠️');
content = content.replace(/EMÄ°N MÄ°SÄ°NÄ°Z\?/g, 'EMİN MİSİNİZ?');
content = content.replace(/TÃœM ALTINLARINIZI/g, 'TÜM ALTINLARINIZI');
content = content.replace(/GELÄ°Ã…ÂžTÄ°RMELERÄ°NÄ°ZÄ°/g, 'GELİŞTİRMELERİNİZİ');
content = content.replace(/iÅŸlemin geri dÃ¶nÃ¼ÅŸÃ¼/g, 'işlemin geri dönüşü');
content = content.replace(/HER Ã…ÂžEYÄ° SÄ°L/g, 'HER ŞEYİ SİL');
content = content.replace(/VAZGEÃ‡/g, 'VAZGEÇ');

// 3. One more check for any remaining firebase or logout traces
content = content.replace(/ÄŸÅ¸Å¡Âª/g, '🚪'); // Logout icon if any
content = content.replace(/Ã‡IKIÃ…Âž YAPILSIN MI\?/g, 'ÇIKIŞ YAPILSIN MI?');

fs.writeFileSync(indexPath, content, 'utf8');
console.log('✅ [ELITE FINAL CLEANUP] Completed successfully.');
