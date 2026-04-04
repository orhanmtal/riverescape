// CACHE BUSTER V3 (Tüm Önbellek Kırıldı, Yeni Mekanikler Eklendi)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let currentLang = 'en'; // v151 FIX: Global tanım eklendi

const scoreElem = null;
const goldElem = null;
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreElem = document.getElementById('finalScoreValue');
const currentLevelUIElem = null;
const pauseBtn = document.getElementById('pause-btn');
const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');
const quitBtn = document.getElementById('quit-btn');
const finalGoldElem = document.getElementById('finalGoldValue');

const levelUpOverlay = document.getElementById('level-up-overlay');
const reviveBtn = document.getElementById('revive-btn');
const x2GoldBtn = document.getElementById('x2-gold-start-btn');
const settingsScreen = document.getElementById('settings-screen');
const settingsOpenBtn = document.getElementById('settings-open-btn');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const spinOpenBtn = document.getElementById('spin-open-btn');
const spinScreen = document.getElementById('spin-screen');
const spinCloseBtn = document.getElementById('spin-close-btn');
const spinBtnMain = document.getElementById('spin-btn-main');

let deathCountForX2 = 0;
let lives = 3; // v98: 3 Can Sistemi

// --- DASH (ANI ZIPLAMA) MEKANİĞİ v147 ---
let dashEnergy = 0;
let isDashing = false;
let dashTimer = 0;
const DASH_DURATION = 0.8;
const MAX_DASH_ENERGY = 100;
const DASH_RECHARGE_RATE = 15; // Saniyede dolan enerji

// LUCKY SPIN v120
let canSpinFree = true; 
let isSpinning = false;
let wheelAngle = 0;
let spinVelocity = 0;
const wheelRewards = [
    { type: 'gold', value: 10,  color: '#f1c40f', label: '10G' },
    { type: 'gold', value: 25,  color: '#f39c12', label: '25G' },
    { type: 'magnet', value: 1, color: '#9b59b6', label: 'MAG' },
    { type: 'gold', value: 50,  color: '#e67e22', label: '50G' },
    { type: 'shield', value: 1, color: '#2ecc71', label: 'SHLD' },
    { type: 'gold', value: 100, color: '#e74c3c', label: '100G' }, // BÜYÜK ÖDÜL
    { type: 'gold', value: 10,  color: '#f1c40f', label: '10G' },
    { type: 'gold', value: 75,  color: '#d35400', label: '75G' }
];

// --- GÖRSEL EFEKT SİSTEMİ v126 ---
let particles = [];
let totalLoops = 0; // v153: SONSUL DÖNGÜ SİSTEMİ
class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = Math.random() * 2 + 1; // Arkaya doğru akış
        this.life = 1.0;
        this.color = color || "rgba(255,255,255,0.6)";
    }
    update(dt) {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= dt * 1.5; 
        if(this.size > 0.1) this.size -= 0.05;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}


function initLanguage() {
    // Tarayıcı veya cihaz dilini al
    const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    
    // Eğer dil Türkçe ise 'tr' yap, değilse (diğer tüm dünya) 'en' yap
    currentLang = lang.startsWith('tr') ? 'tr' : 'en'; 
    
    console.log("Cihaz Dili:", lang, "Seçilen Oyun Dili:", currentLang);
    updateLanguageUI();
}

function updateLanguageUI() {
    const t = translations[currentLang];
    const setText = (id, text) => { const el = document.getElementById(id); if(el) el.innerText = text; };

    setText('start-btn', t.startBtn);
    setText('shop-open-btn', t.shopBtn);
    setText('settings-open-btn', t.settingsBtn);
    if(document.querySelector('#start-screen p')) document.querySelector('#start-screen p').innerText = t.startDesc;
    
    setText('pause-btn', t.pauseTitle);
    setText('resume-btn', t.resumeBtn);
    setText('quit-btn', t.quitBtn);
    setText('pause-title', t.pauseTitle);
    if(document.getElementById('settings-open-btn-pause')) document.getElementById('settings-open-btn-pause').innerHTML = `⚙️ ${t.settingsBtn}`;
    
    setText('gameover-title', t.gameOver);
    if(document.getElementById('score-title-final')) document.getElementById('score-title-final').innerHTML = `${t.scoreTitle} <span id="finalScoreValue">0</span>`;
    if(document.getElementById('gold-title-final')) document.getElementById('gold-title-final').innerHTML = `${t.goldTitle} <span id="finalGoldValue">0</span>`;
    
    setText('revive-btn', t.reviveBtn);
    setText('x2-gold-start-btn', t.x2GoldBtn);
    setText('gameover-shop-btn', t.shopBtn);
    setText('restart-btn', t.hardResetBtn);
    setText('spin-open-btn', t.spinWheelTitle);
    
    if(document.getElementById('shop-title-main')) document.getElementById('shop-title-main').innerText = t.shopTitle;
    if(document.getElementById('shop-balance-text')) document.getElementById('shop-balance-text').innerHTML = `${t.balance} <span id="totalGoldValue" style="color: #FFD700;">0</span> GOLD`;
    
    document.querySelectorAll('#buy-magnet-btn, #buy-shield-btn').forEach(btn => {
        const priceId = btn.id === 'buy-magnet-btn' ? 'magnet-price' : 'shield-price';
        const priceVal = document.getElementById(priceId) ? document.getElementById(priceId).innerText : '0';
        btn.innerHTML = `${t.upgradeBtn}<br><span id="${priceId}">${priceVal}</span>`;
    });
    
    // SHOP ITEM NAMES v149
    if(document.getElementById('shop-mag-title')) document.getElementById('shop-mag-title').innerText = t.magnetName;
    if(document.getElementById('shop-shd-title')) document.getElementById('shop-shd-title').innerText = t.shieldName;

    // SHOP SMALL DESC v149
    if(document.getElementById('shop-mag-desc')) {
        document.getElementById('shop-mag-desc').innerHTML = `${t.magnetDesc} <span id="magnet-duration" style="color:#00e5ff;">0s</span><br>(${translations[currentLang].levelLabel} <span id="magnet-lvl">0</span>)`;
    }
    if(document.getElementById('shop-shd-desc')) {
        document.getElementById('shop-shd-desc').innerHTML = `${t.shieldDesc} <span id="shield-chance" style="color:#64dd17;">%0</span><br>(${translations[currentLang].levelLabel} <span id="shield-lvl">0</span>)`;
    }

    setText('ad-gold-btn', t.adGoldBtn);
    setText('shop-close-btn', t.closeBtn);
    
    if(document.querySelector('#settings-screen h2')) document.querySelector('#settings-screen h2').innerText = t.settingsTitle;
    if(document.getElementById('music-label-text')) document.getElementById('music-label-text').innerText = t.musicLabel;
    if(document.getElementById('sfx-label-text')) document.getElementById('sfx-label-text').innerText = t.sfxLabel;
    if(document.getElementById('vibration-label-text')) document.getElementById('vibration-label-text').innerText = t.vibrationLabel;
    setText('settings-close-btn', t.saveCloseBtn);
    
    if(document.querySelector('#reset-confirm-overlay h3')) document.querySelector('#reset-confirm-overlay h3').innerText = t.resetWarning;
    if(document.querySelector('#reset-confirm-overlay p')) document.querySelector('#reset-confirm-overlay p').innerText = t.resetDesc;
    setText('confirm-reset-yes', t.resetYes);
    setText('confirm-reset-no', t.resetNo);

    setText('spin-title', t.spinWheelTitle);
    setText('spin-close-btn', t.spinClose);
    setText('quit-btn-gameover', t.mainMenu);
    updateSpinButtonText();
}

// ARKA PLANA ALINCA SESİ KES v123
document.addEventListener('visibilitychange', () => {
    if (audioCtx) {
        if (document.hidden) {
            audioCtx.suspend();
        } else {
            audioCtx.resume();
        }
    }
});

function updateSpinButtonText() {
    const btn = document.getElementById('spin-btn-main');
    if(!btn) return;
    btn.innerText = translations[currentLang].spinNextBtn;
}

document.addEventListener('DOMContentLoaded', initLanguage);

let startingDoubleGold = false;
let isDoubleGoldActive = false;

function showToast(msg) {
    const toast = document.getElementById('game-toast');
    const textElem = document.getElementById('toast-text');
    if (!toast || !textElem) return;
    
    textElem.innerText = msg;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 2500);
}

// --- ADMOB YÖNETİCİSİ v3 (@capacitor-community/admob — Capacitor Native API) ---
const REWARDED_AD_UNIT_ID = "ca-app-pub-7739440971804169/6392805140";

// Ödül için global değişkenler
let pendingRewardCallback = null;
let adExecuted = false;

async function initAdMob() {
    if (admobInitialized) return;
    const AdMob = getCapacitorAdMob();
    if (!AdMob) {
        console.warn('[AdMob] Capacitor AdMob plugin bulunamadı.');
        return;
    }
    try {
        await AdMob.initialize({
            requestTrackingAuthorization: true,
            testingDevices: [],
            initializeForTesting: false,
        });

        // --- GLOBAL REWARD LISTENERS v3.1 (Hata Payını Sıfırlar) ---
        
        // 1. Ödül Kazanıldığında
        AdMob.addListener('onRewardedVideoAdReward', (info) => {
            console.log('[AdMob] Ödül Kazanıldı!', info);
            adExecuted = true;
            if (pendingRewardCallback) {
                const callback = pendingRewardCallback;
                pendingRewardCallback = null; // Mükerrer ödülü engelle
                callback();
            }
        });

        // 2. Reklam Kapatıldığında
        AdMob.addListener('onRewardedVideoAdDismissed', () => {
            console.log('[AdMob] Reklam Kapatıldı.');
            
            // Eğer ödül verildiyse (adExecuted true) zaten callback çalıştı.
            // Eğer verilmediyse, butonu tekrar aktif etmemiz lazım.
            setTimeout(() => {
                adExecuted = false;
                rewardedAdReady = false;
                preloadRewardedAd();
                
                // UI temizliği için butonu aktif et (Eğer bir buton bekliyorsa)
                const lastBtn = window.lastAdButton;
                if (lastBtn) {
                     lastBtn.innerText = window.lastAdButtonText;
                     lastBtn.disabled = false;
                }
            }, 300);
        });

        // 3. Yükleme Hatası (Fail) durumunda
        AdMob.addListener('onRewardedVideoAdFailedToLoad', (error) => {
            console.warn('[AdMob] Yükleme Hatası:', error);
            rewardedAdReady = false;
            rewardedAdLoading = false;
        });

        admobInitialized = true;
        console.log('[AdMob] SDK initialized OK with Global Listeners.');
        preloadRewardedAd();
    } catch(e) {
        console.error('[AdMob] initialize failed:', e);
    }
}

