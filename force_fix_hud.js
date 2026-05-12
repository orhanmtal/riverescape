const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'www', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Fix the Bomb Emoji (Try multiple variations of the corruption)
content = content.replace(/Ÿ’▱Â/g, '💣');
content = content.replace(/Ã°Å¸â€™Â¥/g, '💣'); // Another common corruption

// 2. Force Center HUD (Top-Left)
content = content.replace('id="hud-v2"', 'id="hud-v2" style="left: calc(50vw - 230px) !important;"');

// 3. Force Center Bomb Button (Bottom-Left)
content = content.replace('id="bomb-action-btn"', 'id="bomb-action-btn" style="left: calc(50vw - 230px) !important; position: absolute; bottom: 20px;"');

// 4. Force Center Controls (Bottom-Right)
content = content.replace('id="controls-ui"', 'id="controls-ui" style="right: calc(50vw - 230px) !important; position: absolute; bottom: calc(20px + env(safe-area-inset-bottom));"');

// 5. Cleanup redundant style tags we might have added earlier to avoid bloat
content = content.replace(/<!-- ELITE HUD LOCK [\s\S]*?<\/style>/g, '');
content = content.replace(/<!-- ELITE DESKTOP HUD CENTERING [\s\S]*?<\/style>/g, '');

fs.writeFileSync(indexPath, content, 'utf8');
console.log('✅ [HUD & BOMB FORCE FIX] Applied successfully.');
