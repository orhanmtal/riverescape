const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'www', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Extreme Simplification of the Header (Remove Profile, Keep Gold & Settings)
const headerOld = /<div class="elite-menu-header">[\s\S]*?<\/div>\s*<\/div>/;
const headerNew = `<div class="elite-menu-header" style="justify-content: flex-end; gap: 15px;">
                <!-- Minimal Gold Display -->
                <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,215,0,0.4); border-radius: 15px; padding: 5px 12px; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(10px);">
                    <span style="font-size: 12px;">💰</span>
                    <span id="totalGoldValue" style="color: #FFD700; font-family: 'Outfit'; font-weight: 900; font-size: 16px;">0</span>
                </div>
                <button id="open-settings-btn" class="elite-btn-square" style="width: 10vmin; height: 10vmin; font-size: 5vmin; border-radius: 12px;">⚙️</button>
            </div>`;

content = content.replace(headerOld, headerNew);

// 2. Remove Mission Panel & Bottom Actions completely for extreme simplicity
content = content.replace(/<!-- v1\.99\.64\.01: ELITE MISSION PANEL -->[\s\S]*?<\/div>\s*<\/div>/, '</div>');
content = content.replace(/<!-- BOTTOM ROW: ACTIONS -->[\s\S]*?<\/div>/, '');

// 3. Ensure Logo & Play Button are centered and clean
content = content.replace(/<div id="start-screen" class="screen master-start-v21">/, '<div id="start-screen" class="screen master-start-v21" style="justify-content: center; gap: 5vh;">');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ [ELITE EXTREME SIMPLIFICATION] Completed successfully.');