async function preloadRewardedAd() {
    if (rewardedAdLoading || rewardedAdReady) return;
    const AdMob = getCapacitorAdMob();
    if (!AdMob || !admobInitialized) return;
    try {
        rewardedAdLoading = true;
        await AdMob.prepareRewardVideoAd({
            adId: REWARDED_AD_UNIT_ID,
            isTesting: false,
        });
        rewardedAdReady = true;
        rewardedAdLoading = false;
        console.log('[AdMob] Rewarded ad preloaded OK.');
    } catch(e) {
        rewardedAdLoading = false;
        rewardedAdReady = false;
        console.warn('[AdMob] Preload failed:', e);
    }
}

async function showRewardedAd(btnElem, defaultText, callback) {
    const t = translations[currentLang];

    if (!navigator.onLine) {
        showToast(t.adLoadFail);
        btnElem.innerText = defaultText;
        btnElem.disabled = false;
        return;
    }

    btnElem.innerText = t.loadingAd;
    btnElem.disabled = true;

    // UI Referanslarını kaydet (Dismissed durumunda geri dönmek için)
    window.lastAdButton = btnElem;
    window.lastAdButtonText = defaultText;

    const AdMob = getCapacitorAdMob();

    if (AdMob) {
        try {
            if (!admobInitialized) await initAdMob();

            // Reklam hazır değilse (veya önceki kullanıldıysa) tekrar yükle
            if (!rewardedAdReady) {
                console.log('[AdMob] Loading ad on-demand...');
                await AdMob.prepareRewardVideoAd({
                    adId: REWARDED_AD_UNIT_ID,
                    isTesting: false,
                });
                rewardedAdReady = true;
            }

            pendingRewardCallback = callback;
            adExecuted = false;

            console.log('[AdMob] Showing rewarded ad...');
            await AdMob.showRewardVideoAd();

            // Güvenlik: 20 saniye sonra hala bir şey olmadıysa butonu aç
            setTimeout(() => {
                if (btnElem.disabled && !adExecuted) {
                    btnElem.innerText = defaultText;
                    btnElem.disabled = false;
                }
            }, 20000);

        } catch(e) {
            console.error('[AdMob] Error:', e);
            showToast(t.adLoadFail);
            btnElem.innerText = defaultText;
            btnElem.disabled = false;
            rewardedAdReady = false;
        }
    } else {
        showToast("Dev mode: Plugin not detected. Simulating reward...");
        btnElem.innerText = defaultText;
        btnElem.disabled = false;
        callback();
    }
}

// --- HAPTICS (TİTREŞİM SİSTEMİ) v3.2 ---
function getCapacitorHaptics() {
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
            return window.Capacitor.Plugins.Haptics;
        }
    } catch(e) {}
    return null;
}

async function triggerVibration(pattern) {
    // isVibrationEnabled kontrolü game_v3.js içinde tanımlı ayarlardan gelir
    if (typeof isVibrationEnabled !== 'undefined' && !isVibrationEnabled) return;
    
    const Haptics = getCapacitorHaptics();
    
    try {
        if (Haptics) {
            if (Array.isArray(pattern)) {
                // Büyük çarpışmalar (Dizi gönderilen durumlar)
                await Haptics.notification({ type: 'error' });
            } else if (typeof pattern === 'number' && pattern >= 30) {
                // Orta seviye uyarılar
                await Haptics.impact({ style: 'heavy' });
            } else {
                // Altın toplama veya hafif sürtünme (Tık hissi)
                await Haptics.impact({ style: 'light' });
            }
        } else {
            // Fallback (Tarayıcı için standart API)
            if (navigator.vibrate) navigator.vibrate(pattern);
        }
    } catch (e) {
        console.error("[Haptics] Titreşim hatası:", e);
    }
}

// ----------------------------------------------------
// LUCKY WHEEL SİSTEMİ v120
// ----------------------------------------------------
const wheelCanvas = document.getElementById('wheel-canvas');
const wctx = wheelCanvas ? wheelCanvas.getContext('2d') : null;

function drawWheel() {
    if(!wctx) return;
    const centerX = 200, centerY = 200, radius = 180;
    wctx.clearRect(0,0,400,400);

    const sliceAngle = (Math.PI * 2) / wheelRewards.length;

    wheelRewards.forEach((r, i) => {
        const startAng = wheelAngle + i * sliceAngle;
        const endAng = startAng + sliceAngle;

        // Dilim
        wctx.beginPath();
        wctx.moveTo(centerX, centerY);
        wctx.arc(centerX, centerY, radius, startAng, endAng);
        wctx.fillStyle = r.color;
        wctx.fill();
        wctx.strokeStyle = "#fff";
        wctx.lineWidth = 2;
        wctx.stroke();

        // Metin
        wctx.save();
        wctx.translate(centerX, centerY);
        wctx.rotate(startAng + sliceAngle / 2);
        wctx.textAlign = "right";
        wctx.fillStyle = "#fff";
        wctx.font = "bold 20px Outfit";
        wctx.fillText(r.label, radius - 20, 10);
        wctx.restore();
    });

    // Orta Göbek
    wctx.beginPath();
    wctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    wctx.fillStyle = "#333";
    wctx.fill();
    wctx.strokeStyle = "gold";
    wctx.lineWidth = 5;
    wctx.stroke();
}

function startSpin() {
    if (isSpinning) return;
    
    const spinAction = () => {
        isSpinning = true;
        updateSpinButtonText();
        document.getElementById('spin-btn-main').disabled = true;
        document.getElementById('spin-reward-msg').innerText = translations[currentLang].spinWait;
        
        spinVelocity = 0.5 + Math.random() * 0.5;
        requestAnimationFrame(animateSpin);
    };

    // HER SEFERİNDE REKLAMLI ÇEVİRME
    showRewardedAd(document.getElementById('spin-btn-main'), translations[currentLang].spinNextBtn, spinAction);
}

let lastClickTime = 0;
function animateSpin() {
    if(!isSpinning) return;

    wheelAngle += spinVelocity;
    spinVelocity *= 0.985; // Sönümleme (Gittikçe yavaşlar)

    // Tıkırtı sesi (Açı değişimine göre)
    const sliceWidth = (Math.PI * 2) / wheelRewards.length;
    if(Math.floor(wheelAngle / sliceWidth) !== Math.floor((wheelAngle - spinVelocity) / sliceWidth)) {
        if(typeof playSpinClick === 'function') playSpinClick();
    }

    drawWheel();

    if(spinVelocity < 0.002) {
        isSpinning = false;
        spinVelocity = 0;
        giveReward();
    } else {
        requestAnimationFrame(animateSpin);
    }
}

function updateSpinLiveBar() {
    const gl = document.getElementById('spin-gold-live');
    const ml = document.getElementById('spin-mag-live');
    const sl = document.getElementById('spin-shd-live');
    if(gl) gl.innerText = totalGold;
    if(ml) ml.innerText = 'LVL ' + magnetLevel;
    if(sl) sl.innerText = 'LVL ' + shieldLevel;
}


function showSpinRewardPopup(emoji, label, value) {
    const popup = document.getElementById('spin-reward-popup');
    if(!popup) return;
    document.getElementById('spin-popup-emoji').innerText = emoji;
    document.getElementById('spin-popup-label').innerText = label;
    document.getElementById('spin-popup-value').innerText = value;
    
    // Göster
    popup.style.display = 'block';
    requestAnimationFrame(() => {
        popup.style.transform = 'translate(-50%,-50%) scale(1)';
        popup.style.opacity = '1';
    });
    
    // 2.2 saniye sonra kaybol
    setTimeout(() => {
        popup.style.transform = 'translate(-50%,-50%) scale(0)';
        popup.style.opacity = '0';
        setTimeout(() => { popup.style.display = 'none'; }, 380);
    }, 2200);
}

function giveReward() {
    // Ok (Üste) açısına denk gelen dilimi hesapla
    const sliceWidth = (Math.PI * 2) / wheelRewards.length;
    const normalizedAngle = (1.5 * Math.PI - wheelAngle) % (Math.PI * 2);
    const finalAngle = normalizedAngle < 0 ? normalizedAngle + Math.PI * 2 : normalizedAngle;
    const rewardIndex = Math.floor(finalAngle / sliceWidth);
    const reward = wheelRewards[rewardIndex];

    const t = translations[currentLang];
    let rewardLabel = reward.label;
    let popupEmoji = '🎉';
    let popupLabel = '';
    let popupValue = '';
    
    if(reward.type === 'gold') {
        totalGold += reward.value;
        rewardLabel = reward.value + ' ' + t.rewardGold;
        popupEmoji = '💰';
        popupLabel = t.rewardGold.toUpperCase();
        popupValue = '+' + reward.value;
    } else if(reward.type === 'magnet') {
        magnetLevel++;
        rewardLabel = t.rewardMagnet + ' LVL UP!';
        popupEmoji = '🧲';
        popupLabel = t.rewardMagnet.toUpperCase();
        popupValue = 'LVL ' + magnetLevel;
    } else if(reward.type === 'shield') {
        shieldLevel++;
        rewardLabel = t.rewardShield + ' LVL UP!';
        popupEmoji = '🛡️';
        popupLabel = t.rewardShield.toUpperCase();
        popupValue = 'LVL ' + shieldLevel;
    }
    
    // Hemen kaydet ve göster
    saveGame();
    updateSpinLiveBar(); // Bakiye barını anında güncelle
    if(typeof playSpinReward === 'function') playSpinReward();
    
    // Animasyonlu popup göster
    showSpinRewardPopup(popupEmoji, popupLabel, popupValue);
    
    document.getElementById('spin-reward-msg').innerText = t.rewardPrefix + rewardLabel;
    document.getElementById('spin-btn-main').disabled = false;
    updateSpinButtonText();
}

function resizeCanvas() {
    canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); 

// ----------------------------------------------------
// v108 - Ses Sistemi audio.js dosyasına taşındı.


