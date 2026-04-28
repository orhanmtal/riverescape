const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];

if (!newVersion) {
    console.error("Lütfen yeni bir versiyon numarası girin. Örnek: node bump_version.js v1.99.64.00");
    process.exit(1);
}

console.log(`🚀 Versiyon güncelleniyor: ${newVersion}`);

const rootDir = __dirname;
const wwwDir = path.join(rootDir, 'www');

// 1. UPDATE index.html
const indexPath = path.join(wwwDir, 'index.html');
if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    // Version variable update
    html = html.replace(/VERSION:\s*"v?[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+"/g, `VERSION: "${newVersion}"`);
    // Cache-busting script src update
    html = html.replace(/\?v=v?[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/g, `?v=${newVersion}`);
    // UI Label update
    html = html.replace(/v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/g, newVersion);
    
    fs.writeFileSync(indexPath, html);
    console.log("✅ index.html güncellendi.");
}

// 2. UPDATE game_unbeatable_v3.js (if there are any hardcoded versions there)
const jsPath = path.join(wwwDir, 'game_unbeatable_v3.js');
if (fs.existsSync(jsPath)) {
    let js = fs.readFileSync(jsPath, 'utf8');
    // This will update the version string that might be logged or used internally
    js = js.replace(/const\s+GAME_VERSION\s*=\s*['"]v?[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+['"]/g, `const GAME_VERSION = "${newVersion}"`);
    fs.writeFileSync(jsPath, js);
    console.log("✅ game_unbeatable_v3.js güncellendi.");
}

// 3. RENAME VERSION TEXT FILE
const files = fs.readdirSync(rootDir);
files.forEach(file => {
    if (file.startsWith('VERSION_v') && file.endsWith('.txt')) {
        const oldPath = path.join(rootDir, file);
        const newPath = path.join(rootDir, `VERSION_${newVersion}.txt`);
        if (oldPath !== newPath) {
            fs.renameSync(oldPath, newPath);
            console.log(`✅ ${file} -> VERSION_${newVersion}.txt olarak adlandırıldı.`);
        }
    }
});

console.log("🏁 TÜM VERSİYON MÜHÜRLERİ OTOMATİK OLARAK GÜNCELLENDİ!");
