// RİVER ESCAPE PRESTIGE - v1.99.16.12 (GHOST PURGE)
console.log("%c TOXIC PROTOCOL ACTIVE - v1.99.16.12 ", "background: #222; color: #adff2f; font-size: 20px; font-weight: bold;");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let currentLang = 'en'; // v151 FIX: Global tanım eklendi

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreElem = document.getElementById('finalScoreValue');
const pauseBtn = document.getElementById('pause-btn');
const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');
const quitBtn = document.getElementById('quit-btn');
const finalGoldElem = document.getElementById('finalGoldValue');

// v1.99.5.78: Safe Overlay Initialization
let levelUpOverlay = document.getElementById('level-up-overlay');
window.addEventListener('load', () => {
    levelUpOverlay = document.getElementById('level-up-overlay');
});
const reviveBtn = document.getElementById('revive-btn');
const reviveGoldBtn = document.getElementById('revive-gold-btn');

// --- v1.98.1.4 OPTIMIZATION: DOM CACHE ---
const cachedHud = {
    lives: document.getElementById('lives-hud'),
    score: document.getElementById('scoreValue-hud'),
    gold: document.getElementById('goldValue-hud'),
    sLabel: document.getElementById('scoreLabel-hud'),
    gLabel: document.getElementById('goldLabel-hud'),
    lvlName: document.getElementById('levelName-hud'),
    progress: document.getElementById('progress-fill-hud'),
    dashFill: document.getElementById('dash-energy-fill'),
    bBadge: document.getElementById('bomb-badge'),
    bBtn: document.getElementById('bomb-action-btn'),
    aBadge: document.getElementById('armor-badge'),
    aIndi: document.getElementById('armor-ui-indicator')
};
let hudUpdateTimer = 0;
const HUD_UPDATE_INTERVAL = 0.1; // 100ms (10 FPS update for UI is plenty)
const settingsScreen = document.getElementById('settings-screen');
const settingsOpenBtn = document.getElementById('open-settings-btn');
const settingsCloseBtn = document.getElementById('settings-close-btn');
// v1.99.6.1: Elite Button Central Controls
const eliteShopBtn = document.getElementById('open-shop-btn');
const eliteSpinBtn = document.getElementById('spin-btn');
const eliteLeaderboardBtn = document.getElementById('leaderboard-btn');
const eliteOynaBtn = document.getElementById('start-btn');
const spinScreen = document.getElementById('spin-screen');
const spinCloseBtn = document.getElementById('spin-close-btn');
const spinBtnMain = document.getElementById('spin-btn-main');
const buyWeaponBtn = document.getElementById('buy-weapon-btn');
const buyAmmoBtn = document.getElementById('buy-ammo-btn');
const ammoRow = document.getElementById('shop-ammo-row');
const bombActionBtn = document.getElementById('bomb-action-btn');


let lives = 3; // v98: 3 Can Sistemi

// --- DASH (ANI ZIPLAMA) MEKANİĞİ v147 ---
let dashEnergy = 0;
let isDashing = false;
let dashTimer = 0;
const DASH_DURATION = 1.2;
const MAX_DASH_ENERGY = 100;
const DASH_RECHARGE_RATE = 15; // Saniyede dolan enerji

// LUCKY SPIN v120
let canSpinFree = true;
let isSpinning = false;
let wheelAngle = 0;
let spinVelocity = 0;
let wheelRewards = [
    { type: 'gold', value: 50, color: '#f1c40f', label: '50G' },
    { type: 'gold', value: 100, color: '#f39c12', label: '100G' },
    { type: 'magnet', value: 1, color: '#9b59b6', label: 'MAG' },
    { type: 'gold', value: 150, color: '#e67e22', label: '150G' },
    { type: 'shield', value: 1, color: '#2ecc71', label: 'SHLD' },
    { type: 'gold', value: 200, color: '#e74c3c', label: '200G' },
    { type: 'gold', value: 50, color: '#f1c40f', label: '50G' },
    { type: 'gold', value: 100, color: '#d35400', label: '100G' }
];

function updateWheelForWeapon() {
    if (hasWeapon) {
        // İlk 50G ödülünü 10 BOMBA ile değiştir v1.68
        wheelRewards[0] = { type: 'bomb', value: 10, color: '#333', label: '💣10' };
        // Son 100G ödülünü 5 BOMBA ile değiştir v1.68
        wheelRewards[7] = { type: 'bomb', value: 5, color: '#444', label: '💣5' };
    }
}

// --- GÖRSEL EFEKT SİSTEMİ v126 ---
// particles moved to global block at line 755 for v1.99.16.92
let totalLoops = 0; // v153: SONSUL DÖNGÜ SİSTEMİ

// v1.68: NATIVE HAPTIC ENGINE (Capacitor)
function playHaptic(style = 'medium') {
    if (typeof isVibrationEnabled !== 'undefined' && !isVibrationEnabled) return;
    try {
        const Haptics = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
        if (Haptics) {
            const hStyle = (style === 'heavy') ? 'HEAVY' : (style === 'light' ? 'LIGHT' : 'MEDIUM');
            Haptics.impact({ style: hStyle });
        } else if (navigator.vibrate) {
            navigator.vibrate(style === 'heavy' ? 100 : 50);
        }
    } catch (e) { console.warn("Haptics Error", e); }
}

// v153: SONSUL DÖNGÜ SİSTEMİ (v2)
let shakeTimer = 0; // v1.68 Screen Shake
let displayScore = 0; // v1.68 Score Ticker
let displayGold = 0;  // v1.68 Gold Ticker
let displayTotalGold = 0; // Vault ticker
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
        this.life -= dt * 0.8;
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

// v1.97.0.3: DYNAMİC WİNDİNG RİVER MOTORU (Büklüm Büklüm Nehir)
function getRiverShift(y) {
    return 0; // v1.99.10.0: River curvature removed for Elite precision in Lava Level.
    // v1.97: Arka plan kaymasına (bgY) bağlı sinüs dalgası
    // v1.97.1.8: SOFT SYNC (Damped oscillation)
    // Görsel 1 tam ekran boyunda (canvas.height) kendini tekrar eder
    const amplitude = canvas.width * 0.03; // v1.99.10.0: Salınım dengelendi (%5 -> %3)
    const frequency = (Math.PI * 2) / canvas.height;
    const phase = Math.PI / 1.5;
    return Math.sin(((bgY + y) * frequency) + phase) * amplitude;
}

function initLanguage() {
    const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    currentLang = lang.startsWith('tr') ? 'tr' : 'en';
    updateLanguageUI();
}

function updateLanguageUI() {
    const t = translations[currentLang];
    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };

    setText('start-btn', t.startBtn);
    // v1.99.5.5: CLEAN START SCREEN - Icons only for sub-buttons
    // setText('open-shop-btn', t.shopBtn);
    // setText('open-settings-btn', t.settingsBtn);
    // v1.99.4.1.1: Start Description Removed for Clean UI
    // if(document.querySelector('#start-screen p')) document.querySelector('#start-screen p').innerText = t.startDesc;

    setText('resume-btn', t.resumeBtn);
    setText('quit-btn', t.quitBtn);
    if (document.getElementById('open-settings-btn-pause')) document.getElementById('open-settings-btn-pause').innerHTML = `⚙️ ${t.settingsBtn}`;

    setText('gameover-title', t.gameOver);
    // v3.31.2: Simplified Elite Score Display (RESTORED STYLES)
    if (document.getElementById('score-title-final')) {
        document.getElementById('score-title-final').innerHTML = `${t.scoreLabel || 'SKOR:'} <span style="color: #fff; font-size: 32px; font-weight: 900;">${Math.floor(score)}</span>`;
    }
    if (document.getElementById('gold-title-final')) {
        document.getElementById('gold-title-final').innerHTML = `${t.goldTitle || 'ALTIN:'} <span style="color: #FFD700; font-weight: 900;">${goldCount}</span>`;
    }

    setText('revive-btn', t.reviveBtn);
    setText('revive-gold-btn', t.reviveGoldBtn);
    setText('gameover-shop-btn', t.shopBtn);
    setText('restart-btn', t.hardResetBtn);
    // setText('spin-btn', t.spinWheelTitle); 🎡 İkonu korunsun v1.99.5.5

    if (document.getElementById('shop-title-main')) document.getElementById('shop-title-main').innerText = t.shopTitle;
    if (document.getElementById('shop-balance-text')) document.getElementById('shop-balance-text').innerHTML = `${t.balance} <span id="totalGoldValue" style="color: #FFD700;">0</span> GOLD`;

    document.querySelectorAll('#buy-magnet-btn, #buy-shield-btn').forEach(btn => {
        const priceId = btn.id === 'buy-magnet-btn' ? 'magnet-price' : 'shield-price';
        const priceVal = document.getElementById(priceId) ? document.getElementById(priceId).innerText : '0';
        btn.innerHTML = `${t.upgradeBtn}<br><span id="${priceId}">${priceVal}</span>`;
    });

    // SHOP ITEM NAMES v149
    if (document.getElementById('shop-mag-title')) document.getElementById('shop-mag-title').innerText = t.magnetName;
    if (document.getElementById('shop-shd-title')) document.getElementById('shop-shd-title').innerText = t.shieldName;

    // SHOP SMALL DESC v149
    if (document.getElementById('shop-mag-desc')) {
        document.getElementById('shop-mag-desc').innerHTML = `${t.magnetDesc} <span id="magnet-duration" style="color:#00e5ff;">0s</span><br>(${translations[currentLang].levelLabel} <span id="magnet-lvl">0</span>)`;
    }
    if (document.getElementById('shop-shd-desc')) {
        document.getElementById('shop-shd-desc').innerHTML = `${t.shieldDesc} <span id="shield-chance" style="color:#64dd17;">%0</span><br>(${translations[currentLang].levelLabel} <span id="shield-lvl">0</span>)`;
    }

    setText('ad-gold-btn', t.adGoldBtn);
    setText('shop-close-btn', t.closeBtn);

    if (document.querySelector('#settings-screen h2')) document.querySelector('#settings-screen h2').innerText = t.settingsTitle;
    if (document.getElementById('music-label-text')) document.getElementById('music-label-text').innerText = t.musicLabel;
    if (document.getElementById('sfx-label-text')) document.getElementById('sfx-label-text').innerText = t.sfxLabel;
    if (document.getElementById('vibration-label-text')) document.getElementById('vibration-label-text').innerText = t.vibrationLabel;
    setText('settings-close-btn', t.saveCloseBtn);

    if (document.querySelector('#reset-confirm-overlay h3')) document.querySelector('#reset-confirm-overlay h3').innerText = t.resetWarning;
    if (document.querySelector('#reset-confirm-overlay p')) document.querySelector('#reset-confirm-overlay p').innerText = t.resetDesc;
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
            if (typeof Leaderboard !== 'undefined' && Leaderboard.forceSync) {
                Leaderboard.forceSync();
            }
        } else {
            audioCtx.resume();
        }
    }
});

function updateSpinButtonText() {
    const btn = document.getElementById('spin-btn-main');
    if (!btn) return;
    btn.innerText = translations[currentLang].spinNextBtn;
}

document.addEventListener('DOMContentLoaded', initLanguage);



function showToast(msg, isReward = false) {
    const toast = document.getElementById('game-toast');
    const textElem = document.getElementById('toast-text');
    if (!toast || !textElem) return;

    textElem.innerText = msg;
    toast.style.display = 'block';
    toast.style.opacity = '1';

    if (isReward) {
        toast.style.background = 'linear-gradient(to right, #ffd700, #ff8c00)';
        toast.style.color = '#000';
        toast.style.transform = 'translate(-50%, 0) scale(1.2)';
    } else {
        toast.style.background = 'rgba(0,0,0,0.85)';
        toast.style.color = '#fff';
        toast.style.transform = 'translate(-50%, 0) scale(1)';
    }

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 20px) scale(0.9)';
        setTimeout(() => {
            if (toast.style.opacity === '0') toast.style.display = 'none';
        }, 500);
    }, 1500); // v1.68 Fix: 1.5 saniye ekranda kalacak!
}

// --- ADMOB YÖNETİCİSİ v3 (@capacitor-community/admob — Capacitor Native API) ---
const REWARDED_AD_UNIT_ID = "ca-app-pub-7739440971804169/6392805140"; // PRODUCTION ID
let admobInitialized = false;
let rewardedAdReady = false;
let rewardedAdLoading = false;

function getCapacitorAdMob() {
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
            return window.Capacitor.Plugins.AdMob;
        }
    } catch (e) { }
    return null;
}

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
            // Aksiyonu Dismissed (Kapatılma) olayına saklıyoruz
        });

        // 2. Reklam Kapatıldığında
        AdMob.addListener('onRewardedVideoAdDismissed', () => {
            console.log('[AdMob] Reklam Kapatıldı.');

            // v1.67: Eğer ödül kazanıldıysa, aksiyonu otomatik tetikle
            if (adExecuted && pendingRewardCallback) {
                const callback = pendingRewardCallback;
                pendingRewardCallback = null;
                callback();
            }

            setTimeout(() => {
                adExecuted = false;
                rewardedAdReady = false;
                preloadRewardedAd();

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
    } catch (e) {
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
            isTesting: false, // v1.74: TEST REKLAMI
        });
        rewardedAdReady = true;
        rewardedAdLoading = false;
        console.log('[AdMob] Rewarded ad preloaded OK.');
    } catch (e) {
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

    // v1.73: ASLA DONMAYAN (Independent Countdown)
    btnElem.disabled = true;
    let countdown = 8;
    btnElem.innerText = `${t.loadingAd} (${countdown})`;

    // UI Referanslarını kaydet (Dismiss sonrası sıfırlama için) v1.78 FIX
    window.lastAdButton = btnElem;
    window.lastAdButtonText = defaultText;

    // Bağımsız Görsel Geri Sayım (Plugin'den tamamen bağımsız çalışır)
    let countdownTimer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            btnElem.innerText = `${t.loadingAd} (${countdown})`;
        } else {
            clearInterval(countdownTimer);
            if (btnElem.disabled && !adExecuted) {
                console.warn('[AdMob] 1.73: Timeout Reset.');
                btnElem.innerText = defaultText;
                btnElem.disabled = false;
                showToast(t.adLoadFail);
            }
        }
    }, 1000);

    const AdMob = getCapacitorAdMob();
    if (!AdMob) {
        clearInterval(countdownTimer);
        showToast("Simulation Reward...");
        btnElem.innerText = defaultText;
        btnElem.disabled = false;
        callback();
        return;
    }

    // Plugin işlemlerini 'AWAIT' etmeden, arkada (Non-blocking) başlatıyoruz.
    // Böylece Plugin kilitlense bile UI kitlenmeyecek!
    (async () => {
        try {
            if (!admobInitialized) await initAdMob();

            if (!rewardedAdReady) {
                console.log('[AdMob] 1.74: Async Testing Loading...');
                await AdMob.prepareRewardVideoAd({ adId: REWARDED_AD_UNIT_ID, isTesting: false });
                rewardedAdReady = true;
            }

            if (rewardedAdReady) {
                clearInterval(countdownTimer); // Reklam hazırsa sayacı durdur
                pendingRewardCallback = callback;
                adExecuted = false;
                console.log('[AdMob] 1.73: Show Triggered.');
                await AdMob.showRewardVideoAd();
            }
        } catch (e) {
            console.error('[AdMob] 1.73: Async Error:', e);
            rewardedAdReady = false;
        }
    })();
}

// --- HAPTICS (TİTREŞİM SİSTEMİ) v3.2 ---
function getCapacitorHaptics() {
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
            return window.Capacitor.Plugins.Haptics;
        }
    } catch (e) { }
    return null;
}

async function triggerVibration(pattern) {
    if (typeof isVibrationEnabled !== 'undefined' && !isVibrationEnabled) return;

    const Haptics = getCapacitorHaptics();

    try {
        if (Haptics) {
            if (Array.isArray(pattern)) {
                // Büyük çarpışmalar (GameOver vb.)
                await Haptics.notification({ type: 'warning' });
            } else if (typeof pattern === 'number' && pattern >= 30) {
                // v1.67: 'heavy' yerine 'medium' (Daha şık ve profesyonel)
                await Haptics.impact({ style: 'medium' });
            } else {
                // Altın toplama veya hafif sürtünme (Tık hissi)
                await Haptics.impact({ style: 'light' });
            }
        } else {
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
    const wc = document.getElementById('wheel-canvas');
    if (!wc) return;
    const ctx = wc.getContext('2d');
    if (!ctx) return;

    const centerX = 200, centerY = 200, radius = 180;
    ctx.clearRect(0, 0, 400, 400);

    const sliceAngle = (Math.PI * 2) / wheelRewards.length;

    wheelRewards.forEach((r, i) => {
        const startAng = wheelAngle + i * sliceAngle;
        const endAng = startAng + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAng, endAng);
        ctx.fillStyle = r.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAng + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px 'Outfit', sans-serif";
        ctx.fillText(r.label, radius - 20, 10);
        ctx.restore();
    });

    // Orta Göbek Parlaması
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Merkez nokta
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700";
    ctx.fill();

    // v1.99.5.97: OK (CANVAS DRAWING) - Dışa taşma yapmayan mühürlü ok
    ctx.beginPath();
    ctx.moveTo(centerX - 15, 5); // Üst sol
    ctx.lineTo(centerX + 15, 5); // Üst sağ
    ctx.lineTo(centerX, 35);    // Alt orta (uç)
    ctx.closePath();
    ctx.fillStyle = "#FFD700";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(255,215,0,0.8)";
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow
}

function startSpin() {
    if (isSpinning) return;

    const spinAction = () => {
        // Reklam sonrası UI'nın toparlanması için 150ms bekle (Elite Sync)
        setTimeout(() => {
            isSpinning = true;
            updateSpinButtonText();
            const btn = document.getElementById('spin-btn-main');
            if (btn) btn.disabled = true;

            const msg = document.getElementById('spin-reward-msg');
            if (msg) msg.innerText = translations[currentLang].spinWait || "ZAR ATILIYOR...";

            // Başlangıç hızı (Daha uzun ve etkileyici bir dönüş için güçlendirildi)
            spinVelocity = 0.6 + Math.random() * 0.4;
            requestAnimationFrame(animateSpin);
        }, 150);
    };

    showRewardedAd(document.getElementById('spin-btn-main'), translations[currentLang].spinNextBtn, spinAction);
}

function animateSpin() {
    if (!isSpinning) return;

    wheelAngle += spinVelocity;
    // Açıyı normalize et (Sayısal karmaşıklığı önler)
    wheelAngle %= (Math.PI * 2);

    spinVelocity *= 0.988; // Sönümleme biraz azaltıldı (Daha uzun döner)

    const sliceWidth = (Math.PI * 2) / wheelRewards.length;
    if (Math.floor(wheelAngle / sliceWidth) !== Math.floor((wheelAngle - spinVelocity) / sliceWidth)) {
        if (typeof playSpinClick === 'function') playSpinClick();
    }

    drawWheel();

    if (spinVelocity < 0.0015) {
        isSpinning = false;
        spinVelocity = 0;
        giveReward();
        const btn = document.getElementById('spin-btn-main');
        if (btn) btn.disabled = false;
    } else {
        requestAnimationFrame(animateSpin);
    }
}

function updateSpinLiveBar() {
    const gl = document.getElementById('spin-gold-live');
    const ml = document.getElementById('spin-mag-live');
    const sl = document.getElementById('spin-shd-live');
    if (gl) gl.innerText = totalGold || 0;
    if (ml) ml.innerText = 'LVL ' + (magnetLevel || 0);
    if (sl) sl.innerText = 'LVL ' + (shieldLevel || 0);
}


function showSpinRewardPopup(emoji, label, value) {
    const popup = document.getElementById('spin-reward-popup');
    if (!popup) return;
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

    if (reward.type === 'gold') {
        totalGold += reward.value;
        triggerEliteEconomySync(); // v1.99.4.1.8: Çark ödülü anında buluta!
        saveGame();
        rewardLabel = reward.value + ' ' + t.rewardGold;
        popupEmoji = '💰';
        popupLabel = t.rewardGold.toUpperCase();
        popupValue = '+' + reward.value;
    } else if (reward.type === 'bomb') {
        bombCount += reward.value;
        rewardLabel = reward.value + ' ' + t.rewardBomb;
        popupEmoji = '💣';
        popupLabel = t.rewardBomb.toUpperCase();
        popupValue = '+' + reward.value;
    } else if (reward.type === 'magnet') {
        magnetLevel++;
        rewardLabel = t.rewardMagnet + ' LVL UP!';
        popupEmoji = '🧲';
        popupLabel = t.rewardMagnet.toUpperCase();
        popupValue = 'LVL ' + magnetLevel;
    } else if (reward.type === 'shield') {
        shieldLevel++;
        rewardLabel = t.rewardShield + ' LVL UP!';
        popupEmoji = '🛡️';
        popupLabel = t.rewardShield.toUpperCase();
        popupValue = 'LVL ' + shieldLevel;
    }

    // Hemen kaydet ve göster
    saveGame();
    updateSpinLiveBar(); // Bakiye barını anında güncelle
    if (typeof playSpinReward === 'function') playSpinReward();

    // Animasyonlu popup göster
    showSpinRewardPopup(popupEmoji, popupLabel, popupValue);

    const srm = document.getElementById('spin-reward-msg');
    if (srm) srm.innerText = t.rewardPrefix + rewardLabel;

    const sbm = document.getElementById('spin-btn-main');
    if (sbm) sbm.disabled = false;

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
    { threshold: 0, bgKey: 'ilkbahar', speed: 140, spawn: 1.60, titleEN: translations.en.l1Title, titleTR: translations.tr.l1Title, color: "#64dd17", pKey: "ilkbahar", margin: 0.35 },
    { threshold: 1000, bgKey: 'yaz', speed: 160, spawn: 1.55, titleEN: translations.en.l2Title, titleTR: translations.tr.l2Title, color: "#ffd600", pKey: "ilkbahar", margin: 0.33 },
    { threshold: 2500, bgKey: 'sonbahar', speed: 220, spawn: 1.15, titleEN: translations.en.l3Title, titleTR: translations.tr.l3Title, color: "#ff6d00", pKey: "ilkbahar", margin: 0.35 },
    { threshold: 4500, bgKey: 'kis', speed: 260, spawn: 1.40, titleEN: translations.en.l4Title, titleTR: translations.tr.l4Title, color: "#00e5ff", pKey: "ilkbahar", margin: 0.35 },
    { threshold: 7000, bgKey: 'lava', speed: 315, spawn: 0.55, titleEN: translations.en.lavaRiver, titleTR: translations.tr.lavaRiver, color: "#ff4500", pKey: "lava", margin: 0.34 },
    { threshold: 10000, bgKey: 'void', speed: 190, spawn: 1.40, titleEN: translations.en.voidLevel, titleTR: translations.tr.voidLevel, color: "#9b59b6", pKey: "void", margin: 0.32 },
    { threshold: 14000, bgKey: 'lagoon', speed: 310, spawn: 0.65, titleEN: translations.en.l7Title, titleTR: translations.tr.l7Title, color: "#00e5ff", pKey: "ilkbahar", margin: 0.15 },
    { threshold: 18500, bgKey: 'cyber', speed: 340, spawn: 0.50, titleEN: "CYBER CITY", titleTR: "SİBER ŞEHİR", color: "#ff00ff", pKey: "void", margin: 0.18, scrollSpeed: 1.0 },
    { threshold: 22500, bgKey: 'toxic', speed: 320, spawn: 0.85, titleEN: "TOXIC WASTELAND", titleTR: "ZEHİRLİ ATIK", color: "#32CD32", pKey: "lava", margin: 0.30, scrollSpeed: 1.0 }
];

// v1.96.6.6: Ölüm Vadisi (DZ) Durumunu Merkezi Olarak Belirle
// v1.99.13.1: Ölüm Vadisi (DZ) Tetikleyicisi - Seviye Süresinin Son %10'unda Başlar
function getDZStatus() {
    // v1.99.14.9: ELITE DYNAMIC DZ - Triggers at last 20% of CURRENT level progress
    let p = Math.floor(levelProgressTime * 5) % 27500;
    
    for (let i = 0; i < levelAssets.length; i++) {
        let start = levelAssets[i].threshold;
        let end = (i < levelAssets.length - 1) ? levelAssets[i+1].threshold : 27500;
        
        if (p >= start && p < end) {
            let duration = end - start;
            let dzStartPoint = end - (duration * 0.10); // v1.99.14.19: Elite DZ Threshold (Last 10%)
            return p >= dzStartPoint;
        }
    }
    return false;
}

let isTransitioningLevel = false;
let transitionTimer = 0;

// v109 - Görsel Varlıklar assets.js dosyasına taşındı.



// ----------------------------------------------------
// OYUN SİSTEMİ 
// ----------------------------------------------------
let isPlaying = false, isGameOver = false, isPaused = false;
let score = 0, goldCount = 0, lastTime = 0, levelProgressTime = 0, lastSpawnTime = 0;
let obstacles = [], golds = [], particles = [], powerups = []; // v1.99.16.93: LEGACY SYNC
let currentLevel = 1;
let bgY = 0; let bgScrollSpeed = 100;
let screenFlash = 0; // Seviye geçişi parlaması v132
let gameLoopRequestId = null; // v1.98.1.4: LOOP CONTROL

var totalGold = 0;
var magnetLevel = 0;
var shieldLevel = 0;
var bombCount = 0;
var powerupTimer = 0;
var hasShield = false;
var ownsArmorLicense = false;
var armorCharge = 0;
var hasWeapon = false;
let lastShotTime = 0;
let bullets = [];

function saveGame() {
    const data = {
        gold: totalGold,
        magnet: magnetLevel,
        shield: shieldLevel,
        musicVol: isMusicVolume,
        sfxVol: isSFXVolume,
        vib: isVibrationEnabled,
        weapon: hasWeapon,
        bombs: bombCount,
        armorLicense: ownsArmorLicense,
        armorCharge: armorCharge,
        // v1.99.4.1.9: Elite Persistence (Session Restore) 💾
        sessionScore: Math.floor(score || 0),
        sessionLives: lives || 3,
        sessionLevel: currentLevel || 1
    };
    localStorage.setItem('riverEscapeSave', JSON.stringify(data));

    // v1.99.3.31.0: Elite Cloud Sync (Full Asset Backup)
    if (typeof Leaderboard !== 'undefined') {
        Leaderboard.forceSync();
    }

    updateShopUI();
}

function updateArmorUI() {
    let aBadge = document.getElementById('armor-badge');
    let aIndi = document.getElementById('armor-ui-indicator');
    let aBG = document.getElementById('armor-bg-diamond');
    
    if (aBadge) aBadge.innerText = armorCharge;
    
    if (aIndi) {
        // v1.99.14.74: Persistent visibility for licensed players
        if (ownsArmorLicense) {
            aIndi.style.display = 'flex';
            
            if (armorCharge > 0) {
                aIndi.style.opacity = "1";
                aIndi.style.filter = "none";
            } else {
                // Dimmed look when out of armor
                aIndi.style.opacity = "0.5";
                aIndi.style.filter = "grayscale(1) brightness(0.7)";
            }

            // Cycle Highlighting: Glowing only on recharge cycles (multiples of 6)
            const isCycle = (currentLevel > 0 && currentLevel % 6 === 0);
            if (isCycle && aBG) {
                aBG.style.boxShadow = "0 0 40px #9b59b6, inset 0 0 20px #9b59b6";
                aBG.style.border = "2px solid #fff";
                aIndi.style.opacity = "1"; // Brighten during cycle even if 0
                aIndi.style.filter = "none";
            } else if (aBG) {
                aBG.style.boxShadow = "0 0 30px rgba(155, 89, 182, 0.3)";
                aBG.style.border = "2px solid rgba(155, 89, 182, 0.6)";
            }
        } else {
            aIndi.style.display = 'none';
        }
    }
}

// v1.99.14.77: GLOBAL SHOP TRIGGER (Fixing ReferenceError)
function openShop() {
    const sScr = document.getElementById('shop-screen');
    const pScr = document.getElementById('pause-screen');
    const startScr = document.getElementById('start-screen');
    
    // v1.99.14.77 FIX: Use 'isPlaying' instead of 'gameState'
    if (isPlaying && !isPaused && typeof togglePause === 'function') {
        togglePause();
    }
    
    if (sScr) {
        if (pScr) pScr.classList.add('hidden');
        if (startScr) startScr.classList.add('hidden');
        
        sScr.classList.remove('hidden');
        sScr.classList.add('active');
        sScr.style.display = 'flex';
        sScr.style.zIndex = '30000';
        if (typeof updateShopUI === 'function') updateShopUI();
    }
}

// v1.99.7.6: Eski updateShopUI silindi. Master sistem satır 1292'dedir.


// v1.99.7.9: THE ULTIMATE ELITE CLEANUP. Orphaned legacy blocks removed.

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
    // --- v1.99.16.03: ULTIMATE SYNC LEVEL SKIP (Press 'L') ---
    if (e.key === 'l' || e.key === 'L') {
        let cycleLimit = 27500;
        let p = (levelProgressTime * 5) % cycleLimit;
        let nextT = cycleLimit;
        let nextIdx = 0;

        for (let i = 0; i < levelAssets.length; i++) {
            if (levelAssets[i].threshold > p) {
                nextT = levelAssets[i].threshold;
                nextIdx = i;
                break;
            }
        }

        // --- ZORUNLU SENKRONİZASYON ---
        levelProgressTime = (nextT / 5) + 5; 
        score = Math.floor(levelProgressTime * 5);
        currentLevel = nextIdx + 1; // Manuel Override
        
        console.log("MASTER SKIP EXECUTED: Level Index", nextIdx, "Target Threshold:", nextT);
    }
});

