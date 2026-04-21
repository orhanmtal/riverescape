const fs = require('fs');
let content = fs.readFileSync('www/game_unbeatable_v3.js', 'utf8');

const lines = content.split(/\r?\n/);
let inserted = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("var obs = obstacles[i];")) {
        // Look ahead to make sure we are in the right loop
        if (i + 4 < lines.length && lines[i + 2].includes("ELITE PHYSICS ENGINE") || lines[i+3].includes("ELITE PHYSICS ENGINE") || lines[i+4].includes("ELITE PHYSICS ENGINE") || lines[i+1].includes("ELITE PHYSICS ENGINE")) {
            
            // Satırın hemen altına yer çekimi mekaniğini ekle
            lines.splice(i + 1, 0, 
                "        // --- CRITICAL GRAVITY RESTORATION (v1.99.33.73) ---",
                "        var currentSpeedY = obs.speedY;",
                "        if (isNaN(currentSpeedY) || currentSpeedY === undefined) {",
                "             currentSpeedY = (typeof window.bgScrollSpeed !== 'undefined' ? window.bgScrollSpeed : 200);",
                "             if (isNaN(currentSpeedY)) currentSpeedY = 200;",
                "        }",
                "        obs.y += currentSpeedY * dt;"
            );
            inserted = true;
            break;
        }
    }
}

if (inserted) {
    fs.writeFileSync('www/game_unbeatable_v3.js', lines.join('\n'));
    console.log("SUCCESS: Vertical gravity logic inserted via robust line seek.");
} else {
    console.error("FAILED: Could not find the obstacle loop to insert gravity.");
}