const levelAssets = [
    { threshold: 0,    bgKey: 'ilkbahar', speed: 160, spawn: 0.70, titleEN: translations.en.l1Title, titleTR: translations.tr.l1Title, color: "#64dd17", pKey: "ilkbahar" },
    { threshold: 1000,  bgKey: 'yaz',      speed: 220, spawn: 0.55, titleEN: translations.en.l2Title, titleTR: translations.tr.l2Title, color: "#ffd600", pKey: "yaz" },
    { threshold: 2000, bgKey: 'sonbahar', speed: 280, spawn: 0.45, titleEN: translations.en.l3Title, titleTR: translations.tr.l3Title, color: "#ff6d00", pKey: "sonbahar" },
    { threshold: 3000, bgKey: 'kis',      speed: 340, spawn: 0.35, titleEN: translations.en.l4Title, titleTR: translations.tr.l4Title, color: "#00e5ff", pKey: "kis" },
    { threshold: 4000, bgKey: 'lava',     speed: 450, spawn: 0.40, titleEN: translations.en.lavaRiver, titleTR: translations.tr.lavaRiver, color: "#ff4500", pKey: "lava" },
    { threshold: 6000, bgKey: 'void',     speed: 600, spawn: 0.30, titleEN: translations.en.voidLevel, titleTR: translations.tr.voidLevel, color: "#9b59b6", pKey: "void" },
    // v158: SONSUL İLERLEME (ENDLESS PROGRESSION)
    { threshold: 10000, bgKey: 'ilkbahar', speed: 160 * 1.5, spawn: 0.70 / 1.5, titleEN: "NEW CYCLE - SPRING", titleTR: "YENİ TUR - İLKBAHAR", color: "#64dd17", pKey: "ilkbahar" },
    { threshold: 12000, bgKey: 'yaz',      speed: 220 * 1.5, spawn: 0.55 / 1.5, titleEN: "NEW CYCLE - SUMMER", titleTR: "YENİ TUR - YAZ", color: "#ffd600", pKey: "yaz" },
    { threshold: 14000, bgKey: 'sonbahar', speed: 280 * 1.5, spawn: 0.45 / 1.5, titleEN: "NEW CYCLE - AUTUMN", titleTR: "YENİ TUR - SONBAHAR", color: "#ff6d00", pKey: "sonbahar" },
    { threshold: 16000, bgKey: 'kis',      speed: 340 * 1.5, spawn: 0.35 / 1.5, titleEN: "NEW CYCLE - WINTER", titleTR: "YENİ TUR - KIŞ", color: "#00e5ff", pKey: "kis" },
    { threshold: 18000, bgKey: 'lava',     speed: 450 * 1.5, spawn: 0.30 / 1.5, titleEN: "ABYSSAL LAVA", titleTR: "DERİN LAV NEHRİ", color: "#ff4500", pKey: "lava" },
    { threshold: 20000, bgKey: 'void',     speed: 600 * 1.5, spawn: 0.25,       titleEN: "COSMIC VOID",  titleTR: "KOZMİK BOŞLUK",   color: "#9b59b6", pKey: "void" }
];

let isTransitioningLevel = false;
let transitionTimer = 0;

// v109 - Görsel Varlıklar assets.js dosyasına taşındı.



// ----------------------------------------------------
// OYUN SİSTEMİ 
// ----------------------------------------------------
let isPlaying = false, isGameOver = false, isPaused = false;
let score = 0, goldCount = 0, lastTime = 0;
let currentLevel = 1;
let bgY = 0; let bgScrollSpeed = 100; 
let screenFlash = 0; // Seviye geçişi parlaması v132

// KALICI KAYIT VE MAĞAZA
// KALICI KAYIT VE MAĞAZA
let totalGold = 0;
let magnetLevel = 0;
let shieldLevel = 0;
let powerupTimer = 0;
let hasShield = false;

function saveGame() {
    const data = {
        gold: totalGold,
        magnet: magnetLevel,
        shield: shieldLevel,
        musicVol: isMusicVolume,
        sfxVol: isSFXVolume,
        vib: isVibrationEnabled
    };
    localStorage.setItem('riverEscapeSave', JSON.stringify(data));
    updateShopUI();
}

function updateShopUI() {
    const t = translations[currentLang];
    const tg = document.getElementById('totalGoldValue');
    if(tg) tg.innerText = totalGold;
    
    let ml = document.getElementById('magnet-lvl');
    if(ml) {
        ml.innerText = magnetLevel;
        const sUnit = currentLang === 'tr' ? 'sn' : 's';
        document.getElementById('magnet-duration').innerText = magnetLevel > 0 ? (3 + magnetLevel * 2) + sUnit : '0' + sUnit;
        document.getElementById('magnet-price').innerText = magnetLevel < 5 ? (1000 + magnetLevel * 500) : "MAX";
    }
    
    let sl = document.getElementById('shield-lvl');
    if(sl) {
        sl.innerText = shieldLevel;
        document.getElementById('shield-chance').innerText = '%' + (shieldLevel * 5);
        document.getElementById('shield-price').innerText = shieldLevel < 5 ? (1500 + shieldLevel * 750) : "MAX";
    }
}
setTimeout(updateShopUI, 100);

// DASH AKTİVASYON FONKSİYONU
function activateDash() {
    if (!isPlaying || isGameOver || isPaused || isDashing) return;
    if (dashEnergy >= MAX_DASH_ENERGY) {
        isDashing = true;
        dashTimer = DASH_DURATION;
        dashEnergy = 0;
        if (typeof playJumpSound === 'function') playJumpSound(); 
        // Yoksa patlama sesini ödünç alabiliriz görsel için
        playCrashSound(); 
        console.log("DASH ACTIVATED!");
    }
}

// KLAVYE İLE DASH
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        activateDash();
    }
});

// MAĞAZA BUTONLARI HİLELERİ
const shopBtn = document.getElementById('shop-open-btn');
if(shopBtn) shopBtn.addEventListener('click', () => {
    document.getElementById('shop-screen').classList.remove('hidden');
    document.getElementById('shop-screen').classList.add('active');
    document.getElementById('shop-screen').style.display = 'flex';
    document.getElementById('shop-screen').style.opacity = '1';
    document.getElementById('shop-screen').style.zIndex = '6000'; // EN ÜST KATA ÇIK
});

const settingsPauseBtn = document.getElementById('settings-open-btn-pause');
if(settingsPauseBtn) settingsPauseBtn.addEventListener('click', () => {
    settingsScreen.classList.remove('hidden');
    settingsScreen.classList.add('active');
    settingsScreen.style.display = 'flex';
});

if(settingsOpenBtn) settingsOpenBtn.addEventListener('click', () => {
    settingsScreen.classList.remove('hidden');
    settingsScreen.classList.add('active');
    settingsScreen.style.display = 'flex';
});

const shopBtnGameOver = document.getElementById('gameover-shop-btn');
if(shopBtnGameOver) shopBtnGameOver.addEventListener('click', () => {
    document.getElementById('shop-screen').classList.remove('hidden');
    document.getElementById('shop-screen').classList.add('active');
    document.getElementById('shop-screen').style.display = 'flex';
    document.getElementById('shop-screen').style.opacity = '1';
    document.getElementById('shop-screen').style.zIndex = '6000';
});

const closeShopBtn = document.getElementById('shop-close-btn');
if(closeShopBtn) closeShopBtn.addEventListener('click', () => {
    document.getElementById('shop-screen').classList.remove('active');
    document.getElementById('shop-screen').classList.add('hidden');
    document.getElementById('shop-screen').style.display = '';
    document.getElementById('shop-screen').style.opacity = '0';
    document.getElementById('shop-screen').style.zIndex = '100'; // Normale dön
});

const btnMag = document.getElementById('buy-magnet-btn');
if(btnMag) btnMag.addEventListener('click', () => {
    let cost = 1000 + magnetLevel * 500;
    if(totalGold >= cost && magnetLevel < 5) {
        totalGold -= cost; magnetLevel++; saveGame();
        for(let i=0; i<3; i++) setTimeout(playCoinSound, i*150);
    }
});

const btnShd = document.getElementById('buy-shield-btn');
if(btnShd) btnShd.addEventListener('click', () => {
    let cost = 1500 + shieldLevel * 750;
    if(totalGold >= cost && shieldLevel < 5) {
        totalGold -= cost; shieldLevel++; saveGame();
        for(let i=0; i<3; i++) setTimeout(playCoinSound, i*150);
    }
});

const player = { x: canvas.width / 2, y: canvas.height - 150, width: 38, height: 68, speed: 320 };

const keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, a: false, d: false, w: false, s: false };
window.addEventListener('keydown', (e) => {
    let key = e.key.toLowerCase();
    if(['a','d','w','s'].includes(key) || ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) keys[e.key] = true;
    if((key === 'p' || e.key === 'escape') && isPlaying && !isGameOver) {
        togglePause();
    }
});
window.addEventListener('keyup', (e) => {
    let key = e.key.toLowerCase();
    if(['a','d','w','s'].includes(key) || ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) keys[e.key] = false;
});

let touchX = null;
let touchY = null;
canvas.addEventListener('touchstart', (e) => { 
    e.preventDefault(); 
    initAudio(); 
    
    // DOUBLE TAP DASH KONTROLÜ
    let now = performance.now();
    if (window.lastTap && (now - window.lastTap) < 300) {
        activateDash();
    }
    window.lastTap = now;

    if(e.touches.length > 0) { 
        touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left; 
        touchY = e.touches[0].clientY - canvas.getBoundingClientRect().top; 
    } 
}, {passive: false});
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if(e.touches.length > 0) { touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left; touchY = e.touches[0].clientY - canvas.getBoundingClientRect().top; } }, {passive: false});
canvas.addEventListener('touchend', () => { touchX = null; touchY = null; });
canvas.addEventListener('mousedown', initAudio); // PC için güvenlik kırma


// SPAWNERLAR (Artık Yatay ve Dikey var)
let obstacles = [], golds = [], powerups = [];
let spawnInterval = 1.3, spawnTimer = 0;
let goldSpawnInterval = 5.0, goldTimer = 0; // 100 saniyede tam 20 altın akması için 5 sn

let goldBag = [];
function fillGoldBag() {
    goldBag = [];
    for(let i=0; i<17; i++) goldBag.push(1);
    for(let i=0; i<2; i++) goldBag.push(5);
    goldBag.push(10);
    // Torbayı karıştırıyorum (Fisher-Yates Shuffle)
    for (let i = goldBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [goldBag[i], goldBag[j]] = [goldBag[j], goldBag[i]];
    }
}

function spawnPowerup() {
    const riverLeft = canvas.width * 0.35;
    const riverRight = canvas.width * 0.65 - 30;
    
    let type = 'magnet';
    if (shieldLevel > 0 && magnetLevel > 0) type = Math.random() < 0.5 ? 'magnet' : 'shield';
    else if (shieldLevel > 0) type = 'shield';
    
    // Kalkan çıkma ihtimali seviyeye bağlı (%5 per level)
    if (type === 'shield' && Math.random() * 100 > shieldLevel * 5) {
        if(magnetLevel > 0) type = 'magnet'; else { spawnGold(); return; }
    }
    
    powerups.push({
        type: type,
        x: Math.random() * (riverRight - riverLeft) + riverLeft,
        y: -50,
        radius: 18,
        speed: 250
    });
}