// v1.99.6.1: ELITE BUTTON LISTENERS (UNIFIED & HAPTIC)
if (eliteShopBtn) eliteShopBtn.onclick = () => {
    playHaptic('light');
    const shopScr = document.getElementById('shop-screen');
    const menuScr = document.getElementById('start-screen');
    if (shopScr) {
        shopScr.classList.remove('hidden');
        shopScr.classList.add('active');
        if (menuScr) menuScr.classList.add('hidden');
        shopScr.style.display = 'flex';
        shopScr.style.zIndex = '30000';
        updateShopUI();
    }
};

if (eliteLeaderboardBtn) eliteLeaderboardBtn.onclick = () => {
    playHaptic('light');
    if (window.Leaderboard && typeof Leaderboard.show === 'function') {
        Leaderboard.show();
    }
};

if (eliteSpinBtn) eliteSpinBtn.onclick = () => {
    playHaptic('light');
    const sScr = document.getElementById('spin-screen');
    const menuScr = document.getElementById('start-screen');
    if (sScr) {
        sScr.classList.remove('hidden');
        sScr.classList.add('active');
        if (menuScr) menuScr.classList.add('hidden');
        sScr.style.display = 'flex';
        sScr.style.zIndex = '25000';
        if (typeof updateSpinLiveBar === 'function') updateSpinLiveBar();
        if (typeof drawWheel === 'function') drawWheel();
    }
};

// v1.99.6.5: Çark Buton Mantığı (RECOVERY)
if (spinBtnMain) spinBtnMain.onclick = () => {
    playHaptic('medium');
    if (typeof startSpin === 'function') startSpin();
};

if (spinCloseBtn) spinCloseBtn.onclick = () => {
    const sScr = document.getElementById('spin-screen');
    if (sScr) {
        sScr.classList.remove('active');
        sScr.classList.add('hidden');
        sScr.style.display = 'none';
    }
    const menuScr = document.getElementById('start-screen');
    if (!isPlaying && menuScr) {
        menuScr.classList.remove('hidden');
        menuScr.classList.add('active');
        menuScr.style.display = 'flex';
    }
};



if (eliteOynaBtn) eliteOynaBtn.onclick = () => {
    playHaptic('light');
    startGame();
};


const settingsOpenBtnElite = document.getElementById('open-settings-btn');
if (settingsOpenBtnElite) settingsOpenBtnElite.addEventListener('click', () => {
    const menuScr = document.getElementById('start-screen');
    settingsScreen.classList.remove('hidden');
    settingsScreen.classList.add('active');
    if (menuScr) menuScr.classList.add('hidden'); // Menüyü gizle
    settingsScreen.style.display = 'flex';
    settingsScreen.style.zIndex = '20000'; // En üstte
});

const closeSettingsElite = () => {
    saveGame(); // Elite v1.99.5.92: Her zaman kaydet
    settingsScreen.classList.remove('active');
    settingsScreen.classList.add('hidden');
    settingsScreen.style.display = 'none';
    const menuScr = document.getElementById('start-screen');
    if (!isPlaying && menuScr) {
        menuScr.classList.remove('hidden');
        menuScr.classList.add('active');
        menuScr.style.display = 'flex';
    }
};

const settingsCloseBtnElite = document.getElementById('settings-close-btn');
if (settingsCloseBtnElite) settingsCloseBtnElite.addEventListener('click', closeSettingsElite);

const settingsBackBtnElite = document.getElementById('settings-back-btn');
if (settingsBackBtnElite) settingsBackBtnElite.addEventListener('click', closeSettingsElite);

const settingsPauseBtn = document.getElementById('settings-open-btn-pause');

const shopBtnGameOver = document.getElementById('shop-open-btn-gameover');
if (shopBtnGameOver) shopBtnGameOver.addEventListener('click', () => {
    document.getElementById('shop-screen').classList.remove('hidden');
    document.getElementById('shop-screen').classList.add('active');
    document.getElementById('shop-screen').style.display = 'flex';
    document.getElementById('shop-screen').style.opacity = '1';
    document.getElementById('shop-screen').style.zIndex = '20000';
});

// v1.199.3.31.10.2: ELITE QUIT PROTECTION (Gold Vault Guard)
const quitBtnGameOver = document.getElementById('quit-btn-gameover');
if (quitBtnGameOver) {
    quitBtnGameOver.onclick = () => {
        const doQuit = () => {
            saveGame();
            location.reload();
        };

        if (score > 2000) {
            const t = translations[currentLang];
            const confirmQuit = confirm(t.confirmQuit || "Bu turdaki skorun SİLİNECEK! Çıkmak istediğine emin misin?");
            if (confirmQuit) doQuit();
        } else {
            doQuit();
        }
    };
}

// v1.99.5.86: UNIFIED SHOP CONTROLS
const shopScreen = document.getElementById('shop-screen');
const closeShopBtn = document.getElementById('shop-close-btn');

if (closeShopBtn) {
    closeShopBtn.addEventListener('click', () => {
        const menuScr = document.getElementById('start-screen');
        if (shopScreen) {
            shopScreen.classList.remove('active');
            shopScreen.classList.add('hidden');
            shopScreen.style.display = 'none';
        }
        // v1.99.6.0: Akıllı Geri Dönüş
        if (isPlaying) {
            const pauseScr = document.getElementById('pause-screen');
            if (pauseScr && isPaused) {
                pauseScr.classList.remove('hidden');
                pauseScr.classList.add('active');
                pauseScr.style.display = 'flex';
                pauseScr.style.zIndex = '10000';
            }
        } else {
            const menuScr = document.getElementById('start-screen');
            if (menuScr) {
                menuScr.classList.remove('hidden');
                menuScr.classList.add('active');
                menuScr.style.display = 'flex';
                menuScr.style.zIndex = '100';
            }
        }
        saveGame();
    });
}


const armorIndicator = document.getElementById('armor-ui-indicator');
if (armorIndicator) armorIndicator.addEventListener('click', () => {
    // Tıklandığında oyunu durdur (Pause)
    if (!isPaused && isPlaying && !isGameOver) {
        togglePause();
    }
    // Mağazayı otomatik aç
    document.getElementById('shop-screen').classList.remove('hidden');
    document.getElementById('shop-screen').classList.add('active');
    document.getElementById('shop-screen').style.display = 'flex';
    document.getElementById('shop-screen').style.opacity = '1';
    document.getElementById('shop-screen').style.zIndex = '20000';
});

const btnMag = document.getElementById('buy-magnet-btn');
if (btnMag) btnMag.addEventListener('click', () => {
    let cost = 2000 + magnetLevel * 1000;
    if (totalGold >= cost && magnetLevel < 5) {
        totalGold -= cost; magnetLevel++; saveGame();
        triggerEliteEconomySync(); // v1.99.4.1.8: Harcama anında buluta!
        for (let i = 0; i < 3; i++) setTimeout(playCoinSound, i * 150);
        updateShopUI();
    } else if (totalGold < cost) {
        shakeTimer = 0.4; // Sarsıntı güçlendirildi v1.96.6.3
        if (typeof playHaptic === 'function') playHaptic('light');
        showToast(translations[currentLang].noGold, false);
    }
});

const btnShd = document.getElementById('buy-shield-btn');
if (btnShd) btnShd.addEventListener('click', () => {
    let cost = 3500 + shieldLevel * 1500;
    if (totalGold >= cost && shieldLevel < 5) {
        totalGold -= cost; shieldLevel++; saveGame();
        triggerEliteEconomySync(); // v1.99.4.1.8: Harcama anında buluta!
        for (let i = 0; i < 3; i++) setTimeout(playCoinSound, i * 150);
        updateShopUI();
    } else if (totalGold < cost) {
        shakeTimer = 0.4;
        if (typeof playHaptic === 'function') playHaptic('light');
        showToast(translations[currentLang].noGold, false);
    }
});

const buyArmorBtn = document.getElementById('buy-armor-btn');
if (buyArmorBtn) buyArmorBtn.addEventListener('click', () => {
    const t = translations[currentLang];
    if (!ownsArmorLicense) {
        if (totalGold >= 5000) {
            totalGold -= 5000;
            ownsArmorLicense = true;
            armorCharge += 3;
            saveGame();
            triggerEliteEconomySync(); // v1.99.4.1.8: Harcama anında buluta!
            for (let i = 0; i < 8; i++) setTimeout(playCoinSound, i * 100);
            showToast(t.armorActivated, true);
            updateShopUI();
        } else {
            shakeTimer = 0.4;
            if (typeof playHaptic === 'function') playHaptic('light');
            showToast(t.noGold, false);
        }
    } else {
        if (totalGold >= 500) {
            totalGold -= 500;
            armorCharge += 3;
            saveGame();
            triggerEliteEconomySync(); // v1.99.4.1.8: Harcama anında buluta!
            for (let i = 0; i < 3; i++) setTimeout(playCoinSound, i * 100);
            showToast(t.armorReloaded, true);
            updateShopUI();
        } else {
            shakeTimer = 0.4;
            if (typeof playHaptic === 'function') playHaptic('light');
            showToast(t.noGold, false);
        }
    }
});

if (buyWeaponBtn) buyWeaponBtn.addEventListener('click', () => {
    const t = translations[currentLang];
    if (!hasWeapon) {
        if (totalGold >= 5000) {
            totalGold -= 5000;
            hasWeapon = true;
            bombCount += 15; // 5000 altına 15 mermi elite bonus
            saveGame();
            triggerEliteEconomySync(); // v1.99.4.1.8: Harcama anında buluta!
            for (let i = 0; i < 8; i++) setTimeout(playCoinSound, i * 100);
            showToast(t.weaponPurchased || "Silah Lisansı Alındı!", true);
            updateShopUI();
        } else {
            shakeTimer = 0.4;
            if (typeof playHaptic === 'function') playHaptic('light');
            showToast(t.noGold, false);
        }
    }
});

// v1.99.5.3: GLOBAL SHOP FUNCTIONS (Elite Logic)
function buyMagnet() {
    let price = (magnetLevel + 1) * 1000;
    if (totalGold >= price && magnetLevel < 10) {
        totalGold -= price;
        magnetLevel++;
        playPowerupSound();
        saveGame();
        updateShopUI();
        showToast("Mıknatıs Geliştirildi! 🧲", true);
    } else {
        showToast(translations[currentLang].noGold || "Yetersiz Altın!", false);
    }
}

function buyShield() {
    let price = (shieldLevel + 1) * 1500;
    if (totalGold >= price && shieldLevel < 10) {
        totalGold -= price;
        shieldLevel++;
        playPowerupSound();
        saveGame();
        updateShopUI();
        showToast("Kalkan Güçlendirildi! 🛡️", true);
    } else {
        showToast(translations[currentLang].noGold || "Yetersiz Altın!", false);
    }
}

function buyWeapon() {
    if (!hasWeapon && totalGold >= 5000) {
        totalGold -= 5000;
        hasWeapon = true;
        bombCount = 15;
        playPowerupSound();
        saveGame();
        updateShopUI();
        showToast("Nehir Topu ALINDI! 💣", true);
    } else if (hasWeapon) {
        showToast("Zaten Sahipsin!", false);
    } else {
        showToast(translations[currentLang].noGold || "Yetersiz Altın!", false);
    }
}

function buyArmorLicense() {
    if (!ownsArmorLicense && totalGold >= 5000) {
        totalGold -= 5000;
        ownsArmorLicense = true;
        armorCharge = 3;
        playPowerupSound();
        saveGame();
        updateShopUI();
        showToast("Gemi Zırhı Lisansı ALINDI! 💎", true);
    } else if (ownsArmorLicense) {
        // Geliştirme/Şarj mantığı (v1.99.8.8: Max 10)
        if (totalGold >= 1000 && armorCharge < 10) {
            totalGold -= 1000;
            armorCharge++;
            playPowerupSound();
            saveGame();
            updateShopUI();
            showToast("Zırh Şarj Edildi! ⚡", true);
        } else if (armorCharge >= 5) {
            showToast("Maksimum Zırh!", false);
        } else {
            showToast(translations[currentLang].noGold, false);
        }
    } else {
        showToast(translations[currentLang].noGold, false);
    }
}

function updateShopUI() {
    try {
        const tv = document.getElementById('totalGoldValue');
        const tvShop = document.getElementById('totalGoldValue-shop');
        if (tv) tv.innerText = totalGold;
        if (tvShop) tvShop.innerText = totalGold;

        const mPrice = (magnetLevel + 1) * 1000;
        const sPrice = (shieldLevel + 1) * 1500;

        const mDur = document.getElementById('magnet-duration');
        const sChn = document.getElementById('shield-chance');
        const mLvl = document.getElementById('magnet-lvl');
        const sLvl = document.getElementById('shield-lvl');

        if (mDur) mDur.innerText = (3 + magnetLevel * 2) + "s";
        if (sChn) sChn.innerText = "%" + Math.min(60, (10 + shieldLevel * 5));
        if (mLvl) mLvl.innerText = magnetLevel;
        if (sLvl) sLvl.innerText = shieldLevel;

        const mBtn = document.getElementById('buy-magnet-btn');
        const sBtn = document.getElementById('buy-shield-btn');

        if (mBtn) mBtn.disabled = (totalGold < mPrice || magnetLevel >= 10);
        if (sBtn) sBtn.disabled = (totalGold < sPrice || shieldLevel >= 10);

        // Weapon Toggle
        const buyWBtn = document.getElementById('buy-weapon-btn');
        if (buyWBtn) {
            if (hasWeapon) {
                buyWBtn.innerText = "SAHİPSİN";
                buyWBtn.disabled = true;
            } else {
                buyWBtn.innerText = "AL\n5000 G";
                buyWBtn.disabled = (totalGold < 5000);
            }
        }

        // Armor Toggle (Elite Void logic v1.99.9.1)
        const armRow = document.getElementById('shop-armor-row');
        const isVoidLevel = (currentLevel > 0 && currentLevel % 6 === 0);
        const buyABtn = document.getElementById('buy-armor-btn');
        const iconSpan = document.querySelector('#shop-armor-row span');

        if (armRow) {
            // Her zaman göster ama 6 katı değilse kilitli yap (User Request Sync)
            armRow.style.display = 'flex';
            armRow.style.opacity = isVoidLevel ? '1' : '0.4';
            armRow.style.pointerEvents = isVoidLevel ? 'auto' : 'none';
        }

        if (buyABtn) {
            if (isVoidLevel) {
                // LEVEL 6+: ŞARJ VEYA LİSANS AKTİF
                if (ownsArmorLicense) {
                    const price = 1000;
                    if(iconSpan) iconSpan.innerText = "💎"; 
                    buyABtn.innerText = `ŞARJ ET (${armorCharge})\n${price} G`;
                    buyABtn.disabled = (totalGold < price || armorCharge >= 10);
                    if (document.getElementById('shop-arm-title')) document.getElementById('shop-arm-title').innerText = "Zırh Şarjı (Mühimmat)";
                } else {
                    if(iconSpan) iconSpan.innerText = "🔒";
                    buyABtn.innerText = "LİSANS AL\n5000 G";
                    buyABtn.disabled = (totalGold < 5000);
                }
            } else {
                // LEVEL 6 DIŞINDA: KİLİTLİ VE ŞARJ GİZLİ
                if(iconSpan) iconSpan.innerText = "🔒";
                buyABtn.innerText = "KİLİTLİ\n(LVL 6+)";
                buyABtn.disabled = true;
                if (document.getElementById('shop-arm-title')) document.getElementById('shop-arm-title').innerText = "Gemi Zırhı (Void)";
                if (document.getElementById('shop-arm-desc')) document.getElementById('shop-arm-desc').innerText = "Level 6, 12, 18...'de Açılır";
            }
        }
        // Silah Lisansı Yoksa Mühimmat Satırını Gizle (v1.99.8.4)
        const ammoRowElem = document.getElementById('shop-ammo-row');
        if(ammoRowElem) {
            ammoRowElem.style.display = hasWeapon ? 'flex' : 'none';
        }

        // AMMO BUY BUTTON SYNC (v1.99.14.35)
        const ammoBuyBtn = document.getElementById('buy-ammo-btn');
        if (ammoBuyBtn) {
            ammoBuyBtn.disabled = (totalGold < 1000);
        }

        // BOMBA BUTONU & HUD SYNC
        let bBadge = document.getElementById('bomb-badge');
        if (bBadge) bBadge.innerText = bombCount;
        let bBtn = document.getElementById('bomb-action-btn');
        if (bBtn) {
            if (hasWeapon) {
                bBtn.style.display = 'flex';
                bBtn.style.filter = (bombCount <= 0) ? "grayscale(100%) opacity(0.6)" : "none";
            } else { bBtn.style.display = 'none'; }
        }
        updateArmorUI();
    } catch (e) { console.warn("Shop UI Error:", e); }
}

if (buyAmmoBtn) buyAmmoBtn.addEventListener('click', () => {
    const t = translations[currentLang];
    if (totalGold >= 1000) {
        totalGold -= 1000;
        bombCount += 10;
        saveGame();
        triggerEliteEconomySync(); // v1.99.4.1.8: Harcama anında buluta!
        for (let i = 0; i < 3; i++) setTimeout(playCoinSound, i * 100);
        showToast(t.ammoPurchased || "Mühimmat Alındı! +10 💣", true);
        updateShopUI();
    } else {
        shakeTimer = 0.4;
        if (typeof playHaptic === 'function') playHaptic('light');
        showToast(t.noGold, false);
    }
});

