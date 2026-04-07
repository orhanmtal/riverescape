/**
 * RİVER ESCAPE ELİTE - game_leaderboard.js
 * Firebase Firestore Global Sıralama ve Profil Senkronizasyon Sistemi
 * v1.99.3.15
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
        // Firebase Başlat (Eğer SDK yüklendiyse ve bilgiler girildiyse)
        if (typeof firebase !== 'undefined' && this.firebaseConfig.apiKey !== "YOUR_API_KEY") {
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(this.firebaseConfig);
                }
                this.db = firebase.firestore();
                this.auth = firebase.auth();
                console.log("🔥 Firebase Firestore & Auth Connected!");

                // v1.99.3.15: AUTH STATE LISTENER
                this.auth.onAuthStateChanged(user => {
                    if (user) {
                        console.log("👤 Google User Detected:", user.displayName);
                        this.playerID = user.uid;
                        this.playerName = user.displayName;
                        localStorage.setItem('riverEscapeName', this.playerName);
                        
                        // UI Güncelle
                        const statusText = document.getElementById('auth-status-text');
                        if (statusText) {
                            statusText.innerText = "ELİTE HESAP 🏛️";
                            statusText.style.color = "#4caf50";
                        }
                        const loginBtn = document.getElementById('google-login-btn');
                        if (loginBtn) loginBtn.style.display = 'none';

                        const welcomeMsg = document.getElementById('auth-welcome-msg');
                        if (welcomeMsg) {
                            welcomeMsg.innerText = `HOŞ GELDİN, ${user.displayName.toUpperCase()}! 🏛️`;
                            welcomeMsg.classList.remove('hidden');
                        }

                        // Buluttan Verileri Çek
                        this.restoreFromCloud();
                        this.updateUI();
                    } else {
                        console.log("👤 Guest Mode (No Gmail)");
                        this.playerID = localStorage.getItem('riverEscapeID');
                        if (!this.playerID) {
                            this.playerID = 'RE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
                            localStorage.setItem('riverEscapeID', this.playerID);
                        }
                    }
                });
            } catch (e) {
                console.error("Firebase connection error:", e);
            }
        } else {
            console.warn("⚠️ Firebase values are missing in game_leaderboard.js. Using MOCK MODE.");
        }

        // v1.99.3.15: GOOGLE LOGIN LISTENER
        const loginBtn = document.getElementById('google-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.loginWithGoogle());
        }

        const recoverBtn = document.getElementById('google-recover-btn');
        if (recoverBtn) {
            recoverBtn.addEventListener('click', () => this.loginWithGoogle());
        }

        const saveNameBtn = document.getElementById('save-name-btn');
        if (saveNameBtn) {
            saveNameBtn.addEventListener('click', () => {
                const input = document.getElementById('player-name-input');
                let newRes = input.value.trim();
                if (newRes.length > 0) {
                    newRes = newRes.substring(0, 12);
                    this.playerName = newRes;
                    localStorage.setItem('riverEscapeName', newRes);
                    this.updateUI();
                    
                    const modal = document.getElementById('name-modal-overlay');
                    if (modal) modal.style.display = 'none';

                    if (this.db) this.submitProgress(window.score || 0, window.currentLevel || 1);
                    if (typeof showToast === 'function') showToast("İSİM GÜNCELLENDİ! 🏆", true);
                } else {
                    if (typeof showToast === 'function') showToast("GEÇERLİ BİR İSİM GİRİN!", false);
                }
            });
        }

        if (!this.playerID) {
            this.playerID = 'RE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            localStorage.setItem('riverEscapeID', this.playerID);
        }
        
        // Ülke bayrağını hazırla
        this.playerFlag = this.getFlagEmoji(this.playerCountry);
        
        // Ülke tespiti (Sadece bir kez yap)
        if (this.playerCountry === "??") {
            this.detectCountry();
        } else {
            this.updateUI();
        }

        console.log("Leaderboard Ready:", this.playerID, this.playerName);
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
        const payload = {
            id: this.playerID,
            name: this.playerName,
            score: finalScore,
            level: level || 1,
            country: this.playerCountry,
            flag: this.playerFlag,
            // --- ELITE CLOUD SYNC DATA ---
            totalGold: window.totalGold || 0,
            magnetLevel: window.magnetLevel || 0,
            shieldLevel: window.shieldLevel || 0,
            bombCount: window.bombCount || 0,
            ownsArmorLicense: window.ownsArmorLicense || false,
            armorCharge: window.armorCharge || 0,
            hasWeapon: window.hasWeapon || false,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            // Firestore 'leaderboard' koleksiyonuna kaydet (ID çakışmasını önlemek için PlayerID kullanıyoruz)
            await this.db.collection('leaderboard').doc(this.playerID).set(payload, { merge: true });
            console.log("☁️ Global Score Updated!");
        } catch (e) {
            console.error("Firestore Upload Error:", e);
        }
    },

    // En İyi 10 Oyuncuyu Firebase'den Çek
    async getGlobalRankings(callback) {
        if (!navigator.onLine) {
            alert("Internet connection required!");
            return;
        }

        if (this.db) {
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

                // Kendi sıramızı bulmak için küçük bir ekleme
                const myRank = rankings.find(r => r.id === this.playerID) || 
                               { rank: '-', name: this.playerName, score: Math.floor(window.score || 0), flag: this.playerFlag };
                
                callback(rankings, myRank);
            } catch (e) {
                console.error("Firestore Download Error:", e);
                callback([], null);
            }
        } else {
            callback([], { rank: '-', name: this.playerName, score: 0, flag: this.playerFlag });
        }
    },

    // v1.99.3.11: TÜM VERİLERİ ZORLA EŞİTLE (Cloud Backup)
    async forceSync() {
        if (!this.db || !navigator.onLine) return;
        const s = typeof window.score !== 'undefined' ? window.score : 0;
        const l = typeof window.currentLevel !== 'undefined' ? window.currentLevel : 1;
        await this.submitProgress(s, l);
    },

    // v1.99.3.11: BULUTTAN VERİLERİ KURTAR (Restore Assets)
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

    // v1.99.3.15: GMAIL ILE GIRIŞ YAP (Elite Security)
    async loginWithGoogle() {
        if (!this.auth) {
            if (typeof showToast === 'function') showToast("FIREBASE BAĞLANTISI YOK!", false);
            return;
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await this.auth.signInWithPopup(provider);
            if (typeof showToast === 'function') showToast("GMAIL BAĞLANDI! 🏛️", true);
            
            const modal = document.getElementById('name-modal-overlay');
            if(modal) modal.style.display = 'none';
        } catch (e) {
            console.error("Google Login Error:", e);
            if (typeof showToast === 'function') showToast("GMAIL BAĞLANTI HATASI!", false);
        }
    }
};

// Başlat
Leaderboard.init();
