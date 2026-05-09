/**
 * RİVER ESCAPE ELİTE - v1.99.68 (CRAZYGAMES CLOUD SYNC)
 * CrazyGames SDK Veri Senkronizasyon Sistemi
 */

window.Leaderboard = {
    playerID: localStorage.getItem('riverEscapeID') || null,
    playerName: localStorage.getItem('riverEscapeName') || "ELITE PLAYER",
    playerCountry: localStorage.getItem('riverEscapeCountry') || "??",
    playerFlag: "🌍",

    async init() {
        console.log("🎮 [ELITE AUTH] CrazyGames SDK Initialization...");

        // v1.99.65.17: Wait for SDK to be available, then await init()
        let retries = 0;
        while ((!window.CrazyGames || !window.CrazyGames.SDK) && retries < 25) {
            await new Promise(r => setTimeout(r, 200));
            retries++;
        }

        if (!window.CrazyGames || !window.CrazyGames.SDK) {
            console.warn("⚠️ [ELITE AUTH] CrazyGames SDK not available after 5s.");
            this.bindEvents();
            this.restoreFromCloud();
            return;
        }

        try {
            await window.CrazyGames.SDK.init();
            console.log("✅ [ELITE AUTH] CrazyGames SDK init() resolved successfully!");
        } catch (e) {
            console.warn("⚠️ [ELITE AUTH] SDK init() threw:", e);
        }

        // Post-init user sync
        this.playerID = this.playerID || "cg_" + Math.random().toString(36).substr(2, 9);
        this.playerName = this.playerName || "ELITE PLAYER";
        localStorage.setItem('riverEscapeName', this.playerName);
        localStorage.setItem('riverEscapeID', this.playerID);

        if (window.CrazyGames.SDK.user && typeof window.CrazyGames.SDK.user.getUser === 'function') {
            try {
                const user = await window.CrazyGames.SDK.user.getUser();
                if (user) {
                    this.playerName = user.username;
                    this.playerID = user.userId;
                    localStorage.setItem('riverEscapeName', this.playerName);
                    localStorage.setItem('riverEscapeID', this.playerID);
                    this.updateAuthUI(true, this.playerName, false, user.profilePictureUrl);
                }
            } catch(e) {
                console.warn("CrazyGames User not available:", e);
            }
        }

        this.bindEvents();
        this.restoreFromCloud();

        if (this.playerCountry === "??") {
            setTimeout(() => this.detectCountry(), 1000);
        } else {
            this.playerFlag = this.getFlagEmoji(this.playerCountry);
            this.updateUI();
        }
    },

    updateAuthUI(isLoggedIn, displayName, isOffline = false, photoURL = null) {
        const pfpImg = document.getElementById('player-pfp-img');
        const eliteNameDisplay = document.getElementById('player-name-elite');
        const hudNameDisplay = document.getElementById('playerName-hud');

        const finalName = (displayName || this.playerName || "ELITE PLAYER").toUpperCase();
        if (eliteNameDisplay) eliteNameDisplay.innerText = finalName;
        if (hudNameDisplay) hudNameDisplay.innerText = finalName;
        
        if (photoURL && pfpImg) {
            pfpImg.src = photoURL;
            pfpImg.style.display = 'block';
        }
    },

    async submitProgress(score, level, submitScore = true) {
        if (!window.CrazyGames || !window.CrazyGames.SDK || !window.CrazyGames.SDK.data) {
            return;
        }

        const finalScore = Math.floor(score || window.score || 0);
        let localBest = Number(localStorage.getItem('riverEscapeHighScore') || 0);
        if (submitScore && finalScore > localBest) {
            localBest = finalScore;
            localStorage.setItem('riverEscapeHighScore', localBest);
        }

        try {
            const data = {
                totalGold: Math.floor(window.totalGold || 0),
                highScore: localBest,
                magnetLevel: window.magnetLevel || 0,
                shieldLevel: window.shieldLevel || 0,
                bombCount: window.bombCount || 0,
                ownsArmorLicense: !!window.ownsArmorLicense,
                hasWeapon: !!window.hasWeapon,
                armorCharge: window.armorCharge || 0,
                level: level || window.currentLevel || 1,
                country: this.playerCountry,
                timestamp: Date.now()
            };

            // CRAZYGAMES CLOUD SAVE 🛰️
            await window.CrazyGames.SDK.data.setItem('riverEscapeSave', data);
            console.log("✅ [ELITE SYNC] CrazyGames Cloud Save Success!");

            // Also post to CrazyGames Leaderboard if it's a score update
            if (submitScore && window.CrazyGames.SDK.leaderboard) {
                await window.CrazyGames.SDK.leaderboard.postScore('TopRiders', finalScore);
            }
        } catch (e) {
            console.error("❌ [ELITE SYNC] CrazyGames Save Error:", e);
        }
    },

    async restoreFromCloud(callback) {
        if (!window.CrazyGames || !window.CrazyGames.SDK || !window.CrazyGames.SDK.data) {
            if (callback) callback(false);
            return;
        }

        try {
            const cloudData = await window.CrazyGames.SDK.data.getItem('riverEscapeSave');
            if (cloudData) {
                console.log("📥 [ELITE SYNC] Cloud Data Restored:", cloudData);
                
                // Sync Global State
                window.totalGold = cloudData.totalGold || 0;
                window.magnetLevel = cloudData.magnetLevel || 0;
                window.shieldLevel = cloudData.shieldLevel || 0;
                window.bombCount = cloudData.bombCount || 0;
                window.ownsArmorLicense = cloudData.ownsArmorLicense || false;
                window.hasWeapon = cloudData.hasWeapon || false;
                window.armorCharge = cloudData.armorCharge || 0;
                window.currentLevel = cloudData.level || 1;
                
                localStorage.setItem('riverEscapeHighScore', cloudData.highScore || 0);
                
                if (typeof saveGame === 'function') saveGame();
                if (typeof syncEliteHUD === 'function') syncEliteHUD();
                
                if (callback) callback(true);
            } else {
                if (callback) callback(false);
            }
        } catch (e) {
            console.error("❌ [ELITE SYNC] Restore Error:", e);
            if (callback) callback(false);
        }
    },

    // v1.99.68: HARD RESET CLOUD WIPE 🛑
    async hardReset() {
        console.log("🛑 [ELITE RESET] Performing Hard Reset...");
        
        // 1. Clear Local
        localStorage.clear();
        
        // 2. Clear CrazyGames Cloud
        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.data) {
            try {
                await window.CrazyGames.SDK.data.removeItem('riverEscapeSave');
                console.log("✅ [ELITE RESET] CrazyGames Cloud Wiped.");
            } catch (e) {
                console.warn("Cloud wipe error:", e);
            }
        }
        
        // 3. Reload Game
        window.location.reload();
    },

    bindEvents() {
        const lbBackBtn = document.getElementById('leaderboard-back-btn');
        if (lbBackBtn) {
            lbBackBtn.onclick = () => this.hideLeaderboard();
        }
    },

    hideLeaderboard() {
        const lbScreen = document.getElementById('leaderboard-screen');
        if (lbScreen) {
            lbScreen.style.display = 'none';
            lbScreen.classList.remove('active');
            lbScreen.classList.add('hidden');
        }
    },

    async showLeaderboard() {
        const lbScreen = document.getElementById('leaderboard-screen');
        const lbList = document.getElementById('leaderboard-list');
        
        if (!lbScreen || !lbList) return;

        lbScreen.style.display = 'flex';
        lbScreen.style.flexDirection = 'column';
        lbScreen.classList.remove('hidden');
        lbScreen.classList.add('active');
        
        const loadingText = translations[currentLang].loadingLeaderboard || "LOADING... 🛰️";
        lbList.innerHTML = `<div style="text-align: center; color: #00e5ff; padding: 60px; font-weight: 900; font-family: 'Outfit'; letter-spacing: 2px; text-transform: uppercase; animation: pulse 1.5s infinite;">${loadingText}</div>`;

        // v1.99.68: Robust SDK Readiness Check with Retry + Mock Fallback
        let cg = window.CrazyGames;
        let retries = 0;
        
        // Mock for Localhost if SDK fails to load
        if ((!cg || !cg.SDK) && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            console.warn("SDK not found on localhost. Using Mock Data for UI Testing.");
            this.renderLeaderboard([
                { rank: 1, name: "Elite_Tester", score: 9999 },
                { rank: 2, name: "Crazy_Rider", score: 8888 },
                { rank: 3, name: "River_Master", score: 7777 },
                { rank: 4, name: "Gold_Seeker", score: 6666 },
                { rank: 5, name: "Elite_Pilot", score: 5555 }
            ]);
            return;
        }

        while ((!cg || !cg.SDK || !cg.SDK.leaderboard) && retries < 10) {
            console.log(`Waiting for CrazyGames SDK... Retry ${retries + 1}`);
            await new Promise(r => setTimeout(r, 500));
            cg = window.CrazyGames;
            retries++;
        }

        if (!cg || !cg.SDK || !cg.SDK.leaderboard) {
            console.error("CrazyGames SDK initialization timed out.");
            const errorText = translations[currentLang].firebaseNoConnection || "CONNECTION ERROR";
            let debugInfo = "";
            if (!window.CrazyGames) debugInfo = "SDK Script Not Loaded (AdBlock?)";
            else if (!window.CrazyGames.SDK) debugInfo = "SDK Object Empty";
            else if (!window.CrazyGames.SDK.leaderboard) debugInfo = "Leaderboard Module Missing";

            lbList.innerHTML = `<div style="text-align: center; color: #ff5252; padding: 40px; font-family: 'Outfit'; font-weight: bold;">${errorText}<br>
                <span style="font-size: 11px; color: #ffa726; margin-top: 15px; display: block; text-transform: uppercase;">${debugInfo}</span>
                <span style="font-size: 9px; opacity: 0.4; margin-top: 10px; display: block;">TIMEOUT (5000ms)</span></div>`;
            return;
        }

        try {
            console.log("Fetching High Scores for 'TopRiders'...");
            const results = await cg.SDK.leaderboard.getHighScores('TopRiders');
            console.log("Leaderboard success:", results);
            this.renderLeaderboard(results.items || []);
        } catch (e) {
            console.error("Leaderboard fetch error:", e);
            const errorText = translations[currentLang].rankingsFetchError || "FETCH ERROR";
            lbList.innerHTML = `<div style="text-align: center; color: #ff5252; padding: 40px; font-family: 'Outfit'; font-weight: bold;">${errorText}<br><span style="font-size: 10px; opacity: 0.5; margin-top: 10px; display: block;">${e.message || "Unknown API Error"}</span></div>`;
        }
    },

    renderLeaderboard(data) {
        const lbList = document.getElementById('leaderboard-list');
        const myRankContainer = document.getElementById('leaderboard-my-rank');
        if (!lbList) return;

        if (!data || data.length === 0) {
            const noDataText = translations[currentLang].noLeaderboardData || "NO DATA FOUND";
            lbList.innerHTML = `<div style="text-align: center; color: rgba(255,255,255,0.4); padding: 60px; font-family: 'Outfit'; font-weight: bold;">${noDataText}</div>`;
            if (myRankContainer) myRankContainer.style.display = 'none';
            return;
        }

        const scoreLabel = translations[currentLang].leaderboardScore || "SCORE";
        const meLabel = translations[currentLang].leaderboardMe || "YOU";

        // v1.99.68: Top 5 Filter + Personal Rank Logic
        const top5 = data.slice(0, 5);
        const myItem = data.find((item, idx) => {
            if (!item.rank) item.rank = idx + 1;
            return item.userId === this.playerID || (item.name === "Elite_Tester" && window.location.hostname === 'localhost');
        });

        // Render Top 5
        let html = '';
        top5.forEach((item, index) => {
            const rank = index + 1;
            const isMe = item.userId === this.playerID || (item.name === "Elite_Tester" && window.location.hostname === 'localhost');
            html += this.getLeaderboardItemHTML(item, rank, isMe, scoreLabel, meLabel);
        });
        lbList.innerHTML = html;

        // Populate Dedicated Personal Rank Box (The green pill)
        if (myRankContainer) {
            if (myItem) {
                myRankContainer.parentElement.style.display = 'block';
                myRankContainer.innerHTML = this.getLeaderboardItemHTML(myItem, myItem.rank, true, scoreLabel, meLabel);
                myRankContainer.style.background = 'transparent'; // Remove duplicate bg
                myRankContainer.style.border = 'none';
                myRankContainer.style.padding = '0';
            } else {
                // No score yet - Show placeholder
                myRankContainer.parentElement.style.display = 'block';
                myRankContainer.innerHTML = `
                    <div style="width: 100%; text-align: center; color: #00e5ff; font-family: 'Outfit'; font-weight: 900; font-size: 12px; letter-spacing: 1px; opacity: 0.6; padding: 10px;">
                        ${translations[currentLang].noScoreYet || "HENÜZ SKORUNUZ YOK"}
                    </div>`;
            }
        }
    },

    getLeaderboardItemHTML(item, rank, isMe, scoreLabel, meLabel) {
        const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";
        const rankColor = rank === 1 ? "#FFD700" : rank === 2 ? "#E0E0E0" : rank === 3 ? "#CD7F32" : "rgba(255,255,255,0.4)";
        const itemBg = isMe ? 'linear-gradient(90deg, rgba(0, 229, 255, 0.15) 0%, rgba(0, 229, 255, 0.05) 100%)' : 'rgba(255,255,255,0.02)';
        const itemBorder = isMe ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid rgba(255,255,255,0.05)';

        return `
            <div style="background: ${itemBg}; border: ${itemBorder}; border-radius: 20px; padding: 18px 22px; display: flex; align-items: center; gap: 18px; box-shadow: ${isMe ? '0 0 30px rgba(0, 229, 255, 0.15)' : 'none'}; transition: transform 0.3s ease;">
                <div style="width: 50px; height: 50px; border-radius: 14px; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-weight: 950; color: ${rankColor}; font-size: 20px; font-family: 'Outfit'; border: 2px solid ${rank <= 3 ? rankColor : 'rgba(255,255,255,0.1)'};">
                    ${rankEmoji || rank}
                </div>
                <div style="flex: 1;">
                    <div style="color: #fff; font-family: 'Outfit'; font-weight: 900; font-size: 17px; display: flex; align-items: center; gap: 10px; letter-spacing: 0.5px;">
                        ${(item.username || item.name || "ELITE RIDER").toUpperCase()} 
                        ${isMe ? `<span style="font-size: 9px; background: #00e5ff; color: #000; padding: 3px 8px; border-radius: 20px; font-weight: 900; letter-spacing: 1px;">${meLabel}</span>` : ''}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: #00e5ff; font-family: 'Outfit'; font-weight: 900; font-size: 20px; letter-spacing: 0.5px; text-shadow: 0 0 15px rgba(0,229,255,0.3);">${item.score.toLocaleString()}</div>
                    <div style="color: rgba(255,255,255,0.2); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px;">${scoreLabel}</div>
                </div>
            </div>
        `;
    },

    detectCountry() {
        // IP detection logic...
        this.playerCountry = "TR"; // Default or detect
        this.playerFlag = "🇹🇷";
        localStorage.setItem('riverEscapeCountry', this.playerCountry);
    },

    getFlagEmoji(countryCode) {
        if (!countryCode || countryCode === "??") return "🌍";
        return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
    },

    updateUI() {
        // Update flag and country text in UI
    }
};