// v1.99.3.31.0: ALTINLA CANLANMA (REVİVE WİTH GOLD)
if (reviveGoldBtn) reviveGoldBtn.addEventListener('click', reviveWithGold);
function reviveWithGold() {
    // v3.31.0: ELITE BALANCED ECONOMY
    const t = translations[currentLang];
    const cost = 100; // Artık 1 Reklam = 1 Canlanma bedeli (100 Altın)

    if (totalGold >= cost) {
        totalGold -= cost;
        triggerEliteEconomySync(); // v1.99.14.27: Economy Sync (Deduct from shop)
        lives = 3 + (window.extraLives || 0);
        hasShield = true; // Dokunulmazlık Ver
        shieldTimer = 3.0; // 3 Saniye Koruma

        // Oyuncuyu biraz yukarı kaydır ki engelin içinde kalmasın
        player.y -= 100;

        saveGame();
        updateArmorUI();

        // Arayüzü Temizle ve Oyunu Başlat
        isGameOver = false;
        isPlaying = true;
        isPaused = false;

        // Ses Motorunu Canlandır (Oyun başladıktan sonra!)
        if (typeof initAudio === 'function') initAudio();
        if (typeof bgMusicScheduler === 'function' && !isMusicScheduled) {
            bgMusicScheduler();
        }

        gameOverScreen.classList.remove('active');
        gameOverScreen.classList.add('hidden');
        gameOverScreen.style.display = 'none';

        const pb = document.getElementById('pause-btn');
        if (pb) pb.style.display = 'block';

        for (let i = 0; i < 5; i++) setTimeout(playCoinSound, i * 100);
        showToast(t.revived || "CANLANDIN! 🏛️", true);

        // Oyunu Tekrar Döngüye Sok
        requestAnimationFrame(gameLoop);
    } else {
        shakeTimer = 0.4;
        if (typeof playHaptic === 'function') playHaptic('light');
        showToast(t.noGold, false);
    }
}

function fireBomb() {
    if (!isPlaying || isPaused || isGameOver || !hasWeapon) return; // v1.99.8.4 LOCKDOWN

    if (bombCount <= 0) {
        if (hasWeapon) {
            // Tıklandığında oyunu durdur (Pause)
            if (!isPaused) {
                togglePause();
            }
            // Mağazayı otomatik aç
            const shop = document.getElementById('shop-screen');
            if (shop) {
                shop.classList.remove('hidden');
                shop.classList.add('active');
                shop.style.display = 'flex';
                shop.style.opacity = '1';
                shop.style.zIndex = '20000';
            }
        }
        return;
    }

    bombCount--;
    bullets.push({
        x: player.x + player.width / 2,
        y: player.y,
        radius: 8, // v1.68 Sleek: Daha küçük (12->8)
        speed: 750 // Biraz daha hızlı
    });

    if (typeof playCrashSound === 'function') playCrashSound();
    triggerVibration(50);
    saveGame();
}

if (bombActionBtn) bombActionBtn.addEventListener('click', fireBomb);
const dashBtn = document.getElementById('dash-action-btn');
if (dashBtn) dashBtn.addEventListener('click', activateDash);

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') fireBomb();
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.shiftKey) activateDash();
});

const player = { x: canvas.width / 2, y: canvas.height - 150, width: 38, height: 68, speed: 320 };

const keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, a: false, d: false, w: false, s: false };
window.addEventListener('keydown', (e) => {
    let key = e.key.toLowerCase();
    if (['a', 'd', 'w', 's'].includes(key) || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) keys[e.key] = true;
    if ((key === 'p' || e.key === 'escape') && isPlaying && !isGameOver) {
        togglePause();
    }
    // v1.99.14.1: DEBUG - Kesin Seviye Atlama (L Tuşu)
    if (key === 'l' && isPlaying && !isGameOver) {
        let p = (levelProgressTime * 5) % 18000;
        let currentIdx = 0;
        for(let i=levelAssets.length-1; i>=0; i--) {
            if(p >= levelAssets[i].threshold) { currentIdx = i; break; }
        }
        
        // Bir sonraki seviyeye geç (Döngüsel)
        let nextIdx = (currentIdx + 1) % levelAssets.length;
        levelProgressTime = (levelAssets[nextIdx].threshold) / 5;

        if (typeof showToast === 'function') showToast(`DEBUG: SKIP TO LEVEL ${nextIdx + 1}! 🚀`, true);
    }
    // v1.99.14.1: DEBUG - Hassas Süre Artışı (J Tuşu)
    if (key === 'j' && isPlaying && !isGameOver) {
        levelProgressTime += 100;
        if (typeof showToast === 'function') showToast("DEBUG: +100 SECONDS! ⚡", true);
    }
});
window.addEventListener('keyup', (e) => {
    let key = e.key.toLowerCase();
    if (['a', 'd', 'w', 's'].includes(key) || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) keys[e.key] = false;
});

let touchX = null;
let touchY = null;
let moveTouchId = null; // v1.99.12.0: MULTI-TOUCH TRACKING

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (typeof initAudio === 'function') initAudio();

    // v1.99.12.0: Akıllı Multi-Touch Sistemi
    for (let i = 0; i < e.changedTouches.length; i++) {
        let touch = e.changedTouches[i];
        let rect = canvas.getBoundingClientRect();
        let tx = touch.clientX - rect.left;
        let ty = touch.clientY - rect.top;

        // Ekranın sol %65'inden başlıyorsa ve henüz bir hareket parmağı yoksa kilitle
        if (moveTouchId === null && tx < canvas.width * 0.65) {
            moveTouchId = touch.identifier;
            touchX = tx;
            touchY = ty;
            
            // DOUBLE TAP DASH (Sadece yönlendirme parmağı için)
            let now = performance.now();
            if (window.lastTap && (now - window.lastTap) < 300) {
                activateDash();
            }
            window.lastTap = now;
        }
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        let touch = e.changedTouches[i];
        if (touch.id === moveTouchId || touch.identifier === moveTouchId) {
            let rect = canvas.getBoundingClientRect();
            touchX = touch.clientX - rect.left;
            touchY = touch.clientY - rect.top;
        }
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        let touch = e.changedTouches[i];
        if (touch.identifier === moveTouchId) {
            moveTouchId = null;
            touchX = null;
            touchY = null;
        }
    }
});

canvas.addEventListener('touchcancel', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        let touch = e.changedTouches[i];
        if (touch.identifier === moveTouchId) {
            moveTouchId = null;
            touchX = null;
            touchY = null;
        }
    }
});
canvas.addEventListener('mousedown', initAudio); // PC için güvenlik kırma


// SPAWNERLAR (Artık Yatay ve Dikey var)
// obstacles/golds/powerups moved to top for v1.99.16.92
let spawnInterval = 3.0, spawnTimer = 0; // v2.03: Başlangıçta kayaların arasını çok açtık
let goldSpawnInterval = 8.0, goldTimer = 0; // v1.99.3.31.0: Kıtlık ve Hardcore Ekonomi

let goldBag = [];
function fillGoldBag() {
    goldBag = [];
    for (let i = 0; i < 17; i++) goldBag.push(1);
    for (let i = 0; i < 2; i++) goldBag.push(5);
    goldBag.push(10);
    // Torbayı karıştırıyorum (Fisher-Yates Shuffle)
    for (let i = goldBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [goldBag[i], goldBag[j]] = [goldBag[j], goldBag[i]];
    }
}

function spawnPowerup() {
    const currentAsset = levelAssets[(currentLevel - 1) % levelAssets.length];
    const sMargin = currentAsset ? currentAsset.margin : 0.35;
    const spawnY = -50;
    const riverShift = getRiverShift(spawnY);
    const riverLeft = (canvas.width * sMargin) + riverShift;
    const riverRight = (canvas.width * (1 - sMargin)) + riverShift - 40;

    let type = 'magnet';
    // v1.97: Mıknatıs oranını %30'a çekerek kalkanı daha değerli yapıyoruz
    if (shieldLevel > 0 && magnetLevel > 0) type = Math.random() < 0.3 ? 'magnet' : 'shield';
    else if (shieldLevel > 0) type = 'shield';

    // Kalkan çıkma ihtimali seviyeye bağlı (%5 per level)
    if (type === 'shield' && Math.random() * 100 > shieldLevel * 5) {
        if (magnetLevel > 0) type = 'magnet'; else { spawnGold(); return; }
    }

    const spawnX = Math.random() * (riverRight - riverLeft) + riverLeft;

    powerups.push({
        type: type,
        x: spawnX,
        relativeX: spawnX - riverShift, // v1.97.0.3: Elite Drift Support
        y: spawnY,
        radius: 18,
        speed: 250
    });
}

function spawnObstacle() {
    // Güçlendirici Çıkması (v1.97 Balance: %10 -> %5)
    if (Math.random() < 0.05 && (magnetLevel > 0 || shieldLevel > 0)) {
        spawnPowerup(); return;
    }

    // v1.71: %20 daha yavaş engeller + Dinamik Assets Margins
    const currentLAsset = levelAssets[(currentLevel - 1) % levelAssets.length];

    // v2.03 - Taşlar vs Kütükler Hız Farkı (Kütükler daha hızlı akmalı)
    let baseSpeed = (currentLAsset ? currentLAsset.speed : 200) * 1.4; // Kütükler suyun akıntısıyla daha hızlı gelsin

    let spawnMargin = currentLAsset ? currentLAsset.margin : 0.35;
    const spawnY = -150 - (Math.random() * 150); // v1.97.2.3: Organic Y-Jitter (Breaks horizontal walls)
    const riverShift = getRiverShift(spawnY);
    const riverLeft = (canvas.width * spawnMargin) + riverShift;
    const riverRight = (canvas.width * (1 - spawnMargin)) + riverShift - 45;

    // v1.96.6.6: DİNAMİK ÖLÜM VADİSİ (DZ) MANTIĞI - Senkronize edildi
    let isDZ = getDZStatus();

    // v1.99.13.1: ELITE SPAWN COOLDOWN (Anti-Cluster System)
    // Ölüm Vadisi'nde 0.5s, Normal zamanda 0.8s emniyet payı
    let currentCooldown = isDZ ? 0.5 : 0.8; 
    if (currentLevel === 7) currentCooldown = 0.4; 
    if (levelProgressTime - lastSpawnTime < currentCooldown) return;

    // Ölüm Vadisi Hız Bonusu (Elite Seviye)
    if (isDZ) {
        baseSpeed *= 1.7; // v1.99.13.1: Ölüm Vadisi Ciddiyeti (Hız x1.7)
    }

    // v1.99.13.1: ELITE LEVEL 1 DENSITY CAP (Max 3 obstacles)
    if (currentLevel === 1 && obstacles.length >= 3) return;
    
    lastSpawnTime = levelProgressTime; // Doğumu mühürle

    if (currentLevel === 1 && obstacles.length >= 3) return; // v1.99.13.0: L1 Starter Balance

    // v1.99.13.0: ELITE VERTICAL SPACING GUARD (Anti-Wall System)
    for (let obs of obstacles) {
        if (Math.abs(spawnY - obs.y) < 250) return; 
    }

    let biomeIndex = (currentLevel - 1) % levelAssets.length;
    const currentAsset = levelAssets[biomeIndex];
    // v1.99.16.94: ELITE NaN PROTECTION (Safe fallback for missing scrollSpeed)
    const bgScrollSpeed = baseSpeed * (currentAsset && currentAsset.scrollSpeed ? currentAsset.scrollSpeed : 1.0);

    let allowedSpecialTypes = (biomeIndex === 4 || biomeIndex === 5 || biomeIndex === 6 || biomeIndex === 7 || biomeIndex === 8) ? [] : ['rock'];

    // --- v1.99.13.0: THE ELITE CYCLE (Strict Biome Filtering) ---
    if (biomeIndex === 0) { // Spring (L1, L7, L13...)
        if (score % 18000 >= 500) allowedSpecialTypes.push('hippo');
        if (score % 18000 >= 900) allowedSpecialTypes.push('croc');
        allowedSpecialTypes.push('vertical', 'horizontal');
    } else if (biomeIndex === 1) { // Summer (L2, L8...)
        allowedSpecialTypes.push('hippo', 'croc', 'vertical', 'horizontal');
    } else if (biomeIndex === 2) { // Autumn (L3, L9...)
        allowedSpecialTypes.push('hippo', 'croc', 'vertical', 'horizontal', 'leafTornado');
        allowedSpecialTypes.push('whirlpool'); // L3 special
    } else if (biomeIndex === 3) { // Winter (L4, L10...)
        allowedSpecialTypes.push('rock', 'iceBerg', 'whirlpool', 'slidingIce', 'vertical', 'horizontal');
    } else if (biomeIndex === 4) { // Lava (L5, L11...)
        allowedSpecialTypes.push('rock', 'lavaGeyser', 'burningPillar', 'burningPillar', 'fireball', 'fireball', 'fireball', 'magmaSerpent');
        // CROC/HIPPO/LOGS ARE FORBIDDEN
    } else if (biomeIndex === 5) { // Void (L6, L12...)
        // v1.99.14.81: ELITE VOID POOL
        allowedSpecialTypes.push('asteroid', 'asteroid', 'comet', 'fireball', 'blackHole');
        // CROC/HIPPO/LOGS ARE FORBIDDEN
    } else if (biomeIndex === 6) { // Nostalji (L7, L14...)
        allowedSpecialTypes.push('toyBalloon', 'paperPlane', 'paperPlane', 'kite');
    } else if (biomeIndex === 7) { // Cyber City (L8, L16...)
        // v1.99.16.96: NO ROCKS IN CYBER CITY - ONLY ELITE HAZARDS
        allowedSpecialTypes.push('laserGate', 'laserGate', 'cyberDrone', 'glitchStream', 'cyberSpear');
    } else if (biomeIndex === 8) { // Toxic Wasteland (L9, L17...)
        // v1.99.16.97: SERPENT DOMINATION - 90% Serpent spawning weight
        allowedSpecialTypes.push('toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicBarrel');
    }

    // EXTRA LAYER: Ensure crocodiles/logs NEVER appear in Lava/Void/Lagoon/Cyber levels
    const isEliteLethal = (biomeIndex === 4 || biomeIndex === 5 || biomeIndex === 6 || biomeIndex === 7 || biomeIndex === 8);
    if (!isEliteLethal && currentLAsset.bgKey !== 'ilkbahar') {
        if (!allowedSpecialTypes.includes('whirlpool')) allowedSpecialTypes.push('whirlpool');
    }

    let spawnX = Math.random() * (riverRight - riverLeft) + riverLeft;

    // OYUNCUYA UMUT PAYI VER (0% İHTİMALİNİ BİTİR!) v146 (Elite Drift Synced)
    // --- v1.97.2.2: ELITE LANE JUSTICE (Stacked Obstacle Prevent) ---
    // Sadece sonuncuya değil, ekranın üstündeki tüm engellere bak!
    let relSpawnX = spawnX - riverShift;
    let maxAttempts = 10;
    let isBlocked = true;
    let spawnGap = player.width + 75; // Kayıktan biraz daha geniş "güvenli şerit"

    // v1.99.14.16: L7 EXCLUSIVE EDGE BUFFER - Strictly exclusive to Lagoon
    const dynamicObsBuffer = (currentLevel === 7) ? 65 : 15; 
    const leftLimitRel = (canvas.width * spawnMargin) + dynamicObsBuffer;  
    const rightLimitRel = (canvas.width * (1 - spawnMargin)) - (dynamicObsBuffer + 45); 


    while (isBlocked && maxAttempts > 0) {
        isBlocked = false;
        maxAttempts--;
        for (let obs of obstacles) {
            // Sadece ekranın üst yarısındaki (y < 450) engellerin şeritlerini kontrol et
            if (obs.y < 450 && Math.abs(relSpawnX - (obs.relativeX || (obs.x - getRiverShift(obs.y)))) < spawnGap) {
                isBlocked = true;
                // Engeli yan şeride fırlat (Zıplama mesafesi nehre göre uyarlandı)
                const riverCenterRel = (leftLimitRel + rightLimitRel) / 2;
                const jumpDir = (relSpawnX < riverCenterRel) ? 1 : -1;
                relSpawnX += jumpDir * (70 + Math.random() * 40); // v2.03: Daha yumuşak sıçrama
                break;
            }
        }
        // Nehir Sınırlarını Koru (Relative bazda) v1.99.1.2 FIX (Obstacle Outside River)
        if (relSpawnX < leftLimitRel) relSpawnX = leftLimitRel;
        if (relSpawnX > rightLimitRel) relSpawnX = rightLimitRel;
    }
    spawnX = relSpawnX + riverShift;
    window.lastObsRelX = relSpawnX; 
    let currentSpawnChance = 0.45;
    if (currentLevel === 7) currentSpawnChance = 0.90;
    else if (biomeIndex === 5) currentSpawnChance = 0.65; // Boşluk Yoğunluğu
    
    if (Math.random() < currentSpawnChance && allowedSpecialTypes.length > 0) {
        let selectedType = allowedSpecialTypes[Math.floor(Math.random() * allowedSpecialTypes.length)];
        
        // v1.99.16.42: VERIFICATION LOG
        if (biomeIndex === 8) console.log("%c FORCE SPAWN: " + selectedType, "background: #222; color: #adff2f; font-weight: bold;");

        if (selectedType === 'rock') {
            // v1.99.16.95: RESTORED ROCK PUSH LOGIC
            obstacles.push({
                type: 'rock',
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY + 50,
                width: 48, height: 48,
                speedY: bgScrollSpeed, speedX: 0
            });
        } else if (selectedType === 'hippo') {
            obstacles.push({
                type: 'hippo',
                x: spawnX,
                relativeX: spawnX - riverShift, // v1.97.0.3: Elite Drift Support
                y: spawnY + 50, width: 45, height: 50, // İyice zayıflatıldı
                speedY: baseSpeed - 20, speedX: 0, isSubmerged: true
            });
        } else if (selectedType === 'croc') {
            const isZigZag = Math.random() < 0.5; // %50 Şansla zikzak yapar
            obstacles.push({
                type: 'croc',
                x: spawnX,
                relativeX: spawnX - riverShift, // v1.97.0.3: Elite Drift Support
                y: spawnY + 50, width: 38, height: 65,
                speedY: baseSpeed + (isZigZag ? 60 : 40),
                speedX: 0,
                isZigZag: isZigZag,
                zigzagOffset: Math.random() * Math.PI * 2 // Rastgele faz
            });
        } else if (selectedType === 'whirlpool') {
            const isL4 = currentLevel === 4;
            const size = isL4 ? (50 + Math.random() * 20) : (80 + Math.random() * 40);
            obstacles.push({
                type: 'whirlpool',
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY, width: size, height: size,
                speedY: bgScrollSpeed, speedX: 0,
                rotation: 0,
                pullStrength: isL4 ? 100 : 120
            });
        } else if (selectedType === 'lavaGeyser') {
            // v2.1: Elite Spacing (Yanyana kümelenmeyi önleyen mesafe tamponu)
            let tooClose = false;
            for (let o of obstacles) {
                if (o.type === 'lavaGeyser' && Math.abs(o.y - spawnY) < 300) {
                    tooClose = true; break;
                }
            }
            if (!tooClose) {
                obstacles.push({
                    type: 'lavaGeyser',
                    x: spawnX,
                    relativeX: spawnX - riverShift,
                    y: spawnY, width: 120, height: 120,
                    speedY: bgScrollSpeed, speedX: 0,
                    state: 'dormant',
                    stateTimer: 2.0 + Math.random() * 2,
                    isElite: true
                });
            }
        } else if (selectedType === 'fireball') {
            const isL5 = currentLevel === 5;
            if (isL5) {
                // v1.99.14.73: TRIPLE BARRAGE (Left, Center, Right)
                const lanePositions = [0.2, 0.5, 0.8]; // Relative X positions
                lanePositions.forEach(relPos => {
                    const fX = riverLeft + (riverRight - riverLeft) * relPos;
                    obstacles.push({
                        type: 'fireball',
                        x: fX,
                        relativeX: fX - riverShift,
                        y: spawnY, width: 52, height: 52,
                        speedY: (baseSpeed + 120) * (0.9 + Math.random() * 0.2),
                        speedX: 0,
                        isHoming: true
                    });
                });
            } else {
                // Default single fireball for other levels
                obstacles.push({
                    type: 'fireball',
                    x: spawnX,
                    relativeX: spawnX - riverShift,
                    y: spawnY, width: 52, height: 52,
                    speedY: (baseSpeed + 150) * 0.75 * (0.92 + Math.random() * 0.16),
                    speedX: (Math.random() - 0.5) * 50,
                    isHoming: false
                });
            }
        } else if (selectedType === 'leafTornado') {
            obstacles.push({
                type: 'leafTornado',
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY, width: 90, height: 90,
                speedY: bgScrollSpeed, speedX: 0,
                rotation: 0,
                pullStrength: 130,
                baseX: spawnX, baseRelX: spawnX - riverShift,
                zigzagFreq: 0.002 + Math.random() * 0.001,
                zigzagAmp: 30 + Math.random() * 40
            });
        } else if (selectedType === 'asteroid' || selectedType === 'comet') {
            const isL6 = currentLevel === 6 || (currentLevel > 0 && (currentLevel - 1) % 6 === 5);
            obstacles.push({
                type: selectedType,
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY, width: 55, height: 55,
                speedY: baseSpeed * (selectedType === 'comet' ? 1.8 : 1.1) * (isL6 ? 1.25 : 1),
                speedX: 0,
                isHoming: false, // v1.99.14.81: Takipçi Mekaniği
                hp: selectedType === 'asteroid' ? 4 : 1
            });
        } else if (selectedType === 'blackHole') {
            obstacles.push({
                type: 'blackHole',
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY,
                width: 80 + Math.random() * 40,
                height: 80 + Math.random() * 40,
                speedY: baseSpeed * 0.45, // Kara delikler yavaş ve ürkütücü süzülür
                pullRadius: 300,
                pullStrength: 180,
                isElite: true
            });
        } else if (selectedType === 'slidingIce') {
            obstacles.push({
                type: 'slidingIce',
                x: (Math.random() < 0.5) ? riverLeft - 50 : riverRight + 50,
                relativeX: undefined,
                y: spawnY, width: 80, height: 40,
                speedY: baseSpeed * 0.6,
                speedX: (Math.random() < 0.5) ? 120 : -120
            });
        } else if (selectedType === 'rock' || selectedType === 'iceBerg') {
            if (isEliteLethal) return; // v1.99.15.13: Rocks/Ice are forbidden in Elite biomes
            let isIce = selectedType === 'iceBerg';
            let rockSize = isIce ? (45 + Math.random() * 20) : (40 + Math.random() * 20);
            obstacles.push({
                type: selectedType,
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY + 50, width: rockSize, height: rockSize * 0.8,
                speedY: bgScrollSpeed * (0.95 + Math.random() * 0.1), speedX: 0
            });
        } else if (selectedType === 'burningPillar') {
            // v1.99.14.60: RESTORED LOST PILLAR (2-Shot Health Specific to L5)
            const pWidth = 55 + Math.random() * 15;
            const pHeight = 120 + Math.random() * 30;
            obstacles.push({
                type: 'burningPillar',
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY + 50, width: pWidth, height: pHeight,
                health: 2, // Elite Armor: Needs 2 shots
                maxHealth: 2,
                speedY: bgScrollSpeed, speedX: 0
            });
        } else if (selectedType === 'toyBalloon' || selectedType === 'paperPlane' || selectedType === 'kite') {
            const isL7 = currentLevel === 7 || (currentLevel > 0 && (currentLevel - 1) % levelAssets.length === 6);
            let w = 50, h = 50, sY = baseSpeed;
            
            if (selectedType === 'toyBalloon') {
                w = 45; h = 65; sY *= 0.85; // Balonlar biraz daha yavaş
            } else if (selectedType === 'paperPlane') {
                w = 40; h = 40; sY *= 1.4; // Kağıt uçaklar hızlı
            } else if (selectedType === 'kite') {
                w = 80; h = 110; sY *= 0.95; // Uçurtmalar geniş
            }

            obstacles.push({
                type: selectedType,
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY, width: w, height: h,
                speedY: sY * (0.9 + Math.random() * 0.2),
                speedX: 0,
                hp: 1,
                maxHp: 1,
                time: Math.random() * Math.PI * 2, // Hareket varyasyonu için
                phase: Math.random() * 1000
            });
        } else if (selectedType === 'magmaSerpent') {
            // v1.99.14.70: NEW MAGMA SERPENT (Sine Wave Movement)
            const sX = riverLeft + (riverRight - riverLeft) / 2;
            obstacles.push({
                type: 'magmaSerpent',
                x: sX,
                relativeX: sX - riverShift,
                baseX: sX,
                y: spawnY, width: 48, height: 48,
                speedY: baseSpeed * 0.9,
                time: Math.random() * Math.PI * 2,
                amplitude: (riverRight - riverLeft) * 0.38,
                frequency: 2.2,
                health: 4, // More Elite for the Serpent
                maxHealth: 4
            });
        } else if (selectedType === 'laserGate') {
            const buffer = 50;
            const gateWidth = (riverRight - riverLeft) - (buffer * 2);
            obstacles.push({
                type: 'laserGate',
                x: riverLeft + buffer,
                relativeX: (riverLeft + buffer) - riverShift,
                y: spawnY,
                width: gateWidth,
                height: 30,
                speedY: baseSpeed * 0.45,
                state: 'warning',
                timer: 1.5,
                time: 0
            });
        } else if (selectedType === 'cyberDrone') {
            obstacles.push({
                type: 'cyberDrone',
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY,
                width: 44, height: 44,
                speedY: baseSpeed * 1.6,
                speedX: 0,
                time: 0,
                isHoming: true
            });
        } else if (selectedType === 'glitchStream') {
            obstacles.push({
                type: 'glitchStream',
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY,
                width: 120, height: 180,
                speedY: baseSpeed,
                time: 0
            });
        } else if (selectedType === 'cyberSpear') {
            // v1.99.15.20: NEON GREEN SPEAR - Targets player X at spawn
            const targetX = player.x + (player.width / 2);
            obstacles.push({
                type: 'cyberSpear',
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY,
                width: 25, height: 110,
                speedY: baseSpeed * 2.1, 
                speedX: (targetX - spawnX) * 1.5,
                time: 0,
                rotation: Math.atan2((targetX - spawnX) * 1.5, baseSpeed * 2.1)
            });
        } else if (selectedType === 'toxicRat') {
            // v1.99.16.00: MUTATED GIANT RAT - Swims across
            const moveDir = Math.random() < 0.5 ? 1 : -1;
            obstacles.push({
                type: 'toxicRat',
                x: (moveDir === 1) ? riverLeft - 60 : riverRight + 20,
                relativeX: undefined,
                y: spawnY, width: 70, height: 45,
                speedY: baseSpeed * 0.9,
                speedX: moveDir * 125,
                time: Math.random() * 10
            });
        } else if (selectedType === 'toxicBarrel') {
            // v1.99.16.00: RADIOACTIVE BARREL
            obstacles.push({
                type: 'toxicBarrel',
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY + 50, width: 38, height: 52,
                speedY: bgScrollSpeed, speedX: 0
            });
        } else if (selectedType === 'toxicSerpent') {
            // v1.99.17.00: THE FINAL MANIFESTO (Stable River Centering)
            const riverCenter = riverLeft + (riverRight - riverLeft) / 2;
            obstacles.push({
                type: 'toxicSerpent',
                x: riverCenter,
                relativeX: riverCenter - riverShift,
                y: spawnY, width: 44, height: 140, // Devasa gövde
                speedY: bgScrollSpeed * 1.05, speedX: 0,
                time: Math.random() * 10
            });
        }
        return;
    }

    // v1.99.14.86: ELITE BIOME PURITY (No logs in Lava, Void, or Nostalgia)
    // v1.99.15.10: ELITE BIOME PURITY (No logs in Lava, Void, Nostalgia, Cyber)
    const currentBiome = (currentLevel - 1) % levelAssets.length;
    const isEliteThemeSpawn = (currentBiome === 4 || currentBiome === 5 || currentBiome === 6 || currentBiome === 7 || currentBiome === 8);
    if (isEliteThemeSpawn) return;

    // Bütün Kütükler Dikey (Vertical) Gelsin
    let logSpeedX = 0;
    let logRot = 0;
    let logRotSpeed = 0;

    // v1.99.4.1.11: Nizamlı Düz Akış (Straight Highway Flow)
    // Engeller artık sağa sola savrulmayacak, araba yolu gibi nizamlı ve düz gelecek.
    logSpeedX = 0;
    logRot = 0;
    logRotSpeed = 0;

    obstacles.push({
        type: 'vertical',
        x: spawnX,
        relativeX: spawnX - riverShift, // v1.97.0.3: Elite Drift Support
        y: spawnY + 50,
        width: 40,  // İnce
        height: 55, // Boyu bir daha kırpıldı (toplamda 100'den 55'e)
        speedY: baseSpeed,
        speedX: logSpeedX,
        rotation: logRot,
        rotSpeed: logRotSpeed
    });
}