function spawnObstacle() {
    // GEÇİŞ ESNASINDA ARTIK DURMAK YOK! TEMPO SÜREKLİ! v135
    // if (isTransitioningLevel) return; // BU SATIRI UÇURDUK!

    // Güçlendirici Çıkması
    if (Math.random() < 0.1 && (magnetLevel > 0 || shieldLevel > 0)) {
        spawnPowerup(); return;
    }

    const baseSpeed = 200 + Math.random() * 100;
    let spawnMargin = (currentLevel >= 4) ? 0.40 : 0.35;
    const riverLeft = canvas.width * spawnMargin;
    const riverRight = canvas.width * (1 - spawnMargin) - 45; 
    
    // v152: LEVEL 6 (VOID) SINIRI EKLENDİ
    let isDZ = (currentLevel === 1 && score >= 900) || (currentLevel === 2 && score >= 1900) || (currentLevel === 3 && score >= 2900) || (currentLevel === 4 && score >= 3900) || (currentLevel === 5 && score >= 5900) || (currentLevel === 6 && score >= 9900);
    
    // Level 1 / Level 5 / Level 6 Özel Filtreleri
    let allowedSpecialTypes = [];
    if (currentLevel === 1) {
        allowedSpecialTypes.push('rock');
        if (score >= 500) allowedSpecialTypes.push('hippo'); 
        if (score >= 900 && score <= 1000) allowedSpecialTypes.push('croc'); 
    } else if (currentLevel === 5) {
        allowedSpecialTypes = ['rock', 'fireball']; // Lav Seviyesi: Sadece Kaya ve Ateş Topu!
    } else if (currentLevel === 6) {
        allowedSpecialTypes = ['rock', 'asteroid']; // Boşluk Seviyesi: Sadece Kayalar ve Meteorlar!
    } else {
        allowedSpecialTypes = ['hippo', 'croc', 'rock']; 
    }

    // %45 ihtimalle Özel Engel - Sadece izin verilen tiplerden birini seç!
    let spawnX = Math.random() * (riverRight - riverLeft) + riverLeft;
    
    // OYUNCUYA UMUT PAYI VER (0% İHTİMALİNİ BİTİR!) v146
    // Eğer bir önceki engelin tam önüne taş koyuyorsa, en azından kayığın geçebileceği jilet gibi bir "boşluk" (gap) bırak.
    if (typeof window.lastObsX === 'undefined') window.lastObsX = spawnX;
    if (currentLevel === 1) {
        let gap = player.width + 25; // Kayık genişliğinden biraz büyük (Umut boşluğu)
        if (Math.abs(spawnX - window.lastObsX) < gap) {
            if (window.lastObsX < canvas.width / 2) spawnX += gap + 15; // Sağda boşluk aç
            else spawnX -= gap + 15; // Solda boşluk aç
        }
    }
    // Nehir dışına taşmasın
    if (spawnX < riverLeft) spawnX = riverLeft + 5;
    if (spawnX > riverRight - 10) spawnX = riverRight - 10;
    
    window.lastObsX = spawnX; // Hafızaya al

    if (Math.random() < 0.45 && allowedSpecialTypes.length > 0) { 
        let selectedType = allowedSpecialTypes[Math.floor(Math.random() * allowedSpecialTypes.length)];
        
        if (selectedType === 'hippo') {
            obstacles.push({
                type: 'hippo',
                x: spawnX,
                y: -100, width: 60, height: 60, 
                speedY: baseSpeed - 20, speedX: 0, isSubmerged: true
            });
        } else if (selectedType === 'croc') {
            obstacles.push({
                type: 'croc',
                x: spawnX,
                y: -100, width: 100, height: 45,
                speedY: baseSpeed + 40, speedX: 0
            });
        } else if (selectedType === 'rock') {
            let rockSize = 40 + Math.random() * 20;
            obstacles.push({
                type: 'rock',
                x: spawnX,
                y: -100, width: rockSize, height: rockSize * 0.8,
                speedY: bgScrollSpeed, speedX: 0
            });
        } else if (selectedType === 'fireball') {
            obstacles.push({
                type: 'fireball',
                x: spawnX,
                y: -150, width: 70, height: 70,
                speedY: baseSpeed + 150, // ÇOK HIZLI!
                speedX: (Math.random() - 0.5) * 50 // Biraz sağa sola sapabilir
            });
        } else if (selectedType === 'asteroid') {
            const astSize = 70 + Math.random() * 30;
            obstacles.push({
                type: 'asteroid',
                x: spawnX,
                y: -150, width: astSize, height: astSize,
                speedY: baseSpeed + 200, // IŞIK HIZINDA!
                speedX: (Math.random() - 0.5) * 100 // Daha fazla savrulma
            });
        }
        return;
    }
    
    // v152: LAV VE BOŞLUK SEVİYELERİNDEKİ KÜTÜKLERİ (LOGS) İPTAL ET!
    if (currentLevel === 5 || currentLevel === 6) return; 

    obstacles.push({
        type: 'vertical',
        x: spawnX,
        y: -100,
        width: 45,  
        height: 50, 
        speedY: baseSpeed,
        speedX: 0
    });
}

function spawnGold() {
    const riverLeft = canvas.width * 0.35;
    const riverRight = canvas.width * 0.65 - 30;
    
    if (goldBag.length === 0) fillGoldBag();
    let gVal = goldBag.pop(); // Torbadan kesin şans çekiliyor
    
    let gColor = "gold", gRadius = 15;
    if (gVal === 1) { gColor = "gold"; gRadius = 15; }
    else if (gVal === 5) { gColor = "#00e5ff"; gRadius = 18; }
    else if (gVal === 10) { gColor = "#ff00ff"; gRadius = 22; }

    let gx = Math.random() * (riverRight - riverLeft) + riverLeft;
    let gy = -50;
    let speed = 250;

    if (gVal === 10) {
        // HIRS VE RİSK MEKANİĞİ: 10'luk altını almak ecel terleri döktürmeli
        let trapDir = Math.random() < 0.5 ? 1 : -1; 
        
        // Önce gelen sahte kütük, oyuncuyu refleksle yana kaçırır
        obstacles.push({
            type: 'vertical',
            x: gx,
            y: gy - 150, // Oyuncuya daha uzak, kaçma payı var
            width: 45,  
            height: 50, 
            speedY: speed,
            speedX: 0
        });

        // Altın yandadır
        gx += trapDir * 75;
        if (gx < riverLeft + 30) gx = riverLeft + 30;
        if (gx > riverRight - 30) gx = riverRight - 30;

        // İkinci kütük
        obstacles.push({
            type: 'vertical',
            x: gx - (trapDir * 62), 
            y: gy - 250, // Daha da yukarda
            width: 45,  
            height: 50, 
            speedY: speed,
            speedX: 0
        });
    }

    golds.push({
        x: gx,
        y: gy,
        radius: gRadius,
        speed: speed, 
        angle: 0,
        value: gVal,
        color: gColor
    });
}


// OYUN DÖNGÜSÜ (LOOP) 
function togglePause() {
    if (!isPlaying || isGameOver) return;
    isPaused = !isPaused;
    
    const t = translations[currentLang];
    if (isPaused) {
        if(pauseScreen) {
            pauseScreen.classList.remove('hidden');
            pauseScreen.classList.add('active');
            pauseScreen.style.display = 'flex';
        }
        if(pauseBtn) pauseBtn.innerText = "▶ " + t.resumeBtn.toUpperCase();
        // audioCtx.suspend() yerine scheduler isPaused kontrolü yeterlidir
    } else {
        if(pauseScreen) {
            pauseScreen.classList.remove('active');
            pauseScreen.classList.add('hidden');
            pauseScreen.style.display = 'none';
        }
        if(pauseBtn) pauseBtn.innerText = "⏸ " + t.pauseTitle.toUpperCase();
        lastTime = performance.now(); 
        requestAnimationFrame(gameLoop);
    }
}
function startGame() {
    initAudio(); 
    isPlaying = true; isGameOver = false; isPaused = false;
    score = 0; goldCount = 0; // PRODUCTION RELEASE: v160
    lives = 3; 
    totalLoops = 0; 
    updateLanguageUI();
    fillGoldBag();
    obstacles = []; golds = []; powerups = [];
    player.x = canvas.width / 2 - player.width / 2;
    spawnTimer = 0; goldTimer = 0; powerupTimer = 0;
    
    // Satın alınan Kalkan aktivasyonu
    hasShield = false; 
    
    isDoubleGoldActive = startingDoubleGold;
    startingDoubleGold = false; 
    
    spawnTimer = 0; goldTimer = 0;
    spawnInterval = 1.3; 
    currentLevel = 1; 

    bgImg = bgImgs['ilkbahar']; 
    playerImg = players.ilkbahar;
    bgScrollSpeed = 100;
    lastTime = performance.now();
    
    startScreen.classList.remove('active'); startScreen.classList.add('hidden');
    gameOverScreen.classList.remove('active'); gameOverScreen.classList.add('hidden');
    if(pauseScreen) { pauseScreen.classList.remove('active'); pauseScreen.classList.add('hidden'); pauseScreen.style.display = ''; }
    if(pauseBtn) { pauseBtn.style.display = 'block'; pauseBtn.innerText = "⏸ DURDUR"; }
    
    // Revive butonlarını UI üzerinde sıfırla
    if(reviveBtn) {
        reviveBtn.disabled = false;
        reviveBtn.innerText = translations[currentLang].reviveBtn;
        reviveBtn.style.opacity = '1';
    }
    if(x2GoldBtn) {
        x2GoldBtn.disabled = false;
        x2GoldBtn.innerText = translations[currentLang].x2GoldBtn;
        x2GoldBtn.style.opacity = '1';
        x2GoldBtn.style.display = deathCountForX2 >= 3 ? 'block' : 'none';
    }
    
    // Arka Plan Müziğini Başlat
    currentNote = 0;
    nextNoteTime = audioCtx.currentTime + 0.1;
    if(!isMusicScheduled) bgMusicScheduler();
    
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    if (isGameOver) return; 
    
    // v98: CAN SİSTEMİ KONTROLÜ
    lives--; // Önce canı düş!
    
    if (lives > 0) {
        playCrashSound();
        // Geçici Dokunulmazlık / Kalkan (3 saniye)
        hasShield = true;
        player.x = canvas.width / 2 - player.width / 2;
        obstacles = []; // Ekranı temizle
        setTimeout(() => { hasShield = false; }, 3000);
        return; // Oyuna devam!
    }

    // SON CAN DA GİTTİ - GERÇEK GAMEOVER
    isGameOver = true;
    isPlaying = false;
    playDeathSound(); // Artık Final Ölüm sesi EN versiyonunda da çalacak!
    deathCountForX2++;
    
    try {
        triggerVibration([100, 50, 100]); // Oyuncu öldüğünde belirgin titreşim
        
        // v122: Altınlar GameOver ekranında gösterilir ama KASAya aktarım 
        // ancak kullanıcı Quit veya Restart dediğinde (ya da reklam izlemediğinde) kesinleşir.
        // v165 FIX: UI elemanlarını doğrudan DOM'dan çek (Cache null kalmış olabilir)
        const fsElem = document.getElementById('finalScoreValue');
        const fgElem = document.getElementById('finalGoldValue');
        
        if (fsElem) fsElem.innerText = Math.floor(score);
        if (fgElem) fgElem.innerText = goldCount;
        
        if (x2GoldBtn) x2GoldBtn.style.display = (deathCountForX2 >= 3) ? 'flex' : 'none';
        
        gameOverScreen.classList.remove('hidden'); 
        gameOverScreen.classList.add('active');
        gameOverScreen.style.display = 'flex';
        gameOverScreen.style.opacity = '1';
        gameOverScreen.style.zIndex = '5000';
        if(pauseBtn) pauseBtn.style.display = 'none';
        
        let rb = document.getElementById('revive-btn');
        if(rb) {
            rb.classList.add('pulse-button');
            rb.innerText = translations[currentLang].reviveBtn;
        }
        
        saveGame(); // Ayarlar vs. kaydedilsin
    } catch (e) {
        console.error("GameOver hatası:", e);
    }
}

