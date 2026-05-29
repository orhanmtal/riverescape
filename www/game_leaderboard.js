/**
 * RİVER ESCAPE ELİTE - game_leaderboard.js (Local Mock / GameDistribution Mode)
 * Local progress and high score management.
 */

window.Leaderboard = {
    playerID: localStorage.getItem('riverEscapeID') || "GD_PLAYER_LOCAL",
    playerName: localStorage.getItem('riverEscapeName') || "ELITE PLAYER",
    playerCountry: "🌍",
    playerFlag: "🌍",
    initialized: true,

    async init() {
        console.log("🎮 [LEADERBOARD] Initialized in Local Mode (GameDistribution)");
        this.bindEvents();
        return Promise.resolve();
    },

    async submitProgress(score, level, submitScore = true) {
        const finalScore = Math.floor(score || window.score || 0);
        let localBest = Number(localStorage.getItem('riverEscapeHighScore') || 0);
        
        if (submitScore && finalScore > localBest) {
            localBest = finalScore;
            localStorage.setItem('riverEscapeHighScore', localBest);
        }

        // Save local progress object to localStorage just like before
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
        localStorage.setItem('riverEscapeSave', JSON.stringify(data));
        console.log("✅ [LEADERBOARD] Progress saved locally.");
    },

    async restoreFromCloud(callback) {
        // Fallback to loading local save data
        try {
            const localSaveStr = localStorage.getItem('riverEscapeSave');
            if (localSaveStr) {
                const data = JSON.parse(localSaveStr);
                console.log("📥 [LEADERBOARD] Restored local save:", data);
                
                window.totalGold = data.totalGold || 0;
                window.magnetLevel = data.magnetLevel || 0;
                window.shieldLevel = data.shieldLevel || 0;
                window.bombCount = data.bombCount || 0;
                window.ownsArmorLicense = data.ownsArmorLicense || false;
                window.hasWeapon = data.hasWeapon || false;
                window.armorCharge = data.armorCharge || 0;
                window.currentLevel = data.level || 1;
                
                localStorage.setItem('riverEscapeHighScore', data.highScore || 0);
                
                if (typeof window.saveGame === 'function') window.saveGame();
                if (typeof window.syncEliteHUD === 'function') window.syncEliteHUD();
                
                if (callback) callback(true);
            } else {
                if (callback) callback(false);
            }
        } catch (e) {
            console.error("❌ [LEADERBOARD] Restore Error:", e);
            if (callback) callback(false);
        }
    },

    async hardReset() {
        console.log("🛑 [LEADERBOARD] Performing Hard Reset...");
        localStorage.clear();
        window.location.reload();
    },

    bindEvents() {
        // No UI bindings needed
    },

    hideLeaderboard() {
        // UI removed
    },

    showLeaderboard() {
        // UI removed
    },

    renderLeaderboard(data) {
        // UI removed
    }
};