function spawnGold() {
    const currentAsset = levelAssets[(currentLevel - 1) % levelAssets.length];
    const sMargin = currentAsset ? currentAsset.margin : 0.35;
    const spawnY = -50;
    const riverShift = getRiverShift(spawnY);
    const isL7Gold = (currentLevel === 7 || (currentLevel > 0 && (currentLevel - 1) % levelAssets.length === 6));
    const goldBuffer = isL7Gold ? 35 : 0;
    const riverLeft = (canvas.width * sMargin) + riverShift + goldBuffer;
    const riverRight = (canvas.width * (1 - sMargin)) + riverShift - (isL7Gold ? 35 : 30);

    if (goldBag.length === 0) fillGoldBag();
    let gVal = goldBag.pop();

    let gx = Math.random() * (riverRight - riverLeft) + riverLeft;
    let gy = spawnY;
    let speed = 250;
    let gColor = "gold", gRadius = 15;

    if (gVal === 1) { gColor = "gold"; gRadius = 15; }
    else if (gVal === 5) { gColor = "#00e5ff"; gRadius = 18; }
    else if (gVal === 10) { gColor = "#ff00ff"; gRadius = 22; }

    // v1.99.15.10: NO TRAPS IN ELITE BIOMES (Lava, Void, Nostalgia, Cyber)
    // v1.99.16.13: NO TRAPS IN TOXIC WASTELAND (Biome 8)
    const eliteBiomeGold = (currentLevel - 1) % levelAssets.length;
    const isEliteForGold = (eliteBiomeGold === 4 || eliteBiomeGold === 5 || eliteBiomeGold === 6 || eliteBiomeGold === 7 || eliteBiomeGold === 8);

    if (gVal === 10 && !isEliteForGold && !(currentLevel === 1 && obstacles.length >= 2)) {
        // v1.99.13.1: Seviye 1'de tuzak doğmasını da kısıtladık (Kapasite koruma)
        let trapDir = Math.random() < 0.5 ? 1 : -1;
        let trapX1 = gx;
        let trapY1 = gy - 150;

        obstacles.push({
            type: 'vertical',
            x: trapX1,
            relativeX: trapX1 - getRiverShift(trapY1), // v1.97.0.3: Trap Drift
            y: trapY1,
            width: 40,
            height: 55,
            speedY: speed,
            speedX: 0
        });

        gx += trapDir * 75;
        if (gx < riverLeft + 30) gx = riverLeft + 30;
        if (gx > riverRight - 30) gx = riverRight - 30;

        let trapX2 = gx - (trapDir * 62);
        let trapY2 = gy - 250;
        obstacles.push({
            type: 'vertical',
            x: trapX2,
            relativeX: trapX2 - getRiverShift(trapY2), // v1.97.0.3: Trap Drift
            y: trapY2,
            width: 40,
            height: 55,
            speedY: speed,
            speedX: 0
        });
    }

    golds.push({
        x: gx,
        relativeX: gx - getRiverShift(gy), // v1.97.0.3: Gold Drift
        margin: 0.32,      // v1.97.0.3: Widened River for better flow (0.39 -> 0.32)
        baseColor: '#27ae60',
        accentColor: '#2ecc71',
        speed: 100,
        spawnInterval: 1.8, // v1.97.0.3: Slower starts (1.3 -> 1.8)
        spawnIntervalMin: 0.9, // v1.97.0.3: Fairer difficulty (0.5 -> 0.9)
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
        if (pauseScreen) {
            pauseScreen.classList.remove('hidden');
            pauseScreen.classList.add('active');
            pauseScreen.style.display = 'flex';
        }
        if (pauseBtn) pauseBtn.innerText = "▶";
        // audioCtx.suspend() yerine scheduler isPaused kontrolü yeterlidir
    } else {
        if (pauseScreen) {
            pauseScreen.classList.remove('active');
            pauseScreen.classList.add('hidden');
            pauseScreen.style.display = 'none';
        }
        if (pauseBtn) pauseBtn.innerText = "⏸";
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}
function startGame() {
    isPlaying = true;
    isPaused = false;

    // v1.99.5.5: HUD Reveal
    const hud = document.getElementById('modern-hud');
    if (hud) hud.style.display = 'flex';

    // v3.31.2: ELITE AUDIO IGNITION (RESTORED)
    if (typeof initAudio === 'function') initAudio();
    if (typeof bgMusicScheduler === 'function' && !isMusicScheduled) {
        bgMusicScheduler();
    }

    // Reset Core States
    level = 1;
    currentLevel = window.resumeLevel || 1;
    score = window.resumeScore || 0;
    goldCount = 0;
    lives = window.resumeLives || (3 + (window.extraLives || 0));
    isGameOver = false;
    obstacles = []; golds = []; powerups = []; bullets = [];

    // v1.99.5.4: UNHIDE ELITE HUD & CONTROLS
    const mHud = document.getElementById('modern-hud');
    if (mHud) { mHud.classList.remove('hidden'); mHud.style.display = 'flex'; }

    const cUi = document.getElementById('controls-ui');
    if (cUi) { cUi.classList.remove('hidden'); cUi.style.display = 'flex'; }

    const lUi = document.getElementById('left-controls-ui');
    if (lUi) { lUi.classList.remove('hidden'); lUi.style.display = 'flex'; }

    player.x = canvas.width / 2 - player.width / 2;
    // player.y = canvas.height - 150; // Pozisyon koruma

    updateLanguageUI();
    fillGoldBag();

    // Satın alınan Kalkan/Durum sıfırlama v1.99.4.1.0
    hasShield = false;
    isDashing = false;
    dashEnergy = MAX_DASH_ENERGY;
    updateArmorUI();

    spawnTimer = 0;
    goldTimer = 0;
    levelProgressTime = 0; // v1.99.13.0: Reset timer for new game

    // Sync Assets & UI
    const currentAsset = levelAssets[(currentLevel - 1) % levelAssets.length];
    bgImg = bgImgs[currentAsset.bgKey];
    // v1.99.5.70: Dinamik Kayık Sistemi (Skin Fallback) ⛵
    playerImg = players[currentAsset.pKey] || players.ilkbahar;
    bgScrollSpeed = currentAsset.speed;
    lastTime = performance.now();

    startScreen.classList.remove('active'); startScreen.classList.add('hidden');
    gameOverScreen.classList.remove('active'); gameOverScreen.classList.add('hidden');
    if (pauseScreen) { pauseScreen.classList.remove('active'); pauseScreen.classList.add('hidden'); pauseScreen.style.display = 'none'; }

    if (pauseBtn) {
        pauseBtn.style.display = 'block';
        pauseBtn.style.opacity = '0.5';
        pauseBtn.innerText = "⏸";
    }
    if (bombActionBtn && hasWeapon) bombActionBtn.style.display = 'flex';
    updateShopUI();

    // Revive butonlarını UI üzerinde sıfırla
    if (reviveBtn) {
        reviveBtn.disabled = false;
        reviveBtn.innerText = translations[currentLang].reviveBtn;
        reviveBtn.style.opacity = '1';
    }


    // Arka Plan Müziğini Başlat

    if (window.audioCtx) {
        currentNote = 0;
        nextNoteTime = audioCtx.currentTime + 0.1;
        if (!isMusicScheduled) bgMusicScheduler();
    }

    if (gameLoopRequestId) cancelAnimationFrame(gameLoopRequestId);
    gameLoopRequestId = requestAnimationFrame(gameLoop);
}

// v1.99.5.65: Modern Leaderboard Connector
const lbMainBtn = document.getElementById('leaderboard-btn');
if (lbMainBtn) lbMainBtn.addEventListener('click', () => {
    const lbScr = document.getElementById('leaderboard-screen');
    const menuScr = document.getElementById('start-screen');
    if (lbScr) {
        lbScr.classList.remove('hidden');
        lbScr.classList.add('active');
        if (menuScr) menuScr.classList.add('hidden');
        lbScr.style.display = 'flex';
        // v1.99.5.65: Trigger data refresh
        if (typeof Leaderboard !== 'undefined' && typeof Leaderboard.refreshData === 'function') {
            Leaderboard.refreshData();
        }
    }
});

// v1.99.5.66: TOP RIDERS CLOSE BUTTON FIX ❌
const lbCloseBtn = document.getElementById('leaderboard-close-btn');
if (lbCloseBtn) lbCloseBtn.addEventListener('click', () => {
    const lbScr = document.getElementById('leaderboard-screen');
    const menuScr = document.getElementById('start-screen');
    if (lbScr) {
        lbScr.classList.add('hidden');
        lbScr.classList.remove('active');
        lbScr.style.display = 'none';
        if (menuScr) {
            menuScr.classList.remove('hidden');
            menuScr.style.display = 'flex';
        }
    }
});

function gameOver() {
    if (isGameOver) return;

    lives--;

    if (lives > 0) {
        playCrashSound();
        hasShield = true;
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - player.height - 100;
        obstacles = [];
        setTimeout(() => { hasShield = false; }, 3000);
        return;
    }

    isGameOver = true;
    isPlaying = false;
    syncEliteHUD();
    playEliteDeathEffect();

    window.resumeScore = 0;
    window.resumeLives = 3;
    window.resumeLevel = 1; // v1.99.5.78: Reset progression on death
    saveGame();
    localStorage.removeItem('riverEscapeCurrentSession'); // Seansı temizle    
    try {
        const updateEndUI = () => {
            const fsElem = document.getElementById('score-title-final');
            const fgElem = document.getElementById('gold-title-final');
            const t = translations[currentLang];
            if (fsElem) {
                fsElem.innerHTML = `${t.scoreLabel || 'SKOR:'} <span style="color: #fff; font-size: 32px; font-weight: 900;">${Math.floor(score)}</span>`;
            }
            if (fgElem) {
                fgElem.innerHTML = `${t.goldTitle || 'ALTIN:'} <span style="color: #FFD700; font-weight: 900;">${goldCount}</span>`;
            }
        };

        updateEndUI();

        gameOverScreen.classList.remove('hidden');
        gameOverScreen.classList.add('active');
        gameOverScreen.style.display = 'flex';
        gameOverScreen.style.opacity = '1';
        if (pauseBtn) pauseBtn.style.display = 'none';
        if (bombActionBtn) bombActionBtn.style.display = 'none';

        if (typeof Leaderboard !== 'undefined') {
            Leaderboard.submitProgress(score, currentLevel);
        }

        triggerEliteEconomySync();
    } catch (e) {
        console.error("GameOver Error:", e);
    }
}

// v1.99.4.1.8: GLOBAL ELITE ECONOMY SYNC (Cloud + UI + Local)
window.triggerEliteEconomySync = function () {
    try {
        saveGame();

        // 🛰️ Bulut Mührü (Firestore ForceSync)
        if (typeof Leaderboard !== 'undefined' && Leaderboard.forceSync) {
            Leaderboard.forceSync();
        }

        // ✨ Ekran Parlatma (UI Sync)
        syncEliteHUD();
        if (typeof updateShopUI === 'function') updateShopUI();

        // Ana Menüdeki Altın Yazısı (Start Screen)
        const totalGoldValue = document.getElementById('totalGoldValue');
        if (totalGoldValue) totalGoldValue.innerText = totalGold;

        const totalGoldValueShop = document.getElementById('totalGoldValue-shop');
        if (totalGoldValueShop) totalGoldValueShop.innerText = totalGold;

        // v1.99.5.1: KARAKTER ÖNİZLEME GÜNCELLEME (Start Screen)
        const currentLAsset = levelAssets[(currentLevel - 1) % levelAssets.length];
        const charImg = document.getElementById('char-preview-img');
        const charName = document.getElementById('char-preview-name');
        if (charImg && currentLAsset) {
            charImg.src = `assets/Kayik.png`;
            if (charName) charName.innerText = currentLang === 'tr' ? currentLAsset.titleTR : currentLAsset.titleEN;
        }

        const finalGoldValue = document.getElementById('finalGoldValue');
        if (finalGoldValue) finalGoldValue.innerText = totalGold;
    } catch (e) { console.warn("Economy Sync Error:", e); }
};

// v1.99.5.6: ELITE THEME ENGINE (Total Visual Shift)
function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        showToast("Aydınlık Mod Aktif ☀️", false);
    } else {
        document.body.classList.remove('light-theme');
        showToast("Karanlık Mod Aktif 🌙", false);
    }
    localStorage.setItem('riverEscapeTheme', theme);
}

