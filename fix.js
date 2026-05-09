const fs = require('fs');
let content = fs.readFileSync('www/index.html', 'utf8');

// 1. Favicon Fix
content = content.replace(`>ğŸŒŠ</text>`, `>🌊</text>`);

// 2. Shop button logic on start screen
if (!content.includes('id="open-shop-btn"')) {
    content = content.replace(`<button id="open-leaderboard-btn" class="elite-btn-square" style="width: 10vmin;`, 
        `<button id="open-shop-btn" class="elite-btn-square" style="width: 10vmin; height: 10vmin; font-size: 5vmin; border-radius: 12px; background: rgba(255, 215, 0, 0.1); border-color: rgba(255, 215, 0, 0.3);">🛒</button>\n                <button id="open-leaderboard-btn" class="elite-btn-square" style="width: 10vmin;`);
}

// 3. Update Ad Gold logic (200 Gold Sync)
content = content.replace(/onclick="showRewardedAd\(this, '\+250 ALTIN',.*?\)"/g, `onclick="claimDailyAdGold(this)"`);
content = content.replace(/>\+250 ALTIN \(REKLAM İZLE\)</g, `>+200 ALTIN (REKLAM İZLE)<`);

// 4. Ensure CrazyGames SDK Initialization is present
if (!content.includes('Leaderboard.init()')) {
    const sdkInit = `    <script>
        // v1.99.65.16: MANDATORY ELITE INITIALIZATION
        if (typeof Leaderboard !== 'undefined' && Leaderboard.init) {
            Leaderboard.init();
        }
    </script>\n</body>`;
    content = content.replace('</body>', sdkInit);
}

// 5. Elite Version Update
content = content.replace(/1\.99\.65\.\d+/g, '1.99.65.16');

fs.writeFileSync('www/index.html', content);
console.log('✅ [ELITE FIX] index.html updated successfully with CrazyGames SDK compliance.');