function update(dt) {
    if (!isPlaying) return;

    // DASH MANTIĞI GÜNCELLEME
    if (isDashing) {
        dashTimer -= dt;
        if (dashTimer <= 0) {
            isDashing = false;
        }
    } else {
        dashEnergy = Math.min(MAX_DASH_ENERGY, dashEnergy + DASH_RECHARGE_RATE * dt);
    }

    score += dt * 5; 

    bgY += bgScrollSpeed * dt;
    let totalBgHeight = Math.ceil(canvas.height) * 2; // Artık Pre-Mirrored dokumuz tam 2 ekran boyunda
    if (bgY >= totalBgHeight) bgY -= totalBgHeight;

    // Parallax Bulutlar
    clouds.forEach(c => {
        c.y += (bgScrollSpeed * 1.5) * dt; // Daha hızlı akar (derinlik hissi)
        if(c.y > canvas.height + c.r) {
            c.y = -c.r;
            c.x = Math.random() * canvas.width;
        }
    });

    let dx = 0;
    let dy = 0;
    
    if (keys.ArrowLeft || keys.a || keys.A) dx = -1;
    if (keys.ArrowRight || keys.d || keys.D) dx = 1;
    if (keys.ArrowUp || keys.w || keys.W) dy = -1;
    if (keys.ArrowDown || keys.s || keys.S) dy = 1;
    
    if(touchX !== null && touchY !== null) {
        if (touchX < player.x + player.width/2 - 15) dx = -1;
        else if (touchX > player.x + player.width/2 + 15) dx = 1;
        
        if (touchY < player.y + player.height/2 - 30) dy = -1;
        else if (touchY > player.y + player.height/2 + 30) dy = 1;
    }

    // SADECE ileri-geri (Y ekseni) hareket edildiğinde skordan düş (0'ın altına inmez)
    if (dy !== 0) {
        score = Math.max(0, score - (Math.abs(dy) * player.speed * dt * 0.1));
    }

    // X Ekseni Sınırları (Nehir Kanalı) - DİNAMİK (Level 4 Dar, Diğerleri Geniş)
    // X Ekseni Sınırları (Nehir Kanalı) - v154: LEVEL 4-6 ARASI DAR KANAL (0.40)
    let margin = (currentLevel >= 4) ? 0.40 : 0.35;
    const playRiverLeft = canvas.width * margin;
    const playRiverRight = canvas.width * (1 - margin) - player.width;
    
    // KIYIYA SÜRTMÜ KONTROLÜ (Ölüm Yok, Sadece YAVAŞLATMA ve SARSINTI)
    let moveDt = dt; 
    let isDZ = (currentLevel === 1 && score >= 900) || (currentLevel === 2 && score >= 1900) || (currentLevel === 3 && score >= 2900) || (currentLevel === 4 && score >= 3900) || (currentLevel === 5 && score >= 5900) || (currentLevel === 6 && score >= 9900);
    
    if (player.x <= playRiverLeft + 5 || player.x >= playRiverRight - 5) {
        // ÖLÜM BÖLGESİ ÖZEL: Seviye sonu barajlarında kıyıya dokunmak ÖLDÜRÜR!
        if (isDZ) {
            if (!hasShield) {
                gameOver();
                return;
            } else {
                moveDt = dt * 0.4;
                player.x += (Math.random() - 0.5) * 2;
            }
        } else {
            // Normal sürtünme mekaniği
            moveDt = dt * 0.4; // Sadece KAYIK yavaşlar!
            player.x += (Math.random() - 0.5) * 2; // Sarsıntı
            
            // --- TELEFON TİTREŞİMİ (Edge Collision) v127 ---
            if (typeof triggerVibration === 'function') {
                if (!window.lastEdgeVib || performance.now() - window.lastEdgeVib > 200) {
                    triggerVibration(15); // Hafif bir "Tık" hissi
                    window.lastEdgeVib = performance.now();
                }
            }
        }
    }

    // --- CHECKPOINT GEÇİŞ ZAMANLAYICISI v129 ---
    if (isTransitioningLevel) {
        transitionTimer -= dt;
        if (transitionTimer <= 0) {
            isTransitioningLevel = false;
        }
    }

    // v166 FIX: İleri-Geri (Y) hızını %40 yavaşlatarak kontrolü arttırıyoruz
    player.x += dx * player.speed * moveDt;
    player.y += dy * (player.speed * 0.6) * moveDt; 
    
    if (player.x < playRiverLeft) player.x = playRiverLeft;
    if (player.x > playRiverRight) player.x = playRiverRight;
    
    if (player.y < 50) player.y = 50; 
    if (player.y > canvas.height - player.height - 20) player.y = canvas.height - player.height - 20;

    // --- SU SIÇRATMA (PARTICLE) v126 ---
    if (isPlaying && (dx !== 0 || dy !== 0 || Math.random() < 0.1)) {
        // Kayığın arkasından su köpüğü çıkar
        let px = player.x + player.width / 2 + (Math.random() - 0.5) * 20;
        let py = player.y + player.height - 5;
        particles.push(new Particle(px, py, currentLevel === 4 ? "rgba(200, 230, 255, 0.7)" : "rgba(255, 255, 255, 0.6)"));
    }
    // Parçacıkları güncelle ve ömrü biteni sil
    particles.forEach((p, index) => {
        p.update(dt);
        if (p.life <= 0) particles.splice(index, 1);
    });

    spawnTimer += dt;
    let effectiveSpawnInterval = spawnInterval;
    // SEVİYE SONU %80 BARAJLARI: AGRESİF mod! (Ölümcül Hız)
    if (isDZ) {
        effectiveSpawnInterval = 0.50; // LEVEL 4 HIZI! (Maksimum Zorluk)
    }

    if (spawnTimer >= effectiveSpawnInterval) {
        spawnObstacle();
        spawnTimer = 0;
        // Seviye içi kademeli zorlaşma
        if(spawnInterval > 0.5) spawnInterval -= (currentLevel === 1 ? 0.03 : 0.015); 
    }

    goldTimer += dt;
    if(goldTimer >= goldSpawnInterval) {
        spawnGold();
        goldTimer = 0;
    }

    // DİNAMİK 4 MEVSİM SEVİYE GÜNCELLEMESİ v128 (SEVİYE GERİ DÜŞMESİ ENGELLENDİ)
    // 10.000 ŞAMPİYONLUK MÜHRÜ (TEK SEFERLİK BÜYÜK KUTLAMA)
    if (score >= 10000 && totalLoops === 0) {
        totalLoops = 1; // Artık sonsuz devam edeceğiz ama şov bir kez olsun
        isTransitioningLevel = true;
        transitionTimer = 5.0; 
        screenFlash = 1.0;
        
        // Şampiyonluk Ekranı (v158: Level 7'ye Bağladık)
        const lTitle = translations[currentLang].gameCompleted;
        console.log("CEZA: Büyük Şampiyonluk Ekranı (10K) Açılıyor...");
        
        levelUpOverlay.innerHTML = `
            <div style="text-align: center; animation: proLevelPop 1.5s forwards;">
                <div style="font-size: 22px; color: gold; letter-spacing: 10px; font-weight: bold; margin-bottom: 25px; text-shadow: 0 0 40px gold;">O Y U N   B İ T T İ !</div>
                <h1 style="color: #ffffff; font-size: 52px; font-family: 'Press Start 2P', cursive; text-shadow: 6px 6px 0 #000, 0 0 50px rgba(255, 165, 0, 0.6); margin: 0;">ŞAMPİYON!</h1>
                <h2 style="color: #64dd17; font-size: 30px; font-family: 'Outfit', sans-serif; text-shadow: 3px 3px 0 #000; margin-top: 25px; font-weight: 900; letter-spacing: 4px;">${lTitle}</h2>
                <div style="margin-top: 30px; color: white; font-size: 20px; text-shadow: 0 0 10px #fff; font-weight: bold;">SEVİYE: 7 (BÜYÜK TUR)</div>
            </div>
        `;
        levelUpOverlay.classList.remove('hidden');
        levelUpOverlay.style.display = 'flex';
        levelUpOverlay.style.opacity = '1';

        setTimeout(() => {
            levelUpOverlay.classList.add('hidden');
            levelUpOverlay.style.display = 'none';
            levelUpOverlay.style.opacity = '0';
            isTransitioningLevel = false;
        }, 5000);
        
        playVictoryFanfare(); 
    }

    let targetLevelIndex = 0;
    for (let i = levelAssets.length - 1; i >= 0; i--) {
        if (Math.floor(score) >= levelAssets[i].threshold) {
            targetLevelIndex = i;
            break;
        }
    }
    
    // Eğer hesaplanan seviye, mevcut seviyeden BÜYÜKSE geçiş yap (Geri Düşme Yok!)
    if (targetLevelIndex + 1 > currentLevel) {
        currentLevel = targetLevelIndex + 1; // 1 tabanlı indeks
        const lAsset = levelAssets[targetLevelIndex];
        
        // --- ADRENALİN PATLAMASI (Checkpoint Leap) v135 ---
        isTransitioningLevel = true;
        transitionTimer = 2.0; 
        screenFlash = 0.5; // Hafif flaş, hız çizgileri ön planda
        
        bgImg = bgImgs[lAsset.bgKey]; 
        playerImg = players[lAsset.pKey] || players.ilkbahar; // v153: Şeffaflık mühürü (Garantili Fallback)
        
        bgScrollSpeed = 450; // IŞINLANMA HIZI! 🚀⚡️ (Engeller durmaz!)
        spawnInterval = lAsset.spawn; 
        
        if (currentLevel > 1) { 
            if(typeof triggerVibration === 'function') triggerVibration([30, 20, 100, 50, 150]); 
            for(let i=0; i<3; i++) setTimeout(playCoinSound, i*150); 
            
            const lTitle = currentLang === 'tr' ? lAsset.titleTR : lAsset.titleEN;
            levelUpOverlay.innerHTML = `
                <div style="text-align: center; transform: scale(0.5); animation: proLevelPop 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">
                    <div style="font-size: 14px; color: gold; letter-spacing: 5px; font-weight: bold; margin-bottom: 10px; text-shadow: 0 0 10px gold;">CHECKPOINT REACHED</div>
                    <h1 style="color: #ffffff; font-size: 32px; font-family: 'Press Start 2P', cursive; text-shadow: 4px 4px 0 #000; margin: 0;">${translations[currentLang].levelLabel} ${currentLevel}</h1>
                    <h2 style="color: ${lAsset.color}; font-size: 24px; font-family: 'Outfit', sans-serif; text-shadow: 3px 3px 0 #000; margin-top: 10px; font-weight: 900; letter-spacing: 5px;">${lTitle}</h2>
                </div>
            `;
            
            levelUpOverlay.classList.remove('hidden');
            levelUpOverlay.classList.add('active');
            levelUpOverlay.style.display = 'flex';
            levelUpOverlay.style.opacity = '1';
            
            // 1.2 Saniye sonra Boost biter, yeni seviye hızına geçer
            setTimeout(() => {
                bgScrollSpeed = lAsset.speed;
                levelUpOverlay.style.opacity = '0';
                setTimeout(() => {
                    levelUpOverlay.classList.remove('active');
                    levelUpOverlay.classList.add('hidden');
                    levelUpOverlay.style.display = 'none';
                }, 500);
            }, 1200);
        }
    }

    // Kayığın Çarpışma Kutusu (Hitbox) - Daha Affedici (Sadece merkeze vurursa yanar)
    let px = player.x + 15, py = player.y + 25, pw = player.width - 30, ph = player.height - 50;

    if(powerupTimer > 0) powerupTimer -= dt;

    // Power-Uplar
    for (let i = powerups.length - 1; i >= 0; i--) {
        let p = powerups[i];
        p.y += p.speed * dt;
        
        if (px < p.x + p.radius && px + pw > p.x - p.radius &&
            py < p.y + p.radius && py + ph > p.y - p.radius) {
            playPowerupSound(); 
            if(p.type === 'magnet') powerupTimer = 3 + magnetLevel * 2;
            if(p.type === 'shield') hasShield = true;
            powerups.splice(i, 1);
            continue;
        }
    }
    powerups = powerups.filter(p => p.y < canvas.height + 50);

    // Altınlar Mıknatıs Etkisi
    for (let i = golds.length - 1; i >= 0; i--) {
        let g = golds[i];
        
        if (powerupTimer > 0) {
            let cx = player.x + player.width/2;
            let cy = player.y + player.height/2;
            let dx = cx - g.x;
            let dy = cy - g.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 400) { 
                g.x += (dx / dist) * 450 * dt;
                g.y += (dy / dist) * 450 * dt;
            } else g.y += g.speed * dt;
        } else {
            g.y += g.speed * dt;
        }
        
        g.angle += dt * 5; 
        
        if (px < g.x + g.radius && px + pw > g.x - g.radius &&
            py < g.y + g.radius && py + ph > g.y - g.radius) {
            playCoinSound(); 
            triggerVibration(15); // Altın aldığında kısa titreşim
            let collected = (g.value || 1);
            goldCount += isDoubleGoldActive ? collected * 2 : collected;
            golds.splice(i, 1);
            continue;
        }
    }
    golds = golds.filter(g => g.y < canvas.height + 50);

    // Kütükler ve Düşmanlar
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        
        // YAPAY ZEKA: Düşman Mantıkları
        if (obs.type === 'croc') {
            let cx = obs.x + obs.width/2;
            let pxC = player.x + player.width/2;
            if (cx < pxC - 10) obs.speedX = 60; // Sağa kilitlen
            else if (cx > pxC + 10) obs.speedX = -60; // Sola kilitlen
            else obs.speedX = 0;
        } else if (obs.type === 'hippo') {
            // Su aygırı suyun altından gelir, oyuncuya 220px yaklaştığında aniden yüzeye çıkar!
            if (obs.isSubmerged && obs.y > player.y - 220) {
                obs.isSubmerged = false;
                playCrashSound(); // Sudan çıkış patlaması efekti olarak kullanıyoruz
            }
        }

        obs.y += obs.speedY * dt;
        obs.x += obs.speedX * dt;

        let ox = obs.x + (obs.width * 0.25);
        let oy = obs.y + (obs.height * 0.1);
        let ow = obs.width * 0.5;
        let oh = obs.height * 0.8;

        if (px < ox + ow && px + pw > ox &&
            py < oy + oh && py + ph > oy) {
            
            // --- DASH DURUMUNDA ENGELİN ÜZERİNDEN ATLA! ---
            if (isDashing) continue;

            // Eğer su aygırı henüz yüzeye çıkmamışsa (su altındaysa) çarpma/sek!
            if (obs.type === 'hippo' && obs.isSubmerged) continue;
            
            if (hasShield) {
                // Kalkan varken kırılır ve kütüğü/düşmanı imha eder
                playCrashSound();
                hasShield = false; 
                obstacles.splice(i, 1);
            } else {
                gameOver();
                return; // Kilitlenmeyi önler, frame'i anında sonlandırır
            }
        }
    }
    obstacles = obstacles.filter(obs => obs.y < canvas.height + 100 && obs.x > -200 && obs.x < canvas.width + 200);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentBgTex = null;
    let currentLAsset = levelAssets[currentLevel - 1];
    
    // v151 FIX: Asset kontrolünü daha agresif yap (Broken images bypass!)
    if (currentLAsset && bgImgs[currentLAsset.bgKey] && bgImgs[currentLAsset.bgKey].width > 0) {
        currentBgTex = bgImgs[currentLAsset.bgKey];
    }

    // EĞER LEVEL 5 ise ve RESİM HALA YOKSA (VEYA BOZUKSA), DOĞRUDAN COLOR FALLBACK'E ZORLA!
    if (currentLevel === 5 && (!currentBgTex || currentBgTex.width <= 0)) {
        currentBgTex = null; 
    }

    if(currentBgTex) {
        let H = Math.ceil(canvas.height) * 2;
        ctx.drawImage(currentBgTex, 0, Math.floor(bgY), canvas.width, H);
        ctx.drawImage(currentBgTex, 0, Math.floor(bgY) - H + 1, canvas.width, H);
    } else {
        // --- SEVİYE BAZLI ARKA PLAN FALLBACK v151 (SAFLAŞTIRILMIŞ) ---
        if (currentLevel === 5) {
            ctx.fillStyle = "#1a0000"; // Simsiyah Volkanik Temel
            ctx.fillRect(0,0, canvas.width, canvas.height);
            
            // Akan Lav Parlaması (Gradientsiz, Sade)
            ctx.fillStyle = "rgba(255, 69, 0, 0.15)";
            ctx.fillRect(canvas.width * 0.35, 0, canvas.width * 0.3, canvas.height);
            
            // Lav Kabarcıkları (Daha Az, Daha Şık)
            ctx.fillStyle = "rgba(255, 140, 0, 0.6)";
            for(let i=0; i<8; i++) {
                let bx = (Math.sin(performance.now()/1500 + i) * 60 + (i*70)) % canvas.width;
                let by = (performance.now()/3 + i*120) % canvas.height;
                ctx.beginPath();
                ctx.arc(bx, by, 3, 0, Math.PI*2);
                ctx.fill();
            }
        } else if (currentLevel === 6) {
            ctx.fillStyle = "#0a0a2a"; // Derin Uzay Siyahı
            ctx.fillRect(0,0, canvas.width, canvas.height);
            
            // Uzay Tozu ve Uzak Yıldızlar
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            for(let i=0; i<30; i++) {
                let sx = (Math.sin(performance.now()/5000 + i) * 100 + (i*100)) % canvas.width;
                let sy = (performance.now()/4 + i*150) % canvas.height;
                ctx.fillRect(sx, sy, 2, 2); 
            }
            
            ctx.fillStyle = "rgba(155, 89, 182, 0.1)";
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, 200, 0, Math.PI*2);
            ctx.fill();

            // --- v154: VOID KANAL SINIRLARINI BELİRGİNLEŞTİR (LAZER RAYLARI) ---
            const voidMargin = canvas.width * 0.40;
            const laserPulse = (Math.sin(performance.now() / 200) * 0.2 + 0.5);
            
            ctx.lineWidth = 4;
            ctx.strokeStyle = `rgba(155, 89, 182, ${laserPulse})`;
            // v158: GEMİ ETRAFINDAKİ BEYAZLIK ŞÜPHESİNİ SİLMEK İÇİN GÖLGEYİ (SHADOW) KAPAT
            ctx.shadowBlur = (currentLevel >= 5) ? 0 : 15;
            ctx.shadowColor = (currentLevel === 5) ? "#ff4500" : "#fb8c00"; 
            
            // Sol Lazer
            ctx.beginPath();
            ctx.moveTo(voidMargin, 0);
            ctx.lineTo(voidMargin, canvas.height);
            ctx.stroke();
            
            // Sağ Lazer
            ctx.beginPath();
            ctx.moveTo(canvas.width - voidMargin, 0);
            ctx.lineTo(canvas.width - voidMargin, canvas.height);
            ctx.stroke();
            
            // Kanal içi hafif ızgara (Grid) efekti
            ctx.strokeStyle = "rgba(155, 89, 182, 0.05)";
            ctx.lineWidth = 1;
            for(let gy=0; gy<canvas.height; gy+=50) {
                let off = (performance.now()/10) % 50;
                ctx.beginPath();
                ctx.moveTo(voidMargin, gy+off);
                ctx.lineTo(canvas.width-voidMargin, gy+off);
                ctx.stroke();
            }
            
            ctx.shadowBlur = 0; // Reset
        } else {
            // Hiçbir şey yoksa Spring gör - Ama Lav'da asla Spring görme!
            if (bgImgs['ilkbahar'] && currentLevel !== 5) {
                currentBgTex = bgImgs['ilkbahar'];
                let H = Math.ceil(canvas.height) * 2;
                ctx.drawImage(currentBgTex, 0, Math.floor(bgY), canvas.width, H);
                ctx.drawImage(currentBgTex, 0, Math.floor(bgY) - H + 1, canvas.width, H);
            } else {
                ctx.fillStyle = "#1e90ff"; // Resim yüklenene kadar mavi
                ctx.fillRect(0,0, canvas.width, canvas.height);
            }
        }
    }
    
    // YARI SAYDAM PARALLAX SİS/BULUT TABAKASI
    clouds.forEach(c => {
        // Level 5 ve 6'da DUMANLARI TAMAMEN KALDIR (Sade Görünüm)
        if (currentLevel >= 5) return; 

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity})`;
        ctx.fill();
    });

    golds.forEach(g => {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.scale(Math.abs(Math.sin(g.angle)), 1); 
        ctx.beginPath();
        ctx.arc(0, 0, g.radius, 0, Math.PI * 2);
        ctx.fillStyle = g.color || "gold";
        ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = "#D4AF37"; ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.font = "bold 16px Arial";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        let text = (g.value === 1 || !g.value) ? "$" : g.value;
        ctx.fillText(text, 0, 0); 
        ctx.restore();
    });

    obstacles.forEach(obs => {
        if(obs.type === 'vertical' && obsImg.complete) {
            ctx.save();
            // Kütüğün merkezine git
            ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
            // Yapay Zeka resmi yatay (---) çizdiği için 90 derece döndür (|)
            ctx.rotate(Math.PI / 2);
            // Döndürüldüğü için width ve height ters çevrilerek çizilmeli
            ctx.drawImage(obsImg, -obs.height / 2, -obs.width / 2, obs.height, obs.width);
            ctx.restore();
        } else if (obs.type === 'croc' && crocImg.complete && (crocImg.naturalWidth > 0)) {
            ctx.drawImage(crocImg, obs.x, obs.y, obs.width, obs.height);
        } else if (obs.type === 'hippo') {
            if (obs.isSubmerged) {
                // Su altında baloncuk / karartı efekti
                ctx.beginPath();
                ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, obs.width/3, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(100, 200, 255, 0.5)"; // Su altı parlaması
                ctx.fill();
                ctx.beginPath();
                ctx.arc(obs.x + obs.width/2 + Math.sin(performance.now()/150)*8, obs.y + obs.height/2 - 10, 4, 0, Math.PI*2);
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.fill();
            } else {
                // Su yüzeyine çıktı 
                if (hippoImg.complete && hippoImg.naturalWidth > 0) {
                    ctx.drawImage(hippoImg, obs.x, obs.y, obs.width, obs.height);
                } else {
                    ctx.fillStyle = "#8b008b"; // Timsah/Hippo mor fallback rengi
                    ctx.beginPath();
                    ctx.arc(obs.x+obs.width/2, obs.y+obs.height/2, obs.width/2, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        } else if (obs.type === 'rock') {
            // --- PIXEL-ART TARZI DAĞ KAYASI v134 ---
            ctx.save();
            // Temel Gövde (Koyu Gri Bloklar)
            ctx.fillStyle = "#263238"; 
            ctx.fillRect(obs.x + obs.width*0.1, obs.y + obs.height*0.2, obs.width*0.8, obs.height*0.7);
            ctx.fillRect(obs.x + obs.width*0.2, obs.y + obs.height*0.1, obs.width*0.6, obs.height*0.8);
            
            // Işık Alan Yüzeyler (Açık Gri Bloklar)
            ctx.fillStyle = "#546e7a";
            ctx.fillRect(obs.x + obs.width*0.15, obs.y + obs.height*0.15, obs.width*0.4, obs.height*0.3);
            ctx.fillRect(obs.x + obs.width*0.6, obs.y + obs.height*0.4, obs.width*0.2, obs.height*0.2);
            
            // En Parlak Noktalar (Vurgu)
            ctx.fillStyle = "#90a4ae";
            ctx.fillRect(obs.x + obs.width*0.2, obs.y + obs.height*0.15, obs.width*0.1, obs.height*0.1);
            
            // Gölge ve Detay Çatlakları
            ctx.fillStyle = "#102027";
            ctx.fillRect(obs.x + obs.width*0.4, obs.y + obs.height*0.5, obs.width*0.3, 4);
            ctx.fillRect(obs.x + obs.width*0.7, obs.y + obs.height*0.7, 4, obs.height*0.2);
            
            ctx.restore();
        } else if (obs.type === 'fireball') {
            // --- ALEV TOPU (DEMONIC FIREBALL) v151 ---
            if (fireballImg.complete && fireballImg.naturalWidth > 0) {
                ctx.drawImage(fireballImg, obs.x, obs.y, obs.width, obs.height);
            } else {
                ctx.save();
                ctx.shadowBlur = 25;
                ctx.shadowColor = "#ff4500";
                ctx.fillStyle = "#ff8c00";
                ctx.beginPath();
                ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, obs.width/2.5, 0, Math.PI*2);
                ctx.fill();
                // İç Parlama
                ctx.fillStyle = "#ffff00";
                ctx.beginPath();
                ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, obs.width/5, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
            }
        } else if (obs.type === 'asteroid') {
            // --- METEOR (ASTEROID) v152 ---
            if (meteorImg.complete && meteorImg.naturalWidth > 0) {
                ctx.drawImage(meteorImg, obs.x, obs.y, obs.width, obs.height);
            } else {
                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = "#9b59b6";
                ctx.fillStyle = "#4a4a4a";
                ctx.beginPath();
                ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, obs.width/2, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
            }
        }
    });

    // --- PARÇACIKLARIN (Particles) ÇİZİMİ v126 ---
    particles.forEach(p => p.draw());

    // Kalkan Aurası Çizimi
    if (hasShield) {
        ctx.beginPath();
        // player sprite is 60x100
        ctx.arc(player.x + player.width/2, player.y + player.height/2, Math.max(player.width, player.height)/2 + 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 229, 255, 0.3)";
        ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = "#00e5ff"; ctx.stroke();
    }
    // Mıknatıs Etki Alanı Görseli (Belirgin Pulsing Aura)
    if (powerupTimer > 0) {
        let cx = player.x + player.width/2;
        let cy = player.y + player.height/2;
        let pulseRadius = 400 + Math.sin(performance.now() / 150) * 15; // Animasyonlu daralıp genişleme
        
        // Merkezden dışa doğru mor renk geçişi (Gradient)
        let grad = ctx.createRadialGradient(cx, cy, player.width, cx, cy, pulseRadius);
        grad.addColorStop(0, "rgba(224, 64, 251, 0.4)"); 
        grad.addColorStop(0.8, "rgba(224, 64, 251, 0.15)");
        grad.addColorStop(1, "rgba(224, 64, 251, 0)");
        
        ctx.beginPath();
        ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        
        // Dışına ince bir manyetik dalga çizgisi
        ctx.beginPath();
        ctx.arc(cx, cy, pulseRadius - 5, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(224, 64, 251, 0.8)";
        let offset = (performance.now() / 20) % 25; // Çizgileri döndür
        ctx.lineDashOffset = -offset; 
        ctx.setLineDash([10, 15]); // Çizgi çizgi efekt
        ctx.stroke();
        ctx.setLineDash([]); // Normale döndür
        ctx.lineDashOffset = 0;
    }

    if (playerImg) {
        if (playerImg.tagName === 'CANVAS' || playerImg.complete) {
            ctx.save();
            if (isDashing) {
                // ZIPLAMA EFEKTİ: Kayığı büyüt ve merkeze göre ölçeklendir
                let scale = 1.2 + Math.sin((dashTimer / DASH_DURATION) * Math.PI) * 0.3;
                ctx.translate(player.x + player.width/2, player.y + player.height/2);
                ctx.scale(scale, scale);
                ctx.drawImage(playerImg, -player.width/2, -player.height/2, player.width, player.height);
                
                // DASH İZİ (GHOSTING)
                ctx.globalAlpha = 0.3;
                ctx.drawImage(playerImg, -player.width/2, -player.height/2 + 20, player.width, player.height);
            } else {
                ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
            }
            ctx.restore();
        }
    }

    // --- CANVAS TABANLI UI (JİLET GİBİ SİMETRİK) ---
    ctx.font = "bold 9px 'Press Start 2P', cursive";
    ctx.shadowBlur = 5; ctx.shadowColor = "rgba(0,0,0,0.8)";
    
    // SOL TARAF (SKOR & ALTIN)
    const t = translations[currentLang];
    ctx.fillStyle = "#ffffff"; 
    ctx.textAlign = "left";
    let targetText = "";
    if (levelAssets[currentLevel-1]) {
        targetText = currentLevel < levelAssets.length ? `/${levelAssets[currentLevel].threshold}` : "/MAX";
    }
    ctx.fillText(`${t.scoreLabel} ${Math.floor(score)}${targetText}`, 15, 25);
    
    ctx.fillStyle = "#ffd600";
    ctx.fillText(`${t.goldLabel} ${goldCount}`, 15, 42);

    // v98: CANLAR (❤️❤️❤️)
    let heartText = "";
    for(let i=0; i<lives; i++) heartText += "❤️";
    ctx.font = "12px Arial";
    ctx.fillText(heartText, 15, 62);

    // --- DASH ENERJİ BARI ---
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(15, 75, 100, 8);
    ctx.fillStyle = (dashEnergy >= MAX_DASH_ENERGY) ? "#00e5ff" : "#546e7a";
    ctx.fillRect(15, 75, dashEnergy, 8);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.strokeRect(15, 75, 100, 8);
    ctx.font = "bold 8px 'Press Start 2P', cursive";
    ctx.fillStyle = "#fff";
    if (dashEnergy >= MAX_DASH_ENERGY) ctx.fillText(translations[currentLang].dashReady, 15, 95);
    ctx.font = "bold 9px 'Press Start 2P', cursive"; // Fontu geri düzelt
    
    // SAĞ TARAF (KASA & LEVEL)
    ctx.textAlign = "right";
    ctx.fillStyle = "#f2c94c";
    ctx.fillText(`💰${t.vaultLabel} ${totalGold}`, canvas.width - 15, 25);
    
    // Level Kutusu (Daha Şık ve Simetrik)
    let lvlText = `${t.levelLabel} ${currentLevel}`;
    ctx.font = "bold 8px 'Press Start 2P', cursive";
    let tw = ctx.measureText(lvlText).width;
    
    // Kutu Tasarımı
    ctx.fillStyle = "#00e5ff"; // Orijinal Turkuaz
    ctx.fillRect(canvas.width - tw - 25, 34, tw + 10, 14);
    ctx.strokeStyle = "#000"; ctx.lineWidth = 1.5;
    ctx.strokeRect(canvas.width - tw - 25, 34, tw + 10, 14);
    
    // İç Yazı
    ctx.fillStyle = "#000"; // Kalın Siyah Font
    ctx.shadowBlur = 0;
    ctx.fillText(lvlText, canvas.width - 20, 44);

    // Temizlik: Gölgeyi resetle
    ctx.shadowBlur = 0; ctx.shadowColor = "transparent";

    // SEVİYE SONU BARAJANLARI MİNİMAL UYARI
    let isDZ = (currentLevel === 1 && score >= 900) || (currentLevel === 2 && score >= 1900) || (currentLevel === 3 && score >= 2900) || (currentLevel === 4 && score >= 3900) || (currentLevel === 5 && score >= 5900) || (currentLevel === 6 && score >= 9900);
    if (isDZ && (score < 1005 || (score >= 1900 && score < 2005) || (score >= 2900 && score < 3005) || (score >= 3900 && score < 4005) || (score >= 5900 && score < 6005) || (score >= 9900 && score < 10005))) {
        ctx.save();
        ctx.fillStyle = (Math.floor(performance.now() / 200) % 2 === 0) ? "#f44336" : "rgba(244, 67, 54, 0.2)";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("⚠️", canvas.width - 32, 65); 
        ctx.restore();
    }

    // Güzelleştirme: Gölgeyi resetle
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    // UI Powerups Canvas Draw
    powerups.forEach(p => {
        if(p.type === 'magnet' && magImg.complete) {
            ctx.drawImage(magImg, p.x - p.radius, p.y - p.radius, p.radius*2, p.radius*2);
        } else if (p.type === 'shield' && shdImg.complete) {
            ctx.drawImage(shdImg, p.x - p.radius, p.y - p.radius, p.radius*2, p.radius*2);
        }     
    });

    // --- PIXEL-ART SPEED LINES (Checkpoint Transition) v134 ---
    if (isTransitioningLevel) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 4;
        for (let i = 0; i < 20; i++) {
            let lx = Math.random() * canvas.width;
            let ly = Math.random() * canvas.height;
            let len = 50 + Math.random() * 150;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx, ly + len);
            ctx.stroke();
        }
        ctx.restore();
    }

    // --- SCREEN FLASH EFFECT (Level Up / Checkpoint) v132 ---
    if (screenFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${screenFlash})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        screenFlash -= 0.05; // Parlama yavaşça sönsün
    }
}

function gameLoop(timestamp) {
    if (!isPlaying || isPaused) return;
    let dt = (timestamp - lastTime) / 1000; 
    if (dt > 0.1) dt = 0.1;
    lastTime = timestamp;

    if(isPlaying){
        update(dt);
    }
    draw(); // Her durumda çiz: Eğer isPlaying false ise (Crash olduysa) son hali ekranda kalır.
    
    if(isPlaying) {
        requestAnimationFrame(gameLoop);
    }
}

if(startBtn) startBtn.addEventListener('click', startGame);

if(pauseBtn) pauseBtn.addEventListener('click', togglePause);
if(resumeBtn) resumeBtn.addEventListener('click', togglePause);

if(quitBtn) quitBtn.addEventListener('click', () => {
    // Collect loot when quitting v121
    totalGold += goldCount;
    goldCount = 0;
    saveGame();
    
    isPaused = false;
    isPlaying = false;
    isGameOver = false;
    if(pauseScreen) {
        pauseScreen.classList.remove('active');
        pauseScreen.classList.add('hidden');
        pauseScreen.style.display = 'none';
    }
    if(gameOverScreen) {
        gameOverScreen.classList.remove('active');
        gameOverScreen.classList.add('hidden');
        gameOverScreen.style.display = 'none';
    }
    startScreen.classList.remove('hidden');
    startScreen.classList.add('active');
    if(pauseBtn) pauseBtn.style.display = 'none';
});

const qbg = document.getElementById('quit-btn-gameover');
if(qbg) qbg.addEventListener('click', () => {
    // Oyuncu gerçekten çıkıyor, altınları kasaya aktar
    totalGold += goldCount;
    goldCount = 0;
    saveGame();
    
    isGameOver = false;
    isPlaying = false;
    gameOverScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    gameOverScreen.style.display = 'none';
    
    startScreen.classList.remove('hidden');
    startScreen.classList.add('active');
    if(pauseBtn) pauseBtn.style.display = 'none';
});

if(reviveBtn) reviveBtn.addEventListener('click', () => {
    showRewardedAd(reviveBtn, translations[currentLang].reviveBtn, () => {
        isGameOver = false;
        isPlaying = true;
        lives = 3; 
        hasShield = true;
        
        // --- HİNLİK MEKANİĞİ v151 (LAVA SINIRI DAHİL) ---
        if (score >= 900 && score < 1000) {
            score = 900; 
        } else if (score >= 1900 && score < 2000) {
            score = 1900; 
        } else if (score >= 2900 && score < 3000) {
            score = 2900; 
        } else if (score >= 3900 && score < 4000) {
            score = 3900;
        } else if (score >= 5900 && score < 6000) {
            score = 5900;
        } else if (score >= 9900 && score < 10000) {
            score = 9900;
        }
        
        console.log("Hinlik Mekaniği: Skora reset atıldı!");
        
        gameOverScreen.classList.remove('active');
        gameOverScreen.classList.add('hidden');
        gameOverScreen.style.display = 'none';
        if(pauseBtn) pauseBtn.style.display = 'block';
        
        // MÜZİĞİ YENİDEN BAŞLAT v125 (Burada kesilme bug'ı vardı)
        if(!isMusicScheduled) bgMusicScheduler();
        
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
        setTimeout(() => { hasShield = false; }, 3000);
    });
});

if(spinOpenBtn) spinOpenBtn.addEventListener('click', () => {
    spinScreen.classList.remove('hidden');
    spinScreen.classList.add('active');
    spinScreen.style.display = 'flex';
    updateSpinLiveBar(); // Açılınca bakiye göster
    drawWheel();
});

if(spinCloseBtn) spinCloseBtn.addEventListener('click', () => {
    spinScreen.classList.remove('active');
    spinScreen.classList.add('hidden');
    spinScreen.style.display = 'none';
});

if(spinBtnMain) spinBtnMain.addEventListener('click', startSpin);

// Hard Reset moved to settings v121
const hardResetBtnUI = document.getElementById('hard-reset-btn');
if(hardResetBtnUI) hardResetBtnUI.addEventListener('click', () => {
    const resetOverlay = document.getElementById('reset-confirm-overlay');
    if(resetOverlay) {
        resetOverlay.classList.remove('hidden');
        resetOverlay.classList.add('active');
        resetOverlay.style.display = 'flex';
    }
});

// v122: Restart - Altınları kasaya aktar ve yeni oyun başla
if(restartBtn) restartBtn.addEventListener('click', () => { 
    totalGold += goldCount;
    goldCount = 0;
    saveGame();
    startGame();
});

const resetYes = document.getElementById('confirm-reset-yes');
const resetNo = document.getElementById('confirm-reset-no');

if(resetYes) resetYes.addEventListener('click', () => {
    // TAM SIFIRLAMA (Hard Reset)
    totalGold = 0;
    magnetLevel = 0;
    shieldLevel = 0;
    deathCountForX2 = 0;
    startingDoubleGold = false;
    
    localStorage.removeItem('riverEscapeSave');
    saveGame();
    
    // Overlay'i kapat
    const resetOverlay = document.getElementById('reset-confirm-overlay');
    if(resetOverlay) {
        resetOverlay.classList.remove('active');
        resetOverlay.classList.add('hidden');
        resetOverlay.style.display = 'none';
    }
    
    // Ayarlar ekranını da kapat, ana menüe dön
    isPlaying = false;
    isGameOver = false;
    isPaused = false;
    if(settingsScreen) {
        settingsScreen.classList.remove('active');
        settingsScreen.classList.add('hidden');
        settingsScreen.style.display = '';
    }
    if(pauseScreen) {
        pauseScreen.classList.remove('active');
        pauseScreen.classList.add('hidden');
    }
    if(gameOverScreen) {
        gameOverScreen.classList.remove('active');
        gameOverScreen.classList.add('hidden');
        gameOverScreen.style.display = 'none';
    }
    if(pauseBtn) pauseBtn.style.display = 'none';
    startScreen.classList.remove('hidden');
    startScreen.classList.add('active');
    updateShopUI();
});

if(resetNo) resetNo.addEventListener('click', () => {
    const resetOverlay = document.getElementById('reset-confirm-overlay');
    if(resetOverlay) {
        resetOverlay.classList.remove('active');
        resetOverlay.classList.add('hidden');
        resetOverlay.style.display = 'none';
    }
});


if(x2GoldBtn) {
    x2GoldBtn.addEventListener('click', () => {
        showRewardedAd(x2GoldBtn, translations[currentLang].x2GoldBtn, () => {
            startingDoubleGold = true; 
            deathCountForX2 = 0; // Teklif değerlendirildi
            
            // Satın Alma Başarılı Jinglesi
            for(let i=0; i<3; i++) setTimeout(playCoinSound, i*200);
            
            // Ses sistemi uyandırılıp oyun otomatik başlatılır!
            if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            startGame();
        });
    });
}

const adGoldBtn = document.getElementById('ad-gold-btn');
if(adGoldBtn) {
    adGoldBtn.addEventListener('click', () => {
        showRewardedAd(adGoldBtn, translations[currentLang].adGoldBtn, () => {
            totalGold += 50; 
            saveGame();
            updateShopUI();
            for(let i=0; i<4; i++) setTimeout(playCoinSound, i*100);
        });
    });
}

// Redundant saveGame removed (bottom version used)

function loadGame() {
    const saved = localStorage.getItem('riverEscapeSave');
    if (saved) {
        const data = JSON.parse(saved);
        totalGold = data.gold || 0;
        magnetLevel = data.magnet || 0;
        shieldLevel = data.shield || 0;
        isMusicVolume = (data.musicVol !== undefined) ? data.musicVol : 1.0;
        isSFXVolume = (data.sfxVol !== undefined) ? data.sfxVol : 1.0;
        isVibrationEnabled = (data.vib !== undefined) ? data.vib : true;
        
        // UI'yı güncelle
        const mSli = document.getElementById('music-slider');
        const sSli = document.getElementById('sfx-slider');
        const vTog = document.getElementById('vibration-toggle');
        
        if(mSli) { mSli.value = isMusicVolume * 100; document.getElementById('music-vol-txt').innerText = (isMusicVolume*100) + '%'; }
        if(sSli) { sSli.value = isSFXVolume * 100; document.getElementById('sfx-vol-txt').innerText = (isSFXVolume*100) + '%'; }
        if(vTog) vTog.checked = isVibrationEnabled;

        updateShopUI();
    }
}


if(settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', () => {
        saveGame();
        settingsScreen.classList.remove('active');
        settingsScreen.classList.add('hidden');
    });
}

// SLIDER VE AYAR EVENTLERİ
const musicSlider = document.getElementById('music-slider');
if(musicSlider) {
    musicSlider.addEventListener('input', (e) => {
        isMusicVolume = e.target.value / 100;
        document.getElementById('music-vol-txt').innerText = e.target.value + '%';
        saveGame(); // Değiştikçe kaydet
    });
}

const sfxSlider = document.getElementById('sfx-slider');
if(sfxSlider) {
    sfxSlider.addEventListener('input', (e) => {
        isSFXVolume = e.target.value / 100;
        document.getElementById('sfx-vol-txt').innerText = e.target.value + '%';
        saveGame();
    });
}

const vibToggle = document.getElementById('vibration-toggle');
if(vibToggle) {
    vibToggle.addEventListener('change', (e) => {
        isVibrationEnabled = e.target.checked;
        if(isVibrationEnabled) triggerVibration(30); // Test titreşimi
        saveGame();
    });
}

loadGame();