// v1.96.1: ELITE HUD SYNC (Global Function)
function syncEliteHUD() {
    try {
        const langPack = translations[currentLang] || translations.en;

        if (cachedHud.lives) {
            let hearts = "";
            // v1.99.3.31.0: DİNAMİK KALP SİSTEMİ (Can sayısına göre kalp göster)
            for (let i = 0; i < Math.max(3, lives); i++) {
                hearts += (i < lives) ? "❤️" : "🖤";
            }
            if (cachedHud.lives.innerText !== hearts) cachedHud.lives.innerText = hearts;
        }

        if (cachedHud.sLabel) cachedHud.sLabel.innerText = langPack.scoreLabel || "SCORE:";
        if (cachedHud.gLabel) cachedHud.gLabel.innerText = langPack.goldLabel || "GOLD:";
        if (cachedHud.score) cachedHud.score.innerText = Math.max(0, Math.floor(score));
        if (cachedHud.gold) cachedHud.gold.innerText = Math.max(0, totalGold); // v1.199.3.31.10.3: BAKİYEYİ GÖSTER

        const currentLAsset = levelAssets[(currentLevel - 1) % levelAssets.length];
        if (currentLAsset && cachedHud.lvlName) {
            const lvlLabel = langPack.levelLabel || "LVL";
            const fullLvlText = `${lvlLabel} ${currentLevel}`; // v3.30: No names, just LVL X
            if (cachedHud.lvlName.innerText !== fullLvlText) cachedHud.lvlName.innerText = fullLvlText;
        }

        if (cachedHud.progress) {
            // v1.99.14.33: ELITE PROGRESS ENGINE - Independent sync from raw time
            const cycleMax = 18000;
            const absoluteProgress = levelProgressTime * 5;
            const currentVal = absoluteProgress % cycleMax;
            
            // Find the actual level tier this currentVal belongs to
            let activeIdx = 0;
            for (let i = levelAssets.length - 1; i >= 0; i--) {
                if (currentVal >= levelAssets[i].threshold) {
                    activeIdx = i;
                    break;
                }
            }
            
            const isLastInCycle = (activeIdx === levelAssets.length - 1);
            const nextThreshold = isLastInCycle ? cycleMax : levelAssets[activeIdx + 1].threshold;
            const prevThreshold = levelAssets[activeIdx].threshold;
            
            // Calculate progress WITHIN the detected level tier
            const tierProgress = ((currentVal - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
            const smoothWidth = Math.min(100, Math.max(0, tierProgress));
            
            cachedHud.progress.style.width = smoothWidth.toFixed(2) + '%';
        }

        // v1.99.4.1.11: Profil Bilgisini Güncelle
        const pName = document.getElementById('player-name-val');
        if (pName && window.Leaderboard && Leaderboard.currentUser) {
            pName.innerText = Leaderboard.currentUser.displayName || "ELITE PLAYER";
        }
    } catch (e) { console.warn("HUD Sync Error:", e); }
}

function update(dt) {
    if (!isPlaying) return;

    levelProgressTime += dt;
    score += dt * 5; // v1.99.14.12: Baseline score restored

    // --- v1.99.13.1: FRAME-ACCURATE LEVEL CALCULATION ---
    let loopCount = Math.floor((levelProgressTime * 5) / 27500);
    let baseProgressVal = Math.floor(levelProgressTime * 5) % 27500;
    let targetIndex = 0;
    for (let i = levelAssets.length - 1; i >= 0; i--) {
        if (baseProgressVal >= levelAssets[i].threshold) {
            targetIndex = i;
            break;
        }
    }
    let calculatedLevel = (loopCount * levelAssets.length) + targetIndex + 1;
    if (calculatedLevel > currentLevel) {
        score += 500; 
        currentLevel = calculatedLevel; 
        const lAsset = levelAssets[targetIndex];

        // v1.98.x: Void Zırhı Kısıtlaması (Sadece Level 6 ve katlarında geçerli)
        let isVoidLevel = (currentLevel % 6 === 0);
        if (!isVoidLevel && armorCharge > 0) {
            armorCharge = 0;
            if(typeof showToast === 'function') showToast(translations[currentLang].armorDeactivated, false);
            saveGame();
            if(typeof updateArmorUI === 'function') updateArmorUI();
            if(typeof updateShopUI === 'function') updateShopUI();
        }

        // --- ADRENALİN PATLAMASI (Checkpoint Leap) v1.99.13.1 ---
        isTransitioningLevel = true;
        transitionTimer = 2.0;
        screenFlash = 0.5;

        if (lAsset) {
            bgImg = bgImgs[lAsset.bgKey];
            playerImg = players[lAsset.pKey] || players.ilkbahar;
            bgScrollSpeed = 450; // IŞINLANMA HIZI! 🚀⚡️
            spawnInterval = lAsset.spawn;

            if (currentLevel > 1) {
                if (typeof triggerVibration === 'function') triggerVibration([30, 20, 100, 50, 150]);
                for (let i = 0; i < 3; i++) setTimeout(playCoinSound, i * 150);
            }

            if(typeof showLevelUp === 'function') showLevelUp(currentLevel);
            saveGame();
        }
    }

    // v1.73.2 Master Init: Move currentLAsset to TOP to prevent ReferenceError
    const currentLAsset = levelAssets[(currentLevel - 1) % levelAssets.length];

    // DASH MANTIĞI GÜNCELLEME
    if (isDashing) {
        dashTimer -= dt;
        if (dashTimer <= 0) isDashing = false;
    } else {
        dashEnergy = Math.min(MAX_DASH_ENERGY, dashEnergy + DASH_RECHARGE_RATE * dt);
    }

    // v1.98.1.4 OPTİMİZASYON: HUD Güncelleme Frekansı Düşürüldü
    hudUpdateTimer += dt;
    if (hudUpdateTimer >= HUD_UPDATE_INTERVAL) {
        hudUpdateTimer = 0;
        if (cachedHud.dashFill) cachedHud.dashFill.style.width = (dashEnergy / MAX_DASH_ENERGY * 100) + '%';
        syncEliteHUD();
    }

    if (isPlaying) {
        // v1.99.5.0: AUTO-FORWARD MOVEMENT 🚀
        // Karakter nehirde kendi kendine ilerler (Otomatik Pilot)
        const autoSpeed = 15; // Sabit akış hızı
        player.y -= autoSpeed * dt;
        // Alt sınır kontrolü (Ekranın çok dışına çıkmasın)
        if (player.y < 100) player.y = 100;

        if (typeof updateAmbientWind === 'function') updateAmbientWind(currentLevel, true);
        if (typeof updateAmbientLava === 'function') updateAmbientLava(currentLevel, true);
    } else {
        if (typeof updateAmbientWind === 'function') updateAmbientWind(currentLevel, false);
        if (typeof updateAmbientLava === 'function') updateAmbientLava(currentLevel, false);
    }

    // v1.68 SCORE & GOLD TICKER (Yumuşak Geçiş)
    if (displayScore < Math.floor(score)) displayScore += Math.ceil((score - displayScore) * 0.1);
    else displayScore = Math.floor(score);

    if (displayGold < goldCount) displayGold++;
    if (displayTotalGold < totalGold) displayTotalGold += Math.ceil((totalGold - displayTotalGold) * 0.1);
    else displayTotalGold = totalGold;



    let dx = 0;
    let dy = 0;

    if (keys.ArrowLeft || keys.a || keys.A) dx = -1;
    if (keys.ArrowRight || keys.d || keys.D) dx = 1;
    if (keys.ArrowUp || keys.w || keys.W) dy = 0; // v1.99.4.1.11: Manuel ileri gitme iptal
    if (keys.ArrowDown || keys.s || keys.S) dy = 0; // v1.99.4.1.11: Manuel geri gitme iptal

    if (touchX !== null && touchY !== null) {
        if (touchX < player.x + player.width / 2 - 15) dx = -1;
        else if (touchX > player.x + player.width / 2 + 15) dx = 1;

        // v1.99.4.1.11: Touch Y kontrolü pasifize edildi
        dy = 0;
    }

    // v1.99.4.1.11: Manuel hareket cezası kaldırıldı!
    // Skor artık sadece süreye bağlı olarak artacak, geri gitmeyecek.

    // X Ekseni Sınırları (Nehir Kanalı) - v1.97.0.3: Dinamik Büklüm Sistemi
    const pMargin = (currentLAsset && typeof currentLAsset.margin === 'number') ? currentLAsset.margin : 0.32;
    const riverShift = getRiverShift(player.y);
    // v1.99.14.16: L7 EXCLUSIVE PLAYER BUFFER - Strictly exclusive to Lagoon
    const dynamicPlayBuffer = (currentLevel === 7) ? 40 : (currentLevel === 6 ? 8 : (currentLevel >= 4 ? 25 : 10));
    const playRiverLeft = (canvas.width * pMargin) + riverShift + dynamicPlayBuffer; 
    const playRiverRight = (canvas.width * (1 - pMargin)) + riverShift - player.width - dynamicPlayBuffer; 


    // PLAYER X CLAMP: Karaya çıkışı fiziksel olarak da engelle!
    if (player.x < playRiverLeft) player.x = playRiverLeft;
    if (player.x > playRiverRight) player.x = playRiverRight;

    // KIYIYA SÜRTMÜ KONTROLÜ (Ölüm Yok, Sadece YAVAŞLATMA ve SARSINTI)
    let moveDt = dt;
    let isDZ = getDZStatus();

    if (player.x <= playRiverLeft + 1 || player.x >= playRiverRight - 1) {
        // Kıyıya sürtünce artık ÖLDÜRMÜYOR (Ölüm Bölgesi/isDZ olsa bile kaldırıldı)
        // Normal sürtünme mekaniği
        moveDt = dt * 0.4; // Sadece KAYIK yavaşlar!

        // --- TELEFON TİTREŞİMİ (Edge Collision) v127 ---
        if (typeof triggerVibration === 'function') {
            if (!window.lastEdgeVib || performance.now() - window.lastEdgeVib > 200) {
                triggerVibration(15); // Hafif bir "Tık" hissi
                window.lastEdgeVib = performance.now();
            }
        }
    }

    // --- CHECKPOINT GEÇİŞ ZAMANLAYICISI v129 (Spawn Korumalı) ---
    if (isTransitioningLevel) {
        transitionTimer -= dt;
        spawnTimer = 0; // Seviye geçişinde engel çıkmasını engelle
        goldTimer = 0;  // Altın çıkmasını da engelle
        if (transitionTimer <= 0) {
            isTransitioningLevel = false;
            bgScrollSpeed = currentLAsset.speed; // v1.99.14.25: Işınlanma bitti, hızı normale döndür!
        }
    }

    // --- v1.97.1.9: PLAYER ELITE MANUAL CONTROL (No Auto-Drift) ---
    if (currentLevel === 5) {
        // Absolute control in Lava River - No automatic drift
        // v1.99.10.0: Double-movement bug fixed (Removed redundant application)

        player.relativeX = undefined; // Reset drift tracker
    } // <-- v1.99.4.1.11: Eksik parantez düzeltildi

    // --- v1.99.4.1.11: Yatay Hareket Sistemi (Fixed Horizontal) ---
    player.x += dx * player.speed * moveDt;

    // Y pozisyonunu sabitle (Kendi kendine ilerleme hissi)
    player.y = canvas.height - player.height - 100;

    // X Ekseni Sınırları (Nihai Koruma)
    if (player.x < playRiverLeft) player.x = playRiverLeft;
    if (player.x > playRiverRight) player.x = playRiverRight;

    // --- SU SIÇRATMA (PARTICLE) v126 ---
    if (isPlaying && (dx !== 0 || dy !== 0 || Math.random() < 0.1)) {
        // Kayığın arkasından su köpüğü çıkar
        let px = player.x + player.width / 2 + (Math.random() - 0.5) * 20;
        let py = player.y + player.height - 5;
        let pColor = "rgba(255, 255, 255, 0.6)";
        if (currentLevel === 4) pColor = "rgba(200, 230, 255, 0.7)";
        else if (currentLevel === 5) pColor = "rgba(255, 69, 0, 0.8)"; // Lava orange
        particles.push(new Particle(px, py, pColor));
    }
    // Parçacıkları güncelle ve ömrü biteni sil
    // --- KAR YAĞIŞI (SNOWFALL) v1.96.8.3 ---
    if (currentLevel === 4 && Math.random() < 0.1) {
        particles.push(new Particle(Math.random() * canvas.width, -50, "rgba(255, 255, 255, 0.8)"));
    }

    particles.forEach((p, index) => {
        p.update(dt);
        if (p.life <= 0) particles.splice(index, 1);
    });

    spawnTimer += dt;
    let effectiveSpawnInterval = spawnInterval;
    // SEVİYE SONU %80 BARAJLARI: AGRESİF mod! (Ölümcül Hız) ama artık daha insaflı
    if (isDZ) {
        effectiveSpawnInterval = 0.85; // v2.03: Mesafeleri çok daha açtık (Eskiden 0.50'ydi)
    }

    if (spawnTimer >= effectiveSpawnInterval) {
        spawnObstacle();
        spawnTimer = 0;

        // Seviye içi kademeli zorlaşma (Kullanıcı talebiyle aralıklar İYİCE açıldı)
        let minSpawnInterval = 2.5 - (currentLevel * 0.2); // Lv1 min: 2.3, Lv2 min: 2.1 vs.
        if (minSpawnInterval < 0.9) minSpawnInterval = 0.9; // Mutlak alt sınır, kayalar arası en az 0.9sn mesafe

        if (spawnInterval > minSpawnInterval) {
            spawnInterval -= (currentLevel === 1 ? 0.005 : 0.010);
        }
    }

    goldTimer += dt;
    if (goldTimer >= goldSpawnInterval) {
        spawnGold();
        goldTimer = 0;
    }

    // 14.000 ŞAMPİYONLUK MÜHRÜ (v1.98 Level 7 Final Loop)
    if (score >= 18000 && totalLoops === 0) {
        totalLoops = 1; // Artık sonsuz devam edeceğiz
        // v1.99.14.17: Şampionluk yazısı kullanıcı talebiyle KALDIRILDI.
        // Oyun artık kesintisiz akmaya devam edecek.
    }



    // Kayığın Çarpışma Kutusu (Hitbox) - Daha Gerçekçi (Artık kenarlara vurduğunda yanar)
    let px = player.x + 4, py = player.y + 10, pw = player.width - 8, ph = player.height - 20;

    if (powerupTimer > 0) powerupTimer -= dt;

    // Power-Uplar
    for (let i = powerups.length - 1; i >= 0; i--) {
        let p = powerups[i];
        p.y += p.speed * dt;

        // v1.97.0.3: ELITE DRIFT
        if (currentLevel === 5) {
            if (p.relativeX === undefined) p.relativeX = p.x - getRiverShift(p.y - p.speed * dt);
            p.x = getRiverShift(p.y) + p.relativeX;
        }

        if (px < p.x + p.radius && px + pw > p.x - p.radius &&
            py < p.y + p.radius && py + ph > p.y - p.radius) {
            playPowerupSound();
            if (p.type === 'magnet') powerupTimer = 3 + magnetLevel * 2;
            if (p.type === 'shield') hasShield = true;
            powerups.splice(i, 1);
            continue;
        }
    }
    powerups = powerups.filter(p => p.y < canvas.height + 50);

    // Altınlar Mıknatıs Etkisi
    for (let i = golds.length - 1; i >= 0; i--) {
        let g = golds[i];

        if (powerupTimer > 0) {
            let cx = player.x + player.width / 2;
            let cy = player.y + player.height / 2;
            let dx = cx - g.x;
            let dy = cy - g.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 400) {
                g.x += (dx / dist) * 450 * dt;
                g.y += (dy / dist) * 450 * dt;
                // v1.97.0.3: Re-calculate relativeX when pulled by magnet
                if (currentLevel === 5) g.relativeX = g.x - getRiverShift(g.y);
            } else {
                g.y += g.speed * dt;
                if (currentLevel === 5) {
                    if (g.relativeX === undefined) g.relativeX = g.x - getRiverShift(g.y - g.speed * dt);
                    g.x = getRiverShift(g.y) + g.relativeX;
                }
            }
        } else {
            g.y += g.speed * dt;
        }

        g.angle += dt * 5;

        if (px < g.x + g.radius && px + pw > g.x - g.radius &&
            py < g.y + g.radius && py + ph > g.y - g.radius) {
            triggerVibration(15); // Altın aldığında kısa titreşim
            if (typeof playCoinSound === 'function') playCoinSound();
            let collected = (g.value || 1);
            goldCount += collected;
            totalGold += collected;
            score += collected * 100; // v1.199.13.0: SKOR ARTIK DEĞERLİ! (x100 Bonus)
            triggerEliteEconomySync();
            saveGame();
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
            let cx = obs.x + obs.width / 2;
            let pxC = player.x + player.width / 2;

            // Gerçekçi S-şeklinde yüzme hareketi (Sinüs dalgası ile)
            obs.swimFactor = (obs.swimFactor || 0) + dt * 10;
            let naturalSway = Math.sin(obs.swimFactor) * 35;

            // v1.96.3: EĞER ZIKZAK TİMSAH İSE Hareket Genişliğini Artır
            if (obs.isZigZag) {
                obs.zigzagOffset = (obs.zigzagOffset || 0) + dt * 4;
                obs.speedX = Math.sin(obs.zigzagOffset) * 150; // Geniş zikzak
            } else {
                // Kayığa doğru yumuşak ve kurnazca takip et
                let diffX = pxC - cx;
                obs.speedX = (diffX > 0 ? 50 : -50) + naturalSway;
                if (Math.abs(diffX) < 15) obs.speedX = naturalSway * 0.5;
            }

            // v2.7: RIVER BOUNDARY FOR CROCS (Timsahlar karaya çıkamaz!)
            const cMargin = currentLAsset ? currentLAsset.margin : 0.35;
            const rShift = (typeof getRiverShift === 'function') ? getRiverShift(obs.y) : 0;
            const bLeft = (canvas.width * cMargin) + rShift + 10;
            const bRight = (canvas.width * (1 - cMargin)) + rShift - obs.width - 10;
            
            // Eğer karaya çok yaklaşırsa hızı ve konumu sınırla
            if (obs.x < bLeft) { obs.x = bLeft; if(obs.speedX < 0) obs.speedX = 0; }
            if (obs.x > bRight) { obs.x = bRight; if(obs.speedX > 0) obs.speedX = 0; }
        } else if (obs.type === 'whirlpool' || obs.type === 'leafTornado' || obs.type === 'blackHole') {
            obs.rotation += dt * (obs.type === 'blackHole' ? 120 : 300); // Görsel dönüş hızı

            if (obs.type === 'leafTornado') {
                if (currentLevel === 5) {
                    obs.relativeX = obs.baseRelX + Math.sin(performance.now() * obs.zigzagFreq) * obs.zigzagAmp;
                } else {
                    obs.x = obs.baseX + Math.sin(performance.now() * obs.zigzagFreq) * obs.zigzagAmp;
                }
            }

            // --- GİRDAP/HORTUM/KARA DELİK ÇEKİM KUVVETİ (PULL FORCE) ---
            let gx = obs.x + obs.width / 2;
            let gy = obs.y + obs.height / 2;
            let pxC = player.x + player.width / 2;
            let pyC = player.y + player.height / 2;

            let distToPlayer = Math.sqrt((pxC - gx) ** 2 + (pyC - gy) ** 2);
            let effectRadius = obs.type === 'blackHole' ? obs.pullRadius : 300;

            // Eğer oyuncu merkeze yeterince yakınsa, onu yavaşça kendine çeker
            if (distToPlayer < effectRadius && !isDashing) {
                let pullDirX = gx - pxC;
                let pullDirY = gy - pyC;
                // Merkeze yaklaştıkça çekim artar
                let pullStr = (1 - distToPlayer / effectRadius) * (obs.pullStrength || 120);
                player.x += (pullDirX / distToPlayer) * pullStr * dt;
                player.y += (pullDirY / distToPlayer) * pullStr * dt;
            }
        } else if (obs.type === 'hippo') {
            // Su aygırı suyun altından gelir, oyuncuya 220px yaklaştığında aniden yüzeye çıkar!
            if (obs.isSubmerged && obs.y > player.y - 220) {
                obs.isSubmerged = false;
                // v1.99.14.28: Hippo emergence sound removed per user request
            }
        } else if (obs.type === 'lavaGeyser') {
            obs.stateTimer -= dt;
            if (obs.stateTimer <= 0) {
                if (obs.state === 'dormant') {
                    // %15 Chance for INSTANT BURST (0.2s warning) - v1.99.14.50 Surprise
                    const isInstant = Math.random() < 0.15;
                    obs.state = 'warning';
                    obs.stateTimer = isInstant ? 0.2 : (0.6 + Math.random() * 0.4); 
                } else if (obs.state === 'warning') {
                    obs.state = 'erupting';
                    obs.stateTimer = 1.0 + Math.random() * 0.8; // Değişken patlama süresi
                    if (typeof playCrashSound === 'function') playCrashSound();
                    shakeTimer = 0.5;
                } else if (obs.state === 'erupting') {
                    obs.state = 'cooldown';
                    obs.stateTimer = 1.0;
                } else if (obs.state === 'cooldown') {
                    // %20 Chance for DOUBLE TAP (Back to warning immediately)
                    const isDoubleTap = Math.random() < 0.20;
                    if (isDoubleTap) {
                        obs.state = 'warning';
                        obs.stateTimer = 0.5;
                    } else {
                        obs.state = 'dormant';
                        obs.stateTimer = 1.5 + Math.random() * 2.5;
                    }
                } else {
                    obs.state = 'dormant';
                    obs.stateTimer = 2.0;
                }
            }
            // Patlama anında hitbox'ı aktif et
            obs.isDeadly = (obs.state === 'erupting');
        } else if ((obs.type === 'fireball' || obs.type === 'asteroid') && obs.isHoming) {
            // v1.99.14.81: HOMING TRACKING (Elite Standards)
            const trackingSpeed = obs.type === 'asteroid' ? 65 : 95; // Asteroidler daha kütleli, daha yavaş döner
            if (player.x > obs.x + obs.width / 2) obs.x += trackingSpeed * dt;
            else obs.x -= trackingSpeed * dt;
            
            // Update relativeX for Elite Drift consistency
            if (typeof getRiverShift === 'function') {
                obs.relativeX = obs.x - getRiverShift(obs.y);
            }
            obs.relativeX = obs.x - getRiverShift(obs.y);
        } else if (obs.type === 'magmaSerpent') {
            // v1.99.14.70: SINE WAVE SERPENT MOVEMENT
            obs.time += dt;
            obs.relativeX = (obs.baseX - getRiverShift(obs.y)) + Math.sin(obs.time * obs.frequency) * obs.amplitude;
            obs.x = getRiverShift(obs.y) + obs.relativeX;
        } else if (obs.type === 'laserGate') {
            obs.timer -= (dt || 0.016);
            if (obs.timer <= 0) {
                if (obs.state === 'warning') {
                    obs.state = 'active';
                    obs.timer = 0.8;
                } else {
                    obs.state = 'warning';
                    obs.timer = 1.5;
                }
            }
            obs.x = getRiverShift(obs.y) + (obs.relativeX || 0);
        } else if (obs.type === 'cyberDrone') {
            obs.time += (dt || 0.016);
            const targetX = player.x - (obs.width / 2);
            obs.speedX = (targetX - obs.x) * 1.8;
            if (obs.relativeX === undefined) obs.relativeX = obs.x - getRiverShift(obs.y);
            obs.relativeX += obs.speedX * dt;
            obs.x = getRiverShift(obs.y) + obs.relativeX;
        } else if (obs.type === 'glitchStream') {
            obs.time += (dt || 0.016);
            obs.offsetX = (Math.random() - 0.5) * 8;
            obs.x = getRiverShift(obs.y) + (obs.relativeX || 0) + obs.offsetX;
        } else if (obs.type === 'cyberSpear') {
            obs.time += (dt || 0.016);
            if (obs.relativeX === undefined) obs.relativeX = obs.x - getRiverShift(obs.y);
            obs.relativeX += obs.speedX * dt;
            obs.x = getRiverShift(obs.y) + obs.relativeX;
        } else if (obs.type === 'toxicRat') {
            obs.time += (dt || 0.016);
            // Sıçanlar hem nehirle akar hem de çapraz yüzerler (Dalgalı hareketle)
            const swimWiggle = Math.sin(obs.time * 5) * 1.5;
            obs.x += (obs.speedX + swimWiggle) * dt;
            // Nehir kaymasına (drift) uyum sağla (Opsiyonel: Sıçanlar nehirden bağımsız yüzebilir ama senkronizasyon için ekledik)
            if (obs.relativeX === undefined) obs.relativeX = obs.x - getRiverShift(obs.y);
            obs.relativeX += (obs.speedX + swimWiggle) * dt; 
            obs.x = getRiverShift(obs.y) + obs.relativeX;
        } else if (obs.type === 'toxicSerpent') {
            // v1.99.16.40: WIDE S-SLITHER MOVEMENT
            obs.time += (dt || 0.016);
            const slitherX = Math.sin(obs.time * 2.0) * 90;
            if (obs.relativeX === undefined) obs.relativeX = obs.x - getRiverShift(obs.y);
            obs.relativeX = (obs.relativeX || 0) * 0.95 + slitherX * 0.05;
            obs.x = getRiverShift(obs.y) + obs.relativeX;
        } else if (obs.type === 'toyBalloon') {
            obs.time += (dt || 0.016);
            const driftX = Math.sin(obs.time * 3) * 80;
            const driftY = Math.cos(obs.time * 4) * 25;
            obs.relativeX = (obs.relativeX || (obs.x - getRiverShift(obs.y))) + driftX * dt; 
            obs.x = getRiverShift(obs.y) + obs.relativeX; // v1.99.14.88: VİSİUAL SYNC
            obs.speedY += driftY * dt;
        } else if (obs.type === 'paperPlane') {
            obs.time += (dt || 0.016);
            const zigzag = Math.sin(obs.time * 8) * 180;
            obs.speedX = zigzag;
            // Kağıt uçaklar da nehre göre hareket etmeli
            if (obs.relativeX === undefined) obs.relativeX = obs.x - getRiverShift(obs.y);
            obs.relativeX += obs.speedX * dt;
            obs.x = getRiverShift(obs.y) + obs.relativeX;
        } else if (obs.type === 'kite') {
            obs.time += (dt || 0.016);
            const windSweep = Math.sin(obs.time * 1.5) * 100;
            obs.speedX = windSweep;
            obs.rotation = Math.sin(obs.time * 2) * 0.2;
            if (obs.relativeX === undefined) obs.relativeX = obs.x - getRiverShift(obs.y);
            obs.relativeX += obs.speedX * dt;
            obs.x = getRiverShift(obs.y) + obs.relativeX;
        }

        // v1.99.5.0: STRAIGHT MOVEMENT PROTOCOL (No edge drifting for logs/rocks) 🛣️
        let isStraightObject = (obs.type === 'vertical' || obs.type === 'horizontal' || obs.type === 'rock' || obs.type === 'burningPillar');
        if (isStraightObject) obs.speedX = 0;

        obs.y += (obs.speedY || obs.speed || 0) * dt;
        obs.x += (obs.speedX || 0) * dt;

        // v1.97.0.3: ELITE DRIFT - Nesnelerin nehir kıvrımını takip etmesi
        if (currentLevel === 5) {
            // Eğer nesne ilk defa güncelleniyorsa ve relativeX yoksa ata (Eski nesnelerle uyum)
            if (obs.relativeX === undefined) obs.relativeX = obs.x - getRiverShift(obs.y - obs.speedY * dt);

            // Düşman hareketini (speedX) relativeX üzerinden uygula
            if (obs.speedX) obs.relativeX += obs.speedX * dt;

            // Toplam X = Kıvrım Kayması + Nehir İçi Konum
            obs.x = getRiverShift(obs.y) + obs.relativeX;
        }

        // v1.96.8.6: YATAY KAYAN BUZLAR İÇİN KENARLARDAN SEKME (BOUNCE)
        if (obs.type === 'slidingIce') {
            const sMargin = currentLAsset ? currentLAsset.margin : 0.39;
            const riverShift = getRiverShift(obs.y);
            const bLeft = (canvas.width * sMargin) + (currentLevel === 5 ? riverShift : 0);
            const bRight = (canvas.width * (1 - sMargin)) + (currentLevel === 5 ? riverShift : 0) - obs.width;

            if (obs.x < bLeft || obs.x > bRight) {
                obs.speedX *= -1;
                if (currentLevel === 5) {
                    obs.relativeX = obs.x - riverShift;
                } else {
                    if (obs.x < bLeft) obs.x = bLeft;
                    if (obs.x > bRight) obs.x = bRight;
                }
            }
            if (obs.rotSpeed) obs.rotation += obs.rotSpeed * dt;
        }

        // v2.04: Level 1 Kütük Zıplama (Diagonal Bouncing)
        if (currentLevel === 1 && obs.type === 'vertical') {
            const sMargin = currentLAsset ? currentLAsset.margin : 0.34;
            const bLeft = (canvas.width * sMargin);
            const bRight = (canvas.width * (1 - sMargin)) - obs.width;

            // Kenardan Sekme
            if (obs.x < bLeft || obs.x > bRight) {
                obs.speedX *= -1;
                if (obs.x < bLeft) obs.x = bLeft;
                if (obs.x > bRight) obs.x = bRight;
            }

            // Kaya ile çarpışınca sekme (Obs vs Obs)
            for (let jObs = 0; jObs < obstacles.length; jObs++) {
                let other = obstacles[jObs];
                if (other === obs) continue;
                if (other.type === 'rock') {
                    if (obs.x < other.x + other.width && obs.x + obs.width > other.x &&
                        obs.y < other.y + other.height && obs.y + obs.height > other.y) {
                        obs.speedX *= -1;
                        obs.x += obs.speedX * dt * 2;
                        break;
                    }
                }
            }
            if (obs.rotSpeed) (obs.rotation = (obs.rotation || 0) + obs.rotSpeed * dt);
        }

        // v1.99.14.26: LEVEL 2 HİNLİK MEKANİZMASI (Rotation on Rock Collision)
        if (currentLevel === 2 && obs.type === 'vertical') {
            for (let jObs = 0; jObs < obstacles.length; jObs++) {
                let other = obstacles[jObs];
                if (other === obs) continue;
                if (other.type === 'rock') {
                    if (obs.x < other.x + other.width && obs.x + obs.width > other.x &&
                        obs.y < other.y + other.height && obs.y + obs.height > other.y) {
                        
                        // Hinlik Başlasın: Kütük dönmeye ve yana kaymaya başlar
                        obs.rotSpeed = (obs.rotSpeed || 0) + 5; 
                        obs.speedX = (obs.x < other.x) ? -100 : 100; // Çarptığı yöne fırlar
                        obs.x += obs.speedX * dt * 2;
                        break;
                    }
                }
            }
            if (obs.rotSpeed) (obs.rotation = (obs.rotation || 0) + obs.rotSpeed * dt);
        }

        // Elite varlıkların kenarlarında şeffaf boşluklar (padding) olabileceği için
        // Hitbox'u P oyuncu standartlarında çok daha affedici (küçük) hale getiriyoruz!
        let ox = obs.x + (obs.width * 0.25);
        let oy = obs.y + (obs.height * 0.25);
        let ow = obs.width * 0.5;
        let oh = obs.height * 0.5;

        // v2.2: Elite Lava Difficulty (Gayzerler affetmez)
        if (obs.type === 'lavaGeyser') {
            ox = obs.x + (obs.width * 0.1); // Hitbox genişletildi
            ow = obs.width * 0.8;
            oy = obs.y + (obs.height * 0.1);
            oh = obs.height * 0.8;
        }

        if (px < ox + ow && px + pw > ox &&
            py < oy + oh && py + ph > oy) {

            // --- DASH DURUMUNDA ENGELİN ÜZERİNDEN ATLA! ---
            if (isDashing) continue;

            // Eğer su aygırı henüz yüzeye çıkmamışsa (su altındaysa) çarpma/sek!
            if (obs.type === 'hippo' && obs.isSubmerged) continue;

            // v2.05: Lav Gayzeri sadece patlama anında (erupting) öldürür
            if (obs.type === 'lavaGeyser' && !obs.isDeadly) continue;

            // v1.99.15.10: Siber Lazer sadece aktifken öldürür
            if (obs.type === 'laserGate' && obs.state === 'warning') continue;

            // v1.99.15.10: Glitch Stream (Kontrol Bozulması) - Öldürmez ama yavaşlatır/saptırır
            if (obs.type === 'glitchStream') {
                player.x += (Math.random() - 0.5) * 15; // Kontrol titremesi
                continue;
            }

            // Zırh sadece kalkan Level 6 ve üstündeyse hasar bloklar, yoksa sadece roket çarpar! (v1.98 Level 6 Restriction)
            if (armorCharge > 0 && currentLevel >= 6) {
                // playCrashSound();
                armorCharge--;
                updateArmorUI();
                obstacles.splice(i, 1);
                // Patlama Efekti
                for (let p = 0; p < 15; p++) particles.push(new Particle(player.x + player.width / 2, player.y + player.height / 2, "#9b59b6"));
                if (armorCharge <= 0) showToast(translations[currentLang].armorEmpty, false);
            } else if (hasShield) {
                // Kalkan varken kırılır ve kütüğü/düşmanı imha eder
                // playCrashSound();
                hasShield = false;
                obstacles.splice(i, 1);
            } else {
                gameOver();
                return; // Kilitlenmeyi önler, frame'i anında sonlandırır
            }
        }
    }

    // v1.97.0.3: STRICT "ELITE" CLAMPING (Never touch walls)
    const finalPMargin = currentLAsset ? currentLAsset.margin : 0.32;
    const finalShift = getRiverShift(player.y);
    const wallSafeBuffer = 10; // v1.99.14.23: Elite 'Touch' Buffer (Reduced from 18)
    const fLeft = (canvas.width * finalPMargin) + finalShift + wallSafeBuffer;
    const fRight = (canvas.width * (1 - finalPMargin)) + finalShift - player.width - wallSafeBuffer;

    if (player.x < fLeft) player.x = fLeft;
    if (player.x > fRight) player.x = fRight;

    obstacles = obstacles.filter(obs => obs.y < canvas.height + 100 && obs.x > -200 && obs.x < canvas.width + 200);

    // Gülleleri güncelle ve engellerle çarpıştır
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.y -= b.speed * dt;

        // Ekrandan çıkan gülleri sil
        if (b.y < -50) {
            bullets.splice(i, 1);
            continue;
        }

        // Engel çarpışması
        for (let j = obstacles.length - 1; j >= 0; j--) {
            let obs = obstacles[j];
            if (obs.type === 'hippo' && obs.isSubmerged) continue; // Su altındaki hipoya vurulmaz

            if (b.x < obs.x + obs.width && b.x > obs.x &&
                b.y < obs.y + obs.height && b.y > obs.y) {

                // PARÇALAMA!
                // playCrashSound();
                triggerVibration(40);

                // Patlama efekt parçacıkları (v3.30: KÜTÜKLERDE EFEKT İPTAL)
                // Bullet Particles Removed v3.30 Final

                obstacles.splice(j, 1);
                bullets.splice(i, 1);
                shakeTimer = 0.25; // PATLAMA - EKRANI SALLA!
                break;
            }
        }
    }
}

