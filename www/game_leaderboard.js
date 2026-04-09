/**
 * RİVER ESCAPE ELİTE - game_leaderboard.js
 * Firebase Firestore Global Sıralama ve Profil Senkronizasyon Sistemi
 * v1.99.3.30
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

                // v1.99.3.30: [REDIRECT HANDLER] Yönlendirme dönüşünü daha akıllıca yakala
                try {
                    this.auth.getRedirectResult().then(result => {
                        if (result.user) {
                            console.log("🚀 [ELITE AUTH] Redirect Girişi Başarılı:", result.user.displayName);
                            if (typeof showToast === 'function') showToast(`HOŞ GELDİN ${result.user.displayName.toUpperCase()}! 🏛️`, true);
                        }
                    }).catch(err => {
                        console.error("❌ [ELITE AUTH] Redirect Hatası Yakalandı:", err);
                        // "localhost bağlamayı reddetti" gibi durumlar için detaylı log
                        if (err.code === 'auth/internal-error') {
                            console.error("⚠️ [ELITE AUTH] Olası Origin Uyuşmazlığı! Origin:", window.location.origin);
                        }
                        if (err.code === 'auth/network-request-failed') {
                            if (typeof showToast === 'function') showToast("İNTERNET BAĞLANTINI KONTROL ET!", false);
                        }
                    });
                } catch(reDirErr) { console.warn("Redirect check failed, skipping."); }

                // AUTH STATE LISTENER (Safe Wrapper)
                this.auth.onAuthStateChanged(user => {
                    try {
                        if (user) {
                            console.log("👤 [ELITE AUTH] Google User Detected:", user.displayName);
                            this.playerID = user.uid;
                            this.playerName = user.displayName;
                            localStorage.setItem('riverEscapeName', this.playerName);
                            localStorage.setItem('riverEscapeID', this.playerID);
                            
                            this.updateAuthUI(true, user.displayName);
                            this.restoreFromCloud();
                        } else {
                            console.log("👤 [ELITE AUTH] Guest Mode Activated.");
                            this.handleGuestMode();
                        }
                    } catch (authErr) {
                        console.error("❌ [ELITE AUTH] Error in State Change:", authErr);
                    }
                });
            } else {
                console.warn("⚠️ [ELITE INIT] Firebase SDK NOT FOUND. Using Offline Mode.");
                this.handleGuestMode();
            }
        } catch (e) {
            console.error("❌ [ELITE INIT] Critical Error during Firebase Setup:", e);
            this.handleGuestMode();
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

    handleGuestMode() {
        this.playerID = localStorage.getItem('riverEscapeID');
        if (!this.playerID) {
            this.playerID = 'RE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            localStorage.setItem('riverEscapeID', this.playerID);
        }
        this.updateUI();
    },

    updateAuthUI(isLoggedIn, displayName) {
        try {
            const statusText = document.getElementById('auth-status-text');
            if (statusText) {
                statusText.innerText = isLoggedIn ? "ELİTE HESAP 🏛️" : "MİSAFİR HESAP";
                statusText.style.color = isLoggedIn ? "#4caf50" : "#ffd700";
            }
            const loginBtn = document.getElementById('google-login-btn');
            if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'flex';

            const welcomeMsg = document.getElementById('auth-welcome-msg');
            if (welcomeMsg && isLoggedIn) {
                welcomeMsg.innerText = `HOŞ GELDİN, ${displayName.toUpperCase()}! 🏛️`;
                welcomeMsg.classList.remove('hidden');
            }
        } catch (e) { console.warn("UI Update missing elements - skipping."); }
    },

    bindEvents() {
        const elements = {
            'google-login-btn': () => this.loginWithGoogle(),
            'google-recover-btn': () => this.loginWithGoogle(),
            'save-name-btn': () => this.handleManualNameSave()
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

            if (this.db) this.submitProgress(window.score || 0, window.currentLevel || 1);
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

    // Skoru ve İlerlemeyi Buluta Gönder (Firestore)
    async submitProgress(score, level) {
        if (!navigator.onLine || !this.db) return;
        
        const finalScore = Math.floor(score);
        try {
            // 1. Mevcut skoru kontrol et (High Score Protection)
            const doc = await this.db.collection('leaderboard').doc(this.playerID).get();
            if (doc.exists) {
                const existingData = doc.data();
                if (existingData.score >= finalScore) {
                    console.log(`ℹ️ [LEADERBOARD] Progress skipped. Existing high score (${existingData.score}) is better than current (${finalScore}).`);
                    return;
                }
            }

            console.log(`🚀 [LEADERBOARD] New High Score! Submitting: ${finalScore}`);
            const payload = {
                id: this.playerID,
                name: this.playerName,
                score: finalScore,
                level: level || 1,
                country: this.playerCountry,
                flag: this.playerFlag,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('leaderboard').doc(this.playerID).set(payload, { merge: true });
            console.log("✅ [LEADERBOARD] Cloud High Score Updated!");
            if (typeof showToast === 'function') showToast("YENİ REKOR! SIRALAMA GÜNCELLENDİ! 🏆", true);
        } catch (e) {
            console.error("❌ [LEADERBOARD] Firestore Progress Error:", e);
        }
    },

    // En İyi 10 Oyuncuyu Firebase'den Çek
    async getGlobalRankings(callback) {
        if (!navigator.onLine || !this.db) {
            console.warn("⚠️ [LEADERBOARD] Cannot fetch rankings: Offline or No DB.");
            callback([], { rank: '-', name: this.playerName, score: 0, flag: this.playerFlag });
            return;
        }

        console.log("🌐 [LEADERBOARD] Fetching Top 10 Riders...");
        try {
            const snapshot = await this.db.collection('leaderboard')
                .orderBy('score', 'desc')
                .limit(10)
                .get();

            if (snapshot.empty) {
                console.log("ℹ️ [LEADERBOARD] Ranking list is currently EMPTY.");
                callback([], { rank: '-', name: this.playerName, score: 0, flag: this.playerFlag });
                return;
            }

            const rankings = [];
            let i = 1;
            snapshot.forEach(doc => {
                rankings.push({ rank: i++, ...doc.data() });
            });

            console.log(`✅ [LEADERBOARD] Successfully fetched ${rankings.length} riders.`);
            
            // Kendi sıramızı bul
            const myRank = rankings.find(r => r.id === this.playerID) || 
                           { rank: '?', name: this.playerName, score: Math.floor(window.score || 0), flag: this.playerFlag };
            
            callback(rankings, myRank);
        } catch (e) {
            console.error("❌ [LEADERBOARD] Firestore Download Error:", e);
            if (typeof showToast === 'function') showToast("SIRALAMA LİSTESİ ALINAMADI!", false);
            callback([], null);
        }
    },

    // v1.99.3.30: TÜM VERİLERİ ZORLA EŞİTLE (Cloud Backup)
    async forceSync() {
        if (!this.db || !navigator.onLine) return;
        const s = typeof window.score !== 'undefined' ? window.score : 0;
        const l = typeof window.currentLevel !== 'undefined' ? window.currentLevel : 1;
        await this.submitProgress(s, l);
    },

    // v1.99.3.30: BULUTTAN VERİLERİ KURTAR (Restore Assets)
    async restoreFromCloud(callback) {
        if (!this.db || !navigator.onLine || !this.playerID) return;
        try {
            const doc = await this.db.collection('leaderboard').doc(this.playerID).get();
            if (doc.exists) {
                const cloudData = doc.data();
                if (cloudData.totalGold !== undefined) {
                    window.totalGold = Math.max(window.totalGold || 0, cloudData.totalGold);
                    window.magnetLevel = Math.max(window.magnetLevel || 0, cloudData.magnetLevel || 0);
                    window.shieldLevel = Math.max(window.shieldLevel || 0, cloudData.shieldLevel || 0);
                    window.bombCount = Math.max(window.bombCount || 0, cloudData.bombCount || 0);
                    if (cloudData.ownsArmorLicense) window.ownsArmorLicense = true;
                    if (cloudData.hasWeapon) window.hasWeapon = true;
                    if (cloudData.armorCharge > (window.armorCharge || 0)) window.armorCharge = cloudData.armorCharge;
                    if (typeof window.saveGame === 'function') window.saveGame();
                    if (typeof window.updateShopUI === 'function') window.updateShopUI();
                    if (callback) callback(true);
                }
            } else if (callback) callback(false);
        } catch (e) {
            console.error("Cloud recovery failed:", e);
            if (callback) callback(false);
        }
    },

    // v1.99.4.0: NATIVE GOOGLE AUTH (Elite Production Çözümü - No Localhost Error)
    async loginWithGoogle() {
        if (!this.auth) {
            if (typeof showToast === 'function') showToast("FIREBASE BAĞLANTISI YOK!", false);
            return;
        }

        try {
            console.log("🚀 [ELITE AUTH] Native Google Login Başlatılıyor...");
            if (typeof showToast === 'function') showToast("GÜVENLİ GİRİŞ BAŞLATILDI...", true);
            
            // 1. Capacitor Native Eklentisi Kontrolü
            const FirebaseAuthPlugin = window.Capacitor && window.Capacitor.Plugins 
                                        ? window.Capacitor.Plugins.FirebaseAuthentication 
                                        : null;

            if (FirebaseAuthPlugin) {
                console.log("📱 [ELITE AUTH] Cihaz İçi Native Login Kullanılıyor!");
                // Tarayıcı veya WebView dışına çıkmadan Google ile bağlanır
                const result = await FirebaseAuthPlugin.signInWithGoogle();
                
                // Gelen güvenlik token'ını alıp Firebase web kütüphanesine tanıtıyoruz
                const credential = firebase.auth.GoogleAuthProvider.credential(result.credential.idToken);
                const userCredential = await this.auth.signInWithCredential(credential);
                
                console.log("✅ [ELITE AUTH] Native Login Başarılı:", userCredential.user.displayName);
                if (typeof showToast === 'function') showToast(`HOŞ GELDİN ${userCredential.user.displayName.toUpperCase()}! 🏛️`, true);
            } else {
                // Eklenti yoksa (Tarayıcıda deneniyorsa) standart Popup yapısına dön
                console.log("💻 [ELITE AUTH] Web Ortamı, Popup Kullanılıyor...");
                const provider = new firebase.auth.GoogleAuthProvider();
                const result = await this.auth.signInWithPopup(provider);
                if (result.user) {
                    console.log("✅ [ELITE AUTH] Web Login Başarılı:", result.user.displayName);
                    if (typeof showToast === 'function') showToast(`HOŞ GELDİN ${result.user.displayName.toUpperCase()}! 🏛️`, true);
                }
            }
        } catch (e) {
            console.error("❌ [ELITE AUTH] Google Login Hatası:", e);
            if (e.code === 'auth/popup-blocked') {
                if (typeof showToast === 'function') showToast("PENCERE ENGELLENDİ!", false);
            } else if (e.code === 'auth/popup-closed-by-user' || e.message === 'SignIn cancelled') {
                if (typeof showToast === 'function') showToast("GİRİŞ İPTAL EDİLDİ.", false);
            } else {
                if (typeof showToast === 'function') showToast("Google Giriş Hatası!", false);
            }
        }
    }
};

// Başlat
Leaderboard.init();
