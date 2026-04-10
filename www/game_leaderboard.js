/**
 * RİVER ESCAPE ELİTE - v1.99.4.1.10 (REVENUE INTEL HUB)
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
        
        // v1.99.4.1.5: Açılışta bekleyen rekor varsa fırlat!
        setTimeout(() => this.checkPendingSync(), 3000);
    },

    handleGuestMode() {
        // v1.99.4.1.5: OFFLINE ELITE PROTECTION 📡
        const cachedID = localStorage.getItem('riverEscapeID');
        const cachedName = localStorage.getItem('riverEscapeName') || "ELITE PLAYER";
        
        if (cachedID) {
            console.log("📡 [ELITE AUTH] Offline Elite Detected. Granting Access.");
            this.playerID = cachedID;
            this.playerName = cachedName;
            this.updateAuthUI(true, cachedName, true); // True = Offline Mode
            
            // İnternet gelirse diye pusuda bekle
            window.addEventListener('online', () => {
                console.log("🌐 [ELITE SYNC] Connection restored! Triggering cloud sync...");
                this.checkPendingSync();
            });
        } else {
            console.log("🔏 [ELITE AUTH] No cached session. Mandatory login required.");
            this.updateAuthUI(false);
        }
    },

    updateAuthUI(isLoggedIn, displayName, isOffline = false) {
        try {
            const statusText = document.getElementById('auth-status-text');
            if (statusText) {
                if (isLoggedIn) {
                    statusText.innerText = isOffline ? "ELİTE OFFLINE 📡" : "ELİTE HESAP 🏛️";
                    statusText.style.color = isOffline ? "#ffa500" : "#4caf50";
                } else {
                    statusText.innerText = "LÜTFEN GİRİŞ YAPIN 🔏";
                    statusText.style.color = "#ff4444";
                }
            }
            
            const loginBtn = document.getElementById('google-login-btn');
            if (loginBtn) {
                loginBtn.style.display = isLoggedIn ? 'none' : 'flex';
                // Eğer offline isek ve giriş yapılmamışsa login butonunu pasif/uyarıcı yapabiliriz
                if (!navigator.onLine && !isLoggedIn) {
                    loginBtn.style.opacity = "0.5";
                    loginBtn.innerText = "İNTERNET GEREKLİ 🌐";
                }
            }
 
            // ELITE BUTTONS - Sadece giriş yapıldıysa (veya offline elite ise) göster! 🏛️
            const eliteButtons = ['start-btn', 'spin-btn', 'open-shop-btn', 'leaderboard-btn', 'open-settings-btn'];
            eliteButtons.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) btn.style.display = isLoggedIn ? '' : 'none';
            });
 
            const welcomeMsg = document.getElementById('auth-welcome-msg');
            if (welcomeMsg && isLoggedIn) {
                welcomeMsg.innerText = isOffline ? `MOD: ÇEVRİMDIŞI 📡` : `HOŞ GELDİN, ${displayName.toUpperCase()}! 🏛️`;
                welcomeMsg.classList.remove('hidden');
            }
        } catch (e) { console.warn("UI Update missing elements - skipping."); }
    },

    bindEvents() {
        const elements = {
            'google-login-btn': () => this.loginWithGoogle(),
            'google-recover-btn': () => this.loginWithGoogle(),
            'save-name-btn': () => this.handleManualNameSave(),
            'logout-btn': () => this.logout()
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

    // Skoru ve İlerlemeyi Buluta Gönder (Firestore)
    async submitProgress(score, level) {
        const finalScore = Math.floor(score);
        
        // v1.99.4.1.8: OFFLINE ECONOMY SYNC - Full Asset Protection
        if (!navigator.onLine || !this.db) {
            console.log("📡 [ELITE OFFLINE] Economy change cached for pending sync.");
            localStorage.setItem('riverEscapePendingSync', 'true');
            localStorage.setItem('riverEscapePendingScore', finalScore);
            localStorage.setItem('riverEscapePendingLevel', level || 1);
            localStorage.setItem('riverEscapePendingGold', window.totalGold || 0);
            return;
        }
        
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
                totalGold: window.totalGold || 0, // v1.99.4.1.3: Kalıcı Bakiye
                magnetLevel: window.magnetLevel || 0,
                shieldLevel: window.shieldLevel || 0,
                bombCount: window.bombCount || 0,
                ownsArmorLicense: window.ownsArmorLicense || false,
                hasWeapon: window.hasWeapon || false,
                armorCharge: window.armorCharge || 0,
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

    async checkPendingSync() {
        if (!navigator.onLine || !this.db || !this.playerID) return;
        
        const hasPending = localStorage.getItem('riverEscapePendingSync');
        if (hasPending === 'true') {
            console.log("🚀 [ELITE SYNC] Pending record found. Syncing to cloud...");
            
            // Eğer offline iken altın veya level değiştiyse, en güncel hali push et
            const pScore = parseInt(localStorage.getItem('riverEscapePendingScore')) || 0;
            const pLevel = parseInt(localStorage.getItem('riverEscapePendingLevel')) || 1;
            const pGold = parseInt(localStorage.getItem('riverEscapePendingGold')) || window.totalGold || 0;
            
            // Veri bütünlüğü için globali güncelle (eğer yereldeki daha yüksekse)
            if (pGold > (window.totalGold || 0)) window.totalGold = pGold;
            
            await this.submitProgress(pScore, pLevel);
            
            localStorage.removeItem('riverEscapePendingSync');
            localStorage.removeItem('riverEscapePendingScore');
            localStorage.removeItem('riverEscapePendingLevel');
            localStorage.removeItem('riverEscapePendingGold');
            console.log("✅ [ELITE SYNC] Pending record synced successfully!");
        }
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
                console.log("💻 [ELITE AUTH] Web/Mobile Browser, Redirect Flow Triggered...");
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.setCustomParameters({ prompt: 'select_account' });
                await this.auth.signInWithRedirect(provider);
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
                    transition: transform 0.2s;
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
                myRankEl.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="color:#fff; font-weight:900;">SIRAN: ${myRank.rank || '?'}</span>
                        <span style="color:rgba(255,255,255,0.6); font-size:11px;">SKORUN: ${Math.floor(myRank.score || 0)}</span>
                    </div>
                    <span style="color:#FFD700; font-weight:900;">${this.playerFlag}</span>
                `;
            }
        });
    }
};

// Başlat
Leaderboard.init();
