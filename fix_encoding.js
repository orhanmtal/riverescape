const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'www', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Center the Start Screen Content properly (Fix "too high up" issue)
// Change space-between to center and add vertical padding
content = content.replace(/justify-content: space-between !important;/, 'justify-content: center !important;');
content = content.replace(/padding: calc\(20px \+ env\(safe-area-inset-top\)\) 6vmin calc\(20px \+ env\(safe-area-inset-bottom\)\) 6vmin !important;/, 'padding: 10vh 6vmin !important;');

// 2. Fix Settings Screen (Remove Vibration, Fix Text)
// Remove the whole vibration div block
const vibrationPattern = /<div\s*style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba\(255,255,255,0.05\); padding-top: 2.8vmin;">[\s\S]*?<\/label>\s*<\/div>/;
content = content.replace(vibrationPattern, '');

// Fix Settings labels and footer
content = content.replace(/Y\? MǬzik Sesi/g, 'Müzik Sesi 🎵');
content = content.replace(/Y"S Efekt Sesi/g, 'Ses Efektleri 🔊');
content = content.replace(/GER\s*D-N\s*Y\?/g, 'ANA MENÜYE DÖN 🏠');
content = content.replace(/id="settings-back-btn-text">.*?<\/span>/, 'id="settings-back-btn-text">ANA MENÜYE DÖN 🏠</span>');
content = content.replace(/AYARLARI\s*KAYDET/g, 'AYARLARI KAYDET ✅');
content = content.replace(/ToM VERLER SIFIRLA/g, 'VERİLERİ SIFIRLA ⚠️');

// 3. Final Version & Character Restoration (Surgical)
content = content.replace(/ELITE v1\.99\.65\.00/g, 'ELITE v1.99.65.12');
content = content.replace(/ğŸ’°/g, '💰');
content = content.replace(/âš™ï¸/g, '⚙️');
content = content.replace(/ğŸ›’/g, '🛒');
content = content.replace(/ğŸ †/g, '🏆');
content = content.replace(/ğŸŽ¡/g, '🎡');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ [ELITE BALANCE & SETTINGS FIX] Completed successfully.');
