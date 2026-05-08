const fs = require('fs');
const path = require('path');

const transPath = path.join(__dirname, 'www', 'translations.js');
let content = fs.readFileSync(transPath, 'utf8');

// TR Update
content = content.replace(/reviveBtn: "\+1 CAN \(REKLAM\)"/g, 'reviveBtn: "+3 CAN (REKLAM)"');
content = content.replace(/reviveGoldBtn: "\+3 CAN \(100 ALTIN\)"/g, 'reviveGoldBtn: "+3 CAN (250 ALTIN)"');
content = content.replace(/reviveAdBtn: "DEVAM ET \(REKLAM\)"/g, 'reviveAdBtn: "+3 CAN (REKLAM)"');
content = content.replace(/reviveGoldBtnLong: "\+3 CAN \(100 ALTIN\)"/g, 'reviveGoldBtnLong: "+3 CAN (250 ALTIN)"');

// EN Update
content = content.replace(/reviveBtn: "\+1 LIFE \(AD\)"/g, 'reviveBtn: "+3 LIVES (AD)"');
content = content.replace(/reviveGoldBtn: "\+3 LIVES \(100 GOLD\)"/g, 'reviveGoldBtn: "+3 LIVES (250 GOLD)"');
content = content.replace(/reviveAdBtn: "CONTINUE \(AD\)"/g, 'reviveAdBtn: "+3 LIVES (AD)"');
content = content.replace(/reviveGoldBtnLong: "\+3 LIVES \(100 GOLD\)"/g, 'reviveGoldBtnLong: "+3 LIVES (250 GOLD)"');

fs.writeFileSync(transPath, content, 'utf8');
console.log('✅ [ELITE UI TRANSLATIONS FIX] Completed successfully.');
