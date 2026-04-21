const fs = require('fs');
let content = fs.readFileSync('www/game_unbeatable_v3.js', 'utf8');

const replacement = `}
        }
        
        // --- RESTORED ELITE HITBOX BASE (v1.99.33.73 Fix) ---
        var ox = obs.x + (obs.width * 0.25);
        var oy = obs.y + (obs.height * 0.25);
        var ow = obs.width * 0.5;
        var oh = obs.height * 0.5;

        if (obs.type === 'lavaGeyser') {`;

// We use string replacement instead of regex to avoid escaping issues
const target = "} else if (obs.type === 'lavaGeyser') {";
const targetIndex = content.indexOf(target);

if (targetIndex !== -1) {
    // We want to replace the FIRST occurrence which is inside the update loop
    // But wait, there might be multiple. Let's make sure we find the one around line 3350
    const lines = content.split('\n');
    let replaced = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("} else if (obs.type === 'lavaGeyser') {") && i > 3300 && i < 3500) {
            lines[i] = lines[i].replace("} else if (obs.type === 'lavaGeyser') {", replacement);
            replaced = true;
            break;
        }
    }
    if (replaced) {
        fs.writeFileSync('www/game_unbeatable_v3.js', lines.join('\n'));
        console.log('Hitbox variables successfully restored via line replacement.');
    } else {
        console.error('Could not find target line in the expected range.');
    }
} else {
    console.error('Target string not found in the file.');
}
