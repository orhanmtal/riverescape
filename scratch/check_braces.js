
const fs = require('fs');
const content = fs.readFileSync('www/game_unbeatable_v3.js', 'utf8');
const lines = content.split('\n');

let openBraces = 0;
let inDraw = false;

for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    if (line.includes('function draw(dt) {')) {
        inDraw = true;
        console.log(`Found draw at line ${lineNum}`);
    }

    if (inDraw) {
        const matchesOpen = line.match(/\{/g);
        const matchesClose = line.match(/\}/g);
        
        if (matchesOpen) openBraces += matchesOpen.length;
        if (matchesClose) openBraces -= matchesClose.length;

        if (openBraces === 0) {
            console.log(`Draw function ends at line ${lineNum}`);
            inDraw = false;
        }
        
        if (openBraces < 0) {
            console.log(`NEGATIVE BRACE COUNT at line ${lineNum}: ${openBraces}`);
            break;
        }
    }
}
