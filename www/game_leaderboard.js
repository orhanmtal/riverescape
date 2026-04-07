/**
 * RİVER ESCAPE ELİTE - game_leaderboard.js
 * Firebase Firestore Global Sıralama ve Profil Sistemi
 * v1.99.2.3
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
                console.log("🔥 Firebase Firestore Connected!");
            } catch (e) {
                console.error("Firebase connection error:", e);
            }
        } else {
            console.warn("⚠️ Firebase values are missing in game_leaderboard.js. Using MOCK MODE.");
        }

        // Benzersiz Cihaz ID'si oluştur (Yoksa)
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
        const msg = (typeof currentLang !== 'undefined' && currentLang === 'tr') ? 'Adını gir (Maks 12 karakter):' : 'Enter your name (Max 12 chars):';
        let newName = prompt(msg, this.playerName);
        if (newName && newName.trim().length > 0) {
            newName = newName.trim().substring(0, 12);
            this.playerName = newName;
            localStorage.setItem('riverEscapeName', newName);
            this.updateUI();
            
            // Eğer internet varsa ve bağlantı yüklendiyse bilgileri güncelle
            if (this.db) this.submitProgress(window.score || 0, window.currentLevel || 1);
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
            // MOCK DATA (Firebase henüz bağlanmadıysa test amaçlı)
            const mockData = [
                { rank: 1, name: "StormRider", score: 85400, flag: "🇺🇸" },
                { rank: 2, name: "RiverKing", score: 72100, flag: "🇹🇷" },
                { rank: 3, name: "AquaDash", score: 68900, flag: "🇩🇪" },
                { rank: 4, name: "VoidWalker", score: 55000, flag: "🇯🇵" },
                { rank: 5, name: "EliteMaster", score: 48200, flag: "🇬🇧" }
            ];
            callback(mockData, { rank: '-', name: this.playerName, score: 0, flag: this.playerFlag });
        }
    }
};

// Başlat
Leaderboard.init();
