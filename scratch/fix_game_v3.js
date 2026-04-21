const fs = require('fs');
const path = 'www/game_unbeatable_v3.js';
let content = fs.readFileSync(path, 'utf8');

console.log('Original length:', content.length);

// 1. Clean up potential literal '\n' sequences from previous failed edits
content = content.replace(/\\n/g, '\n');

// 2. Fix the master constants section (bgScrollSpeed should be 200 for movement)
content = content.replace(/var bgY = 0; var bgScrollSpeed = 100;/g, 'var bgY = 0; var bgScrollSpeed = 200; var targetLevelSpeed = 200;');

// 3. Update the global STAGES_PER_BIOME to 5 (mission scaling)
// We look for the one in the global scope (lines 800-1000 usually)
content = content.replace(/const STAGES_PER_BIOME = 3;/g, 'const STAGES_PER_BIOME = 5;');

// 4. Resolve the 'already declared' error by removing the duplicate inside updateArmorUI
// This is specific to the version that has currentLevel cycle logic
const duplicateMarker = 'const STAGES_PER_BIOME = 5;'; // The one that shouldn't be there
if (content.indexOf(duplicateMarker) !== content.lastIndexOf(duplicateMarker)) {
    // If it appears twice, remove the second one or handle specifically
    // But since one might be 5 and one might be 3, let's be more specific
}

// Better: Remove ONLY the one inside the updateArmorUI function if it exists
content = content.replace(/const STAGES_PER_BIOME = 5;\s+const isCycle =/g, 'const isCycle =');
content = content.replace(/const STAGES_PER_BIOME = 3;\s+const isCycle =/g, 'const isCycle =');

// 5. Ensure economy variables use localStorage
content = content.replace(
    /var totalGold = 0;[\s\S]*?var magnetLevel = 0;[\s\n]+var shieldLevel = 0;[\s\n]+var bombCount = 0;[\s\n]+var powerupTimer = 0;[\s\n]+var hasShield = false;[\s\n]+var ownsArmorLicense = false;[\s\n]+var armorCharge = 0;[\s\n]+var hasWeapon = false;[\s\n]+var lastShotTime = 0;/,
    "var totalGold = parseInt(localStorage.getItem('riverEscapeTotalGold')) || 0;\nvar magnetLevel = parseInt(localStorage.getItem('riverEscapeMagnetLevel')) || 0;\nvar shieldLevel = parseInt(localStorage.getItem('riverEscapeShieldLevel')) || 0;\nvar bombCount = parseInt(localStorage.getItem('riverEscapeBombCount')) || 0;\nvar powerupTimer = 0;\nvar hasShield = false;\nvar ownsArmorLicense = localStorage.getItem('riverEscapeOwnsArmorLicense') === 'true';\nvar armorCharge = parseInt(localStorage.getItem('riverEscapeArmorCharge')) || 0;\nvar hasWeapon = localStorage.getItem('riverEscapeHasWeapon') === 'true';\nvar lastShotTime = 0;"
);

fs.writeFileSync(path, content);
console.log('Successfully fixed game_unbeatable_v3.js. New length:', content.length);
