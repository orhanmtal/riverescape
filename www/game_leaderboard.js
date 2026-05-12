/**
 * RİVER ESCAPE ELİTE - v1.99.70 (YANDEX GAMES SYNC)
 * Yandex Games SDK Veri Senkronizasyon Sistemi
 */

window.Leaderboard = {
    playerID: localStorage.getItem('riverEscapeID') || null,
    playerName: localStorage.getItem('riverEscapeName') || "ELITE PLAYER",
    playerCountry: localStorage.getItem('riverEscapeCountry') || "??",
    playerFlag: "🌍",
    initialized: false,
    initPromise: null,
    ysdk: null,
    lb: null,
    player: null,

    async init() {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;
        this.initPromise = this.initInternal();
        return this.initPromise;
    },

    async initInternal() {
        console.log("🎮 [YANDEX AUTH] SDK Initialization...");

        if (window.YaGames) {
            try {
                this.ysdk = await window.YaGames.init();
                window.ysdk = this.ysdk; // Global access
                this.lb = this.ysdk.leaderboards || null;

                // v1.99.70.10: Yandex Developer Panel Pause Sync
                this.ysdk.onPause(() => {
                    console.log("⏸️ [YANDEX PANEL] Pause Requested");
                    if (window.isPlaying && !window.isPaused && typeof window.togglePause === 'function') {
                        window.togglePause();
                    }
                });
                this.ysdk.onResume(() => {
                    console.log("▶️ [YANDEX PANEL] Resume Requested");
                    if (window.isPlaying && window.isPaused && typeof window.togglePause === 'function') {
                        window.togglePause();
                    }
                });
                
                // Auth Player
                try {
                    this.player = await this.ysdk.getPlayer({ scopes: false });
                    if (this.player) {
                        this.playerName = this.player.getName();
                        this.playerID = this.player.getUniqueID();
                        localStorage.setItem('riverEscapeName', this.playerName);
                        localStorage.setItem('riverEscapeID', this.playerID);
                        this.updateAuthUI(true, this.playerName, false, this.player.getPhoto('small'));
                    }
                } catch(e) {
                    console.warn("Yandex Player Auth Error (Guest Mode):", e);
                }

                // v1.99.70.12: Yandex Language Sync
                const yandexLang = this.ysdk.environment.i18n.lang;
                if (yandexLang && ['tr', 'en', 'ru'].includes(yandexLang)) {
                    console.log("🌍 [YANDEX LANG] SDK Language Detected:", yandexLang);
                    window.currentLang = yandexLang;
                    localStorage.setItem('riverEscapeLang', yandexLang);
                    // Force UI Update if possible
                    if (typeof window.updateLanguageUI === 'function') {
                        window.updateLanguageUI();
                    }
                }

                this.restoreFromCloud();
                this.ysdk.features?.LoadingAPI?.ready();
            } catch (e) {
                console.error("Yandex SDK Init Failed:", e);
            }
        } else {
            console.warn("⚠️ YaGames SDK not found on page.");
        }

        this.bindEvents();
        this.initialized = true;
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
        const finalScore = Math.floor(score || window.score || 0);
        let localBest = Number(localStorage.getItem('riverEscapeHighScore') || 0);
        
        if (submitScore && finalScore > localBest) {
            localBest = finalScore;
            localStorage.setItem('riverEscapeHighScore', localBest);
        }

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
            timestamp: Date.now()
        };

        // YANDEX CLOUD SAVE 🛰️
        if (this.player) {
            try {
                await this.player.setData({ riverEscapeSave: data }, true);
                console.log("✅ [YANDEX SYNC] Cloud Save Success!");
            } catch(e) {
                console.warn("Yandex Cloud Save Error:", e);
            }
        }

        // YANDEX LEADERBOARD POST 🏆
        if (submitScore && this.ysdk && this.ysdk.leaderboards) {
            try {
                let canSetScore = true;
                if (typeof this.ysdk.isAvailableMethod === 'function') {
                    canSetScore = await this.ysdk.isAvailableMethod('leaderboards.setScore');
                }
                if (canSetScore) {
                    await this.ysdk.leaderboards.setScore('TopRiders', finalScore);
                }
                console.log("🏆 [YANDEX LB] Score Submitted:", finalScore);
            } catch(e) {
                console.warn("Yandex Leaderboard Submit Error:", e);
            }
        }
    },

    async restoreFromCloud(callback) {
        if (!this.player) {
            if (callback) callback(false);
            return;
        }

        try {
            const cloudData = await this.player.getData(['riverEscapeSave']);
            if (cloudData && cloudData.riverEscapeSave) {
                const data = cloudData.riverEscapeSave;
                console.log("📥 [YANDEX SYNC] Data Restored:", data);
                
                window.totalGold = data.totalGold || 0;
                window.magnetLevel = data.magnetLevel || 0;
                window.shieldLevel = data.shieldLevel || 0;
                window.bombCount = data.bombCount || 0;
                window.ownsArmorLicense = data.ownsArmorLicense || false;
                window.hasWeapon = data.hasWeapon || false;
                window.armorCharge = data.armorCharge || 0;
                window.currentLevel = data.level || 1;
                
                localStorage.setItem('riverEscapeHighScore', data.highScore || 0);
                
                if (typeof saveGame === 'function') saveGame();
                if (typeof syncEliteHUD === 'function') syncEliteHUD();
                
                if (callback) callback(true);
            } else {
                if (callback) callback(false);
            }
        } catch (e) {
            console.error("❌ [YANDEX SYNC] Restore Error:", e);
            if (callback) callback(false);
        }
    },

    async hardReset() {
        console.log("🛑 [ELITE RESET] Performing Hard Reset...");
        localStorage.clear();
        if (this.player) {
            try {
                await this.player.setData({ riverEscapeSave: null }, true);
                console.log("✅ [YANDEX RESET] Cloud Wiped.");
            } catch(e) {}
        }
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
        lbScreen.classList.remove('hidden');
        lbScreen.classList.add('active');
        
        const loadingText = (window.translations && window.translations[window.currentLang]) ? window.translations[window.currentLang].loadingLeaderboard : "LOADING...";
        lbList.innerHTML = `<div style="text-align: center; color: #00e5ff; padding: 60px; font-weight: 900; font-family: 'Outfit'; letter-spacing: 2px; text-transform: uppercase;">${loadingText}</div>`;

        if (!this.ysdk || !this.ysdk.leaderboards) {
            // Local fallback
            const localBest = Number(localStorage.getItem('riverEscapeHighScore') || 0);
            this.renderLeaderboard([{ rank: 1, name: "YOU (LOCAL)", score: localBest, isMe: true }]);
            return;
        }

        try {
            const result = await this.ysdk.leaderboards.getEntries('TopRiders', { quantityTop: 5, includeUser: true });
            const items = result.entries.map(entry => ({
                name: entry.player.publicName || "PLAYER",
                score: entry.score,
                rank: entry.rank,
                isMe: entry.player.uniqueID === this.playerID
            }));
            this.renderLeaderboard(items);
        } catch (e) {
            console.error("Leaderboard fetch error:", e);
            lbList.innerHTML = `<div style="text-align: center; color: #ff5252; padding: 40px;">ERROR LOADING RANKINGS</div>`;
        }
    },

    renderLeaderboard(data) {
        const lbList = document.getElementById('leaderboard-list');
        if (!lbList) return;

        let html = '';
        data.forEach(item => {
            const isMe = item.isMe;
            const rankEmoji = item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : "";
            const itemBg = isMe ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255,255,255,0.02)';
            
            html += `
                <div style="background: ${itemBg}; border-radius: 15px; padding: 15px; margin-bottom: 10px; display: flex; align-items: center; border: 1px solid ${isMe ? '#00e5ff' : 'rgba(255,255,255,0.1)'};">
                    <div style="width: 40px; font-weight: 900; color: #00e5ff; font-size: 20px;">${rankEmoji || item.rank}</div>
                    <div style="flex: 1; color: #fff; font-weight: bold; font-family: 'Outfit';">${item.name.toUpperCase()} ${isMe ? '<span style="font-size: 10px; background: #00e5ff; color: #000; padding: 2px 5px; border-radius: 5px; margin-left: 5px;">YOU</span>' : ''}</div>
                    <div style="color: #00e5ff; font-weight: 900; font-size: 18px;">${item.score.toLocaleString()}</div>
                </div>
            `;
        });
        lbList.innerHTML = html;
    }
};
