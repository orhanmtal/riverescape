const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'www', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Rebuild modern-hud (Top-Left Score)
content = content.replace(/<div id="modern-hud"[\s\S]*?>/, 
    '<div id="modern-hud" style="position: absolute; top: calc(15px + env(safe-area-inset-top)); left: calc(50vw - 230px) !important; padding: 10px 18px; border-radius: 15px; background: rgba(0, 30, 60, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(0, 229, 255, 0.4); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4); display: none; flex-direction: column; gap: 4px; z-index: 1000; pointer-events: none; min-width: 110px;">');

// 2. Rebuild controls-ui (Bottom-Right Controls) - Clean out the double style mess
content = content.replace(/<div id="controls-ui"[\s\S]*?>/, 
    '<div id="controls-ui" style="position: absolute; bottom: calc(20px + env(safe-area-inset-bottom)); right: calc(50vw - 230px) !important; display: none; flex-direction: column; gap: 60px; z-index: 1000; pointer-events: none;">');

// 3. Rebuild bomb-action-btn (Bottom-Left Bomb)
content = content.replace(/<div id="bomb-action-btn"[\s\S]*?>/, 
    '<div id="bomb-action-btn" style="position: absolute; bottom: 20px; left: calc(50vw - 230px) !important; width: 60px; height: 60px; border-radius: 50%; background: rgba(0, 0, 0, 0.4); border: 2px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; z-index: 1000; cursor: pointer; user-select: none; -webkit-user-select: none; display: none; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); transition: transform 0.1s ease, border-color 0.2s ease;">');

// 4. Double check for the bomb icon span inside index.html
content = content.replace(/<span style="font-size: 24px; pointer-events: none; filter: drop-shadow\(0 2px 4px rgba\(0,0,0,0.5\)\);">.*?<\/span>/, 
    '<span style="font-size: 24px; pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">💣</span>');

fs.writeFileSync(indexPath, content, 'utf8');
console.log('✅ [HUD MASTER REBUILD] Completed successfully.');
