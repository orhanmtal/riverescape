/**
 * RİVER ESCAPE ELİTE - v1.99.9.0 (PURE DIAMOND SYNC)
 * Firebase Firestore Global Sıralama ve Profil Senkronizasyon Sistemi
 * v1.99.9.0
 */

const Leaderboard = {
    // FIREBASE YAPILANDIRMASI (CONNECTED v1.99.1.4!)
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
        console.log("🚀 [ELITE INIT] Starting Social & Cloud Infrastructure...");
        
        try {
            // Firebase Başlat (Eğer SDK yüklendiyse)
            if (typeof firebase !== 'undefined') {
                if (!firebase.apps.length) {
                    firebase.initializeApp(this.firebaseConfig);
                    console.log("✅ [ELITE INIT] Firebase Instance Initialized.");
                }
                this.db = firebase.firestore();
                this.auth = firebase.auth();
                console.log("🔥 [ELITE INIT] Firestore & Auth Connected.");

                // v1.99.3.30: [ELITE SECURITY] Oturum kalıcılığını yerel hafızaya kilitle
                this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                    .then(() => console.log("🔐 [ELITE AUTH] Persistence set to LOCAL"))
                    .catch(e => console.warn("🔐 [ELITE AUTH] Persistence Error:", e));

                // v1.99.4.1.11: [ELITE REDIRECT] Gelişmiş yönlendirme yakalayıcı (Fast-Sync)
                try {
                    this.auth.getRedirectResult().then(result => {
                        if (result && result.user) {
                            console.log("🚀 [ELITE AUTH] Redirect Girişi Başarılı:", result.user.displayName);
                            this.playerID = result.user.uid;
                            this.playerName = result.user.displayName;
                            localStorage.setItem('riverEscapeName', this.playerName);
                            localStorage.setItem('riverEscapeID', this.playerID);
                            
                            this.updateAuthUI(true, this.playerName);
                            this.restoreFromCloud();

                            if (typeof showToast === 'function') showToast(`HOŞ GELDİN ${this.playerName.toUpperCase()}! 🏛️`, true);
                        }
                    }).catch(err => {
                        console.error("❌ [ELITE AUTH] Redirect Hatası Yakalandı:", err);
                        // v1.99.4.1.11: Hata kodlarını kullanıcı için anlaşılır kıl
                        const errorMap = {
                            'auth/internal-error': "DAHİLİ BAĞLANTI HATASI! 🌐",
                            'auth/network-request-failed': "İNTERNET BAĞLANTINI KONTROL ET! 📶",
                            'auth/web-storage-unsupported': "TARAYICI DEPOLAMA DESTEKLENMİYOR! 💾"
                        };
                        if (errorMap[err.code]) {
                            if (typeof showToast === 'function') showToast(errorMap[err.code], false);
                        }
                    });
                } catch(reDirErr) { console.warn("Redirect handler initialization failed."); }

                // AUTH STATE LISTENER (Safe Wrapper)
                this.auth.onAuthStateChanged(user => {
                    try {
                        if (user) {
                            console.log("👤 [ELITE AUTH] Google User Detected:", user.displayName);
                            this.playerID = user.uid;
                            this.playerName = user.displayName;
                            localStorage.setItem('riverEscapeName', this.playerName);
                            localStorage.setItem('riverEscapeID', this.playerID);
                            
                            this.updateAuthUI(true, user.displayName, false, user.photoURL);
                            this.restoreFromCloud();
                        } else {
                            console.log("👤 [ELITE AUTH] Authentication Required.");
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

        console.log("🏁 [ELITE INIT] Initialization Finished. Player:", this.playerName);
    },

    handleNoAuth() {
        console.log("🔏 [ELITE AUTH] Mandatory Firebase authentication required.");
        this.updateAuthUI(false);
    },

    updateAuthUI(isLoggedIn, displayName, isOffline = false, photoURL = null) {
        try {
            // v1.99.20.01: HARD GATE ENFORCEMENT
            const securityOverlay = document.getElementById('security-lock-overlay');
            const securityTitle = document.getElementById('security-msg-title');
            const securityBody = document.getElementById('security-msg-body');
            const securityIcon = document.getElementById('security-icon-box');
            const securityLoginBtn = document.getElementById('security-login-trigger');
            const statusText = document.getElementById('auth-status-text');
            const t = translations[currentLang];

            const isOnline = navigator.onLine;

            if (securityOverlay) {
                if (!isOnline) {
                    securityOverlay.style.visibility = 'visible';
                    securityOverlay.style.opacity = '1';
                    securityTitle.innerText = t.securityInternetRequired || "İNTERNET GEREKLİ!";
                    if (securityBody) {
                        securityBody.style.display = 'block';
                        securityBody.style.opacity = '0.7';
                        securityBody.innerText = t.securityNoInternet || "Lütfen internet bağlantınızı kontrol edin.";
                    }
                    if (securityIcon) {
                        securityIcon.innerHTML = `
                            <svg viewBox="0 0 24 24" style="width: 80px; height: 80px; fill: none; stroke: #EA4335; stroke-width: 1.5; filter: drop-shadow(0 0 15px rgba(234,67,53,0.4));">
                                <circle cx="12" cy="12" r="10" stroke-dasharray="4 4"></circle>
                                <path d="M12 8v4M12 16h.01"></path>
                            </svg>
                        `;
                    }
                    if (securityLoginBtn) securityLoginBtn.style.display = 'none';
                } else if (!isLoggedIn) {
                    securityOverlay.style.visibility = 'visible';
                    securityOverlay.style.opacity = '1';
                    securityTitle.innerText = t.securityAuthRequired || "GİRİŞ GEREKLİ! 🔏";
                    if (securityBody) securityBody.style.display = 'none';
                    if (securityIcon) {
                        securityIcon.innerHTML = `
                            <svg viewBox="0 0 24 24" style="width: 80px; height: 80px; fill: none; stroke: rgba(255, 215, 0, 0.8); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.4)); animation: elitePulse 2.3s infinite ease-in-out;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                <circle cx="12" cy="16" r="1"></circle>
                            </svg>
                        `;
                    }
                    if (securityLoginBtn) {
                        securityLoginBtn.style.display = 'flex';
                        securityLoginBtn.onclick = () => this.loginWithGoogle();
                        const loginTxt = document.getElementById('google-login-text');
                        if (loginTxt) loginTxt.innerText = t.googleLogin || "Google ile devam et";
                    }
                } else {
                    // ALL SECURE - REMOVE LOCK
                    securityOverlay.style.opacity = '0';
                    setTimeout(() => { securityOverlay.style.visibility = 'hidden'; }, 500);
                }
            }

            if (statusText) {
                if (isLoggedIn) {
                    statusText.innerText = isOffline ? "ELİTE BİLGİ 📡" : "ELİTE HESAP 🏛️";
                    statusText.style.color = "#4caf50";
                } else {
                    statusText.innerText = "GİRİŞ YAPMANIZ GEREKLİYOR 🔏";
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
                welcomeMsg.innerText = isOffline ? `MOD: ÇEVRİMDIŞI 📡` : `HOŞ GELDİN, ${displayName.toUpperCase()}! 🏛️`;
                welcomeMsg.classList.remove('hidden');
            }

            // v1.99.22.00: IDENTITY MODAL TRIGGER
            const profileBanner = document.getElementById('player-profile-elite');
            if (profileBanner && isLoggedIn) {
                profileBanner.style.cursor = 'pointer';
                profileBanner.onclick = () => {
                    const modal = document.getElementById('identity-modal');
                    const input = document.getElementById('player-name-input');
                    if (modal && input) {
                        input.value = (this.auth.currentUser.displayName || "ELITE PLAYER").toUpperCase();
                        modal.classList.add('active');
                    }
                };
            }
        } catch (e) { console.warn("UI Update missing elements - skipping.", e); }
    },

    // v1.99.22.00: CLOUD IDENTITY SYNC
    async updatePlayerName(newName) {
        if (!newName || newName.length < 3) {
            if (typeof showToast === 'function') showToast("İSİM EN AZ 3 KARAKTER OLMALI!", false);
            return;
        }
        if (!this.db || !this.auth.currentUser) return;

        console.log("🛰️ [ELITE IDENTITY] Syncing new name to Cloud:", newName);
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
            
            if (typeof showToast === 'function') showToast("KİMLİĞİNİZ BULUTA MÜHÜRLENDİ! 🏛️", true);
            document.getElementById('identity-modal').classList.remove('active');
        } catch (e) {
            console.error("❌ [ELITE IDENTITY] Sync Error:", e);
            if (typeof showToast === 'function') showToast("KİMLİK MÜHÜRLENİRKEN HATA OLUŞTU!", false);
        }
    },

    bindEvents() {
        const elements = {
            'google-login-btn': () => this.loginWithGoogle(),
            'google-recover-btn': () => this.loginWithGoogle(),
            'save-name-btn': () => this.handleManualNameSave(),
            'logout-btn': () => this.logout(),
            'close-identity-btn': () => document.getElementById('identity-modal').classList.remove('active'),
            'save-identity-btn': () => {
                const newName = document.getElementById('player-name-input').value;
                this.updatePlayerName(newName);
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
            if (typeof showToast === 'function') showToast("İSİM GÜNCELLENDİ! 🏆", true);
        } else {
            if (typeof showToast === 'function') showToast("GEÇERLİ BİR İSİM GİRİN!", false);
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

    // v1.99.20.01: MAPPED PROGRESS SYNC (FireStore Schema Enforcement)
    async submitProgress(score, level) {
        if (!navigator.onLine || !this.db || !this.playerID) {
            console.warn("📡 [ELITE SYNC] Blocked: Offline or Unauthenticated.");
            return;
        }

        const finalScore = Math.floor(score || window.score || 0);
        
        try {
            console.log(`🚀 [ELITE SYNC] Mapped Syncing for ${this.playerName}...`);
            const payload = {
                id: this.playerID,
                name: this.playerName,
                score: finalScore,
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
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('leaderboard').doc(this.playerID).set(payload, { merge: true });
            console.log("✅ [ELITE SYNC] Cloud Mapped Update Complete!");
            if (typeof showToast === 'function' && score > 0) showToast("VERİLER BULUTA MÜHÜRLENDİ! 🏛️", true);
        } catch (e) {
            console.error("❌ [ELITE SYNC] Firestore Sync Error:", e);
        }
    },

    // En İyi 10 Oyuncuyu Firebase'den Çek
    async getGlobalRankings(callback) {
        if (!navigator.onLine || !this.db) {
            console.warn("⚠️ [LEADERBOARD] Cannot fetch rankings: Offline or No DB.");
            const localHS = parseInt(localStorage.getItem('riverEscapeHighScore')) || 0;
            callback([], { rank: '-', name: this.playerName, score: localHS, flag: this.playerFlag });
            return;
        }

        console.log("🌐 [LEADERBOARD] Fetching Top 10 Riders...");
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
            if (typeof showToast === 'function') showToast("SIRALAMA LİSTESİ ALINAMADI!", false);
            callback([], null);
        }
    },

    // v1.99.3.30: TÜM VERİLERİ ZORLA EŞİTLE (Cloud Backup)
    // v1.99.20.02: ELITE SYNC BRIDGE (Logic Merge)
    async forceSync() {
        return this.submitProgress();
    },

    // v1.99.3.30: BULUTTAN VERİLERİ KURTAR (Restore Assets)
    async restoreFromCloud(callback) {
        if (!this.db || !navigator.onLine || !this.playerID) return;
        try {
            const doc = await this.db.collection('leaderboard').doc(this.playerID).get();
            if (doc.exists) {
                const data = doc.data();
                console.log("📥 [ELITE CLOUD] All Assets Restored!");
                
                // 💰 Kasa Senkronu
                if (data.totalGold !== undefined) window.totalGold = Math.max(window.totalGold || 0, data.totalGold);
                if (data.gold !== undefined) window.totalGold = Math.max(window.totalGold || 0, data.gold);
                
                // 🛠️ Envanter Senkronu
                if (data.magnetLevel !== undefined) window.magnetLevel = Math.max(window.magnetLevel || 0, data.magnetLevel);
                if (data.shieldLevel !== undefined) window.shieldLevel = Math.max(window.shieldLevel || 0, data.shieldLevel);
                if (data.bombCount !== undefined) window.bombCount = Math.max(window.bombCount || 0, data.bombCount);
                if (data.armorCharge !== undefined) window.armorCharge = Math.max(window.armorCharge || 0, data.armorCharge);
                
                if (data.ownsArmorLicense) window.ownsArmorLicense = true;
                if (data.hasWeapon) window.hasWeapon = true;
                
                // 🗺️ Level Senkronu
                if (data.level !== undefined) {
                    window.currentLevel = Math.max(window.currentLevel || 1, data.level);
                    console.log(`🗺️ [ELITE CLOUD] Level Restored: Reached Level ${window.currentLevel}`);
                }
                
                // 👤 İsim Senkronu
                if (data.name && data.name !== "ELITE PLAYER") {
                    this.playerName = data.name;
                    localStorage.setItem('riverEscapeName', this.playerName);
                    this.updateUI();
                }

                // Force Local Save after sync
                if (typeof window.saveGame === 'function') window.saveGame();
                if (typeof window.updateShopUI === 'function') window.updateShopUI();
                if (callback) callback(true);
            } else if (callback) callback(false);
        } catch (e) {
            console.error("Cloud recovery failed:", e);
            if (callback) callback(false);
        }
    },

    // v1.99.20.02: ELITE AUDIT - PURGED OFFLINE CALIBRATION (Trash Cleaned)
    clearLocalSyncPending() {
        localStorage.removeItem('riverEscapePendingSync');
        localStorage.removeItem('riverEscapePendingScore');
        localStorage.removeItem('riverEscapePendingLevel');
        localStorage.removeItem('riverEscapePendingGold');
    },

    // v1.99.4.1.7: TAM TEMİZLİK (Deep Wipe - No Inheritance)
    async logout() {
        if (!confirm("Oturumu kapatmak istediğinize emin misiniz? Tüm yerel veriler silinecek ve ana ekrana döneceksiniz.")) return;
        
        try {
            if (this.auth) await this.auth.signOut();
            
            // ELITE PURGE: Tüm oyun verilerini yerel hafızadan kazı! 🧼✨
            const keysToRemove = [
                'riverEscapeID', 'riverEscapeName', 'riverEscapeGold', 
                'riverEscapeScore', 'riverEscapeHighScore', 'riverEscapeLevel',
                'riverEscapeMagnetLevel', 'riverEscapeShieldLevel', 'riverEscapeBombCount',
                'riverEscapeWeapon', 'riverEscapeArmorLicense', 'riverEscapeArmorCharge',
                'riverEscapePendingSync', 'riverEscapePendingScore', 'riverEscapePendingLevel',
                'riverEscapeCountry'
            ];
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            console.log("🚪 [ELITE AUTH] Logout successful. Reloading...");
            location.reload(); 
        } catch (e) {
            console.error("Logout failed:", e);
            location.reload();
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
        if (!this.auth) {
            if (typeof showToast === 'function') showToast("FIREBASE BAĞLANTISI YOK!", false);
            return;
        }

        try {
            console.log("🚀 [ELITE AUTH] Native Modern Modal Başlatılıyor...");
            if (typeof showToast === 'function') showToast("GÜVENLİ GİRİŞ AÇILIYOR...", true);
            
            // 1. Capacitor Native Eklentisine Öncelik Ver
            const AuthPlugin = window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins.FirebaseAuthentication : null;

            if (AuthPlugin) {
                console.log("📱 [ELITE AUTH] Cihaz İçi Modern Pencere Kullanılıyor!");
                const result = await AuthPlugin.signInWithGoogle();
                if (result.credential && result.credential.idToken) {
                    const credential = firebase.auth.GoogleAuthProvider.credential(result.credential.idToken);
                    const userCredential = await this.auth.signInWithCredential(credential);
                    console.log("✅ [ELITE AUTH] Modern Giriş Başarılı:", userCredential.user.displayName);
                }
            } else {
                console.log("💻 [ELITE AUTH] Platform Algılanıyor...");
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.setCustomParameters({ prompt: 'select_account' });

                // v1.99.8.5: Web Browser ise Popup, Native ise Redirect kullan
                const isWebBrowser = !window.Capacitor || window.Capacitor.getPlatform() === 'web';

                if (isWebBrowser) {
                    console.log("🖥️ [ELITE AUTH] Web Tarayıcı: Popup Kullanılıyor (Block Fix)");
                    await this.auth.signInWithPopup(provider);
                } else {
                    console.log("📱 [ELITE AUTH] Mobil Uygulama: Redirect Kullanılıyor");
                    await this.auth.signInWithRedirect(provider);
                }
            }
        } catch (e) {
            console.error("❌ [ELITE AUTH] Giriş Hatası:", e);
        }
    },

    // v1.99.5.66: THE MISSING DATA REFRESH ENGINE 🚀
    refreshData() {
        const listEl = document.getElementById('leaderboard-list');
        const myRankEl = document.getElementById('leaderboard-my-rank');
        if(!listEl) return;
        
        listEl.innerHTML = '<div style="color:#00e5ff; text-align:center; padding:20px; font-family:\'Outfit\';">YÜKLENİYOR... 🛰️</div>';
        
        this.getGlobalRankings((rankings, myRank) => {
            listEl.innerHTML = '';
            if(!rankings || rankings.length === 0) {
                listEl.innerHTML = '<div style="color:#ff4444; text-align:center; padding:20px;">VERİ ALINAMADI! 🛰️</div>';
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
                        <div style="color:rgba(255,255,255,0.4); font-size:9px; font-weight:bold;">SKORUN</div>
                    </div>
                `;
            }
        });
    }
};

// Başlat
Leaderboard.init();
