const fs = require('fs');
let content = fs.readFileSync('www/game_unbeatable_v3.js', 'utf8');

// 1. Header Fixes
content = content.replace(
    '// RİVER ESCAPE PRESTİGE - v1.99.33.71 (MODERN BOAT UPDATE)',
    '// RİVER ESCAPE PRESTİGE - v1.99.33.73 (ENGINE RESTORATION)'
);
content = content.replace(
    'const VERSION = "1.99.33.71";',
    'const VERSION = "1.99.33.73";'
);
content = content.replace(
    'console.log("%c INFINITE EVOLUTION ACTIVE - v1.99.33.71 - ELITE PROGRESSION ", "background: #ff00ff; color: #fff; font-size: 20px; font-weight: bold;");',
    'console.log("%c INFINITE EVOLUTION ACTIVE - v1.99.33.73 - ELITE RESTORED ", "background: #ff00ff; color: #fff; font-size: 20px; font-weight: bold;");'
);

// 2. Global Speed and local Storage Init
content = content.replace(
    'var bgY = 0; var bgScrollSpeed = 100;',
    'var bgY = 0; var bgScrollSpeed = 200; window.targetLevelSpeed = 200;'
);

content = content.replace(
    'var armorCharge = 0;\nvar ownsArmorLicense = false;',
    'var armorCharge = parseInt(localStorage.getItem(\'riverEscapeArmorCharge\')) || 0;\nvar ownsArmorLicense = localStorage.getItem(\'riverEscapeOwnsArmorLicense\') === \'true\';'
);

// 3. Asset and Economy
content = content.replace(
    'var currentAsset = levelAssets[0]; // v1.99.33.71: Global Asset Reference Restored',
    'var currentAsset = levelAssets[0];\nvar currentLAsset = currentAsset;'
);
content = content.replace(
    'var totalGold = 0;\n\nvar magnetLevel = 0;\nvar shieldLevel = 0;\nvar bombCount = 0;',
    'var totalGold = parseInt(localStorage.getItem("riverEscapeTotalGold")) || 0;\nvar magnetLevel = parseInt(localStorage.getItem("riverEscapeMagnetLevel")) || 0;\nvar shieldLevel = parseInt(localStorage.getItem("riverEscapeShieldLevel")) || 0;\nvar bombCount = parseInt(localStorage.getItem("riverEscapeBombCount")) || 0;'
);

// 4. Mission scaling
content = content.replace(
    'const STAGES_PER_BIOME = 3;',
    'const STAGES_PER_BIOME = 5;'
);
// Duplicate remove (around line 966)
content = content.replace(
    '            const STAGES_PER_BIOME = 3;\n            const isCycle',
    '            const isCycle'
);

// 5. Hitbox Fix
const hitboxTarget = "} else if (obs.type === 'lavaGeyser') {";
const hitboxReplace = `}
        
        // --- RESTORED ELITE HITBOX BASE (v1.99.33.73 Fix) ---
        var ox = obs.x + (obs.width * 0.25);
        var oy = obs.y + (obs.height * 0.25);
        var ow = obs.width * 0.5;
        var oh = obs.height * 0.5;

        if (obs.type === 'lavaGeyser') {`;

const lines = content.split(/\r?\n/);
let replacedHitbox = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("} else if (obs.type === 'lavaGeyser') {") && i > 3300 && i < 3500) {
        lines[i] = lines[i].replace("} else if (obs.type === 'lavaGeyser') {", hitboxReplace);
        replacedHitbox = true;
        break;
    }
}
if(replacedHitbox) {
    content = lines.join('\n');
}

fs.writeFileSync('www/game_unbeatable_v3.js', content);
console.log("SUCCESS: Re-applied all 33.73 engine fixes.");

