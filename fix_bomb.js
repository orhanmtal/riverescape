const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'www', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Replace the broken bomb icon and any other similar corruption
indexContent = indexContent.replace(/ÄŸÅ¸â€™Â£/g, '💣'); // One variation of broken bomb
indexContent = indexContent.replace(/Ÿ’▱Â/g, '💣'); // Another variation based on screenshot
indexContent = indexContent.replace(/<span style="font-size: 24px; pointer-events: none;">.*?<\/span>/, '<span style="font-size: 24px; pointer-events: none;">💣</span>');

// Find the exact bomb button string in case it's different
indexContent = indexContent.replace(/<div id="bomb-action-btn"[\s\S]*?<\/div>/, '<div id="bomb-action-btn" style="position: absolute; bottom: 20px; left: 20px; width: 60px; height: 60px; border-radius: 50%; background: rgba(0, 0, 0, 0.4); border: 2px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; z-index: 1000; cursor: pointer; user-select: none; -webkit-user-select: none; display: none; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); transition: transform 0.1s ease, border-color 0.2s ease;"><span style="font-size: 24px; pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">💣</span><div id="bomb-badge" style="position: absolute; top: -5px; right: -5px; background: #f12711; color: white; font-size: 13px; font-weight: 900; padding: 3px 8px; border-radius: 12px; border: 2px solid #fff; z-index: 1001; display: none;">0</div></div>');

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✅ [ELITE BOMB HUD FIX] Completed successfully.');
