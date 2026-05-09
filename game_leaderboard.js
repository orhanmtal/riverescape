/**
 * RİVER ESCAPE ELİTE - v1.99.68 (CRAZYGAMES CLOUD SYNC)
 * CrazyGames SDK Veri Senkronizasyon Sistemi
 */

window.Leaderboard = {
    playerID: localStorage.getItem('riverEscapeID') || null,
    playerName: localStorage.getItem('riverEscapeName') || "ELITE PLAYER",
    playerCountry: localStorage.getItem('riverEscapeCountry') || "??",
    playerFlag: "🌍",

    init() {
        console.log("🎮 [ELITE AUTH] CrazyGames SDK Initialization...");
        
        // v1.99.65.00: CrazyGames Auth System
        if (window.CrazyGames && window.CrazyGames.SDK) {
            this.playerID = this.playerID || "cg_" + Math.random().toString(36).substr(2, 9);
            this.playerName = this.playerName || "ELITE PLAYER";
            
            localStorage.setItem('riverEscapeName', this.playerName);
            localStorage.setItem('riverEscapeID', this.playerID);
            
            // Sync with CrazyGames User if available
            if (window.CrazyGames.SDK.user && typeof window.CrazyGames.SDK.user.getUser === 'function') {
                window.CrazyGames.SDK.user.getUser().then(user => {
                    if (user) {
                        this.playerName = user.username;
                        this.playerID = user.userId;
                        localStorage.setItem('riverEscapeName', this.playerName);
                        localStorage.setItem('riverEscapeID', this.playerID);
                        this.updateAuthUI(true, this.playerName, false, user.profilePictureUrl);
                    }
                }).catch(e => console.warn("CrazyGames User not available:", e));
            }
        }

        this.bindEvents();
        this.restoreFromCloud(); // İlk açılışta buluttan verileri çek

        // Ülke tespiti
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
        // v1.99.68: Leaderboard UI Listeners
        const lbBackBtn = document.getElementById('leaderboard-back-btn');
        if (lbBackBtn) {
            lbBackBtn.onclick = () => {
                const lbScreen = document.getElementById('leaderboard-screen');
                if (lbScreen) {
                    lbScreen.classList.remove('active');
                    lbScreen.classList.add('hidden');
                }
            };
        }
    },

    async showLeaderboard() {
        const lbScreen = document.getElementById('leaderboard-screen');
        const lbList = document.getElementById('leaderboard-list');
        
        if (!lbScreen || !lbList) return;

        lbScreen.classList.remove('hidden');
        lbScreen.classList.add('active');
        lbList.innerHTML = '<div style="text-align: center; color: #00e5ff; padding: 40px; font-weight: bold; animation: pulse 1s infinite;">CRAZYGAMES BULUTUNDAN VERİLER ÇEKİLİYOR...</div>';

        if (!window.CrazyGames || !window.CrazyGames.SDK || !window.CrazyGames.SDK.leaderboard) {
            lbList.innerHTML = '<div style="text-align: center; color: #ff5252; padding: 40px;">CRAZYGAMES SDK HAZIR DEĞİL.</div>';
            return;
        }

        try {
            // v1.99.68: Fetch High Scores from CrazyGames SDK
            const results = await window.CrazyGames.SDK.leaderboard.getHighScores('TopRiders');
            this.renderLeaderboard(results.items || []);
        } catch (e) {
            console.error("Leaderboard fetch error:", e);
            lbList.innerHTML = '<div style="text-align: center; color: #ff5252; padding: 40px;">SIRALAMA VERİSİ ALINAMADI.</div>';
        }
    },

    renderLeaderboard(data) {
        const lbList = document.getElementById('leaderboard-list');
        if (!lbList) return;

        if (!data || data.length === 0) {
            lbList.innerHTML = '<div style="text-align: center; color: #aaa; padding: 40px;">HİÇ SKOR BULUNAMADI. İLK SEN OL!</div>';
            return;
        }

        let html = '';
        data.forEach((item, index) => {
            const isMe = item.userId === this.playerID;
            const rankEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
            const rankColor = index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "#aaa";
            
            html += `
                <div style="background: ${isMe ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255,255,255,0.03)'}; 
                            border: 1px solid ${isMe ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255,255,255,0.1)'}; 
                            border-radius: 15px; padding: 15px; display: flex; align-items: center; gap: 15px;
                            box-shadow: ${isMe ? '0 0 15px rgba(0, 229, 255, 0.2)' : 'none'};
                            transition: transform 0.2s ease;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: 900; color: ${rankColor}; font-size: 18px;">
                        ${rankEmoji || (index + 1)}
                    </div>
                    <div style="flex: 1;">
                        <div style="color: #fff; font-family: 'Outfit'; font-weight: 900; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                            ${item.username.toUpperCase()} ${isMe ? '<span style="font-size: 10px; background: #00e5ff; color: #000; padding: 2px 6px; border-radius: 10px;">SEN</span>' : ''}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #00e5ff; font-family: 'Outfit'; font-weight: 900; font-size: 18px;">${item.score.toLocaleString()}</div>
                        <div style="color: rgba(255,255,255,0.3); font-size: 10px; font-weight: bold; text-transform: uppercase;">SKOR</div>
                    </div>
                </div>
            `;
        });

        lbList.innerHTML = html;
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
