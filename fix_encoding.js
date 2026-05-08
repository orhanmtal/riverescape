const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'www', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Top Menu Header (Remove duplicates and fix icons)
const menuHeaderOld = /<div class="elite-menu-header">[\s\S]*?<div id="elite-main-version"/;
const menuHeaderNew = `<div class="elite-menu-header">
                <div id="player-profile-elite" class="account-info-elite" style="position: relative; pointer-events: auto !important; z-index: 9999;">
                    <div id="player-photo-container" style="width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.1)); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #FFD700; font-size: 18px; box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); overflow: hidden; border: 1px solid rgba(255,215,0,0.3);">
                        <img id="player-pfp-img" src="" style="width: 100%; height: 100%; object-fit: cover; display: none;" onerror="this.style.display='none'; document.getElementById('player-pfp-initial').style.display='flex';">
                        <div id="player-pfp-initial" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                            <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: #FFD700; opacity: 0.8;">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                            </svg>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <div id="player-name-elite" style="font-family: 'Outfit'; font-weight: 900; font-size: 16px; letter-spacing: 0.5px; line-height: 1.1;">ELITE PLAYER</div>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,215,0,0.4); border-radius: 20px; padding: 5px 15px; display: flex; align-items: center; gap: 8px; backdrop-filter: blur(10px); height: fit-content; margin-top: 5px; box-shadow: 0 0 15px rgba(255,215,0,0.1);">
                    <span style="font-size: 14px; filter: drop-shadow(0 0 5px rgba(255,215,0,0.5));">💰</span>
                    <span id="totalGoldValue" style="color: #FFD700; font-family: 'Outfit'; font-weight: 900; font-size: 18px; text-shadow: 0 0 10px rgba(255,215,0,0.5);">0</span>
                </div>

                <button id="open-settings-btn" class="elite-btn-square" style="width: 11.5vmin; height: 11.5vmin; font-size: 5vmin;">⚙️</button>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; gap: clamp(8px, 2vh, 30px); width: 100%; flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; -ms-overflow-style: none; padding-bottom: 8px;">
                <div style="text-align: center; position: relative; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; pointer-events: none; flex-shrink: 0;">
                    <h1 class="floating-logo" style="font-family: 'Outfit', sans-serif; font-weight: 900; color: white; font-size: 13vmin; letter-spacing: -2px; margin: 0; line-height: 0.85; background: linear-gradient(135deg, #fff 20%, #00e5ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 15px 30px rgba(0,229,255,0.3)); text-transform: uppercase;">RIVER<br><span style="background: linear-gradient(135deg, #00e5ff 0%, #00897b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ESCAPE</span></h1>
                    <div id="elite-main-version"`;

content = content.replace(menuHeaderOld, menuHeaderNew);

// 2. Fix Emojis and Version Logic
content = content.replace(/ELITE v1\.99\.65\.00/g, 'ELITE v1.99.65.12');
content = content.replace(/OYNA ğŸŒŠ/g, 'OYNA 🌊');
content = content.replace(/AKTÄ°F HEDEFLER ğŸŽ¯/g, 'AKTİF HEDEFLER 🎯');
content = content.replace(/ğŸ›’/g, '🛒');
content = content.replace(/ğŸ †/g, '🏆');
content = content.replace(/ğŸŽ¡/g, '🎡');
content = content.replace(/ğŸ’°/g, '💰');
content = content.replace(/âš™ï¸/g, '⚙️');
content = content.replace(/ğŸš©/g, '🚩');
content = content.replace(/ğŸ›¡ï¸/g, '🛡️');
content = content.replace(/MAÃ„ÂžAZA ğŸ›’/g, 'MAĞAZA 🛒');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ [ELITE FINAL SURGERY] Completed successfully.');