function spawnLog() {
    const isHorizontal = Math.random() < 0.15; // Logların %85'i dikey gelsin (Daha nehirsel)

    // v152: LAV VE BOŞLUK SEVİYELERİNDEKİ KÜTÜKLERİ (LOGS) İPTAL ET!
    if (currentLevel === 5 || currentLevel === 6) return;

    // ... (spawn logic continues)
}



function draw(dt) {
    // v1.74 FIX: FULL CANVAS CLEAR (Reset Transform safe)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // v1.72.1: Tanımlar en başa (ReferenceError Fix)
    let currentLAsset = levelAssets[(currentLevel - 1) % levelAssets.length];

    // --- CAMERA ZOOM SYSTEM v1.72 (Ghost Buster NaN Protection) ---
    // v1.97.0.3: DYNAMIC ELITE ZOOM (1.25 -> 1.76 Closer perspective)
    let zoom = (currentLevel === 1) ? 1.58 : 1.76;
    const centerX = canvas.width / 2;
    // v1.72 FIX: player.y NaN ise merkezi 0'a daya (Siyah ekran engellendi)
    const pY = (player && typeof player.y === 'number' && !isNaN(player.y)) ? player.y : (canvas.height / 2);
    const pHeight = (player && typeof player.height === 'number') ? player.height : 60;
    const centerY = pY + pHeight / 2;

    if (!isNaN(centerX) && !isNaN(centerY)) {
        ctx.translate(centerX, centerY);
        ctx.scale(zoom, zoom);
        ctx.translate(-centerX, -centerY);
    }

    // v1.68 SCREEN SHAKE (Daha Belirgin v1.96.6.3)
    if (shakeTimer > 0) {
        let intensity = shakeTimer * 30; // Çarpan 15'ten 30'a çıkarıldı
        ctx.translate((Math.random() - 0.5) * intensity, (Math.random() - 0.5) * intensity);
    }

    // v1.74: PROCEDURAL WATER RIPPLES (Elite Dynamic System)
    drawProceduralWater(dt);

    // v1.72.3 ELITE MODERN RIVER SURFACE FX
    if (currentLevel < 5) {
        const cMargin = (currentLAsset ? currentLAsset.margin : 0.35);
        const rLeft = canvas.width * cMargin;
        const rRight = canvas.width * (1 - cMargin);
        const rWidth = rRight - rLeft;

        // v2.02 SEVİYE BAZLI DİNAMİK SU RENGİ (Fall-back Immersion)
        let waterColor = "rgba(0, 180, 255, 0.2)"; // Ilkbahar/Yaz: Turkuaz
        if (currentLevel === 3) waterColor = "rgba(139, 69, 19, 0.25)"; // Sonbahar: Kahverengi/Kızıl
        if (currentLevel === 4) waterColor = "rgba(173, 216, 230, 0.4)"; // Kış: Buz Mavisi
        if (currentLevel === 5) waterColor = "rgba(255, 69, 0, 0.3)";   // Lava: Kırmızı/Turuncu
        if (currentLevel === 6) waterColor = "rgba(0, 0, 0, 0.5)";        // Void: Siyah/Mor

        let waterGrad = ctx.createLinearGradient(rLeft, 0, rRight, 0);
        waterGrad.addColorStop(0.2, waterColor);  // Dynamic Water Tone
        ctx.fillStyle = waterGrad;
        ctx.fillRect(rLeft, 0, rWidth, canvas.height);

        // 2. Layer: Specular River Glints (Daha Modern, İnce Parıltılar)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
            let lx = rLeft + (rWidth * (0.1 + (i / 7) * 0.8));
            let speedMod = (i % 2 === 0) ? 1.5 : 2.5;
            let offset = (performance.now() / speedMod) % 600;
            ctx.beginPath();
            ctx.setLineDash([15, 60 + i * 10]);
            ctx.lineDashOffset = -offset;
            ctx.moveTo(lx, 0); ctx.lineTo(lx, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // 3. Layer: Subtle Vignette edges for immersion
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(rLeft, 0, 15, canvas.height);           // Sol iç gölge
        ctx.fillRect(rRight - 15, 0, 15, canvas.height);    // Sağ iç gölge
    }

    let currentBgTex = null;

    // v151 FIX: Asset kontrolünü daha agresif yap (Broken images bypass!)
    if (currentLAsset && bgImgs[currentLAsset.bgKey] && bgImgs[currentLAsset.bgKey].width > 0) {
        currentBgTex = bgImgs[currentLAsset.bgKey];
    }

    // EĞER LEVEL 5 ise ve RESİM HALA YOKSA (VEYA BOZUKSA), DOĞRUDAN COLOR FALLBACK'E ZORLA!
    if (currentLevel === 5 && (!currentBgTex || currentBgTex.width <= 0)) {
        currentBgTex = null;
    }
    // LEVEL 6 ve LEVEL 8 tamamen procedural çizilecek, resme gerek yok!
    const biomeIndexForBg = (currentLevel - 1) % levelAssets.length;
    if (currentLevel === 6 || biomeIndexForBg === 7) {
        currentBgTex = null;
    }

    if (currentBgTex) {
        let H = Math.ceil(canvas.height) * 2;
        ctx.drawImage(currentBgTex, 0, Math.floor(bgY), canvas.width, H);
        ctx.drawImage(currentBgTex, 0, Math.floor(bgY) - H + 1, canvas.width, H);
    } else {
        // --- SEVİYE BAZLI ARKA PLAN FALLBACK v151 (SAFLAŞTIRILMIŞ) ---
        if (currentLevel === 5) {
            ctx.fillStyle = "#1a0000"; // Simsiyah Volkanik Temel
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Akan Lav Parlaması (Gradientsiz, Sade)
            ctx.fillStyle = "rgba(255, 69, 0, 0.15)";
            ctx.fillRect(canvas.width * 0.35, 0, canvas.width * 0.3, canvas.height);

            // Lav Kabarcıkları (Daha Az, Daha Şık)
            ctx.fillStyle = "rgba(255, 140, 0, 0.6)";
            for (let i = 0; i < 8; i++) {
                let bx = (Math.sin(performance.now() / 1500 + i) * 60 + (i * 70)) % canvas.width;
                let by = (performance.now() / 3 + i * 120) % canvas.height;
                ctx.beginPath();
                ctx.arc(bx, by, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (currentLevel === 6) {
            ctx.fillStyle = "#000000"; // Tam Siyah Uzay
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // v1.98.x: PROCEDURAL VOID STARFIELD
            ctx.shadowBlur = 0;
            for (let i = 0; i < 45; i++) {
                let seed = (i * 997) % 1000;
                let sy = (performance.now() / 5 + seed) % canvas.height;
                let sx = (seed * 123) % canvas.width;
                let size = 1 + (i % 3);
                let alpha = 0.2 + Math.sin(performance.now() / 200 + i) * 0.3;

                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fillRect(sx, sy, size, size);
            }

            // Nebula Glow Parıldaması
            const nebulaPulse = 0.05 + Math.sin(performance.now() / 2000) * 0.02;
            ctx.fillStyle = `rgba(155, 89, 182, ${nebulaPulse})`;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 350, 0, Math.PI * 2);
            ctx.fill();

            // --- v154: VOID KANAL SINIRLARINI BELİRGİNLEŞTİR (LAZER RAYLARI) ---
            const voidMargin = canvas.width * 0.32; // LevelAssets margin ile aynı uyarlandı
            const laserPulse = (Math.sin(performance.now() / 200) * 0.2 + 0.5);

            ctx.lineWidth = 4;
            ctx.strokeStyle = `rgba(155, 89, 182, ${laserPulse})`;

            // Sol ve Sağ Lazer Koridor
            ctx.beginPath();
            ctx.moveTo(voidMargin, 0); ctx.lineTo(voidMargin, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(canvas.width - voidMargin, 0); ctx.lineTo(canvas.width - voidMargin, canvas.height);
            ctx.stroke();

            // Kanal içi hafif hız/akış ızgarası
            ctx.strokeStyle = "rgba(155, 89, 182, 0.05)";
            ctx.lineWidth = 1;
            for (let gy = 0; gy < canvas.height; gy += 50) {
                let off = (performance.now() / 10) % 50;
                ctx.beginPath();
                ctx.moveTo(voidMargin, gy + off);
                ctx.lineTo(canvas.width - voidMargin, gy + off);
                ctx.stroke();
            }


            ctx.shadowBlur = 0; // Reset
        } else if (biomeIndexForBg === 7) {
            // --- v1.99.15.12: PROCEDURAL CYBER CITY BACKGROUND ---
            ctx.fillStyle = "#00050a"; // Ultra Koyu Cyber Siyah
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cyberMargin = canvas.width * 0.18;
            const cyberPulse = (Math.sin(performance.now() / 400) * 0.3 + 0.7);

            // Nehir Yatağı Akan Neon Izgara (Grid)
            ctx.strokeStyle = `rgba(0, 229, 255, ${0.1 * cyberPulse})`; 
            ctx.lineWidth = 1;
            for (let gy = 0; gy < canvas.height; gy += 40) {
                let off = (performance.now() / 8) % 40;
                ctx.beginPath();
                ctx.moveTo(cyberMargin, gy + off);
                ctx.lineTo(canvas.width - cyberMargin, gy + off);
                ctx.stroke();
            }

            // Dikey Neon Hatlar (Sınırlar)
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ff00ff";
            ctx.strokeStyle = `rgba(255, 0, 255, ${cyberPulse})`;

            ctx.beginPath();
            ctx.moveTo(cyberMargin, 0); ctx.lineTo(cyberMargin, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(canvas.width - cyberMargin, 0); ctx.lineTo(canvas.width - cyberMargin, canvas.height);
            ctx.stroke();
            
            ctx.shadowBlur = 0; // Reset
        } else if (biomeIndexForBg === 8) {
            // --- v1.99.16.00: PROCEDURAL TOXIC WASTELAND BACKGROUND ---
            ctx.fillStyle = "#0a1a05"; // Koyu, Bataklıksı Çürümüş Yeşil
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const toxicMargin = canvas.width * 0.30;
            const tPulse = (Math.sin(performance.now() / 600) * 0.2 + 0.8);

            // 1. Zehirli Su Parıltısı (River Glow)
            ctx.fillStyle = `rgba(50, 205, 50, ${0.12 * tPulse})`;
            ctx.fillRect(toxicMargin, 0, canvas.width - (toxicMargin * 2), canvas.height);

            // 2. Radyoaktif Kabarcıklar (Bubbles)
            ctx.fillStyle = "rgba(173, 255, 47, 0.4)";
            for (let i = 0; i < 12; i++) {
                let seed = (i * 777) % 500;
                let bx = toxicMargin + ((seed * 1.5) % (canvas.width - toxicMargin * 2));
                let by = (performance.now() / 4 + seed) % canvas.height;
                let bSize = 2 + (i % 4);
                ctx.beginPath();
                ctx.arc(bx, by, bSize, 0, Math.PI * 2);
                ctx.fill();
            }

            // 3. YIKIK BİNALAR VE HARABELER (RUINS)
            ctx.fillStyle = "#1e1e1e"; // Beton Grisi/Siyah
            ctx.shadowBlur = 0;
            for (let i = 0; i < 6; i++) {
                let side = (i % 2 === 0) ? -20 : canvas.width - toxicMargin + 20;
                let buildY = ((performance.now() / 2) + (i * 200)) % (canvas.height + 250) - 200;
                let bWidth = toxicMargin - 10;
                let bHeight = 150 + (i * 30) % 100;
                
                // Bina Gövdesi
                ctx.fillRect(side, buildY, bWidth, bHeight);
                
                // Harabe Pencereleri (Karanlık/Kırık)
                ctx.fillStyle = "rgba(0,0,0,0.6)";
                for (let px = 15; px < bWidth - 15; px += 20) {
                    for (let py = 20; py < bHeight - 20; py += 25) {
                        if ((px + py + i) % 7 !== 0) { 
                            ctx.fillRect(side + px, buildY + py, 8, 12);
                        }
                    }
                }
                ctx.fillStyle = "#1e1e1e"; 
            }
        } else {
            // Hiçbir şey yoksa Spring gör - Ama Lav'da asla Spring görme!
            if (bgImgs['ilkbahar'] && currentLevel !== 5) {
                currentBgTex = bgImgs['ilkbahar'];
                let H = Math.ceil(canvas.height) * 2;
                ctx.drawImage(currentBgTex, 0, Math.floor(bgY), canvas.width, H);
                ctx.drawImage(currentBgTex, 0, Math.floor(bgY) - H + 1, canvas.width, H);
            } else {
                ctx.fillStyle = "#1e90ff"; // Resim yüklenene kadar mavi
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    // YARI SAYDAM PARALLAX SİS/BULUT TABAKASI
    clouds.forEach(c => {
        if (currentLevel >= 5) return;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity})`;
        ctx.fill();
    });

    // v1.97.0.2: LAVA ELITE ATMOSPHERIC OVERLAYS
    if (currentLevel === 4) { if (typeof drawFrostVignette === 'function') drawFrostVignette(); }
    if (currentLevel === 5) {
        if (typeof drawLavaGlow === 'function') drawLavaGlow();
        if (typeof drawHeatHaze === 'function') drawHeatHaze();
    }

    // v1.68 SCORE & GOLD GÖRSELLEŞTİRME (Canvas Altınları)
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
        const currentLAsset = levelAssets[(currentLevel - 1) % levelAssets.length];
        const tile = currentLAsset ? obsTiles[currentLAsset.bgKey] : null;

        // v2.00 UNIFIED ASSET SYSTEM (Support Individual & Grid)
        let drawSuccess = false;
        if (tile) {
            // New Individual System (Level 2+) // v2.03 Full Classic Revert
            if (tile.isIndividual) {
                // v1.99.14.5: ELITE ASSET FALLBACK (Check level tile first, then global pool)
                let img = tile[obs.type] || obsTiles[obs.type];
                if (img && (img.tagName === 'CANVAS' || img.complete)) {
                    // Kutuk.png orijinal dosyada YATAY'dır. Base64 olduğu için isim kontrolü silindi.
                    if (obs.type === 'vertical') {
                        ctx.save();
                        ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                        ctx.rotate(Math.PI / 2 + (obs.rotation || 0)); // v2.04: Rotation Support
                        ctx.drawImage(img, -obs.height / 2, -obs.width / 2, obs.height, obs.width);
                        ctx.restore();
                    } else if (obs.type === 'croc') {
                        // Timsah orijinal dosyada YUKARI bakar. Onu 180 derece (AŞAĞI) döndürmeliyiz.
                        // Ayrıca sağa/sola yüzerken kafasını o yöne hafif çevirmeli (gerçekçi his).
                        ctx.save();
                        ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                        let tilt = obs.speedX ? (obs.speedX / 100) * 0.25 : 0; // Sağa sola kafa açısı
                        ctx.rotate(Math.PI + tilt);
                        ctx.drawImage(img, -obs.width / 2, -obs.height / 2, obs.width, obs.height);
                        ctx.restore();
                    } else {
                        // Hippo and Taşlar için doğal düz (dik) çizim
                        ctx.save();
                        ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                        ctx.drawImage(img, -obs.width / 2, -obs.height / 2, obs.width, obs.height);
                        ctx.restore();
                    }
                    drawSuccess = true;
                }
            }
            // Legacy/Grid Tileset System (Levels 1, 3, 4, 5, 6)
            else if (tile.complete) {
                const sw = Math.floor(tile.width / 2);
                const sh = Math.floor(tile.height / 2);
                let sx = 0, sy = 0;
                if (obs.type === 'rock') { sx = 0; sy = 0; }
                else if (obs.type === 'vertical') { sx = sw; sy = 0; }
                else if (obs.type === 'croc') { sx = 0; sy = sh; }
                else if (obs.type === 'hippo') { sx = sw; sy = sh; }

                const margin = 4;
                if (obs.type === 'vertical') {
                    ctx.save();
                    ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                    ctx.rotate(Math.PI / 2 + (obs.rotation || 0)); // v2.04: Rotation Support
                    ctx.drawImage(tile, sx + margin, sy + margin, sw - margin * 2, sh - margin * 2, -obs.height / 2, -obs.width / 2, obs.height, obs.width);
                    ctx.restore();
                }
                
                // v1.99.16.80: ONLY set drawSuccess if we actually drew a supported tileset type
                if (obs.type === 'rock' || obs.type === 'vertical' || obs.type === 'croc' || obs.type === 'hippo') {
                    drawSuccess = true;
                }
            }
        }

        // --- FALLBACKS (If Tileset/Elite fails) ---
        if (!drawSuccess) {
            if (obs.type === 'vertical' || obs.type === 'horizontal_log' || obs.type === 'vertical_log') {
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.fillStyle = "#8b4513";
                ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
                ctx.restore();
            } else if (obs.type === 'rock') {
                // v2.03 CUTE RETRO ROCK (Procedural Canvas Art)
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                // Taşın gövdesi (Koyu Gri Çizgi, Açık Gri İç)
                ctx.fillStyle = "#A8B2C1"; // Şirin gri
                ctx.strokeStyle = "#2D3436"; // Koyu kalın dış çerçeve (PixelArt hissi)
                ctx.lineWidth = Math.max(3, obs.width * 0.08); // Dinamik kalınlık

                ctx.beginPath();
                ctx.lineJoin = "round";
                // Yumuşak ve Pürüzsüz Yuvarlak Nehir Taşı
                ctx.moveTo(-obs.width * 0.3, -obs.height * 0.35);
                ctx.bezierCurveTo(-obs.width * 0.1, -obs.height * 0.45, obs.width * 0.2, -obs.height * 0.45, obs.width * 0.3, -obs.height * 0.3);
                ctx.bezierCurveTo(obs.width * 0.45, -obs.height * 0.1, obs.width * 0.45, obs.height * 0.1, obs.width * 0.3, obs.height * 0.35);
                ctx.bezierCurveTo(obs.width * 0.1, obs.height * 0.45, -obs.width * 0.2, obs.height * 0.45, -obs.width * 0.35, obs.height * 0.35);
                ctx.bezierCurveTo(-obs.width * 0.45, obs.height * 0.1, -obs.width * 0.45, -obs.height * 0.1, -obs.width * 0.3, -obs.height * 0.35);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Işık Vurması (Şirin Parlaklık)
                ctx.fillStyle = "#DFE6E9";
                ctx.beginPath();
                ctx.ellipse(obs.width * 0.1, -obs.height * 0.2, obs.width * 0.15, obs.height * 0.08, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            } else if (obs.type === 'leafTornado') {
                // --- v1.96.6.0 YÜKSEK KALİTE YAPRAK HORTUMU (Procedural) ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.rotate(obs.rotation * Math.PI / 180);

                // 1. Ana Girdap (Turuncu-Altın Gradyan)
                let grad = ctx.createRadialGradient(0, 0, 5, 0, 0, obs.width / 2);
                grad.addColorStop(0, "rgba(255, 109, 0, 0.45)"); // Deep Orange
                grad.addColorStop(1, "transparent");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, obs.width / 2, 0, Math.PI * 2);
                ctx.fill();

                // 2. Spiral Rüzgar Çizgileri
                ctx.strokeStyle = "rgba(255, 215, 0, 0.6)"; // Gold
                ctx.lineWidth = 2;
                for (let j = 0; j < 4; j++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, (obs.width / 2.2) * (1 - j * 0.2), 0, Math.PI * 1.5);
                    ctx.stroke();
                }

                // 3. Uçuşan Yaprak Partikülleri (Procedural)
                ctx.fillStyle = "#ff6d00"; // Autumn Orange
                for (let k = 0; k < 8; k++) {
                    let angle = (performance.now() / 150 + k * 45) * Math.PI / 180;
                    let r = (obs.width / 3) + Math.sin(performance.now() / 200 + k) * 5;
                    let lx = Math.cos(angle) * r;
                    let ly = Math.sin(angle) * r;

                    ctx.save();
                    ctx.translate(lx, ly);
                    ctx.rotate(angle + Math.PI / 4);
                    // Küçük yaprak şekli
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 4, 7, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'paper_plane') {
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.rotate(obs.rotation || 0);
                if (obsTiles['plane_elite']) {
                    ctx.drawImage(obsTiles['plane_elite'], -obs.width / 2, -obs.height / 2, obs.width, obs.height);
                } else {
                    ctx.fillStyle = "white"; 
                    ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
                }
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'kite') {
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                // Uçurtma hafifçe yalpalasın
                ctx.rotate(Math.sin(obs.oscillation) * 0.2);
                if (obsTiles['kite_elite']) {
                    ctx.drawImage(obsTiles['kite_elite'], -obs.width / 2, -obs.height / 2, obs.width, obs.height);
                } else {
                    ctx.fillStyle = "red"; // Fallback
                    ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
                }
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'whirlpool') {
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.rotate(obs.rotation * Math.PI / 180);
                // Su Girdabı Spiral (Elite)
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.lineWidth = 3;
                for (let j = 0; j < 3; j++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, (obs.width / 2) * (1 - j * 0.25), 0, Math.PI * 1.7);
                    ctx.stroke();
                }
                ctx.fillStyle = 'rgba(0, 40, 80, 0.3)';
                ctx.beginPath();
                ctx.arc(0, 0, obs.width / 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (obs.type === 'iceBerg') {
                // v1.96.8.1: Kristal Buz Dağı Çizimi
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                // Ana mavi gövde
                ctx.fillStyle = "#E0F7FA";
                ctx.strokeStyle = "#4DD0E1";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-obs.width / 2, obs.height / 2);
                ctx.lineTo(0, -obs.height / 2);
                ctx.lineTo(obs.width / 2, obs.height / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Beyaz parıltı ucu
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.beginPath();
                ctx.moveTo(-obs.width / 4, 0);
                ctx.lineTo(0, -obs.height / 2);
                ctx.lineTo(obs.width / 4, 0);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'slidingIce') {
                // v1.96.8.6: CRYSTALLINE SLIDING SHARD (Geometric & Neon)
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.rotate(obs.rotation || 0);

                // Neon Glow
                ctx.shadowColor = "#00e5ff";
                ctx.shadowBlur = 15;

                // Body (Sharp geometric crystal)
                ctx.fillStyle = "rgba(178, 235, 242, 0.9)";
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.moveTo(0, -obs.height / 2);
                ctx.lineTo(obs.width / 2, 0);
                ctx.lineTo(0, obs.height / 2);
                ctx.lineTo(-obs.width / 2, 0);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'fireball') {
                // --- v1.97.0.2 PROCEDURAL NEON FIREBALL (Elite!) ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                // Core Glow
                const pulse = 1.0 + Math.sin(performance.now() / 100) * 0.2;
                ctx.shadowBlur = 30 * pulse;
                ctx.shadowColor = "#ff4500";

                // Neon Body
                ctx.fillStyle = "#ff8c00";
                ctx.beginPath();
                ctx.arc(0, 0, obs.width / 2 * pulse, 0, Math.PI * 2);
                ctx.fill();

                // Bright Core
                ctx.fillStyle = "#ffff00";
                ctx.beginPath();
                ctx.arc(0, 0, obs.width / 4, 0, Math.PI * 2);
                ctx.fill();

                // Particle Sparks
                ctx.fillStyle = "#ff4500";
                for (let j = 0; j < 8; j++) {
                    let off = (performance.now() / 5 + j * 45) * Math.PI / 180;
                    let rx = Math.cos(off) * (obs.width / 1.2);
                    let ry = Math.sin(off) * (obs.width / 1.2);
                    ctx.beginPath();
                    ctx.arc(rx, ry, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'asteroid') {
                // --- v1.74 PROCEDURAL ASTEROID (404-Proof!) ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.rotate(performance.now() / 800);

                // Void Aura
                ctx.shadowBlur = 15;
                ctx.shadowColor = "#9b59b6";

                // Rock Body (Jagged Polygon)
                ctx.fillStyle = "#1e1e24"; // Dark Space Rock
                ctx.strokeStyle = "#4a148c"; // Deep purple outline
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
                    let r = (obs.width / 2.5) + Math.random() * 12;
                    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Craters / Shading (Elite Details)
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                for (let i = 0; i < 3; i++) {
                    let cx = (Math.random() - 0.5) * obs.width * 0.4;
                    let cy = (Math.random() - 0.5) * obs.width * 0.4;
                    let cr = Math.random() * (obs.width / 8) + 2;
                    ctx.beginPath();
                    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                ctx.beginPath(); ctx.arc(-5, -5, 6, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(10, 8, 4, 0, Math.PI * 2); ctx.fill();

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'comet') {
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                // Kuyruk efekti
                ctx.shadowBlur = 25;
                ctx.shadowColor = "#00e5ff"; // Cyan glow
                ctx.beginPath();
                ctx.moveTo(0, 0);
                let tailX = -obs.speedX * 0.4;
                let tailY = -obs.speedY * 0.3;
                ctx.lineTo(tailX, tailY);
                ctx.lineWidth = obs.width * 0.9;
                ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
                ctx.lineCap = "round";
                ctx.stroke();

                // Çekirdek
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(0, 0, obs.width / 2.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'blackHole') {
                // --- v1.99.14.81: ELITE BLACK HOLE RENDERING ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                
                // Event Horizon (Pulsing Glow)
                let pulse = 0.85 + Math.sin(performance.now() / 200) * 0.15;
                ctx.shadowBlur = 40 * pulse;
                ctx.shadowColor = "#9b59b6"; // Forbidden Void Purple
                
                // Inner Void
                ctx.fillStyle = "#000000";
                ctx.beginPath();
                ctx.arc(0, 0, (obs.width / 2.2) * pulse, 0, Math.PI * 2);
                ctx.fill();
                
                // Distortion Ring
                ctx.strokeStyle = "rgba(155, 89, 182, 0.6)";
                ctx.lineWidth = 4;
                ctx.rotate(obs.rotation || 0);
                for (let i = 0; i < 3; i++) {
                    ctx.rotate(Math.PI / 1.5);
                    ctx.beginPath();
                    ctx.arc(obs.width / 3, 0, obs.width / 4, 0, Math.PI);
                    ctx.stroke();
                }
                
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'laserGate') {
                // --- v1.99.15.10: NEON LASER BARRIER ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                
                if (obs.state === 'warning') {
                    // Titreyen Pembe Uyarı Işığı
                    let blink = Math.sin(performance.now() / 50) > 0 ? 0.8 : 0.2;
                    ctx.strokeStyle = `rgba(255, 0, 255, ${blink})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-obs.width / 2, 0);
                    ctx.lineTo(obs.width / 2, 0);
                    ctx.stroke();
                } else {
                    // Kalın Cyan Neon Lazer
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = "#00e5ff";
                    ctx.strokeStyle = "#00e5ff";
                    ctx.lineWidth = 8;
                    ctx.beginPath();
                    ctx.moveTo(-obs.width / 2, 0);
                    ctx.lineTo(obs.width / 2, 0);
                    ctx.stroke();
                    
                    // İç Beyaz Çizgi (Core)
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'cyberDrone') {
                // --- v1.99.15.10: ORBITAL CYBER DRONE ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.rotate(obs.time * 2);
                
                // Drone Gövdesi (Üçgen)
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#ff00ff";
                ctx.fillStyle = "#ff00ff";
                ctx.beginPath();
                ctx.moveTo(0, -obs.height / 2);
                ctx.lineTo(obs.width / 2, obs.height / 2);
                ctx.lineTo(-obs.width / 2, obs.height / 2);
                ctx.closePath();
                ctx.fill();
                
                // Core
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'glitchStream') {
                // --- v1.99.15.10: DIGITAL GLITCH STREAM ---
                ctx.save();
                ctx.translate(obs.x, obs.y);
                
                // Parazit parçacıkları
                for (let i = 0; i < 5; i++) {
                    let rx = Math.random() * obs.width;
                    let ry = Math.random() * obs.height;
                    let rw = Math.random() * 40;
                    ctx.fillStyle = i % 2 === 0 ? "rgba(0, 229, 255, 0.4)" : "rgba(255, 0, 255, 0.4)";
                    ctx.fillRect(rx, ry, rw, 4);
                }
                
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'toxicRat') {
                // --- v1.99.16.10: ELITE MUTATED RAT (Redesign) ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                
                // 1. Su üstünde sülfürlü yeşil iz (Toxic Wake)
                ctx.fillStyle = "rgba(50, 205, 50, 0.2)";
                ctx.beginPath();
                ctx.arc(-obs.width/2, 5, 10 + Math.sin(obs.time*10)*5, 0, Math.PI*2);
                ctx.fill();

                // 2. Gövde (Paslı Gri)
                ctx.fillStyle = "#3d3d3d";
                ctx.beginPath();
                ctx.ellipse(0, 0, obs.width / 2, obs.height / 2.3, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // 3. Animatif Kuyruk (Yılan gibi kıvrılan)
                ctx.strokeStyle = "#5a3a3a";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-obs.width / 2, 2);
                for(let i=0; i<15; i++) {
                    let tx = -obs.width/2 - i*3;
                    let ty = Math.sin(obs.time * 8 + i*0.5) * 8;
                    ctx.lineTo(tx, ty);
                }
                ctx.stroke();

                // 4. Parlayan Gözler (Neon Kırmızı)
                ctx.fillStyle = "#ff1111";
                ctx.shadowBlur = 10;
                ctx.shadowColor = "red";
                ctx.beginPath();
                ctx.arc(obs.width / 3, -5, 3, 0, Math.PI * 2);
                ctx.arc(obs.width / 3, 5, 3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'toxicBarrel') {
                // --- v1.99.16.20: LEAKING BARREL WITH GAS ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                
                // 1. Yükselen Zehirli Gaz (Gas Smoke)
                ctx.fillStyle = "rgba(173, 255, 47, 0.2)";
                for(let i=0; i<3; i++) {
                    let offY = -((obs.time * 40 + i*20) % 60);
                    let offX = Math.sin(obs.time*2 + i) * 10;
                    let size = 8 + (i*4);
                    ctx.beginPath();
                    ctx.arc(offX, -obs.height/2 + offY, size, 0, Math.PI*2);
                    ctx.fill();
                }

                // 2. Sızan Radyoaktif Sıvı
                ctx.fillStyle = "rgba(50, 255, 50, 0.4)";
                ctx.beginPath();
                ctx.ellipse(0, obs.height/2, obs.width*0.9, 10 + Math.sin(obs.time*3)*4, 0, 0, Math.PI*2);
                ctx.fill();

                // 3. Paslı Varil Gövdesi (Kavisli Silindir Formu)
                ctx.fillStyle = "#2c2c2c";
                // Ana Gövde
                ctx.beginPath();
                ctx.moveTo(-obs.width/2 + 2, -obs.height/2);
                ctx.quadraticCurveTo(0, -obs.height/2 - 3, obs.width/2 - 2, -obs.height/2);
                ctx.lineTo(obs.width/2, obs.height/2);
                ctx.quadraticCurveTo(0, obs.height/2 + 3, -obs.width/2, obs.height/2);
                ctx.closePath();
                ctx.fill();
                
                // Varil Boğumları (Ribs)
                ctx.strokeStyle = "#1a1a1a";
                ctx.lineWidth = 2;
                for(let i=-1; i<=1; i++) {
                    ctx.beginPath();
                    let ry = i * (obs.height/3.5);
                    ctx.moveTo(-obs.width/2, ry);
                    ctx.quadraticCurveTo(0, ry + 2, obs.width/2, ry);
                    ctx.stroke();
                }

                // Pas Lekeleri
                ctx.fillStyle = "#8b4513"; ctx.globalAlpha = 0.5;
                ctx.fillRect(-obs.width/4, -obs.height/3, 6, 12); ctx.globalAlpha = 1.0;

                // 4. İkon (Kuşak üzerinde)
                ctx.fillStyle = "#ffcc00"; ctx.fillRect(-obs.width/2 + 2, -4, obs.width - 4, 10);
                
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'toxicSerpent') {
                // --- v1.99.16.40: GIANT SEGMENTED SERPENT (Elite Rendering) ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                const segmentCount = 6;
                const segmentDist = 20;

                for (let i = segmentCount - 1; i >= 0; i--) {
                    // Her segment bir önceki segmenti takip eden bir sine-wave gecikmesine sahip
                    const sOffset = Math.sin(obs.time * 5 + i * 0.6) * 25;
                    const sY = i * segmentDist - (obs.height / 2);
                    const sSize = (obs.width / 2) * (1 - (i / (segmentCount + 2)));

                    ctx.fillStyle = i === 0 ? "#222" : "#1a1a1a"; // Kafa daha belirgin
                    ctx.beginPath();
                    ctx.arc(sOffset, sY, sSize, 0, Math.PI * 2);
                    ctx.fill();

                    // Radyoaktif Desenler (Bioluminescence)
                    if (i % 2 === 0) {
                        ctx.fillStyle = "#adff2f";
                        ctx.beginPath();
                        ctx.arc(sOffset - sSize/3, sY, 2, 0, Math.PI * 2);
                        ctx.arc(sOffset + sSize/3, sY, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    // Kafa Detayları
                    if (i === 0) {
                        // Parlayan Gözler (Neon Sarı)
                        ctx.fillStyle = "#ffff00";
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = "yellow";
                        ctx.beginPath();
                        ctx.arc(sOffset - 6, sY - 4, 4, 0, Math.PI * 2);
                        ctx.arc(sOffset + 6, sY - 4, 4, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                }

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'cyberSpear') {
                // --- v1.99.15.20: NEON GREEN ENERGY SPEAR ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.rotate(obs.rotation);
                
                // Mızrak Gövdesi - Neon Yeşil
                ctx.shadowBlur = 18;
                ctx.shadowColor = "#39ff14";
                ctx.fillStyle = "#39ff14";
                
                ctx.beginPath();
                ctx.moveTo(0, -obs.height / 2); // Keskin uç (tip)
                ctx.lineTo(obs.width / 2, obs.height / 2);
                ctx.lineTo(-obs.width / 2, obs.height / 2);
                ctx.closePath();
                ctx.fill();
                
                // İç Işık (Core)
                ctx.fillStyle = "#ffff";
                ctx.beginPath();
                ctx.moveTo(0, -obs.height / 2 + 15);
                ctx.lineTo(5, obs.height / 2 - 5);
                ctx.lineTo(-5, obs.height / 2 - 5);
                ctx.closePath();
                ctx.fill();
                
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'toyBalloon') {
                // --- v1.99.14.85: NOSTALGIC TOY BALLOONS ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                
                // Balon İpi (Sallanan)
                ctx.beginPath();
                ctx.moveTo(0, obs.height / 2.5);
                ctx.bezierCurveTo(Math.sin(performance.now()/200)*10, obs.height/2, -Math.sin(performance.now()/200)*10, obs.height*0.8, 0, obs.height);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                ctx.stroke();

                // Balon Gövdesi (v1.99.14.89: Fixed Color Selection)
                const colors = ["#ff5252", "#448aff", "#ffeb3b", "#e040fb"];
                const colorIdx = Math.floor((obs.phase || 0) % colors.length);
                ctx.fillStyle = colors[colorIdx];
                ctx.beginPath();
                ctx.ellipse(0, 0, obs.width / 2.2, obs.height / 2.5, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Parlama (HighLight)
                ctx.fillStyle = "rgba(255,255,255,0.3)";
                ctx.beginPath();
                ctx.ellipse(-obs.width/8, -obs.height/8, obs.width/6, obs.width/8, 0, 0, Math.PI*2);
                ctx.fill();

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'paperPlane') {
                // --- v1.99.14.85: RETRO PAPER PLANE ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.rotate(Math.atan2(obs.speedY, obs.speedX) + Math.PI/2);
                
                ctx.fillStyle = "#ffffff";
                ctx.strokeStyle = "#dddddd";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, -obs.height / 2); // Burun
                ctx.lineTo(obs.width / 2, obs.height / 2); // Sağ kanat
                ctx.lineTo(0, obs.height / 4); // Kuyruk içi
                ctx.lineTo(-obs.width / 2, obs.height / 2); // Sol kanat
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'kite') {
                // --- v1.99.14.85: HIGH FLYING KITE ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.rotate(obs.rotation || 0);
                
                // Uçurtma İskeleti
                ctx.fillStyle = "#ff5722";
                ctx.beginPath();
                ctx.moveTo(0, -obs.height / 2);
                ctx.lineTo(obs.width / 2, 0);
                ctx.lineTo(0, obs.height / 2);
                ctx.lineTo(-obs.width / 2, 0);
                ctx.closePath();
                ctx.fill();
                
                // Kuyruk (Renkli Kurdeleler)
                ctx.strokeStyle = "#ffeb3b";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, obs.height / 2);
                for(let i=0; i<3; i++) {
                    ctx.lineTo(Math.sin(performance.now()/150 + i)*20, obs.height/2 + (i+1)*25);
                }
                ctx.stroke();

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'lavaGeyser') {
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                if (obs.state === 'dormant' || obs.state === 'cooldown' || obs.state === 'warning') {
                    // --- v2.1 ELITE MAGMA CRACK (Ground Effect) ---
                    ctx.beginPath();
                    ctx.ellipse(0, 0, obs.width / 3, obs.height / 6, 0, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(40, 20, 10, 0.8)"; // Koyu volkanik yarık
                    ctx.fill();

                    if (obs.state === 'warning') {
                        // Pulsing Warning Glow
                        let pulse = 0.5 + Math.sin(performance.now() / 100) * 0.5;
                        ctx.shadowBlur = 20 * pulse;
                        ctx.shadowColor = "#ff4500";
                        ctx.strokeStyle = `rgba(255, 69, 0, ${pulse})`;
                        ctx.lineWidth = 4;
                        ctx.stroke();
                        // Shake effect for the vent
                        ctx.translate((Math.random()-0.5)*5, (Math.random()-0.5)*5);
                    }
                } else if (obs.state === 'erupting') {
                    // --- v1.99.14.50 ULTRA ELITE SURPRISE ERUPTION ---
                    const grad = ctx.createLinearGradient(0, obs.height/2, 0, -obs.height * 2.5);
                    grad.addColorStop(0, "rgba(255, 60, 0, 0.95)");
                    grad.addColorStop(0.3, "rgba(255, 165, 0, 0.9)");
                    grad.addColorStop(0.6, "rgba(255, 255, 0, 0.7)");
                    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

                    ctx.shadowBlur = 50;
                    ctx.shadowColor = "#ff4500";
                    ctx.fillStyle = grad;
                    
                    // Main Pillar (Dynamic width based on eruption peak)
                    ctx.beginPath();
                    ctx.moveTo(-obs.width/2, obs.height/2);
                    ctx.quadraticCurveTo(0, -obs.height * 2.2, obs.width/2, obs.height/2);
                    ctx.fill();

                    // Magma Sparks (Increased count for v1.99.14.50 Surprise)
                    for(let k=0; k<8; k++) {
                        let sx = (Math.random()-0.5) * obs.width;
                        let sy = (Math.random()-1) * obs.height * 2;
                        particles.push(new Particle(obs.x + obs.width/2 + sx, obs.y + obs.height/2 + sy, "#ffaa00"));
                    }
                }
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'burningPillar') {
                // v1.99.14.60: ELITE BURNING PILLAR (Visual Overhaul)
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                // Volcanic Body
                ctx.fillStyle = "#222222";
                ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

                // Magma Cracks (Dynamic pulsing)
                let pulse = 0.5 + Math.sin(performance.now() / 300) * 0.5;
                ctx.strokeStyle = `rgba(255, 69, 0, ${pulse})`;
                ctx.lineWidth = 2 + (pulse * 3);
                
                // Draw jagged magma veins
                ctx.beginPath();
                ctx.moveTo(-obs.width/2, -obs.height/3);
                ctx.lineTo(0, 0);
                ctx.lineTo(-obs.width/4, obs.height/2);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(obs.width/2, -obs.height/4);
                ctx.lineTo(obs.width/4, 0);
                ctx.lineTo(obs.width/2, obs.height/3);
                ctx.stroke();

                // Glow Effect
                ctx.shadowBlur = 15;
                ctx.shadowColor = "#ff4500";
                ctx.strokeStyle = "#ff4500";
                ctx.strokeRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

                // Damaged State Visual (Show cracks more if hit once)
                if (obs.health < obs.maxHealth) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                    ctx.fillRect(-obs.width/2, -obs.height/2, obs.width, obs.height);
                }

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'magmaSerpent') {
                // v1.99.14.70: DYNAMIC MAGMA SERPENT RENDERING
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                
                // Head Section
                const headGlow = 0.7 + Math.sin(performance.now() / 150) * 0.3;
                ctx.shadowBlur = 25 * headGlow;
                ctx.shadowColor = "#ff4500";
                
                ctx.fillStyle = "#331100"; // Dark volcanic head
                ctx.beginPath();
                ctx.arc(0, 0, obs.width / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Magma Eyes / Core
                ctx.fillStyle = "#ffcc00";
                ctx.beginPath();
                ctx.arc(-obs.width/4, -obs.height/6, 6, 0, Math.PI * 2);
                ctx.arc(obs.width/4, -obs.height/6, 6, 0, Math.PI * 2);
                ctx.fill();
                
                // Body Segments (Lagging behind slightly for snake effect)
                ctx.restore(); // Exit head local space
                
                for (let i = 1; i <= 3; i++) {
                    ctx.save();
                    // Lag the segments along the sine wave
                    const lagTime = obs.time - (i * 0.15);
                    const segRelX = (obs.baseX - getRiverShift(obs.y + i*25)) + Math.sin(lagTime * obs.frequency) * obs.amplitude;
                    const segX = getRiverShift(obs.y + i*25) + segRelX;
                    const segY = obs.y + i * 28; // Spacing
                    
                    ctx.translate(segX + obs.width/2, segY + obs.height/2);
                    const sSize = (obs.width / 2) * (1 - (i * 0.15));
                    
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = "#ff4500";
                    ctx.fillStyle = (i % 2 === 0) ? "#ff4500" : "#442200";
                    ctx.beginPath();
                    ctx.arc(0, 0, sSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                drawSuccess = true;
            }
        }
    });

    // --- PARÇACIKLARIN (Particles) ÇİZİMİ v126 ---
    particles.forEach(p => p.draw());

    // Kalkan Aurası Çizimi
    if (armorCharge > 0 && currentLevel >= 6) {
        ctx.save();
        let cx = player.x + player.width / 2;
        let pulse = Math.sin(performance.now() / 150) * 3; // İleri-geri motor nefes efekti

        // Daha küçük, kayığı saran aerodinamik kalkan
        ctx.beginPath();
        ctx.moveTo(cx, player.y - 15 - pulse); // Burun sadece biraz önde
        ctx.lineTo(cx + player.width / 2 + 8, player.y + 25 - pulse / 2); // Sağ kanat
        ctx.lineTo(cx, player.y + 5 - pulse / 2); // İç boşluk kayığın tam burnunda
        ctx.lineTo(cx - player.width / 2 - 8, player.y + 25 - pulse / 2); // Sol kanat
        ctx.closePath();

        ctx.fillStyle = "rgba(155, 89, 182, 0.4)";
        ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = "#e056fd";
        ctx.shadowBlur = 15; ctx.shadowColor = "#e056fd";
        ctx.stroke();

        // Buruna ekstra küçük sıcak enerji çizgisi
        ctx.beginPath();
        ctx.moveTo(cx - 8, player.y - 5 - pulse);
        ctx.lineTo(cx + 8, player.y - 5 - pulse);
        ctx.lineWidth = 2; ctx.strokeStyle = "#fff";
        ctx.shadowBlur = 8; ctx.shadowColor = "#fff";
        ctx.stroke();

        ctx.restore();
    } else if (hasShield) {
        ctx.beginPath();
        // player sprite is 60x100
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, Math.max(player.width, player.height) / 2 + 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 229, 255, 0.3)";
        ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = "#00e5ff"; ctx.stroke();
    }
    // Mıknatıs halkası v1.98 Visual Cleanup - Halkasız modern görünüm
    if (powerupTimer > 0) {
        // Mıknatıs aktif, görsel halka kaldırıldı.
    }

    // --- v1.98.x: PROCEDURAL VOID AURA ---
    if (currentLevel === 6) {
        ctx.save();
        ctx.shadowColor = "#9b59b6";
        // Parlama ve halka kalınlığını iyice düşürdük
        ctx.shadowBlur = 10 + Math.sin(performance.now() / 150) * 5;
        ctx.strokeStyle = "rgba(155, 89, 182, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Halkanın çapı çok daha dar, kayığın hemen altından fışkırıyor
        ctx.ellipse(player.x + player.width / 2, player.y + player.height / 2, player.width / 2.2, player.height / 2.2, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(155, 89, 182, 0.6)";
        for (let i = 0; i < 4; i++) {
            let angle = (performance.now() / 200) + (i * Math.PI / 2);
            // Dönen noktaları iyice kayığa yanaştırdık
            let px = player.x + player.width / 2 + Math.cos(angle) * (player.width / 1.8);
            let py = player.y + player.height / 2 + Math.sin(angle) * (player.height / 1.8);
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2); // Noktalar da ufaldı
            ctx.fill();
        }
        ctx.restore();
    }

    // v1.99.5.77: UNSTOPPABLE SPRITE ENGINE ⛵
    let activePlayerImg = playerImg || iPI;
    let isImgReady = activePlayerImg && (activePlayerImg.tagName === 'CANVAS' || activePlayerImg.complete);

    ctx.save();
    if (isImgReady) {
        if (isDashing) {
            let scale = 1.2 + Math.sin((dashTimer / DASH_DURATION) * Math.PI) * 0.3;
            ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
            ctx.scale(scale, scale);
            ctx.drawImage(activePlayerImg, -player.width / 2, -player.height / 2, player.width, player.height);
            ctx.globalAlpha = 0.3;
            ctx.drawImage(activePlayerImg, -player.width / 2, -player.height / 2 + 20, player.width, player.height);
        } else {
            ctx.drawImage(activePlayerImg, player.x, player.y, player.width, player.height);
        }
    } else {
        // EMERGENCY FALLBACK: Draw a brown boat silhouette if image is missing
        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.ellipse(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, player.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#5D2E0C";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.restore();


    // v1.97.0.2: Haze wrap-up
    if (typeof endHeatHaze === 'function') endHeatHaze();

    // v1.74: All Legacy Canvas HUD elements removed. Using modern HTML Glass HUD.
    // Lives and Dash are now synced to DOM.

    // v1.99.14.9: ELITE DEATH ZONE WARNING (Centralized & Aggressive)
    if (getDZStatus()) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const phase = performance.now() / 150;
        const alpha = 0.4 + Math.sin(phase) * 0.4;
        
        // DANGER VIGNETTE (Elite Atmosphere)
        let grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 50, canvas.width/2, canvas.height/2, canvas.height/0.8);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, `rgba(255, 0, 0, ${alpha * 0.4})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0,0, canvas.width, canvas.height);

        // CENTRAL SKULL & TEXT
        ctx.globalAlpha = alpha + 0.2;
        ctx.shadowColor = "#ff1744";
        ctx.shadowBlur = 25;
        
        ctx.fillStyle = "#ff1744";
        ctx.textAlign = "center";
        
        // Pulsing Skull
        const scale = 1 + Math.sin(phase) * 0.1;
        ctx.font = `bold ${48 * scale}px Arial`;
        ctx.fillText("💀", canvas.width / 2, canvas.height * 0.35);
        
        // Danger Text
        ctx.font = "900 24px 'Outfit', sans-serif";
        ctx.fillText("DEATH ZONE", canvas.width / 2, canvas.height * 0.35 + 40);
        
        ctx.restore();
    }

    // v1.96.8.4: DONDURUCU VADİ - FROST VIGNETTE (Elite Atmosfer)
    if (currentLevel === 4) {
        if (typeof drawFrostVignette === 'function') drawFrostVignette();
    }

    // Güzelleştirme: Gölgeyi resetle
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    // UI Powerups Canvas Draw
    powerups.forEach(p => {
        if (p.type === 'magnet' && magImg.complete) {
            ctx.drawImage(magImg, p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
        } else if (p.type === 'shield' && shdImg.complete) {
            ctx.drawImage(shdImg, p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
        }
    });

    // --- PIXEL-ART SPEED LINES (Checkpoint Transition) Removed v1.80 ---
    if (isTransitioningLevel) {
        // Speed lines removed as per modern design update
    }

    // --- SCREEN FLASH EFFECT (Level Up / Checkpoint) v132 ---
    if (screenFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${screenFlash})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        screenFlash -= 0.05; // Parlama yavaşça sönsün
    }

    // Enerji Mermileri (v1.68 Sleek Energy)
    bullets.forEach(b => {
        ctx.save();
        // Enerji Kuyruğu (Tail)
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#f12711";
        ctx.fillStyle = "rgba(241, 39, 17, 0.6)";
        ctx.beginPath();
        ctx.moveTo(b.x - b.radius, b.y);
        ctx.lineTo(b.x + b.radius, b.y);
        ctx.lineTo(b.x, b.y + b.radius * 3); // Arkaya doğru uzanan sivriltme
        ctx.closePath();
        ctx.fill();

        // Parlayan Çekirdek (Core)
        let coreGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        coreGrad.addColorStop(0, "#fff");
        coreGrad.addColorStop(0.5, "#ff8a80");
        coreGrad.addColorStop(1, "#f12711");

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Çıkış Kıvılcımları (Mini Trail)
        if (Math.random() < 0.3) {
            particles.push(new Particle(b.x, b.y + b.radius, "#ff5722"));
        }

        ctx.restore();
    });

    ctx.restore(); // Shake/Save'i kapat
}

// v1.74: ELITE PROCEDURAL WATER RIPPLES ENGINE
function drawProceduralWater(dt) {
    const lAsset = levelAssets[(currentLevel - 1) % levelAssets.length];
    const margin = (lAsset ? lAsset.margin : 0.35);
    const rLeft = canvas.width * margin;
    const rRight = canvas.width * (1 - margin);
    const rWidth = rRight - rLeft;
    const wColor = lAsset ? lAsset.color : "#00e5ff";

    ctx.save();

    // Wave Generation Logic
    if (currentLevel < 5) {
        // v1.74 Simplified Straight Shimmer Lines (Sadeleştirilmiş Tasarım)
        ctx.strokeStyle = wColor;
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 1;

        for (let i = 0; i < 10; i++) {
            let waveY = ((performance.now() / 25) + (i * canvas.height / 10)) % canvas.height;
            ctx.beginPath();
            ctx.moveTo(rLeft, waveY);
            ctx.lineTo(rRight, waveY);
            ctx.stroke();
        }
    } else if (currentLevel === 5) {
        // --- v1.99.10.0 ELITE LAVA SHIMMER (Sizzling Heat) ---
        ctx.globalAlpha = 0.35;
        for (let i = 0; i < 6; i++) {
            let ly = (performance.now() / 8 + i * 150) % canvas.height;
            let sizzle = Math.sin(performance.now() / 200 + i) * 15;
            let grad = ctx.createLinearGradient(rLeft, ly, rRight, ly);
            grad.addColorStop(0, "rgba(255, 69, 0, 0)");
            grad.addColorStop(0.5, "rgba(255, 140, 0, 0.6)");
            grad.addColorStop(1, "rgba(255, 69, 0, 0)");
            ctx.fillStyle = grad;
            ctx.fillRect(rLeft + sizzle, ly, rRight - rLeft, 25);
        }
        
        // Heat Haze (Subtle distortion effect)
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = "rgba(255, 100, 0, 0.05)";
        ctx.fillRect(rLeft, 0, rRight - rLeft, canvas.height);
        ctx.restore();
    }

    ctx.restore();
}

function gameLoop(timestamp) {
    // v1.96.6.1 FIX: Menüdeyken de döngünün çalışmasına izin ver (Sarsıntı ve arka plan akışı için)
    const isOverlayOpen =
        document.getElementById('shop-screen').classList.contains('active') ||
        document.getElementById('spin-screen').classList.contains('active') ||
        document.getElementById('settings-screen').classList.contains('active');

    if (!isPlaying && !isGameOver && !startScreen.classList.contains('active') && !isOverlayOpen) return;

    let dt = (timestamp - lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    lastTime = timestamp;

    // v1.96.6.3: Akıllı Ambiyans Yönetimi 
    if (shakeTimer > 0) shakeTimer -= dt;

    // v1.96.6.3: Menülerde akışı tamamen durdur (Kullanıcı tercihi)
    let ambientSpeed = (isPlaying && !isPaused) ? bgScrollSpeed : 0;
    bgY += ambientSpeed * dt;
    let totalBgHeight = Math.ceil(canvas.height) * 2;
    if (bgY >= totalBgHeight) bgY -= totalBgHeight;

    clouds.forEach(c => {
        c.y += (ambientSpeed * 1.5) * dt; // Bulutlar da su hızıyla orantılı
        if (c.y > canvas.height + c.r) {
            c.y = -c.r;
            c.x = Math.random() * canvas.width;
        }
    });

    // Sadece oyun aktifse ve duraklatılmamışsa ana mantığı güncelle
    if (isPlaying && !isPaused) {
        update(dt);
    }

    // HER DURUMDA ÇİZ (Pause dahil)
    draw(dt);

    // Döngüyü devam ettir
    gameLoopRequestId = requestAnimationFrame(gameLoop);
}

// v1.74: Giriş ekranında da döngüyü başlat
if (startScreen.classList.contains('active')) {
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

if (startBtn) startBtn.addEventListener('click', startGame);

function quitToMainMenu() {
    window.resumeLevel = 1;
    window.resumeScore = 0;
    saveGame();
    isPlaying = false;
    isPaused = false;
    isGameOver = false;

    // v1.99.5.78: Clear ALL UI overlays to prevent ghosting
    const allScreens = [
        'start-screen', 'pause-screen', 'game-over-screen',
        'shop-screen', 'leaderboard-screen', 'spin-screen',
        'settings-screen', 'level-up-overlay'
    ];
    allScreens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('active');
            el.style.display = 'none';
        }
    });

    // Ana Menüyü göster
    if (startScreen) {
        startScreen.classList.remove('hidden');
        startScreen.classList.add('active');
        startScreen.style.display = 'flex';
        startScreen.style.opacity = '1';
    }

    // HUD ve Kontrolleri gizle
    const hud = document.getElementById('modern-hud');
    const controls = document.getElementById('controls-ui');
    if (hud) hud.style.display = 'none';
    if (controls) controls.style.display = 'none';

    // Background & Player Restore
    const l1Asset = levelAssets[0];
    bgImg = bgImgs[l1Asset.bgKey];
    playerImg = players.ilkbahar;

    if (typeof stopAllAudio === 'function') stopAllAudio();
}

if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
if (resumeBtn) resumeBtn.addEventListener('click', togglePause);

// v1.199.3.31.10.3: Mükerrer çıkış dinleyicileri temizlendi. 🛡️
if (quitBtn) quitBtn.onclick = () => {
    // v1.199.3.31.10.3: Session protection (Instant Vault already saved)
    saveGame();
    location.reload(); // Üstün Temizlik v1.99.5.95
};


const qbg = document.getElementById('quit-btn-gameover');
if (qbg) qbg.addEventListener('click', () => {
    // Oyuncu gerçekten çıkıyor, altınları kasaya aktar
    totalGold += goldCount;
    // goldCount = 0; // v1.99.3.31.0: RESUME İÇİN SIFIRLAMAYI KALDIRDIK
    saveGame();

    isGameOver = false;
    isPlaying = false;
    gameOverScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    gameOverScreen.style.display = 'none';

    startScreen.classList.remove('hidden');
    startScreen.classList.add('active');
    const hud = document.getElementById('modern-hud');
    if (hud) hud.style.display = 'none'; // v1.99.5.5
    if (pauseBtn) pauseBtn.style.display = 'none';
});

if (reviveBtn) reviveBtn.addEventListener('click', () => {
    showRewardedAd(reviveBtn, translations[currentLang].reviveBtn, () => {
        // v166 GARANTİ CANLANMA (Force Restart)
        isGameOver = false;
        isPlaying = true;
        isPaused = false;
        lives = 1;
        hasShield = true;

        // UI'yi zorla kapat (Hem class hem style)
        if (gameOverScreen) {
            gameOverScreen.classList.remove('active');
            gameOverScreen.classList.add('hidden');
            gameOverScreen.style.display = 'none';
            gameOverScreen.style.opacity = '0';
        }
        if (pauseBtn) pauseBtn.style.display = 'block';

        // --- HİNLİK MEKANİĞİ v151 ---
        if (score >= 900 && score < 1000) score = 900;
        else if (score >= 1900 && score < 2000) score = 1900;
        else if (score >= 2900 && score < 3000) score = 2900;
        else if (score >= 3900 && score < 4000) score = 3900;
        else if (score >= 5900 && score < 6000) score = 5900;
        else if (score >= 9900 && score < 10000) score = 9900;

        if (!isMusicScheduled) bgMusicScheduler();
        lastTime = performance.now();
        if (gameLoopRequestId) cancelAnimationFrame(gameLoopRequestId);
        gameLoopRequestId = requestAnimationFrame(gameLoop);

        draw(); // Görseli hemen güncelle
        setTimeout(() => { hasShield = false; }, 3000);
    });
});

// v166: GARANTİ ÇİZİM FONKSİYONU (Kalpler vs.)
function drawHeart(x, y, size, color) {
    ctx.save();
    ctx.beginPath();
    let d = size;
    ctx.moveTo(x, y + d / 4);
    ctx.quadraticCurveTo(x, y, x + d / 4, y);
    ctx.quadraticCurveTo(x + d / 2, y, x + d / 2, y + d / 4);
    ctx.quadraticCurveTo(x + d / 2, y, x + d * 3 / 4, y);
    ctx.quadraticCurveTo(x + d, y, x + d, y + d / 4);
    ctx.quadraticCurveTo(x + d, y + d / 2, x + d * 5 / 8, y + d * 3 / 4);
    ctx.lineTo(x + d / 2, y + d);
    ctx.lineTo(x + d * 3 / 8, y + d * 3 / 4);
    ctx.quadraticCurveTo(x, y + d / 2, x, y + d / 4);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

// v1.99.6.3: MASTER UI FINAL SYNC (Cleanup Complete)
// Tüm ana menü butonları yukarıdaki haptik blokta mühürlenmiştir.


const shopPauseBtn = document.getElementById('open-shop-btn-pause');
// v1.99.5.99: Mühürlü Mağaza Dinleyicisi
if (shopPauseBtn) {
    shopPauseBtn.onclick = () => {
        const sScr = document.getElementById('shop-screen');
        const pScr = document.getElementById('pause-screen');
        if (sScr) {
            // v1.99.6.0: Pause menüsünü gizle (Mühürlü Geçiş)
            if (pScr) pScr.classList.add('hidden');

            sScr.classList.remove('hidden');
            sScr.classList.add('active');
            sScr.style.display = 'flex';
            sScr.style.zIndex = '30000';
            updateShopUI();
        }
    };
}



// Settings back functionality handled in Elite section

const logoutBtn = document.getElementById('logout-btn');
const logoutConfirmScreen = document.getElementById('logout-confirm-screen');
const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
const cancelLogoutBtn = document.getElementById('cancel-logout-btn');

if (logoutBtn) logoutBtn.addEventListener('click', () => {
    logoutConfirmScreen.classList.remove('hidden');
    logoutConfirmScreen.classList.add('active');
    logoutConfirmScreen.style.display = 'flex';
});

if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', () => {
    logoutConfirmScreen.classList.remove('active');
    logoutConfirmScreen.classList.add('hidden');
    logoutConfirmScreen.style.display = 'none';
});

if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', async () => {
    try {
        if (window.gameLeaderboard && typeof window.gameLeaderboard.logout === 'function') {
            await window.gameLeaderboard.logout();
        } else {
            // Fallback
            localStorage.clear();
            location.reload();
        }
    } catch (e) {
        console.error("Logout failed:", e);
        location.reload();
    }
});

// Hard Reset moved to settings v121
const hardResetBtnUI = document.getElementById('hard-reset-btn');
if (hardResetBtnUI) hardResetBtnUI.addEventListener('click', () => {
    const resetOverlay = document.getElementById('reset-confirm-overlay');
    if (resetOverlay) {
        resetOverlay.classList.remove('hidden');
        resetOverlay.classList.add('active');
        resetOverlay.style.display = 'flex';
    }
});

// v122: Restart - Altınları kasaya aktar ve yeni oyun başla
if (restartBtn) restartBtn.addEventListener('click', () => {
    totalGold += goldCount;
    // goldCount = 0; // v1.99.3.31.0: RESUME İÇİN SIFIRLAMAYI KALDIRDIK
    saveGame();
    startGame();
});

const resetYes = document.getElementById('confirm-reset-yes');
const resetNo = document.getElementById('confirm-reset-no');

if (resetYes) resetYes.addEventListener('click', () => {
    // TAM SIFIRLAMA (Hard Reset) v1.99.5.92
    localStorage.clear(); // Her şeyi sil
    localStorage.removeItem('riverEscapeSave');
    localStorage.removeItem('re_best_score');

    // Uygulamayı tamamen tertemiz başlat
    location.reload();
});

if (resetNo) resetNo.addEventListener('click', () => {
    const resetOverlay = document.getElementById('reset-confirm-overlay');
    if (resetOverlay) {
        resetOverlay.classList.remove('active');
        resetOverlay.classList.add('hidden');
        resetOverlay.style.display = 'none';
    }
});

if (resetNo) resetNo.addEventListener('click', () => {
    const resetOverlay = document.getElementById('reset-confirm-overlay');
    if (resetOverlay) {
        resetOverlay.classList.remove('active');
        resetOverlay.classList.add('hidden');
        resetOverlay.style.display = 'none';
    }
});



const adGoldBtn = document.getElementById('ad-gold-btn');
if (adGoldBtn) {
    adGoldBtn.addEventListener('click', () => {
        showRewardedAd(adGoldBtn, translations[currentLang].adGoldBtn, () => {
            totalGold += 100; // v3.31.0: 1 Ad = 1 Revive Cost Correlation
            triggerEliteEconomySync(); // v1.99.4.1.8: Reklam altını anında buluta!
            saveGame();
            updateShopUI();
            showToast(`${translations[currentLang].rewardPrefix} 100 GOLD! 💰`, true);
            for (let i = 0; i < 4; i++) setTimeout(playCoinSound, i * 100);
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
        hasWeapon = data.weapon || false;
        ownsArmorLicense = data.armorLicense || false;
        armorCharge = data.armorCharge || 0;
        bombCount = data.bombs || 0;

        // v1.99.4.1.9: Devam Etme Bilgileri
        window.resumeScore = data.sessionScore || 0;
        window.resumeLives = data.sessionLives || 3;
        window.resumeLevel = data.sessionLevel || 1;

        // UI'yı güncelle
        const mSli = document.getElementById('music-slider');
        const sSli = document.getElementById('sfx-slider');
        const vTog = document.getElementById('vibration-toggle');

        if (mSli) { mSli.value = isMusicVolume * 100; document.getElementById('music-vol-txt').innerText = (isMusicVolume * 100) + '%'; }
        if (sSli) { sSli.value = isSFXVolume * 100; document.getElementById('sfx-vol-txt').innerText = (isSFXVolume * 100) + '%'; }
        if (vTog) vTog.checked = isVibrationEnabled;

        // v1.99.3.31.0: Buluttan Serveti Geri Yükle (Recovery)
        if (typeof Leaderboard !== 'undefined') {
            Leaderboard.restoreFromCloud();
        }

        updateShopUI();

        // v1.99.5.1: Tema Tercihini Uygula
        const savedTheme = localStorage.getItem('riverEscapeTheme') || 'dark';
        setTheme(savedTheme);
        const tTog = document.getElementById('theme-toggle');
        if (tTog) tTog.checked = (savedTheme === 'dark');
    }
}


if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', () => {
        saveGame();
        settingsScreen.classList.remove('active');
        settingsScreen.classList.add('hidden');
    });
}

// SLIDER VE AYAR EVENTLERİ
const musicSlider = document.getElementById('music-slider');
if (musicSlider) {
    musicSlider.addEventListener('input', (e) => {
        isMusicVolume = e.target.value / 100;
        document.getElementById('music-vol-txt').innerText = e.target.value + '%';
        saveGame(); // Değiştikçe kaydet
    });
}

const sfxSlider = document.getElementById('sfx-slider');
if (sfxSlider) {
    sfxSlider.addEventListener('input', (e) => {
        isSFXVolume = e.target.value / 100;
        document.getElementById('sfx-vol-txt').innerText = e.target.value + '%';
        saveGame();
    });
}

const vibToggle = document.getElementById('vibration-toggle');
if (vibToggle) {
    vibToggle.addEventListener('change', (e) => {
        isVibrationEnabled = e.target.checked;
        if (isVibrationEnabled) triggerVibration(30); // Test titreşimi
        saveGame();
    });
}

loadGame();

// --- v1.96.8.4 DONDURUCU VADİ GÖRSEL EFEKT SİSTEMİ ---
function drawFrostVignette() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Köşelerde Buzlanma (Frosty Corners)
    const grd = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height / 4,
        canvas.width / 2, canvas.height / 2, canvas.width
    );

    // v1.96.8.4: Kristalize Mavi/Beyaz Geçiş
    grd.addColorStop(0, "transparent");
    grd.addColorStop(0.7, "rgba(224, 247, 250, 0.1)"); // Hafif sis
    grd.addColorStop(1, "rgba(255, 255, 255, 0.35)"); // Köşelerde yoğun buzlanma

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- v1.97.0.5: Elite Breathing Crystals (Baş Dönmesi Engelleyici) ---
    const pulse = 0.5 + Math.sin(performance.now() / 1500) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + pulse * 0.3})`; // Yumuşak nefes alma efekti

    // Sabit, rastgele olmayan kristal noktaları (Daha huzurlu)
    const crystalPoints = [
        { x: 50, y: 50 }, { x: canvas.width - 50, y: 50 },
        { x: 50, y: canvas.height - 50 }, { x: canvas.width - 50, y: canvas.height - 50 },
        { x: 120, y: 150 }, { x: canvas.width - 120, y: 150 }
    ];

    crystalPoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}
// v1.97.0.1: LAVA ELITE ATMOSPHERICS
function drawLavaGlow() {
    ctx.save();
    const flicker = 0.3 + Math.random() * 0.15;
    const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width * 0.2, canvas.width / 2, canvas.height / 2, canvas.width * 0.8);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, `rgba(255, 69, 0, ${flicker})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function drawHeatHaze() {
    // v1.97.0.1: Heat distortion (simulated via slight periodic canvas translation displacement)
    const intensity = 0.4; // v1.97.1.9: Titreşim minimuma indirildi (0.8 -> 0.4)
    const dx = Math.sin(performance.now() / 150) * intensity;
    const dy = Math.cos(performance.now() / 150) * intensity;
    ctx.save();
    ctx.translate(dx, dy);
}

// v1.97.0.1: Finalize Draw Loop wrap for Haze
function endHeatHaze() {
    if (currentLevel === 5) ctx.restore();
}

// --- ELITE AUDIO ENGINE v3.31.0 ---
