/**
 * RİVER ESCAPE ELİTE - v1.99.40.01 (CLOUD SYNC)
 * Firebase Firestore Global Sıralama ve Profil Senkronizasyon Sistemi
 * v1.99.40.01
 */

window.Leaderboard = {
    // FIREBASE YAPILANDIRMASI (CONNECTED v1.99.23.00!)
    firebaseConfig: {
        apiKey: "AIzaSyBVLsQ9I8UAzBYRqWcRYkHUHTQz5xrTHgs",
        authDomain: "riverescapeglobal.firebaseapp.com",
        projectId: "riverescapeglobal",
        storageBucket: "riverescapeglobal.firebasestorage.app",
        messagingSenderId: "542497054139",
        appId: "1:542497054139:web:492767a415169d6e87789e",
        measurementId: "G-RX0NEJ4CR1"
    },
    
    db: null,
    playerID: localStorage.getItem('riverEscapeID') || null,
    playerName: localStorage.getItem('riverEscapeName') || "ELITE PLAYER",
    playerCountry: localStorage.getItem('riverEscapeCountry') || "??",
    playerFlag: "🌍",

    init() {
        // v1.99.65.00: CrazyGames Auth Bypass
        if (window.isCrazyGames) {
            console.log("🎮 [ELITE AUTH] CrazyGames Bypass Active.");
            this.playerID = this.playerID || "cg_" + Math.random().toString(36).substr(2, 9);
            this.playerName = this.playerName || "GUEST PLAYER";
            localStorage.setItem('riverEscapeName', this.playerName);
            localStorage.setItem('riverEscapeID', this.playerID);
        }
        try {
            // Firebase Başlat (Eğer SDK yüklendiyse)
            if (typeof firebase !== 'undefined') {
                if (!firebase.apps.length) {
                    firebase.initializeApp(this.firebaseConfig);
                    
                }
                this.db = firebase.firestore();
                this.auth = firebase.auth();
                this.analytics = firebase.analytics();
                
                // İlk açılış sinyali
                this.analytics.logEvent('app_open', { version: window.ELITE_CONFIG ? window.ELITE_CONFIG.VERSION : '1.99.63.63' });
                

                // v1.99.23.00: [ELITE SECURITY] Oturum kalıcılığını yerel hafızaya kilitle
                this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                    .then(() => {})
                    .catch(e => console.warn("🔐 [ELITE AUTH] Persistence Error:", e));

                // v1.99.64.01: [ELITE SECURITY] Redirect result only for WEB to avoid Dynamic Links dependency
                const isWebBrowser = !window.Capacitor || window.Capacitor.getPlatform() === 'web';
                if (isWebBrowser) {
                    try {
                        this.auth.getRedirectResult().then(result => {
                            if (result && result.user) {
                                this.playerID = result.user.uid;
                                this.playerName = result.user.displayName;
                                localStorage.setItem('riverEscapeName', this.playerName);
                                localStorage.setItem('riverEscapeID', this.playerID);
                                this.updateAuthUI(true, this.playerName);
                                this.restoreFromCloud();
                                if (typeof showToast === 'function') {
                                    const welcome = translations[currentLang].welcomeMsg.replace('{name}', this.playerName.toUpperCase());
                                    showToast(welcome, true);
                                }
                            }
                        }).catch(err => {
                            console.error("❌ [ELITE AUTH] Redirect Result Error:", err);
                        });
                    } catch(reDirErr) { console.warn("Redirect handler initialization failed."); }
                }

                // AUTH STATE LISTENER (Safe Wrapper)
                this.auth.onAuthStateChanged(user => {
                    this.resetGlobalGameState(); // v1.99.33.79: Prevent multi-user inheritance
                    try {
                        if (user) {
                            
                            this.playerID = user.uid;
                            this.playerName = user.displayName;
                            localStorage.setItem('riverEscapeName', this.playerName);
                            localStorage.setItem('riverEscapeID', this.playerID);
                            
                            this.updateAuthUI(true, user.displayName, false, user.photoURL);
                            this.restoreFromCloud();
                        } else {
                            
                            this.handleNoAuth();
                        }
                    } catch (authErr) {
                        console.error("❌ [ELITE AUTH] Error in State Change:", authErr);
                    }
                });

                // v1.99.20.01: Online/Offline Heartbeat
                window.addEventListener('online', () => this.updateAuthUI(this.auth.currentUser !== null, this.playerName, false, this.auth.currentUser ? this.auth.currentUser.photoURL : null));
                window.addEventListener('offline', () => this.updateAuthUI(this.auth.currentUser !== null, this.playerName, true));
            }
        } catch (e) {
            console.error("❌ [ELITE INIT] Critical Error during Firebase Setup:", e);
            this.handleNoAuth();
        }

        // Event Listener'ları Güvenli Bağla
        this.bindEvents();

        // Ülke tespiti (Arka planda, açılışı engellemeden)
        if (this.playerCountry === "??") {
            setTimeout(() => this.detectCountry(), 1000);
        } else {
            this.playerFlag = this.getFlagEmoji(this.playerCountry);
            this.updateUI();
        }

        
    },

    handleNoAuth() {
        
        this.updateAuthUI(false);
    },

    updateAuthUI(isLoggedIn, displayName, isOffline = false, photoURL = null) {
        try {
            // v1.99.20.01: HARD GATE ENFORCEMENT
            // Legacy security overlay logic removed

            if (statusText) {
                if (isLoggedIn) {
                    statusText.innerText = isOffline ? t.statusOffline : t.statusOnline;
                    statusText.style.color = "#4caf50";
                } else {
                    statusText.innerText = t.statusLoginRequired;
                    statusText.style.color = "#ff4444";
                }
            }
            
            // v1.99.21.01: DYNAMIC IDENTITY MAPPING
            const pfpImg = document.getElementById('player-pfp-img');
            const pfpInitial = document.getElementById('player-pfp-initial');
            const eliteNameDisplay = document.getElementById('player-name-elite');
            const hudNameDisplay = document.getElementById('playerName-hud');

            if (isLoggedIn) {
                const finalName = (displayName || "ELITE PLAYER").toUpperCase();
                if (eliteNameDisplay) eliteNameDisplay.innerText = finalName;
                if (hudNameDisplay) hudNameDisplay.innerText = finalName;
                
                if (photoURL) {
                if (pfpImg) {
                    pfpImg.src = photoURL;
                    pfpImg.style.display = 'block';
                }
                if (pfpInitial) pfpInitial.style.display = 'none';
            } else if (pfpInitial) {
                pfpInitial.style.display = 'block';
                if (pfpImg) pfpImg.style.display = 'none';
            }

            const loginBtn = document.getElementById('google-login-btn');
            if (loginBtn) {
                loginBtn.style.display = isLoggedIn ? 'none' : 'flex';
            }
            
            // ELITE BUTTONS - v1.99.5.82: MANDATORY LOGIN ENFORCED
            const eliteButtons = ['start-btn', 'spin-btn', 'open-shop-btn', 'leaderboard-btn', 'open-settings-btn'];
            eliteButtons.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.style.display = (isLoggedIn && isOnline) ? 'flex' : 'none';
                }
            });
  
            const welcomeMsg = document.getElementById('auth-welcome-msg');
            if (welcomeMsg && isLoggedIn) {
                const t = translations[currentLang];
                welcomeMsg.innerText = isOffline ? t.statusOffline : t.welcomeMsg.replace('{name}', displayName.toUpperCase());
                welcomeMsg.classList.remove('hidden');
            }

            // v1.99.27.00: ELITE IDENTITY TRIGGER (ZERO-LAG)
            const profileBanner = document.getElementById('player-profile-elite');
            if (profileBanner && isLoggedIn) {
                profileBanner.style.cursor = 'pointer';
                profileBanner.style.pointerEvents = 'auto'; // Force interaction

                const openModal = (e) => {
                    if (e) {
                        if (e.cancelable) e.preventDefault();
                        e.stopPropagation();
                    }
                    
                    const modal = document.getElementById('identity-modal');
                    const input = document.getElementById('player-name-input');
                    if (modal && input) {
                        input.value = (this.playerName || "ELITE PLAYER").toUpperCase();
                        modal.style.display = 'flex';
                        modal.style.opacity = '0';
                        modal.classList.add('active');
                        // v1.99.27.01: Yıldırım hızıyla göster!
                        requestAnimationFrame(() => {
                            modal.style.opacity = '1';
                        });
                        input.focus();
                    }
                };

                profileBanner.onclick = openModal;
                profileBanner.ontouchstart = openModal; 
            }
        }
    } catch (e) { console.warn("UI Update missing elements - skipping.", e); }
    },

    // v1.99.22.00: CLOUD IDENTITY SYNC
    async updatePlayerName(newName) {
        if (!newName || newName.length < 3) {
            if (typeof showToast === 'function') showToast(translations[currentLang].nameMinLength, false);
            return;
        }
        if (!this.db || !this.auth.currentUser) return;

        
        try {
            const user = this.auth.currentUser;
            const cleanName = newName.trim().toUpperCase();

            // 1. Firebase Auth Profili Güncelle
            await user.updateProfile({ displayName: cleanName });

            // 2. Firestore Leaderboard Dökümanını Güncelle (ROP RIDERS Sync)
            await this.db.collection('leaderboard').doc(user.uid).set({
                name: cleanName
            }, { merge: true });

            // 3. Yerel Hafızayı Güncelle
            this.playerName = cleanName;
            localStorage.setItem('riverEscapeName', cleanName);

            // 4. UI'yi Yenile
            this.updateAuthUI(true, cleanName, false, user.photoURL);
            
            if (typeof showToast === 'function') showToast(translations[currentLang].identitySynced, true);
            const modal = document.getElementById('identity-modal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.opacity = '0';
                setTimeout(() => { modal.style.display = 'none'; }, 300);
            }
        } catch (e) {
            console.error("❌ [ELITE IDENTITY] Sync Error:", e);
            if (typeof showToast === 'function') showToast(translations[currentLang].identityError, false);
        }
    },

    bindEvents() {
        const elements = {
            'google-login-btn': () => this.loginWithGoogle(),
            'google-recover-btn': () => this.loginWithGoogle(),
            'save-name-btn': () => this.handleManualNameSave(),
            // 'logout-btn' dinleyicisi Ayarlar ekranı tarafından yönetilecek (v1.99.63.77)
            'close-identity-btn': () => {
                const modal = document.getElementById('identity-modal');
                if (modal) {
                    modal.classList.remove('active');
                    modal.style.opacity = '0';
                    setTimeout(() => { modal.style.display = 'none'; }, 300);
                }
            },
            'save-identity-btn': () => {
                const input = document.getElementById('player-name-input');
                if (input) {
                    this.updatePlayerName(input.value);
                }
            }
        };
        for (let id in elements) {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', elements[id]);
        }
    },

    handleManualNameSave() {
        const input = document.getElementById('player-name-input');
        if (!input) return;
        let newRes = input.value.trim();
        if (newRes.length > 0) {
            newRes = newRes.substring(0, 12);
            this.playerName = newRes;
            localStorage.setItem('riverEscapeName', newRes);
            this.updateUI();
            
            const modal = document.getElementById('name-modal-overlay');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
            if (this.db) {
                // v1.99.4.1.3: Tüm Varlıkları Buluta Mühürle! 🛰️💰
                this.db.collection('leaderboard').doc(this.playerID).set({
                    name: this.playerName,
                    totalGold: window.totalGold || 0,
                    magnetLevel: window.magnetLevel || 0,
                    shieldLevel: window.shieldLevel || 0,
                    bombCount: window.bombCount || 0,
                    ownsArmorLicense: window.ownsArmorLicense || false,
                    hasWeapon: window.hasWeapon || false,
                    armorCharge: window.armorCharge || 0,
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
            if (typeof showToast === 'function') showToast(translations[currentLang].nameUpdated, true);
        } else {
            if (typeof showToast === 'function') showToast(translations[currentLang].invalidName, false);
        }
    },

    updateUI() {
        const nameEl = document.getElementById('player-name-main');
        const flagEl = document.getElementById('player-flag-main');
        if (nameEl) nameEl.innerText = this.playerName.toUpperCase();
        if (flagEl) flagEl.innerText = this.playerFlag;
    },

    promptName() {
        const modal = document.getElementById('name-modal-overlay');
        const input = document.getElementById('player-name-input');
        if (modal && input) {
            input.value = this.playerName === "ELITE PLAYER" ? "" : this.playerName;
            modal.classList.remove('hidden');
            modal.classList.add('active');
            modal.style.display = 'flex';
            input.focus();
        }
    },

    async detectCountry() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            this.playerCountry = data.country_code || "??";
            this.playerFlag = this.getFlagEmoji(this.playerCountry);
            localStorage.setItem('riverEscapeCountry', this.playerCountry);
            this.updateUI();
        } catch (e) {
            console.warn("Country detection error, fallback to default.");
            const lang = navigator.language || "en-US";
            this.playerCountry = lang.split('-')[1] || "??";
            this.playerFlag = this.getFlagEmoji(this.playerCountry);
            this.updateUI();
        }
    },

    getFlagEmoji(countryCode) {
        if (!countryCode || countryCode === "??") return "🌍";
        const codePoints = countryCode
          .toUpperCase()
          .split('')
          .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    },

    // v1.99.64.123: submitScore = true only on gameOver, false for shop/ad sync
    async submitProgress(score, level, submitScore = true) {
        if (!navigator.onLine || !this.db || !this.playerID) {
            console.warn("📡 [ELITE SYNC] Blocked: Offline or Unauthenticated.");
            return;
        }

        const finalScore = Math.floor(score || window.score || 0);
        
        // v1.99.63.77: [ELITE HIGH SCORE PROTECTION]
        let localBest = Number(localStorage.getItem('riverEscapeHighScore') || 0);
        if (submitScore && finalScore > localBest) {
            localBest = finalScore;
            localStorage.setItem('riverEscapeHighScore', localBest);
        }
        
        try {
            const payload = {
                id: this.playerID,
                name: this.playerName,
                // v1.99.64.123: Only write score field on actual game-over submit
                ...(submitScore ? { score: localBest, currentScore: finalScore } : {}),
                totalGold: Math.floor(window.totalGold || 0),
                magnetLevel: window.magnetLevel || 0,
                shieldLevel: window.shieldLevel || 0,
                bombCount: window.bombCount || 0,
                ownsArmorLicense: !!window.ownsArmorLicense,
                hasWeapon: !!window.hasWeapon,
                armorCharge: window.armorCharge || 0,
                level: level || window.currentLevel || 1,
                country: this.playerCountry,
                flag: this.playerFlag,
                missionCycle: (window.MissionManager) ? window.MissionManager.getMissions()[0]?.cycle || 1 : 1,
                missions: (window.MissionManager) ? window.MissionManager.getMissions() : [],
                sessionLevel: window.currentLevel || 1,
                sessionProgress: window.levelProgressTime || 0,
                sessionLives: window.lives || 3,
                sessionScore: finalScore,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            };

            console.log("🛰️ [ELITE SYNC] Sending Payload:", payload);

            if (submitScore) {
                // v1.99.64.124: FIRESTORE TRANSACTION - Cloud score never regresses
                const docRef = this.db.collection('leaderboard').doc(this.playerID);
                await this.db.runTransaction(async (transaction) => {
                    const snap = await transaction.get(docRef);
                    const cloudScore = snap.exists ? (Number(snap.data().score) || 0) : 0;
                    const safeScore = Math.max(localBest, cloudScore);
                    if (safeScore > localBest) localStorage.setItem('riverEscapeHighScore', safeScore);
                    transaction.set(docRef, { ...payload, score: safeScore, currentScore: finalScore }, { merge: true });
                    console.log('[ELITE TX] Cloud:' + cloudScore + ' Local:' + localBest + ' Written:' + safeScore);
                });
            } else {
                // Inventory/gold sync - do NOT touch score field
                const basePayload = Object.fromEntries(Object.entries(payload).filter(([k]) => k !== 'score' && k !== 'currentScore'));
                await this.db.collection('leaderboard').doc(this.playerID).set(basePayload, { merge: true });
            }
            console.log("✅ [ELITE SYNC] Firestore Sync Success!");
            
            // v1.99.63.77: Gelişmiş Analytics Takibi
            if (this.analytics) {
                this.analytics.logEvent('score_submitted', {
                    score: finalScore,
                    level: payload.level
                });
                if (payload.level > 1) {
                    this.analytics.logEvent('level_reached', { level: payload.level });
                }
            }
            
            if (typeof showToast === 'function' && score > 0) showToast(translations[currentLang].dataSynced, true);
        } catch (e) {
            console.error("❌ [ELITE SYNC] Firestore Sync Error:", e);
            // Detailed error analysis
            if (e.code === 'permission-denied') console.warn("🔐 [SECURITY] Firestore rules rejected the write.");
            if (e.code === 'invalid-argument') console.warn("🧱 [DATA] Invalid payload structure.");
        }
    },

    // En İyi 10 Oyuncuyu Firebase'den Çek
    async getGlobalRankings(callback) {
        // v1.99.65.10: CrazyGames SDK Leaderboard Implementation
        const isCG = window.isCrazyGames || (window.CrazyGames && window.CrazyGames.SDK);
        
        if (isCG) {
            console.log("📊 [ELITE] Routing to CrazyGames Leaderboard SDK...");
            if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.leaderboard) {
                try {
                    window.CrazyGames.SDK.leaderboard.getScores({
                        leaderboardName: 'Global',
                        order: 'desc',
                        limit: 10
                    }, (err, response) => {
                        if (err) {
                            console.error("❌ [ELITE] CG Leaderboard Fetch Error:", err);
                            callback([], { rank: '-', name: this.playerName, score: 0, flag: '🏁' });
                            return;
                        }
                        
                        const scores = response.items || [];
                        const rankings = scores.map((s, idx) => ({
                            rank: idx + 1,
                            name: (s.user.username || 'Guest').toUpperCase(),
                            score: s.score,
                            flag: '🏁',
                            id: s.user.userId
                        }));
                        
                        // v1.99.65.11: [ELITE] Improved User Rank Detection
                        let myRank = rankings.find(r => r.name === this.playerName.toUpperCase());
                        
                        if (!myRank && window.CrazyGames && window.CrazyGames.SDK.user) {
                            // If not in Top 10, try to get user's specific info
                            const user = window.CrazyGames.SDK.user.systemInfo; 
                            const localHS = parseInt(localStorage.getItem('riverEscapeHighScore')) || 0;
                            myRank = { rank: '??', name: (user && user.username ? user.username : this.playerName).toUpperCase(), score: localHS, flag: '🏁' };
                        } else if (!myRank) {
                             myRank = { rank: '-', name: this.playerName, score: parseInt(localStorage.getItem('riverEscapeHighScore')) || 0, flag: '🏁' };
                        }
                        
                        callback(rankings, myRank);
                    });
                    return; // Prevent Firebase fallback
                } catch (sdkErr) {
                    console.warn("⚠️ [ELITE] CG SDK Leaderboard fail:", sdkErr);
                }
            }
            
            // Fallback for CG environment if SDK not ready
            const localHS = parseInt(localStorage.getItem('riverEscapeHighScore')) || 0;
            callback([], { rank: '-', name: this.playerName, score: localHS, flag: '🏁' });
            return;
        }

        if (!navigator.onLine || !this.db) {
            console.warn("⚠️ [LEADERBOARD] Cannot fetch rankings: Offline or No DB.");
            const localHS = parseInt(localStorage.getItem('riverEscapeHighScore')) || 0;
            callback([], { rank: '-', name: this.playerName, score: localHS, flag: this.playerFlag });
            return;
        }

        
        try {
            const snapshot = await this.db.collection('leaderboard')
                .orderBy('score', 'desc')
                .limit(10)
                .get();

            const rankings = [];
            let i = 1;
            snapshot.forEach(doc => {
                rankings.push({ rank: i++, ...doc.data() });
            });

            // Kendi sıramızı bul
            let myRank = rankings.find(r => r.id === this.playerID);
            
            if (myRank) {
                callback(rankings, myRank);
            } else {
                // Top 10'da değiliz, gerçek sıramızı bulmaya çalışalım (Count Query)
                try {
                    const myDoc = await this.db.collection('leaderboard').doc(this.playerID).get();
                    if (myDoc.exists) {
                        const myData = myDoc.data();
                        // v1.99.5.78: Modern Aggregate Count for Rank Calculation (Compat v9)
                        const betterSnapshot = await this.db.collection('leaderboard')
                            .where('score', '>', myData.score)
                            .get();
                        
                        const actualRank = betterSnapshot.size + 1;
                        callback(rankings, { rank: actualRank, ...myData });
                    } else {
                        // Henüz kaydımız yok, en azından skoru yerelden gösterelim
                        const localHS = parseInt(localStorage.getItem('riverEscapeHighScore')) || 0;
                        callback(rankings, { rank: '-', name: this.playerName, score: localHS, flag: this.playerFlag });
                    }
                } catch (rankErr) {
                    console.warn("Rank fetch failed, fallback to '?'");
                    const localHS = parseInt(localStorage.getItem('riverEscapeHighScore')) || 0;
                    callback(rankings, { rank: '?', name: this.playerName, score: localHS, flag: this.playerFlag });
                }
            }
        } catch (e) {
            console.error("❌ [LEADERBOARD] Firestore Download Error:", e);
            if (typeof showToast === 'function') showToast(translations[currentLang].rankingsFetchError, false);
            callback([], null);
        }
    },

    // v1.99.3.30: TÜM VERİLERİ ZORLA EŞİTLE (Cloud Backup)
    // v1.99.20.02: ELITE SYNC BRIDGE (Logic Merge)
    async getTopScores() {
        if (window.isCrazyGames && window.CrazyGames && window.CrazyGames.SDK) {
            return []; 
        }
        if (!this.db) return [];
        this.submitProgress();
    },

    // v1.99.3.30: BULUTTAN VERİLERİ KURTAR (Restore Assets)
    async restoreFromCloud(callback) {
        if (!this.db || !navigator.onLine || !this.playerID) return;
        try {
            const doc = await this.db.collection('leaderboard').doc(this.playerID).get();
            if (doc.exists) {
                const data = doc.data();
                
                
                // 💰 Kasa Senkronu (v1.99.33.79: Strict Overwrite - No inheritance)
                if (data.totalGold !== undefined) window.totalGold = Number(data.totalGold);
                else if (data.gold !== undefined) window.totalGold = Number(data.gold);
                
                // 🛠️ Envanter Senkronu (Strict Assignment)
                if (data.magnetLevel !== undefined) window.magnetLevel = Number(data.magnetLevel);
                if (data.shieldLevel !== undefined) window.shieldLevel = Number(data.shieldLevel);
                if (data.bombCount !== undefined) window.bombCount = Number(data.bombCount);
                if (data.armorCharge !== undefined) window.armorCharge = Number(data.armorCharge);
                
                window.ownsArmorLicense = !!data.ownsArmorLicense;
                window.hasWeapon = !!data.hasWeapon;
                
                if (data.level !== undefined) {
                    window.currentLevel = Number(data.level);
                    window.resumeLevel = Number(data.level);
                }

                // 🏆 Rekor Senkronu (v1.99.63.77: Elite High Score Restore)
                if (data.score !== undefined) {
                    localStorage.setItem('riverEscapeHighScore', Math.floor(data.score));
                }
                
                // v1.99.40.03: Precision Resume Restore
                if (data.sessionLevel !== undefined) window.resumeLevel = Number(data.sessionLevel);
                if (data.sessionProgress !== undefined) window.resumeProgressTime = Number(data.sessionProgress);
                if (data.sessionLives !== undefined) window.resumeLives = data.sessionLives;
                if (data.sessionScore !== undefined) window.resumeScore = data.sessionScore;

                // v1.99.64.02: Boathouse sync removed - Forced Standard 🛶

                // 🎯 Mission Senkronu (v1.99.33.80)
                if (data.missions && window.MissionManager && typeof window.MissionManager.syncFromCloud === 'function') {
                    window.MissionManager.syncFromCloud(data.missions, data.missionCycle || 1);
                }
                
                // 👤 İsim Senkronu
                if (data.name && data.name !== "ELITE PLAYER") {
                    this.playerName = data.name;
                    localStorage.setItem('riverEscapeName', this.playerName);
                    this.updateUI();
                }

                // Force Local Save and UI Refresh after sync
                if (typeof window.saveGame === 'function') window.saveGame();
                if (typeof window.updateShopUI === 'function') window.updateShopUI();
                if (typeof window.syncEliteHUD === 'function') window.syncEliteHUD();
                
                if (callback) callback(true);
            } else if (callback) callback(false);
        } catch (e) {
            console.error("Cloud recovery failed:", e);
            if (callback) callback(false);
        }
    },

    // v1.99.33.79: DEEP PURGE (No Inheritance between sessions)
    resetGlobalGameState() {
        
        window.totalGold = 0;
        window.ownedBoats = ['spring'];
        window.magnetLevel = 0;
        window.shieldLevel = 0;
        window.bombCount = 0;
        window.armorCharge = 0;
        window.ownsArmorLicense = false;
        window.hasWeapon = false;
        window.currentLevel = 1;
        window.score = 0;
        
        // 🎯 Reset Missions (v1.99.33.80)
        if (window.MissionManager && typeof window.MissionManager.reset === 'function') {
            window.MissionManager.reset();
        }
    },

    // v1.99.61.81: ELITE AUDIT - PURGED OFFLINE CALIBRATION (Trash Cleaned)
    clearLocalSyncPending() {
        localStorage.removeItem('riverEscapePendingSync');
        localStorage.removeItem('riverEscapePendingScore');
        localStorage.removeItem('riverEscapePendingLevel');
        localStorage.removeItem('riverEscapePendingGold');
    },

    // v1.99.61.81: TAM TEMİZLİK (Deep Wipe - No Inheritance)
    async logout() {
        const t = translations[currentLang];
        if (typeof window.showEliteConfirm === 'function') {
            window.showEliteConfirm(
                t.logoutConfirmTitle, 
                t.logoutConfirmBody, 
                t.logoutBtnLabel, 
                "🚪", 
                async () => {
                    await this.performLogout();
                }
            );
        } else {
            if (confirm(t.logoutConfirmBody)) {
                await this.performLogout();
            }
        }
    },

    async performLogout() {
        try {
            // v1.99.64.106: [ELITE SECURITY] Çıkmadan önce verileri son kez buluta mühürle
            if (typeof this.submitProgress === 'function') {
                console.log("☁️ [ELITE SYNC] Çıkış öncesi son senkronizasyon...");
                try {
                    await this.submitProgress(); 
                } catch (e) {
                    console.warn("⚠️ Son senkronizasyon başarısız, yine de çıkış yapılıyor...", e);
                }
            }

            if (this.auth) await this.auth.signOut();

            // v1.99.64.105: Native Session Purge (For Account Switching)
            const AuthPlugin = window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins.FirebaseAuthentication : null;
            if (AuthPlugin) {
                try {
                    await AuthPlugin.signOut();
                } catch (e) {
                    console.warn("⚠️ Native sign-out failed, proceeding with local purge.");
                }
            }
            
            // ELITE PURGE: Tüm oyun verilerini yerel hafızadan kazı! 🧼✨
            const keysToRemove = [
                'riverEscapeID', 'riverEscapeName', 'riverEscapeGold', 
                'riverEscapeScore', 'riverEscapeHighScore', 'riverEscapeLevel',
                'riverEscapeMagnetLevel', 'riverEscapeShieldLevel', 'riverEscapeBombCount',
                'riverEscapeWeapon', 'riverEscapeArmorLicense', 'riverEscapeArmorCharge',
                'riverEscapePendingSync', 'riverEscapePendingScore', 'riverEscapePendingLevel',
                'riverEscapeCountry', 'riverEscapeOwnedBoats', 'riverEscapeSave',
                'riverEscapeMissions', 'riverEscapeMissionCycle', 'riverEscapeLastMissionReset'
            ];
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            this.resetGlobalGameState();
            
            location.reload(); 
        } catch (e) {
            console.error("Logout failed:", e);
            location.reload();
        }
    },

    // SKOR RAPORLA
    async reportScore(score) {
        // v1.99.65.10: CrazyGames Leaderboard Integration
        if (window.isCrazyGames && window.CrazyGames && window.CrazyGames.SDK) {
            try {
                await window.CrazyGames.SDK.leaderboard.postScore('TopRiders', score);
                console.log("🏆 [ELITE] Score posted to CrazyGames Leaderboard:", score);
            } catch(e) { console.warn("CrazyGames Leaderboard post error:", e); }
            return;
        }

        if (!this.db || !this.playerID) return;
        
        try {
            await this.db.collection('leaderboard').doc(this.playerID).set({
                score: score,
                lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error("Score report failed:", e);
        }
    },

    // v1.99.4.1.10: GELİR TAKİBİ (Revenue Tracker) 💰🏦
    async reportPurchase(amountUSD) {
        if (!this.db || !this.playerID) return;
        
        try {
            const increment = firebase.firestore.FieldValue.increment(amountUSD);
            await this.db.collection('leaderboard').doc(this.playerID).set({
                totalSpentUSD: increment,
                lastPurchaseDate: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (e) {
            // Sessiz hata yönetimi
        }
    },

    // v1.99.3.31.5: NATIVE GOOGLE AUTH FORCED (Modern Modal - No Chrome)
    async loginWithGoogle() {
        const t = translations[currentLang];
        if (!this.auth) {
            if (typeof showToast === 'function') showToast(t.firebaseNoConnection, false);
            return;
        }

        try {
            console.log("🚀 [DEBUG] loginWithGoogle called!");
            if (typeof showToast === 'function') showToast("Giriş işlemi başlatılıyor...", true);
            
            if (this.analytics) this.analytics.logEvent('login_attempt_start');
            
            // 1. Capacitor Native Eklentisine Öncelik Ver
            const AuthPlugin = window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins.FirebaseAuthentication : null;

            if (AuthPlugin) {
                let result;
                try {
                    // v1.99.64.01: Simplified call - Plugin will find Client ID from google-services.json
                    result = await AuthPlugin.signInWithGoogle();
                } catch (nativeError) {
                    if (typeof showToast === 'function') showToast("❌ Google Hatası: " + nativeError.message, false);
                    throw nativeError;
                }

                if (result && result.credential && result.credential.idToken) {
                    const idToken = result.credential.idToken;
                    console.log("✅ [ELITE AUTH] ID Token received.");

                    try {
                        const fb = window.firebase;
                        if (fb && fb.auth) {
                            // v1.99.64.01: Absolute Reference to Provider
                            const Provider = fb.auth.GoogleAuthProvider;
                            if (Provider) {
                                const credential = Provider.credential(idToken);
                                await fb.auth().signInWithCredential(credential);
                                if (typeof showToast === 'function') showToast("✅ Giriş Başarılı!", true);
                            } else {
                                throw new Error("GoogleAuthProvider bulunamadı! (fb.auth var ama provider yok)");
                            }
                        } else {
                            throw new Error("Firebase (window.firebase) yüklü değil!");
                        }
                    } catch (innerError) {
                        console.error("Inner Auth Error:", innerError);
                        if (typeof showToast === 'function') showToast("❌ Detay: " + innerError.message, false);
                    }
                }
            } else {
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.setCustomParameters({ prompt: 'select_account' });

                const isWebBrowser = !window.Capacitor || window.Capacitor.getPlatform() === 'web';

                if (isWebBrowser) {
                    // Web tarayıcıda popup hala güvenli
                    await this.auth.signInWithPopup(provider);
                } else {
                    // v1.99.64.01: [ELITE ANTI-DEPRECATION] 
                    // Android/iOS üzerinde Redirect artık yasak (Dynamic Links kapanıyor).
                    // Eklenti yoksa hata ver, kullanıcıyı uyar.
                    console.error("❌ [ELITE AUTH] Native Auth Plugin missing on mobile!");
                    if (typeof showToast === 'function') showToast("Sistem hatası: Giriş modülü yüklenemedi.", false);
                }
            }
        } catch (e) {
            console.error("❌ [ELITE AUTH] Giriş Hatası:", e);
            
            if (this.analytics) this.analytics.logEvent('login_failure', { error_msg: e.message || 'unknown', code: e.code || 'no_code' });

            if (typeof showToast === 'function') {
                const errorMsg = e.message || "Giriş başarısız oldu. Lütfen tekrar deneyin.";
                showToast(`❌ ${errorMsg}`, false);
            }
        }
    },

    // v1.99.5.66: THE MISSING DATA REFRESH ENGINE 🚀
    refreshData() {
        const listEl = document.getElementById('leaderboard-list');
        const myRankEl = document.getElementById('leaderboard-my-rank');
        if(!listEl) return;
        
        const t = translations[currentLang];
        listEl.innerHTML = `<div style="color:#00e5ff; text-align:center; padding:20px; font-family:'Outfit';">${t.loadingLeaderboard}</div>`;
        
        this.getGlobalRankings((rankings, myRank) => {
            listEl.innerHTML = '';
            if(!rankings || rankings.length === 0) {
                const t = translations[currentLang];
                listEl.innerHTML = `<div style="color:#ff4444; text-align:center; padding:20px;">${t.noLeaderboardData}</div>`;
                return;
            }
            
            rankings.forEach(rider => {
                const item = document.createElement('div');
                item.style.cssText = `
                    display: flex; justify-content: space-between; align-items: center;
                    background: rgba(255,255,255,0.05); padding: 12px 15px; border-radius: 12px;
                    border: 1px solid ${rider.id === this.playerID ? '#FFD700' : 'rgba(255,255,255,0.1)'};
                    transition: opacity 0.2s ease, visibility 0.2s ease;
                `;
                item.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="color:${rider.rank <= 3 ? '#FF6D00' : '#fff'}; font-weight:900; width:20px;">${rider.rank}.</span>
                        <span>${rider.flag || '🌍'}</span>
                        <span style="font-weight:bold; color:#fff;">${(rider.name || 'UNK').substring(0,10).toUpperCase()}</span>
                    </div>
                    <div style="color:#FFD700; font-weight:900;">${Math.floor(rider.score || 0)}</div>
                `;
                listEl.appendChild(item);
            });
            
            if(myRankEl && myRank) {
                myRankEl.style.cssText = `
                    display: flex; justify-content: space-between; align-items: center;
                    background: rgba(0, 229, 255, 0.15); padding: 12px 15px; border-radius: 12px;
                    border: 1px solid #00e5ff;
                `;
                myRankEl.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="color:#fff; font-weight:900;">${myRank.rank || '-'}.</span>
                        <span>${this.playerFlag}</span>
                        <span style="font-weight:bold; color:#fff;">${this.playerName.toUpperCase()}</span>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:#FFD700; font-weight:900;">${Math.floor(myRank.score || 0)}</div>
                        <div style="color:rgba(255,255,255,0.4); font-size:9px; font-weight:bold;">${translations[currentLang].yourScoreLabel || 'SKORUN'}</div>
                    </div>
                `;
            }
        });
    }
};

// Başlat
Leaderboard.init();

// v1.99.63.77: Global Mühürleme (Dış erişim için)
window.Leaderboard = Leaderboard;
