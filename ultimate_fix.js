const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'www', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. COMPLETELY RE-WRITE THE CONTROLS SECTION (To avoid double style attributes)
const cleanControls = 
        <div id="controls-ui" style="position: absolute; bottom: calc(20px + env(safe-area-inset-bottom)); right: calc(50vw - 230px) !important; display: none; flex-direction: column; gap: 60px; z-index: 1000; pointer-events: none;">
            <div id="dash-action-btn" style="width: 60px; height: 60px; border-radius: 50%; background: rgba(0, 229, 255, 0.15); border: 2px solid rgba(0, 229, 255, 0.4); display: flex; align-items: center; justify-content: center; cursor: pointer; pointer-events: auto;">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#00e5ff" stroke-width="2">
                    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
                </svg>
                <div id="dash-energy-bar" style="position: absolute; top: -10px; width: 40px; height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
                    <div id="dash-energy-fill" style="width: 0%; height: 100%; background: #00e5ff;"></div>
                </div>
            </div>
            
            <div style="position: relative; pointer-events: none;">
                <div id="bomb-action-btn" style="position: absolute; bottom: 20px; left: calc(-50vw + 270px) !important; width: 60px; height: 60px; border-radius: 50%; background: rgba(0, 0, 0, 0.4); border: 2px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; z-index: 1000; cursor: pointer; user-select: none; -webkit-user-select: none; display: none; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); transition: transform 0.1s ease, border-color 0.2s ease;">
                    <span style="font-size: 24px; pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">💣</span>
                    <div id="bomb-badge" style="position: absolute; top: -5px; right: -5px; background: #f12711; color: white; font-size: 13px; font-weight: 900; padding: 3px 8px; border-radius: 12px; border: 2px solid #fff; z-index: 1001; display: none;">0</div>
                </div>
            </div>
        </div>
;

// Replace the entire old block from #controls-ui until the toast system
content = content.replace(/<div id="controls-ui"[\s\S]*?<!-- Removed legacy security lock overlay -->/, cleanControls + '\n\n        <!-- Removed legacy security lock overlay -->');

// 2. Ensure modern-hud is also strictly locked
content = content.replace(/id="modern-hud"[\s\S]*?style="[\s\S]*?"/, 
    'id="modern-hud" style="position: absolute; top: calc(15px + env(safe-area-inset-top)); left: calc(50vw - 230px) !important; padding: 10px 18px; border-radius: 15px; background: rgba(0, 30, 60, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(0, 229, 255, 0.4); display: none; flex-direction: column; gap: 4px; z-index: 1000; min-width: 110px;"');

fs.writeFileSync(indexPath, content, 'utf8');
console.log('✅ [ULTIMATE HUD FIX] Applied.');
