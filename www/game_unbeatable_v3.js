/**
 * RİVER ESCAPE ELİTE - v1.99.36.25 (FINAL SERPENT AI)
 * DEVELOPMENT RULES:
 * 1. NO PLACEHOLDERS 2. PERFORMANCE FIRST 3. VISUAL EXCELLENCE
 * 4. CODE INTEGRITY 5. ELITE SYNC
 */

// --- v1.99.36.80: ELITE GLOBAL CONSTANTS (Locked & Sealed) ---
const STAGES_PER_BIOME = 3; 
const BIOME_COUNT = 9;
const LOOP_THRESHOLD = BIOME_COUNT * 3000; 

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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

var levelUpOverlay = document.getElementById('level-up-overlay');
window.addEventListener('load', () => {
    levelUpOverlay = document.getElementById('level-up-overlay');
});
const reviveBtn = document.getElementById('revive-btn');
const reviveGoldBtn = document.getElementById('revive-gold-btn');

// --- v1.99.35.00 OPTIMIZATION: DOM CACHE ---
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
var hudUpdateTimer = 0;
const HUD_UPDATE_INTERVAL = 0.1; // 100ms (10 FPS update for UI is plenty)
const settingsScreen = document.getElementById('settings-screen');
const settingsOpenBtn = document.getElementById('open-settings-btn');
const settingsCloseBtn = document.getElementById('settings-close-btn');
// v1.99.19.09: Elite Button Central Controls
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


var lives = 3; // v98: 3 Can Sistemi

// --- DASH (ANI ZIPLAMA) MEKANİĞİ v1.99.35.00 ---
var dashEnergy = 0;
var isDashing = false;
var dashTimer = 0;
const DASH_DURATION = 1.2;
const MAX_DASH_ENERGY = 100;
const DASH_RECHARGE_RATE = 15; // Saniyede dolan enerji

// --- v1.99.31.00: CARTONY SQUASH & STRETCH BOUNCINESS ---
var pScaleX = 1, pScaleY = 1, pSkew = 0;
var targetScaleX = 1, targetScaleY = 1, targetSkew = 0;

var cameraZoom = 1.0;

// LUCKY SPIN v120
var canSpinFree = true;
var isSpinning = false;
var wheelAngle = 0;
var spinVelocity = 0;
var wheelRewards = [
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
// particles moved to global block at line 755 for v1.99.19.09
var totalLoops = 0; // v153: SONSUL DÖNGÜ SİSTEMİ

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
var shakeTimer = 0; // v1.68 Screen Shake
var displayScore = 0; // v1.68 Score Ticker
var displayGold = 0;  // v1.68 Gold Ticker
var displayTotalGold = 0; // Vault ticker

// v1.99.35.00: ELITE RENDER CACHE (Prevents per-frame GC pressure)
const renderCache = {
    lavaGeyser: null,
    leafTornado: null,
    fireball: null,
    voidAura: null,
    frostVignette: null,
    lastCanvasWidth: 0,
    lastCanvasHeight: 0
};
// v1.99.35.00: ELITE MODAL ENGINE
function showEliteConfirm(title, body, confirmBtnText, emoji, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;
    const t = translations[currentLang];
    
    document.getElementById('confirm-modal-title').innerText = title || t.confirmTitle;
    document.getElementById('confirm-modal-body').innerText = body || "";
    document.getElementById('confirm-modal-emoji').innerText = emoji || "🛡️";
    const okBtn = document.getElementById('confirm-ok-btn');
    okBtn.innerText = confirmBtnText || t.confirmBtn;
    
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    const close = () => {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    };
    
    document.getElementById('confirm-cancel-btn').onclick = close;
    okBtn.onclick = () => {
        close();
        if (onConfirm) onConfirm();
    };
}
window.showEliteConfirm = showEliteConfirm; // Global expose
class Particle {
    constructor(x, y, color, type = 'default') {
        this.x = x; this.y = y;
        this.type = type;
        this.size = (type === 'glitch') ? (Math.random() * 6 + 2) : (Math.random() * 4 + 2);
        this.speedX = (type === 'glitch') ? (Math.random() - 0.5) * 10 : (Math.random() - 0.5) * 2;
        
        // v1.99.35.00: MOTION SAFETY FIX (All particles move DOWN relative to camera)
        if (type === 'ember' || type === 'bubble' || type === 'leaf') {
             // Rise/Float: Move slower than water (positive but smaller speed)
             this.speedY = Math.random() * 1.5 + 0.5;
        } else {
             // Normal debris: Move with flow or faster
             this.speedY = Math.random() * 2 + 1.5;
        }

        this.life = 1.0;
        this.color = color || "rgba(255,255,255,0.6)";
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.2;
    }
    update(dt) {
        if (this.targetX !== undefined) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
                this.x += (dx / dist) * 800 * dt;
                this.y += (dy / dist) * 800 * dt;
            } else {
                this.life = 0;
            }
            return;
        }

        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.rotSpeed;

        if (this.type === 'ember') {
            this.speedX += Math.sin(performance.now() / 500) * 0.1;
            this.life -= dt * 0.3;
        } else if (this.type === 'glitch') {
            if (Math.random() < 0.1) this.x += (Math.random() - 0.5) * 20;
            this.life -= dt * 0.8;
        } else if (this.type === 'bubble' || this.type === 'leaf') {
            this.x += Math.cos(performance.now() / 200) * 0.5;
            this.life -= dt * (this.type === 'leaf' ? 0.2 : 0.4);
        } else {
            this.life -= dt * (this.type === 'default' ? 0.8 : 0.4);
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        if (this.type === 'glitch') {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else if (this.type === 'ember') {
            ctx.shadowBlur = 15; ctx.shadowColor = "#ff4500";
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}
// --- v1.99.31.00: AMBIENT ECOLOGY SYSTEM (Birds & Shadows) ---
class AmbientLife {
    constructor(type = 'bird') {
        this.type = type;
        this.life = 1.0;
        if (type === 'bird') {
            this.x = Math.random() < 0.5 ? -50 : canvas.width + 50;
            this.y = Math.random() * (canvas.height * 0.4);
            this.vx = (this.x < 0) ? (Math.random() * 2 + 2) : -(Math.random() * 2 + 2);
            this.vy = Math.random() * 1.5 + 1;
            this.size = Math.random() * 10 + 15;
            this.wingSpeed = 0.15 + Math.random() * 0.1;
        } else { // Shadow
            this.x = Math.random() * canvas.width;
            this.y = -60;
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = bgScrollSpeed / 40 + (Math.random() * 2 + 2);
            this.size = Math.random() * 20 + 30;
        }
    }
    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y > canvas.height + 100 || this.x < -100 || this.x > canvas.width + 100) {
            this.life = 0;
        }
    }
    draw(layer = 'top') {
        if (this.type === 'bird' && layer === 'top') {
            ctx.save();
            ctx.strokeStyle = "rgba(0,0,0,0.6)";
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.lineWidth = 1.8;
            ctx.lineCap = 'round';
            const wingOffset = Math.sin(performance.now() * this.wingSpeed) * (this.size * 0.7);

            // Draw Body Point
            ctx.beginPath();
            ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Draw Curved Wings
            ctx.beginPath();
            // Left Wing
            ctx.moveTo(this.x, this.y);
            ctx.quadraticCurveTo(this.x - this.size / 2, this.y - wingOffset - 5, this.x - this.size, this.y - wingOffset);
            // Right Wing
            ctx.moveTo(this.x, this.y);
            ctx.quadraticCurveTo(this.x + this.size / 2, this.y - wingOffset - 5, this.x + this.size, this.y - wingOffset);
            ctx.stroke();
            ctx.restore();
        } else if (this.type === 'shadow' && layer === 'bottom') {
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.12)";
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.size, this.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
var ambientEntities = [];


// v1.97.0.3: DYNAMİC WİNDİNG RİVER MOTORU (Büklüm Büklüm Nehir)
function getRiverShift(y) {
    return 0; // v1.99.19.09: River curvature removed for Elite precision in Lava Level.
    // v1.97: Arka plan kaymasına (bgY) bağlı sinüs dalgası
    // v1.97.1.8: SOFT SYNC (Damped oscillation)
    // Görsel 1 tam ekran boyunda (canvas.height) kendini tekrar eder
    const amplitude = canvas.width * 0.03; // v1.99.19.09: Salınım dengelendi (%5 -> %3)
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

    // v1.99.30.06: DYNAMIC START/RESUME BUTTON
    if (window.resumeScore > 0) {
        setText('start-btn', t.resumeBtn);
    } else {
        setText('start-btn', t.startBtn);
    }

    setText('resume-btn', t.resumeBtn);
    setText('quit-btn', t.quitBtn);
    if (document.getElementById('open-settings-btn-pause')) document.getElementById('open-settings-btn-pause').innerHTML = `⚙️ ${t.settingsBtn}`;

    setText('gameover-title', t.gameOver);
    // v3.31.2: Simplified Elite Score Display (RESTORED STYLES)
    if (document.getElementById('score-title-final')) {
        document.getElementById('score-title-final').innerHTML = `${t.scoreLabel} <span style="color: #fff; font-size: 32px; font-weight: 900;">${Math.floor(score)}</span>`;
    }
    if (document.getElementById('final-gold-container')) {
        document.getElementById('final-gold-container').innerHTML = `+ <span id="finalGoldValue">${goldCount}</span> ${t.goldLabel || "GOLD"}`;
    }

    setText('revive-btn', t.reviveAdBtn || t.reviveBtn);
    setText('revive-gold-btn', t.reviveGoldBtnLong || t.reviveGoldBtn);
    setText('gameover-shop-btn', t.shopBtn);
    setText('restart-btn', t.restartBtnLong || t.hardResetBtn);
    setText('quit-btn-gameover', t.returnToMenu || t.mainMenu);

    if (document.getElementById('shop-title-main')) document.getElementById('shop-title-main').innerText = t.shopTitle;
    if (document.getElementById('shop-balance-label')) document.getElementById('shop-balance-label').innerText = t.balance;
    if (document.getElementById('shop-gold-unit')) document.getElementById('shop-gold-unit').innerText = t.goldLabel || "GOLD";
    if (document.getElementById('shop-boathouse-title')) document.getElementById('shop-boathouse-title').innerText = t.boathouseTitle;

    // SHOP ITEM NAMES v149
    if (document.getElementById('shop-mag-title')) document.getElementById('shop-mag-title').innerText = t.magnetName;
    if (document.getElementById('shop-shd-title')) document.getElementById('shop-shd-title').innerText = t.shieldName;
    if (document.getElementById('shop-magma-title')) document.getElementById('shop-magma-title').innerText = t.magmaCannonName;
    if (document.getElementById('shop-weapon-title')) document.getElementById('shop-weapon-title').innerText = t.weaponName;
    if (document.getElementById('shop-void-armor-title')) document.getElementById('shop-void-armor-title').innerText = t.voidArmorName;
    if (document.getElementById('shop-gold-market-title')) document.getElementById('shop-gold-market-title').innerText = t.goldMarketTitle;

    // SHOP SMALL DESC v149
    if (document.getElementById('shop-mag-desc')) {
        document.getElementById('shop-mag-desc').innerHTML = `${t.magnetDesc} <span id="magnet-duration" style="color:#00e5ff;">0s</span><br>(${translations[currentLang].levelLabel} <span id="magnet-lvl">0</span>)`;
    }
    if (document.getElementById('shop-shd-desc')) {
        document.getElementById('shop-shd-desc').innerHTML = `${t.shieldDesc} <span id="shield-chance" style="color:#64dd17;">%0</span><br>(${translations[currentLang].levelLabel} <span id="shield-lvl">0</span>)`;
    }
    if (document.getElementById('shop-weapon-desc')) document.getElementById('shop-weapon-desc').innerText = t.weaponDesc;
    if (document.getElementById('shop-void-armor-desc')) document.getElementById('shop-void-armor-desc').innerText = t.voidArmorDesc;

    setText('ad-gold-btn', t.adGoldBtn);
    setText('shop-close-btn', t.closeBtn);

    if (document.querySelector('#settings-screen h2')) document.querySelector('#settings-screen h2').innerText = t.settingsTitle;
    if (document.getElementById('music-label-text')) document.getElementById('music-label-text').innerText = t.musicVolLabel || t.musicLabel;
    if (document.getElementById('sfx-label-text')) document.getElementById('sfx-label-text').innerText = t.sfxVolLabel || t.sfxLabel;
    if (document.getElementById('vibration-label-text')) document.getElementById('vibration-label-text').innerText = t.vibrationToggleLabel || t.vibrationLabel;
    if (document.getElementById('settings-back-btn-text')) document.getElementById('settings-back-btn-text').innerText = t.returnToMenu || "HOME";
    setText('settings-close-btn', t.settingsSaveBtn || t.saveCloseBtn);
    setText('logout-btn', t.logoutBtnLabel);

    if (document.getElementById('logout-confirm-title')) document.getElementById('logout-confirm-title').innerText = t.logoutConfirmTitleModal;
    if (document.getElementById('logout-confirm-desc')) document.getElementById('logout-confirm-desc').innerText = t.logoutConfirmDesc;
    setText('confirm-logout-btn', t.logoutYes);
    setText('cancel-logout-btn', t.cancelBtnModal);

    if (document.querySelector('#reset-confirm-overlay h2')) document.querySelector('#reset-confirm-overlay h2').innerText = t.resetConfirmTitleModal || t.resetWarning;
    if (document.querySelector('#reset-confirm-overlay p')) document.querySelector('#reset-confirm-overlay p').innerText = t.resetConfirmDesc || t.resetDesc;
    setText('confirm-reset-yes', t.resetYesAction || t.resetYes);
    setText('confirm-reset-no', t.cancelBtnModal || t.resetNo);

    if (document.getElementById('edit-username-title')) document.getElementById('edit-username-title').innerText = t.editUsernameTitle;
    if (document.getElementById('edit-username-desc')) document.getElementById('edit-username-desc').innerText = t.setEliteNameDesc;
    if (document.getElementById('player-name-input')) document.getElementById('player-name-input').placeholder = t.newUsernamePlaceholder;
    setText('save-identity-btn', t.editBtn);
    setText('close-identity-btn', t.cancelBtnModal);

    if (document.getElementById('active-goals-title')) document.getElementById('active-goals-title').innerText = t.activeGoals;
    if (document.getElementById('armor-badge-label')) document.getElementById('armor-badge-label').innerText = t.armorBadgeLabel;

    setText('spin-title', t.spinWheelTitle);
    setText('spin-close-btn', t.spinClose);
    setText('quit-btn-gameover', t.mainMenu);
    updateSpinButtonText();
}

// ARKA PLANA ALINCA SENKRONİZE ET v1.99.20.01
document.addEventListener('visibilitychange', () => {
    if (audioCtx) {
        if (document.hidden) {
            audioCtx.suspend();
            if (typeof triggerEliteEconomySync === 'function') {
                
                triggerEliteEconomySync(true); // v1.99.27.04: Leak-Proof Sync Wrapper
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
var admobInitialized = false;
var rewardedAdReady = false;
var rewardedAdLoading = false;

function getCapacitorAdMob() {
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
            return window.Capacitor.Plugins.AdMob;
        }
    } catch (e) { }
    return null;
}

// Ödül için global değişkenler
var pendingRewardCallback = null;
var adExecuted = false;

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
            
            adExecuted = true;
            // Aksiyonu Dismissed (Kapatılma) olayına saklıyoruz
        });

        // 2. Reklam Kapatıldığında
        AdMob.addListener('onRewardedVideoAdDismissed', () => {
            

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
    var countdown = 8;
    btnElem.innerText = `${t.loadingAd} (${countdown})`;

    // UI Referanslarını kaydet (Dismiss sonrası sıfırlama için) v1.78 FIX
    window.lastAdButton = btnElem;
    window.lastAdButtonText = defaultText;

    // Bağımsız Görsel Geri Sayım (Plugin'den tamamen bağımsız çalışır)
    var countdownTimer = setInterval(() => {
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
                
                await AdMob.prepareRewardVideoAd({ adId: REWARDED_AD_UNIT_ID, isTesting: false });
                rewardedAdReady = true;
            }

            if (rewardedAdReady) {
                clearInterval(countdownTimer); // Reklam hazırsa sayacı durdur
                pendingRewardCallback = callback;
                adExecuted = false;
                
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

    // v1.99.19.09: OK (CANVAS DRAWING) - Dışa taşma yapmayan mühürlü ok
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
            if (msg) msg.innerText = translations[currentLang].spinWait;

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
    var rewardLabel = reward.label;
    var popupEmoji = '🎉';
    var popupLabel = '';
    var popupValue = '';

    if (reward.type === 'gold') {
        totalGold += reward.value;
        triggerEliteEconomySync(true); // v1.99.27.00: Çark ödülü sarsılmaz mühür!
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

// v1.99.35.00: ELITE RESPONSIVE ENGINE (Centering & High DPI)
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const baseWidth = window.innerWidth > 600 ? 600 : window.innerWidth;
    
    // Internal resolution (DPR for smoothness)
    canvas.width = baseWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    
    // CSS layout size
    canvas.style.width = baseWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    
    // Scale context back to normal for easy coordinate management
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ----------------------------------------------------
// v108 - Ses Sistemi audio.js dosyasına taşındı.



const levelAssets = [
    { threshold: 0, bgKey: 'spring', speed: 200, spawn: 0.55, titleEN: translations.en.springRiver, titleTR: translations.tr.springRiver, color: "#00e5ff", pKey: "ilkbahar", margin: 0.35, visuals: { hideAmbients: false, isProcedural: false, waterColor: "rgba(0, 180, 255, 0.2)", groundColor: "#1e90ff", waterEffect: "shimmer" } }, 
    { threshold: 3000, bgKey: 'summer', speed: 220, spawn: 0.52, titleEN: translations.en.summerRiver, titleTR: translations.tr.summerRiver, color: "#1e90ff", pKey: "yaz", margin: 0.35, visuals: { hideAmbients: false, isProcedural: false, waterColor: "rgba(0, 180, 255, 0.2)", groundColor: "#1e90ff", waterEffect: "shimmer" } }, 
    { threshold: 6000, bgKey: 'autumn', speed: 230, spawn: 0.48, titleEN: translations.en.autumnRiver, titleTR: translations.tr.autumnRiver, color: "#ff8c00", pKey: "sonbahar", margin: 0.35, visuals: { hideAmbients: false, isProcedural: false, waterColor: "rgba(139, 69, 19, 0.25)", groundColor: "#cd853f", waterEffect: "shimmer" } }, 
    { threshold: 9000, bgKey: 'winter', speed: 220, spawn: 0.45, titleEN: translations.en.winterRiver, titleTR: translations.tr.winterRiver, color: "#add8e6", pKey: "kis", margin: 0.35, visuals: { hideAmbients: false, isProcedural: false, waterColor: "rgba(173, 216, 230, 0.4)", groundColor: "#b0c4de", waterEffect: "shimmer" } }, 
    { threshold: 12000, bgKey: 'lava', speed: 250, spawn: 0.85, titleEN: translations.en.lavaRiver, titleTR: translations.tr.lavaRiver, color: "#ff4500", pKey: "lava", margin: 0.34, visuals: { hideAmbients: true, isProcedural: false, waterColor: "rgba(255, 69, 0, 0.3)", groundColor: "#1a0000", waterEffect: "lava" } }, 
    { threshold: 15000, bgKey: 'void', speed: 190, spawn: 0.95, titleEN: translations.en.voidLevel, titleTR: translations.tr.voidLevel, color: "#9b59b6", pKey: "void", margin: 0.32, visuals: { hideAmbients: true, isProcedural: true, neonBorders: true, auraColor: "#9b59b6", waterColor: "rgba(0, 0, 0, 0.85)", groundColor: "#000000", waterEffect: "neonPulse" } }, 
    { threshold: 18000, bgKey: 'lagoon', speed: 310, spawn: 0.55, titleEN: translations.en.l7Title, titleTR: translations.tr.l7Title, color: "#00e5ff", pKey: "ilkbahar", margin: 0.15, visuals: { hideAmbients: true, isProcedural: false, waterColor: "rgba(0, 180, 255, 0.2)", groundColor: "#00e5ff", waterEffect: "ripples" } }, 
    { threshold: 21000, bgKey: 'cyber', speed: 340, spawn: 0.42, titleEN: "CYBER CITY", titleTR: "SİBER ŞEHİR", color: "#ff00ff", pKey: "void", margin: 0.18, scrollSpeed: 1.0, visuals: { hideAmbients: true, isProcedural: true, neonBorders: true, auraColor: "#ff00ff", riverFill: "rgba(255, 0, 255, 0.05)", groundColor: "#00050a", waterColor: "rgba(255, 0, 255, 0.1)", waterEffect: "neonPulse" } }, 
    { threshold: 24000, bgKey: 'toxic', speed: 320, spawn: 0.70, titleEN: "TOXIC WASTELAND", titleTR: "ZEHİRLİ ATIK", color: "#32CD32", pKey: "lava", margin: 0.30, scrollSpeed: 1.0, visuals: { hideAmbients: true, isProcedural: true, neonBorders: true, auraColor: "#32CD32", riverFill: "rgba(50, 205, 50, 0.08)", groundColor: "#0a1a05", waterColor: "rgba(50, 205, 50, 0.1)", waterEffect: "bubbles" } } 
];



// v1.96.6.6: Ölüm Vadisi (DZ) Durumunu Merkezi Olarak Belirle
// v1.99.19.09: Ölüm Vadisi (DZ) Tetikleyicisi - Seviye Süresinin Son %10'unda Başlar
function getDZStatus() {
    // v1.99.19.09: ELITE DYNAMIC DZ - Triggers at last 20% of CURRENT level progress
    var p = Math.floor(levelProgressTime * 5) % LOOP_THRESHOLD;

    for (var i = 0; i < levelAssets.length; i++) {
        var start = levelAssets[i].threshold;
        var end = (i < levelAssets.length - 1) ? levelAssets[i + 1].threshold : 27500;

        if (p >= start && p < end) {
            var duration = end - start;
            var dzStartPoint = end - (duration * 0.10); // v1.99.19.09: Elite DZ Threshold (Last 10%)
            return p >= dzStartPoint;
        }
    }
    return false;
}

var isTransitioningLevel = false;
var transitionTimer = 0;

// v109 - Görsel Varlıklar assets.js dosyasına taşındı.



// ----------------------------------------------------
// OYUN SİSTEMİ 
// ----------------------------------------------------
var isPlaying = false, isGameOver = false, isPaused = false;
var score = 0, goldCount = 0, lastTime = 0, levelProgressTime = 0, lastSpawnTime = 0;
var armorRegenTimer = 0; // v1.99.33.61: Magma Overlord Perk Global
// v1.99.19.09: GLOBAL STATE MAPPING (Force Window Bind)
window.obstacles = [];
window.golds = [];
window.particles = [];
window.powerups = [];
var obstacles = window.obstacles;
var golds = window.golds;
var particles = window.particles;
var powerups = window.powerups;
var currentLevel = 1;
// v1.99.19.09: Armor and Leveling
var armorCharge = 0;
var ownsArmorLicense = false;
var bgY = 0; var bgScrollSpeed = 200; window.targetLevelSpeed = 200;
var screenFlash = 0; // Seviye geçişi parlaması v132
var gameLoopRequestId = null; // v1.98.1.4: LOOP CONTROL

// --- v1.99.35.00: ELITE GLOBAL CONSTANTS ---
// STAGES_PER_BIOME and LOOP_THRESHOLD already defined in header
const MORPH_DURATION = 1500;
var isMorphing = false;
var morphTimer = 0;
 // 5 saniye Yavaş Geçiş!
var transitionAlpha = 0;
var levelUpInvuln = false; // v1.99.33.71: Geçişlerde haksız ölümü engelleme
var nextLevelAsset = null;
var previousLevelAsset = null;
var nextBgImg = null;
var parallaxFogY = 0; // Layer 3 (Foreground) scroll
var parallaxSkyY = 0; // Layer 1 (Background) scroll

var cameraZoom = 1.0;
var targetCameraZoom = 1.0;
var currentAsset = levelAssets[0];
var currentLAsset = currentAsset;


window.totalGold = 0;

var magnetLevel = 0;
var shieldLevel = 0;
var bombCount = 0;
var powerupTimer = 0;
var hasShield = false;
var ownsArmorLicense = false;
var armorCharge = 0;
var hasWeapon = false;
var lastShotTime = 0;
var bullets = [];

var currentVersion = "1.99.35.00"; // ELITE VOID SYNC

function saveGame() {
    const data = {
        gold: Number(window.totalGold || 0),
        ownedBoats: window.ownedBoats || ['spring'],
        magnet: magnetLevel,
        shield: shieldLevel,
        musicVol: isMusicVolume,
        sfxVol: isSFXVolume,
        vib: isVibrationEnabled,
        weapon: hasWeapon,
        bombs: bombCount,
        armorLicense: ownsArmorLicense,
        armorCharge: armorCharge,
        // v1.99.19.09.9: Elite Persistence (Session Restore) 💾
        sessionScore: Math.floor(score || 0),
        sessionLives: lives || 3,
        sessionProgress: levelProgressTime || 0,
        sessionLevel: currentLevel || 1
    };
    localStorage.setItem('riverEscapeSave', JSON.stringify(data));

    // v1.99.27.05: Cloud sync removed from saveGame to prevent bomb-firing leaks.
    // Cloud sync is now strictly forced ONLY on GameOver and Shop Transactions.

    updateShopUI();
}

function updateArmorUI() {
    var aBadge = document.getElementById('armor-badge');
    var aIndi = document.getElementById('armor-ui-indicator');
    var aBG = document.getElementById('armor-bg-diamond');

    if (aBadge) aBadge.innerText = armorCharge;

    if (aIndi) {
        // v1.99.19.09: Persistent visibility for licensed players
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

            // Cycle Highlighting: Glowing only on recharge cycles (multiples of 6 - Biome based)
            const isCycle = (currentLevel > 0 && (Math.floor((currentLevel - 1) / STAGES_PER_BIOME) + 1) % 6 === 0);
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

// v1.99.27.11: MASTER UNIFIED SHOP TRIGGER
function openShop() {
    const sScr = document.getElementById('shop-screen');
    const pScr = document.getElementById('pause-screen');
    const startScr = document.getElementById('start-screen');

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
        sScr.style.opacity = '1';

        // v1.99.27.11: ELITE SCROLL RESET (Fix for "Starts at River Cannon" bug)
        const sArea = sScr.querySelector('.shop-scroll-area');
        if (sArea) {
            sArea.scrollTop = 0;
            // Browser paint sync reset
            requestAnimationFrame(() => {
                sArea.scrollTop = 0;
                setTimeout(() => { sArea.scrollTop = 0; }, 50);
            });
        }

        if (typeof updateShopUI === 'function') updateShopUI();
    }
}

// v1.99.19.09: Eski updateShopUI silindi. Master sistem satır 1292'dedir.


// v1.99.19.09: THE ULTIMATE ELITE CLEANUP. Orphaned legacy blocks removed.

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
        

        // --- v1.99.30.06: MISSION HOOK ---
        if (window.MissionManager) window.MissionManager.notify('dash');
    }
}

// KLAVYE İLE DASH
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        activateDash();
    }
    // --- v1.99.36.86: ULTIMATE SYNC LEVEL SKIP (Press 'L') ---
    if ((e.key === 'l' || e.key === 'L') && !window.lastLPress) {
        window.lastLPress = true;
        setTimeout(() => { window.lastLPress = false; }, 200); // Debounce
        
        // Skip exactly 1 stage (1000 absolute units)
        const currentProgress = levelProgressTime * 5;
        const nextTarget = (Math.floor(currentProgress / 1000) + 1) * 1000 + 5;
        
        levelProgressTime = nextTarget / 5;
        score = Math.floor(nextTarget);
        
        if (typeof showToast === 'function') {
            const nextLvl = Math.floor(nextTarget / 1000) + 1;
            const bNum = Math.floor((nextLvl - 1) / STAGES_PER_BIOME) + 1;
            const sNum = ((nextLvl - 1) % STAGES_PER_BIOME) + 1;
            showToast(translations[currentLang].skipLevel.replace('{level}', bNum + "-" + sNum));
        }
    }

});

// v1.99.19.09: ELITE BUTTON LISTENERS (UNIFIED & HAPTIC)
if (eliteShopBtn) eliteShopBtn.onclick = () => {
    playHaptic('light');
    openShop();
};

if (eliteLeaderboardBtn) eliteLeaderboardBtn.onclick = () => {
    playHaptic('light');
    if (window.Leaderboard && typeof Leaderboard.show === 'function') {
        Leaderboard.show();
    }
};

if (eliteSpinBtn) eliteSpinBtn.onclick = () => {
    playHaptic('light');
    if (typeof playUIClick === 'function') playUIClick();
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

// v1.99.19.09: Çark Buton Mantığı (RECOVERY)
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
    if (typeof playUIClick === 'function') playUIClick();
    const menuScr = document.getElementById('start-screen');
    settingsScreen.classList.remove('hidden');
    settingsScreen.classList.add('active');
    if (menuScr) menuScr.classList.add('hidden'); // Menüyü gizle
    settingsScreen.style.display = 'flex';
    settingsScreen.style.zIndex = '20000'; // En üstte
});

const closeSettingsElite = () => {
    saveGame(); // Elite v1.99.19.09: Her zaman kaydet
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
if (shopBtnGameOver) shopBtnGameOver.addEventListener('click', openShop);

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
            const confirmQuit = confirm(t.confirmQuit);
            if (confirmQuit) doQuit();
        } else {
            doQuit();
        }
    };
}

// v1.99.19.09: UNIFIED SHOP CONTROLS
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
        // v1.99.19.09: Akıllı Geri Dönüş
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
if (armorIndicator) armorIndicator.addEventListener('click', openShop);

const btnMag = document.getElementById('buy-magnet-btn');
if (btnMag) btnMag.addEventListener('click', () => {
    var cost = 2000 + magnetLevel * 1000;
    if (totalGold >= cost && magnetLevel < 5) {
        if (typeof initAudio === 'function') initAudio();
        totalGold -= cost; magnetLevel++; saveGame();
        triggerEliteEconomySync(true);
        if (typeof playPowerupSound === 'function') playPowerupSound();
        setTimeout(() => { for (var i = 0; i < 3; i++) setTimeout(playCoinSound, i * 150); }, 150);
        updateShopUI();
    } else if (totalGold < cost) {
        shakeTimer = 0.4; // Sarsıntı güçlendirildi v1.96.6.3
        if (typeof playHaptic === 'function') playHaptic('light');
        showToast(translations[currentLang].noGold, false);
    }
});

const btnShd = document.getElementById('buy-shield-btn');
if (btnShd) btnShd.addEventListener('click', () => {
    var cost = 3500 + shieldLevel * 1500;
    if (totalGold >= cost && shieldLevel < 5) {
        if (typeof initAudio === 'function') initAudio();
        totalGold -= cost; shieldLevel++; saveGame();
        triggerEliteEconomySync(true);
        if (typeof playPowerupSound === 'function') playPowerupSound();
        setTimeout(() => { for (var i = 0; i < 3; i++) setTimeout(playCoinSound, i * 150); }, 150);
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
            if (typeof initAudio === 'function') initAudio();
            totalGold -= 5000;
            ownsArmorLicense = true;
            armorCharge += 3;
            saveGame();
            triggerEliteEconomySync(true);
            if (typeof playPowerupSound === 'function') playPowerupSound();
            setTimeout(() => { for (var i = 0; i < 8; i++) setTimeout(playCoinSound, i * 100); }, 150);
            showToast(t.armorActivated, true);
            updateShopUI();
        } else {
            shakeTimer = 0.4;
            if (typeof playHaptic === 'function') playHaptic('light');
            showToast(t.noGold, false);
        }
    } else {
        if (totalGold >= 500) {
            if (typeof initAudio === 'function') initAudio();
            totalGold -= 500;
            armorCharge += 3;
            saveGame();
            triggerEliteEconomySync(true);
            if (typeof playPowerupSound === 'function') playPowerupSound();
            setTimeout(() => { for (var i = 0; i < 3; i++) setTimeout(playCoinSound, i * 100); }, 150);
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
            if (typeof initAudio === 'function') initAudio();
            totalGold -= 5000;
            hasWeapon = true;
            bombCount += 15;
            saveGame();
            triggerEliteEconomySync(true);
            if (typeof playPowerupSound === 'function') playPowerupSound();
            setTimeout(() => { for (var i = 0; i < 8; i++) setTimeout(playCoinSound, i * 100); }, 150);
            showToast(t.weaponPurchased, true);
            updateShopUI();
        } else {
            shakeTimer = 0.4;
            if (typeof playHaptic === 'function') playHaptic('light');
            showToast(t.noGold, false);
        }
    }
});

// v1.99.19.09: GLOBAL SHOP FUNCTIONS (Elite Logic)
function buyMagnet() {
    var price = (magnetLevel + 1) * 1000;
    if (totalGold >= price && magnetLevel < 10) {
        totalGold -= price;
        magnetLevel++;
        playPowerupSound();
        saveGame();
        updateShopUI();
        showToast(translations[currentLang].magnetUpgraded, true);
    } else {
        showToast(translations[currentLang].noGold, false);
    }
}

function buyShield() {
    var price = (shieldLevel + 1) * 1500;
    if (totalGold >= price && shieldLevel < 10) {
        totalGold -= price;
        shieldLevel++;
        playPowerupSound();
        saveGame();
        updateShopUI();
        showToast(translations[currentLang].shieldUpgraded, true);
    } else {
        showToast(translations[currentLang].noGold, false);
    }
}

function buyWeapon() {
    if (!hasWeapon && totalGold >= 5000) {
        totalGold -= 5000;
        hasWeapon = true;
        bombCount += 15; // v1.99.27.10: Additive license bonus
        playPowerupSound();
        saveGame();
        updateShopUI();
        showToast(translations[currentLang].weaponPurchased, true);
    } else if (hasWeapon) {
        showToast(translations[currentLang].alreadyOwned, false);
    } else {
        showToast(translations[currentLang].noGold, false);
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
        const t = translations[currentLang];
        showToast(t.armorLicensePurchased, true);
    } else if (ownsArmorLicense) {
        // Geliştirme/Şarj mantığı (v1.99.19.09: Max 10)
        const t = translations[currentLang];
        if (totalGold >= 1000 && armorCharge < 10) {
            totalGold -= 1000;
            armorCharge++;
            playPowerupSound();
            saveGame();
            updateShopUI();
            showToast(t.armorCharged, true);
        } else if (armorCharge >= 10) {
            showToast(t.maxArmor, false);
        } else {
            showToast(t.noGold, false);
        }
    } else {
        showToast(translations[currentLang].noGold, false);
    }
}

function updateShopUI() {
    try {
        const t = translations[currentLang];
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

        if (mBtn) {
            if (magnetLevel >= 5) {
                mBtn.innerText = t.maxBtn;
                mBtn.disabled = true;
            } else {
                mBtn.innerText = `${t.buyBtnShort}\n${mPrice} G`;
                mBtn.disabled = (totalGold < mPrice);
            }
        }
        if (sBtn) {
            if (shieldLevel >= 5) {
                sBtn.innerText = t.maxBtn;
                sBtn.disabled = true;
            } else {
                sBtn.innerText = `${t.buyBtnShort}\n${sPrice} G`;
                sBtn.disabled = (totalGold < sPrice);
            }
        }

        // Weapon Toggle
        const buyWBtn = document.getElementById('buy-weapon-btn');
        if (buyWBtn) {
            if (hasWeapon) {
                buyWBtn.innerText = t.ownedBtn;
                buyWBtn.disabled = true;
            } else {
                buyWBtn.innerText = `${t.buyBtnShort}\n5000 G`;
                buyWBtn.disabled = (totalGold < 5000);
            }
            buyWBtn.classList.add('elite-upgrade-btn');
        }

        // Ammo Update
        const bCount = document.getElementById('shop-bomb-count');
        if (bCount) bCount.innerText = bombCount;
        
        const ammoBtn = document.getElementById('buy-ammo-btn');
        if (ammoBtn) {
            ammoBtn.innerText = `${t.buyBtnShort}\n1000 G`;
            ammoBtn.disabled = (totalGold < 1000);
        }

        const armRow = document.getElementById('shop-armor-row');
        const biomeIdxLocal = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length;
        const isVoidLevel = (currentLevel > 0 && biomeIdxLocal === 5); // 0-indexed: 5 is Void
        const buyABtn = document.getElementById('buy-armor-btn');
        const iconSpan = document.querySelector('#shop-armor-row span');

        if (armRow) {
            armRow.style.display = 'flex';
            armRow.style.opacity = isVoidLevel ? '1' : '0.4';
            armRow.style.pointerEvents = isVoidLevel ? 'auto' : 'none';
        }

        if (buyABtn) {
            buyABtn.classList.add('elite-upgrade-btn');
            if (isVoidLevel) {
                if (ownsArmorLicense) {
                    const price = 1000;
                    if (iconSpan) iconSpan.innerText = "💎";
                    buyABtn.innerText = `${t.chargeArmor.replace('{charge}', armorCharge)}\n${price} G`;
                    buyABtn.disabled = (totalGold < price || armorCharge >= 10);
                    if (document.getElementById('shop-void-armor-title')) document.getElementById('shop-void-armor-title').innerText = t.armorChargeTitle;
                } else {
                    if (iconSpan) iconSpan.innerText = "🔒";
                    buyABtn.innerText = `${t.getLicenseBtn}\n5000 G`;
                    buyABtn.disabled = (totalGold < 5000);
                }
            } else {
                if (iconSpan) iconSpan.innerText = "🔒";
                buyABtn.innerText = `${t.lockedBtn}\n(LVL 6+)`;
                buyABtn.disabled = true;
                if (document.getElementById('shop-void-armor-title')) document.getElementById('shop-void-armor-title').innerText = t.voidArmorTitleLocked;
                if (document.getElementById('shop-void-armor-desc')) document.getElementById('shop-void-armor-desc').innerText = t.voidArmorLockedDesc;
            }
        }

        // Dynamic Magma Cannon Desc
        const magmaDesc = document.getElementById('shop-magma-desc');
        if (magmaDesc) {
            magmaDesc.innerHTML = t.magmaCannonDesc.replace('{count}', `<span id="shop-bomb-count" style="color: #fff; font-weight: 800;">${bombCount}</span>`);
        }
        // Silah Lisansı Yoksa Mühimmat Satırını Gizle (v1.99.34.00)
        // BOMBA BUTONU, HUD & SHOP SYNC
        var bBadge = document.getElementById('bomb-badge');
        if (bBadge) bBadge.innerText = bombCount;
        var sBCount = document.getElementById('shop-bomb-count');
        if (sBCount) sBCount.innerText = bombCount;

        // AMMO BUY BUTTON SYNC (v1.99.34.00)
        const ammoBuyBtn = document.getElementById('buy-ammo-btn');
        if (ammoBuyBtn) {
            ammoBuyBtn.innerText = "AL\n1000 G";
            ammoBuyBtn.disabled = (totalGold < 1000);
            ammoBuyBtn.classList.add('elite-upgrade-btn');
        }

        // BOMBA BUTONU & HUD SYNC
        var bBadge = document.getElementById('bomb-badge');
        if (bBadge) bBadge.innerText = bombCount;
        var bBtn = document.getElementById('bomb-action-btn');
        if (bBtn) {
            if (hasWeapon) {
                bBtn.style.display = 'flex';
                bBtn.style.filter = (bombCount <= 0) ? "grayscale(100%) opacity(0.6)" : "none";
            } else { bBtn.style.display = 'none'; }
        }
        updateArmorUI();

        // --- v1.99.34.00: ELITE MODULAR BOAT RENDERER ---
        renderBoatShop();

    } catch (e) { console.warn("Shop UI Error:", e); }
}

function renderBoatShop() {
    const list = document.getElementById('boat-list');
    if (!list || !window.ELITE_COLLECTIONS) return;
    list.innerHTML = '';

    window.ELITE_COLLECTIONS.boats.forEach(boat => {
        const isOwned = window.ownedBoats && window.ownedBoats.includes(boat.id);
        const isActive = currentAsset && currentAsset.pKey === boat.id;

        const card = document.createElement('div');
        card.className = 'showroom-item';
        card.style.border = isActive ? '2px solid #00e5ff' : '1px solid rgba(255,255,255,0.1)';

        const perkDesc = currentLang === 'tr' ? boat.perk.descTR : boat.perk.descEN;
        const name = currentLang === 'tr' ? boat.nameTR : boat.nameEN;

        const rarityKey = 'rarity' + boat.rarity;
        const rarityText = translations[currentLang][rarityKey] || boat.rarity;

        card.innerHTML = `
            <div class="item-aura-box" style="border: 2px solid ${isActive ? '#00e5ff' : 'rgba(255,255,255,0.2)'}">
                <img src="${boat.asset}" style="width: 80%; height: 80%; object-fit: contain;">
            </div>
            <div class="showroom-info">
                <div class="showroom-title">${name} <span style="font-size: 9px; opacity: 0.5;">[${rarityText}]</span></div>
                <div class="showroom-desc" style="color: #00e5ff;">✨ ${perkDesc}</div>
            </div>
        `;

        const btn = document.createElement('button');
        btn.className = 'elite-upgrade-btn';
        
        // v1.99.34.00: Strict Gold Validation (Force window.totalGold)
        const currentGold = Number(window.totalGold || 0);
        const itemPrice = Number(boat.price || 0);
        
        if (!isOwned && currentGold < itemPrice) btn.disabled = true;

        btn.style.background = isOwned ? (isActive ? '#2ecc71' : 'rgba(255,255,255,0.1)') : 'linear-gradient(135deg, #ffd700, #ff8c00)';
        const t = translations[currentLang];
        btn.innerText = isOwned ? (isActive ? t.selectedBtn : t.selectBtn) : itemPrice + ' G';

        btn.addEventListener('click', () => {
            if (isOwned) {
                selectBoat(boat.id);
            } else {
                buyBoat(boat.id);
            }
        });

        card.appendChild(btn);
        list.appendChild(card);
    });
}

function selectBoat(id) {
    if (window.players && window.players[id]) {
        playerImg = window.players[id];
        if (currentAsset) currentAsset.pKey = id;
        
        // v1.99.34.00: Sync modular perk engine
        if (window.PerkEngine) window.PerkEngine.sync();
        
        saveGame();
        updateShopUI();
        if (typeof showToast === 'function') showToast(translations[currentLang].boatSelectedToast, true);
    }
}

function buyBoat(id) {
    const boat = window.ELITE_COLLECTIONS.boats.find(b => b.id === id);
    if (!boat) return;

    // v1.99.34.00: Strict Gold Validation (Force window.totalGold)
    const currentGold = Number(window.totalGold || 0);
    const itemPrice = Number(boat.price || 0);

    if (currentGold < itemPrice) {
        if (typeof showToast === 'function') showToast("YETERSİZ ALTIN!", false);
        return;
    }

    // [MODULAR BUY CONTROL] Force Confirm
    if (itemPrice > 0) {
        const name = currentLang === 'tr' ? boat.nameTR : boat.nameEN;
        const msg = currentLang === 'tr' 
            ? `DİKKAT: ${name} kayığını ${itemPrice} altın karşılığında satın almak istiyor musunuz?` 
            : `WARNING: Do you want to buy ${name} for ${itemPrice} gold?`;

        if (!confirm(msg)) {
            
            return;
        }
    }

    // EXECUTE PURCHASE
    window.totalGold = Number(window.totalGold) - itemPrice;
    if (!window.ownedBoats) window.ownedBoats = ['spring'];
    
    // Add if not already present
    if (!window.ownedBoats.includes(id)) {
        window.ownedBoats.push(id);
    }
    
    saveGame();
    if (typeof selectBoat === 'function') selectBoat(id);
    
    // v1.99.34.00: Immediate Cloud Sync for Boathouse
    if (window.Leaderboard && typeof window.Leaderboard.submitProgress === 'function') {
        window.Leaderboard.submitProgress();
    }
    
    updateShopUI();
    if (typeof showToast === 'function') showToast("YENİ KAYIK ALINDI!", true);
}

if (buyAmmoBtn) buyAmmoBtn.addEventListener('click', () => {
    const t = translations[currentLang];

    // v1.99.34.00: Security Check - License Required
    if (!hasWeapon) {
        showToast(t.licenseRequired || "Önce Lisans Almalısın!", false);
        shakeTimer = 0.4;
        if (typeof playHaptic === 'function') playHaptic('medium');
        return;
    }

    if (totalGold >= 1000) {
        totalGold -= 1000;
        bombCount += 10;
        saveGame();
        triggerEliteEconomySync();
        // v1.99.34.00: Elite Reload Sound
        if (typeof playPowerupSound === 'function') playPowerupSound();
        setTimeout(() => { for (var i = 0; i < 2; i++) setTimeout(playCoinSound, i * 100); }, 200);
        showToast(t.ammoPurchased || "Mühimmat Alındı! +10 💣", true);
        updateShopUI();
    } else {
        shakeTimer = 0.4;
        if (typeof playHaptic === 'function') playHaptic('light');
        showToast(t.noGold, false);
    }
});

// v1.99.34.00: ALTINLA CANLANMA (REVİVE WİTH GOLD)
if (reviveGoldBtn) reviveGoldBtn.addEventListener('click', reviveWithGold);
function reviveWithGold() {
    // v3.31.0: ELITE BALANCED ECONOMY
    const t = translations[currentLang];
    const cost = 100; // Artık 1 Reklam = 1 Canlanma bedeli (100 Altın)

    if (totalGold >= cost) {
        totalGold -= cost;
        triggerEliteEconomySync(true); // v1.99.34.00: Harcama anında sarsılmaz mühür!
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

        for (var i = 0; i < 5; i++) setTimeout(playCoinSound, i * 100);
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
    if (!isPlaying || isPaused || isGameOver || !hasWeapon) return; // v1.99.34.00 LOCKDOWN

    if (bombCount <= 0) {
        if (hasWeapon) {
            // Tıklandığında oyunu durdur (Pause)
            if (!isPaused) {
                togglePause();
            }
            // Mağazayı otomatik aç
            openShop();
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
    var key = e.key.toLowerCase();
    if (['a', 'd', 'w', 's'].includes(key) || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) keys[e.key] = true;
    if ((key === 'p' || e.key === 'escape') && isPlaying && !isGameOver) {
        togglePause();
    }
});
window.addEventListener('keyup', (e) => {
    var key = e.key.toLowerCase();
    if (['a', 'd', 'w', 's'].includes(key) || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) keys[e.key] = false;
});

var touchX = null;
var touchY = null;
var moveTouchId = null; // v1.99.34.00: MULTI-TOUCH TRACKING

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (typeof initAudio === 'function') initAudio();

    // v1.99.34.00: Akıllı Multi-Touch Sistemi
    for (var i = 0; i < e.changedTouches.length; i++) {
        var touch = e.changedTouches[i];
        var rect = canvas.getBoundingClientRect();
        var tx = touch.clientX - rect.left;
        var ty = touch.clientY - rect.top;

        // Ekranın sol %65'inden başlıyorsa ve henüz bir hareket parmağı yoksa kilitle
        if (moveTouchId === null && tx < canvas.width * 0.65) {
            moveTouchId = touch.identifier;
            touchX = tx;
            touchY = ty;

            // DOUBLE TAP DASH (Sadece yönlendirme parmağı için)
            var now = performance.now();
            if (window.lastTap && (now - window.lastTap) < 300) {
                activateDash();
            }
            window.lastTap = now;
        }
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
        var touch = e.changedTouches[i];
        if (touch.id === moveTouchId || touch.identifier === moveTouchId) {
            var rect = canvas.getBoundingClientRect();
            touchX = touch.clientX - rect.left;
            touchY = touch.clientY - rect.top;
        }
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    for (var i = 0; i < e.changedTouches.length; i++) {
        var touch = e.changedTouches[i];
        if (touch.identifier === moveTouchId) {
            moveTouchId = null;
            touchX = null;
            touchY = null;
        }
    }
});

canvas.addEventListener('touchcancel', (e) => {
    for (var i = 0; i < e.changedTouches.length; i++) {
        var touch = e.changedTouches[i];
        if (touch.identifier === moveTouchId) {
            moveTouchId = null;
            touchX = null;
            touchY = null;
        }
    }
});
canvas.addEventListener('mousedown', initAudio); // PC için güvenlik kırma


// SPAWNERLAR (Artık Yatay ve Dikey var)
// obstacles/golds/powerups moved to top for v1.99.34.00
var spawnInterval = 3.0, spawnTimer = 0; // v2.03: Başlangıçta kayaların arasını çok açtık
var goldSpawnInterval = 8.0, goldTimer = 0; // v1.99.34.00: Kıtlık ve Hardcore Ekonomi

var goldBag = [];
function fillGoldBag() {
    goldBag = [];
    for (var i = 0; i < 17; i++) goldBag.push(1);
    for (var i = 0; i < 2; i++) goldBag.push(2);
    goldBag.push(4);
    // Torbayı karıştırıyorum (Fisher-Yates Shuffle)
    for (var i = goldBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [goldBag[i], goldBag[j]] = [goldBag[j], goldBag[i]];
    }
}

function spawnPowerup() {
    const currentAsset = levelAssets[Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length];
    const sMargin = currentAsset ? currentAsset.margin : 0.35;
    const spawnY = -50;
    const riverShift = getRiverShift(spawnY);
    const riverLeft = (canvas.width * sMargin) + riverShift;
    const riverRight = (canvas.width * (1 - sMargin)) + riverShift - 40;

    var type = 'magnet';
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
    // v1.99.34.00: ELITE CORE INITIALIZATION
    const biomeIndex = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length;
    const currentAsset = levelAssets[biomeIndex];
    const isDZ = (typeof getDZStatus === 'function') ? getDZStatus() : false;
    let baseSpeed = (currentAsset ? currentAsset.speed : 200) * 1.75;
    if (isDZ) baseSpeed *= 1.7;
    const bgScrollSpeed = baseSpeed * (currentAsset && currentAsset.scrollSpeed ? currentAsset.scrollSpeed : 1.0);

    // v1.99.34.00: TOXIC HARD MODE (Index 8 - Moved from index 4)
    if (biomeIndex === 8) { 
        if (!hasWeapon) hasWeapon = true; // v1.99.34.00: Combat Support (Free Weapon for L9)
        if (levelProgressTime - lastSpawnTime < 0.4) return; // HARD MODE: 0.4s interval (Elite)
        lastSpawnTime = levelProgressTime;

        const lAsset = currentAsset;
        const pMargin = lAsset ? lAsset.margin : 0.30;
        const spawnY = -150 - (Math.random() * 150);
        const riverShift = typeof getRiverShift === 'function' ? getRiverShift(spawnY) : 0;
        const riverWidth = canvas.width * (1 - 2 * pMargin);

        // Kenarlarda doğma eğilimini artır (Confusion logic)
        const sideBias = (Math.random() < 0.6) ? (Math.random() < 0.5 ? 0.05 : 0.95) : Math.random();
        const randomX = (canvas.width * pMargin) + riverShift + (sideBias * riverWidth);
        const safeSpeed = (bgScrollSpeed || 350);

        // Variety selection (Aggressive)
        // v1.99.36.10: CLEAN L9 POOL (No Magma leak, strictly Toxic)
        var toxicType = 'toxicSerpent';
        var rand = Math.random();
        if (rand < 0.65) toxicType = 'toxicSerpent';
        else toxicType = 'toxicBarrel';

        window.obstacles.push({
            type: toxicType,
            x: randomX,
            baseRelX: randomX - riverShift,
            relativeX: randomX - riverShift,
            y: spawnY,
            width: (toxicType === 'toxicSerpent' ? 26 : (toxicType === 'toxicBarrel' ? 39 : 50)),
            height: (toxicType === 'toxicSerpent' ? 84 : (toxicType === 'toxicBarrel' ? 56 : 60)),
            speedY: (toxicType === 'toxicBarrel' ? safeSpeed * 1.5 : safeSpeed * 1.15), // v1.99.35.10: Aggressive Serpent Speed
            speedX: 0,
            time: Math.random() * 10,
            health: (toxicType === 'toxicSerpent' ? 3 : (toxicType === 'magmaSerpent' ? 2 : 1)),
            frequency: 1.5, amplitude: 65 // v1.99.34.00: Normalized snake movement
        });
        
        return;
    }

    // Güçlendirici Çıkması (v1.97 Balance: %10 -> %5)
    if (Math.random() < 0.05 && (magnetLevel > 0 || shieldLevel > 0)) {
        spawnPowerup(); return;
    }

    // v1.71: %20 daha yavaş engeller + Dinamik Assets Margins
    const currentLAsset = currentAsset;

    // v2.03 - Taşlar vs Kütükler Hız Farkı (Kütükler daha hızlı akmalı)
    // baseSpeed is already calculated at the top

    var spawnMargin = currentLAsset ? currentLAsset.margin : 0.35;
    const spawnY = -150 - (Math.random() * 150); // v1.97.2.3: Organic Y-Jitter (Breaks horizontal walls)
    const riverShift = getRiverShift(spawnY);
    const riverLeft = (canvas.width * spawnMargin) + riverShift;
    const riverRight = (canvas.width * (1 - spawnMargin)) + riverShift - 45;

    // isDZ is already calculated at the top

    // v1.99.34.00: ELITE SPAWN COOLDOWN (Anti-Cluster System)
    // v1.99.35.09: MASTER ELITE BALANCE (One Click Easier)
    var currentCooldown = isDZ ? 0.30 : 0.35; 
    if (biomeIndex === 6) currentCooldown = 0.25; // Lagoon Relaxed
    if (levelProgressTime - lastSpawnTime < currentCooldown) return;

    // Ölüm Vadisi Hız Bonusu (Elite Seviye)
    // baseSpeed scaling is already handled at the top

    // v1.99.35.09: MASTER ELITE L1 DENSITY CAP (Max 6 obstacles)
    if (biomeIndex === 0 && obstacles.length >= 6) return; // Spring

    lastSpawnTime = levelProgressTime; // Doğumu mühürle

    if (biomeIndex === 0 && obstacles.length >= 6) return; // v1.99.35.09: Master Elite Density

    // v1.99.34.00: ELITE VERTICAL SPACING GUARD (Anti-Wall System)
    for (var obs of obstacles) {
        if (Math.abs(spawnY - obs.y) < 100) return; // v1.99.35.09: MASTER ELITE GAPS
    }

    // biomeIndex, currentAsset and bgScrollSpeed are already calculated at the top

    var allowedSpecialTypes = (biomeIndex === 4 || biomeIndex === 5 || biomeIndex === 6 || biomeIndex === 7 || biomeIndex === 8) ? [] : ['rock'];

    // --- v1.99.34.00: THE ELITE CYCLE (Strict Biome Filtering) ---
    if (biomeIndex === 0) { // Spring (L1, L7, L13...)
        allowedSpecialTypes.push('hippo', 'croc', 'vertical', 'horizontal');
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
        // v1.99.34.00: ELITE VOID POOL
        allowedSpecialTypes.push('asteroid', 'asteroid', 'comet', 'fireball', 'blackHole');
        // CROC/HIPPO/LOGS ARE FORBIDDEN
    } else if (biomeIndex === 6) { // Nostalji (L7, L14...)
        allowedSpecialTypes.push('toyBalloon', 'paperPlane', 'paperPlane', 'kite');
    } else if (biomeIndex === 7) { // Cyber City (L8, L16...)
        // v1.99.34.00: NO ROCKS IN CYBER CITY - ONLY ELITE HAZARDS
        allowedSpecialTypes.push('laserGate', 'laserGate', 'cyberDrone', 'glitchStream', 'cyberSpear');
    } else if (biomeIndex === 8) { // Toxic Wasteland (L9, L17...)
        // v1.99.34.00: SPEED NORMALIZATION FIX
        // v1.99.34.00: SERPENT DOMINATION - 90% Serpent spawning weight
        allowedSpecialTypes.push('toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicSerpent', 'toxicBarrel');
    }

    // EXTRA LAYER: Ensure crocodiles/logs NEVER appear in Lava/Void/Lagoon/Cyber levels
    const isEliteLethal = (biomeIndex === 4 || biomeIndex === 5 || biomeIndex === 6 || biomeIndex === 7 || biomeIndex === 8);
    if (!isEliteLethal && currentLAsset.bgKey !== 'ilkbahar') {
        if (!allowedSpecialTypes.includes('whirlpool')) allowedSpecialTypes.push('whirlpool');
    }

    var spawnX = Math.random() * (riverRight - riverLeft) + riverLeft;
    var relSpawnX = spawnX - riverShift;

    // v1.99.34.00: ELITE ANGULAR CHAOS (Diagonal & Rotating Obstacles)
    var speedX = 0;
    var angle = 0;
    var rotationSpeed = 0;
    
    // Kütükler, kayalar ve bazı biyom engelleri açısal gelebilir (%45 şans)
    if (Math.random() < 0.45) {
        speedX = (Math.random() - 0.5) * (baseSpeed * 0.55); // Yatay savrulma
        angle = Math.random() * Math.PI * 2; // Rastgele açıyla başlar
        rotationSpeed = (Math.random() - 0.5) * 4.5; // Kendi etrafında döner
    }

    // OYUNCUYA UMUT PAYI VER (0% İHTİMALİNİ BİTİR!) v146 (Elite Drift Synced)
    var maxAttempts = 10;
    var isBlocked = true;
    var spawnGap = player.width + 75; // Kayıktan biraz daha geniş "güvenli şerit"

    // v1.99.34.00: L7 EXCLUSIVE EDGE BUFFER - Strictly exclusive to Lagoon
    const dynamicObsBuffer = (biomeIndex === 6) ? 65 : 15; // Lagoon
    const leftLimitRel = (canvas.width * spawnMargin) + dynamicObsBuffer;
    const rightLimitRel = (canvas.width * (1 - spawnMargin)) - (dynamicObsBuffer + 45);


    while (isBlocked && maxAttempts > 0) {
        isBlocked = false;
        maxAttempts--;
        for (var obs of obstacles) {
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
        // Nehir Sınırlarını Koru (Relative bazda) v1.99.34.00 FIX (Obstacle Outside River)
        if (relSpawnX < leftLimitRel) relSpawnX = leftLimitRel;
        if (relSpawnX > rightLimitRel) relSpawnX = rightLimitRel;
    }
    spawnX = relSpawnX + riverShift;
    window.lastObsRelX = relSpawnX;
    var currentSpawnChance = 0.85; // v1.99.35.03: Elite Density (was 0.45)
    if (biomeIndex === 6) currentSpawnChance = 0.90; // Lagoon
    else if (biomeIndex === 5) currentSpawnChance = 0.65; // Boşluk Yoğunluğu
    else if (biomeIndex === 7) currentSpawnChance = 0.85; // Cyber Yoğunluğu
    else if (biomeIndex === 8) currentSpawnChance = 0.95; // Toxic Yoğunluğu (v1.99.34.00 Force)

    if (Math.random() < currentSpawnChance && allowedSpecialTypes.length > 0) {
        var selectedType = allowedSpecialTypes[Math.floor(Math.random() * allowedSpecialTypes.length)];

        // v1.99.34.00: VERIFICATION LOG
        if (selectedType === 'rock') {
            // v1.99.34.00: RESTORED ROCK PUSH LOGIC
            obstacles.push({
                type: 'rock',
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY + 50,
                width: 48, height: 48,
                speedY: bgScrollSpeed, 
                speedX: speedX,
                angle: angle,
                rotationSpeed: rotationSpeed
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
            const isL4 = biomeIndex === 3; // Winter
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
            var tooClose = false;
            for (var o of obstacles) {
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
            const isL5 = biomeIndex === 4; // Lava
            if (isL5) {
                // v1.99.34.00: TRIPLE BARRAGE (Left, Center, Right)
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
            const isL6 = biomeIndex === 5; // Void
            obstacles.push({
                type: selectedType,
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY, width: 55, height: 55,
                speedY: baseSpeed * (selectedType === 'comet' ? 1.8 : 1.1) * (isL6 ? 1.25 : 1),
                speedX: 0,
                isHoming: false, // v1.99.34.00: Takipçi Mekaniği
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
            const startX = (Math.random() < 0.5) ? riverLeft - 50 : riverRight + 50;
            obstacles.push({
                type: 'slidingIce',
                x: startX,
                relativeX: startX - riverShift,
                y: spawnY, width: 80, height: 40,
                speedY: baseSpeed * 0.6,
                speedX: (Math.random() < 0.5) ? 120 : -120
            });
        } else if (selectedType === 'rock' || selectedType === 'iceBerg') {
            if (isEliteLethal) return; // v1.99.34.00: Rocks/Ice are forbidden in Elite biomes
            var isIce = selectedType === 'iceBerg';
            var rockSize = isIce ? (45 + Math.random() * 20) : (40 + Math.random() * 20);
            obstacles.push({
                type: selectedType,
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY + 50, width: rockSize, height: rockSize * 0.8,
                speedY: bgScrollSpeed * (0.95 + Math.random() * 0.1), 
                speedX: speedX,
                angle: angle,
                rotationSpeed: rotationSpeed
            });
        } else if (selectedType === 'burningPillar') {
            // v1.99.34.00: RESTORED LOST PILLAR (2-Shot Health Specific to L5)
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
            const isL7 = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length === 6; // v1.99.34.00: Lagoon Biome check
            var w = 50, h = 50, sY = baseSpeed;

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
            // v1.99.34.00: NEW MAGMA SERPENT (Sine Wave Movement)
            const sX = riverLeft + (riverRight - riverLeft) / 2;
            obstacles.push({
                type: 'magmaSerpent',
                x: sX,
                relativeX: sX - riverShift,
                baseX: sX,
                baseRelX: sX - riverShift,
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
                baseRelX: spawnX - riverShift,
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
                speedX: 0, // v1.99.34.00: Akış sabitleme
                time: 0
            });
        } else if (selectedType === 'cyberSpear') {
            // v1.99.34.00: NEON GREEN SPEAR - Targets player X at spawn
            const targetX = player.x + (player.width / 2);
            let sx = (targetX - spawnX) * 1.5;
            if (biomeIndex === 0) sx = 0; // Spring check

            obstacles.push({
                type: 'cyberSpear',
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY,
                width: 25, height: 110,
                speedY: baseSpeed * 2.1,
                speedX: sx,
                time: 0,
                rotation: Math.atan2(sx, baseSpeed * 2.1)
            });
        } else if (selectedType === 'toxicRat') {
            // v1.99.34.00: MUTATED GIANT RAT - Swims across
            const moveDir = Math.random() < 0.5 ? 1 : -1;
            const startX = (moveDir === 1) ? riverLeft - 60 : riverRight + 20;
            let sx = moveDir * 125;
            if (biomeIndex === 0) sx = 0; 

            obstacles.push({
                type: 'toxicRat',
                x: startX,
                relativeX: startX - riverShift,
                y: spawnY, width: 70, height: 45,
                speedY: baseSpeed * 0.9,
                speedX: sx,
                time: Math.random() * 10
            });
        } else if (selectedType === 'toxicBarrel') {
            // v1.99.34.00: RADIOACTIVE BARREL
            obstacles.push({
                type: 'toxicBarrel',
                x: spawnX,
                relativeX: spawnX - riverShift,
                y: spawnY + 50, width: 53, height: 73,
                speedY: bgScrollSpeed, speedX: 0
            });
        } else if (selectedType === 'toxicSerpent') {
            const targetX = spawnX; // v1.99.34.00: Prevent center-only spawning
            window.obstacles.push({
                type: 'toxicSerpent',
                x: targetX,
                baseRelX: targetX - riverShift, // v1.99.35.10: Fix S-Motion Base
                relativeX: targetX - riverShift,
                y: spawnY, width: 44, height: 140,
                speedY: bgScrollSpeed * 1.15, speedX: 0, // v1.99.35.10: Boosted flow
                time: Math.random() * 10
            });
            console.log("!!! ELITE SPAWN: TOXIC SERPENT MANIFESTED !!!");
        }
        return;
    }

    // v1.99.34.00: ELITE BIOME PURITY (No logs in Lava, Void, or Nostalgia)
    // v1.99.34.00: ELITE BIOME PURITY (No logs in Lava, Void, Nostalgia, Cyber)
    const currentBiome = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length;
    const isEliteThemeSpawn = (currentBiome === 4 || currentBiome === 5 || currentBiome === 6 || currentBiome === 7 || currentBiome === 8);
    if (isEliteThemeSpawn) return;

    // Bütün Kütükler Dikey (Vertical) Gelsin
    var logSpeedX = 0;
    var logRot = 0;
    var logRotSpeed = 0;

    // v1.99.34.00: Nizamlı Düz Akış (Straight Highway Flow)
    // Engeller artık sağa sola savrulmayacak, araba yolu gibi nizamlı ve düz gelecek.
    logSpeedX = 0;
    if (biomeIndex === 0) logSpeedX = 0; // Spring
    logRot = 0;
    logRotSpeed = 0;

    obstacles.push({
        type: 'vertical',
        x: spawnX,
        relativeX: spawnX - riverShift,
        y: spawnY + 50,
        width: 40,
        height: 55,
        speedY: baseSpeed,
        speedX: speedX, // v1.99.34.00: Elite Angular Chaos
        angle: angle,
        rotationSpeed: rotationSpeed
    });
}

function spawnGold() {
    const currentAsset = levelAssets[Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length];
    const sMargin = currentAsset ? currentAsset.margin : 0.35;
    const spawnY = -50;
    const riverShift = getRiverShift(spawnY);
    const isL7Gold = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length === 6;
    const goldBuffer = isL7Gold ? 35 : 0;
    const riverLeft = (canvas.width * sMargin) + riverShift + goldBuffer;
    const riverRight = (canvas.width * (1 - sMargin)) + riverShift - (isL7Gold ? 35 : 30);

    if (goldBag.length === 0) fillGoldBag();
    var gVal = goldBag.pop();

    var gx = Math.random() * (riverRight - riverLeft) + riverLeft;
    var gy = spawnY;
    var speed = 250;
    var gColor = "gold", gRadius = 15;

    if (gVal === 1) { gColor = "gold"; gRadius = 15; }
    else if (gVal === 5) { gColor = "#00e5ff"; gRadius = 18; }
    else if (gVal === 10) { gColor = "#ff00ff"; gRadius = 22; }

    // v1.99.34.00: NO TRAPS IN ELITE BIOMES (Lava, Void, Nostalgia, Cyber)
    // v1.99.34.00: NO TRAPS IN TOXIC WASTELAND (Biome 8)
    const eliteBiomeGold = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length;
    const isEliteForGold = (eliteBiomeGold === 4 || eliteBiomeGold === 5 || eliteBiomeGold === 6 || eliteBiomeGold === 7 || eliteBiomeGold === 8);

    if (gVal === 10 && !isEliteForGold && !(Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length === 0 && obstacles.length >= 2)) {
        // v1.99.34.00: Seviye 1'de tuzak doğmasını da kısıtladık (Kapasite koruma)
        var trapDir = Math.random() < 0.5 ? 1 : -1;
        var trapX1 = gx;
        var trapY1 = gy - 150;

        // v1.99.34.00: ELITE ANGULAR CHAOS (Trap Sync FIX)
        var speedX = 0, angle = 0, rotationSpeed = 0;
        if (Math.random() < 0.45) {
            speedX = (Math.random() - 0.5) * (speed * 0.55); 
            angle = Math.random() * Math.PI * 2;
            rotationSpeed = (Math.random() - 0.5) * 4.5;
        }

        obstacles.push({
            type: 'vertical',
            x: trapX1,
            relativeX: trapX1 - getRiverShift(trapY1),
            y: trapY1,
            width: 40,
            height: 55,
            speedY: speed,
            speedX: speedX,
            angle: angle,
            rotationSpeed: rotationSpeed
        });

        gx += trapDir * 75;
        if (gx < riverLeft + 30) gx = riverLeft + 30;
        if (gx > riverRight - 30) gx = riverRight - 30;

        var trapX2 = gx - (trapDir * 62);
        var trapY2 = gy - 250;
        obstacles.push({
            type: 'vertical',
            x: trapX2,
            relativeX: trapX2 - getRiverShift(trapY2), // v1.97.0.3: Trap Drift
            y: trapY2,
            width: 40,
            height: 55,
            speedY: speed,
            speedX: 0,
            angle: 0,
            rotationSpeed: 0
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

    // v1.99.34.00: HUD Reveal
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
    levelProgressTime = window.resumeProgressTime || 0; // v1.99.34.00: Resume fine-grained progress
    isGameOver = false;
    obstacles = []; golds = []; powerups = []; bullets = [];

    // v1.99.34.00: UNHIDE ELITE HUD & CONTROLS
    const mHud = document.getElementById('modern-hud');
    if (mHud) { mHud.classList.remove('hidden'); mHud.style.display = 'flex'; }

    const cUi = document.getElementById('controls-ui');
    if (cUi) { cUi.classList.remove('hidden'); cUi.style.display = 'flex'; }

    const lUi = document.getElementById('left-controls-ui');
    if (lUi) { lUi.classList.remove('hidden'); lUi.style.display = 'flex'; }

    player.x = canvas.width / 2 - player.width / 2;
    // v1.99.34.00: Fixed Temporal Dead Zone Error - Accessing global currentAsset correctly
    playerImg = window.players[currentAsset.pKey] || window.players.spring;

    updateLanguageUI();
    fillGoldBag();

    // Satın alınan Kalkan/Durum sıfırlama v1.99.34.00
    hasShield = false;
    isDashing = false;
    dashEnergy = MAX_DASH_ENERGY;
    updateArmorUI();

    spawnTimer = 0;
    goldTimer = 0;
    // levelProgressTime handle by resume logic above

    // Sync Assets & UI (v1.99.34.00: STAGES_PER_BIOME Aware Mapping)
    // v1.99.34.00: Use global currentAsset instead of local const shadowing
    currentAsset = levelAssets[Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length];
    bgImg = bgImgs[currentAsset.bgKey];
    // v1.99.34.00: Dinamik Kayık Sistemi (Skin Fallback) ⛵
    playerImg = window.players[currentAsset.pKey] || window.players.spring;
    bgScrollSpeed = currentAsset.speed;
    
    // v1.99.34.00: SPAWN ENGINE IGNITION (Ensures L1 has obstacles)
    isTransitioningLevel = false;
    spawnInterval = currentAsset.spawn;
    lastSpawnTime = 0;

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

// v1.99.34.00: Modern Leaderboard Connector
const lbMainBtn = document.getElementById('leaderboard-btn');
if (lbMainBtn) lbMainBtn.addEventListener('click', () => {
    const lbScr = document.getElementById('leaderboard-screen');
    const menuScr = document.getElementById('start-screen');
    if (lbScr) {
        lbScr.classList.remove('hidden');
        lbScr.classList.add('active');
        if (menuScr) menuScr.classList.add('hidden');
        lbScr.style.display = 'flex';
        // v1.99.34.00: Trigger data refresh
        if (typeof Leaderboard !== 'undefined' && typeof Leaderboard.refreshData === 'function') {
            Leaderboard.refreshData();
        }
    }
});

// v1.99.34.00: TOP RIDERS CLOSE BUTTON FIX ❌
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
    window.resumeLevel = 1; // v1.99.34.00: Reset progression on death
    window.totalGold = Number(window.totalGold || 0) + Number(goldCount || 0);
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

        if (typeof triggerEliteEconomySync === 'function') {
            triggerEliteEconomySync(true); // v1.99.34.00: Oyun bittiğinde sarsılmaz zorunlu mühür!
        }

        // v1.99.34.00: BACKGROUND LISTENER (Safe Exit Backup)
        if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.App) {
            Capacitor.Plugins.App.addListener('appStateChange', ({ isActive }) => {
                if (!isActive) {
                    
                    if (typeof triggerEliteEconomySync === 'function') triggerEliteEconomySync(true);
                }
            });
        }
    } catch (e) {
        console.error("GameOver Error:", e);
    }
}

// v1.99.34.00: GLOBAL ELITE ECONOMY SYNC (Cloud + UI + Local)
// v1.99.34.00: ELITE ECONOMY ENGINE (Cost-Optimized Batching)
let isEconomyDirty = false; // Yereldeki verinin henüz buluta işlenmediğini takip eder

window.triggerEliteEconomySync = function (force = false) {
    try {
        saveGame(); // Yıldırım hızıyla yerele kaydet (Veri kaybolmaz)
        isEconomyDirty = true;

        // 🛰️ Bulut Mühürleme Koşulu (v1.99.34.00: Lockdown Logic)
        // Sadece force=true (GameOver, Reklam, Alışveriş, Background) anlarında yaz.
        if (force) {
            if (typeof Leaderboard !== 'undefined' && Leaderboard.submitProgress) {
                
                Leaderboard.submitProgress();
                isEconomyDirty = false; // Senkronize edildi, temizlendi
            }
        } else {
            
        }

        // ✨ Ekran Parlatma (UI Sync)
        syncEliteHUD();
        if (typeof updateShopUI === 'function') updateShopUI();

        // Ana Menüdeki Altın Yazısı (Start Screen)
        const totalGoldValue = document.getElementById('totalGoldValue');
        if (totalGoldValue) totalGoldValue.innerText = window.totalGold;

        const totalGoldValueShop = document.getElementById('totalGoldValue-shop');
        if (totalGoldValueShop) totalGoldValueShop.innerText = window.totalGold;

        const totalGoldHUD = document.getElementById('goldValue-hud');
        if (totalGoldHUD) totalGoldHUD.innerText = window.totalGold;

        // v1.99.34.00: KARAKTER ÖNİZLEME GÜNCELLEME (Start Screen)
        const STAGES_PER_BIOME_MAP = 3;
        const bIdxSync = Math.floor((currentLevel - 1) / STAGES_PER_BIOME_MAP) % levelAssets.length;
        const currentLAsset = levelAssets[bIdxSync];
        const charImg = document.getElementById('char-preview-img');
        const charName = document.getElementById('char-preview-name');
        if (charImg && currentLAsset) {
            charImg.src = `assets/Kayik.png`;
            if (charName) charName.innerText = currentLang === 'tr' ? currentLAsset.titleTR : currentLAsset.titleEN;
        }

        const finalGoldValue = document.getElementById('finalGoldValue');
        if (finalGoldValue) finalGoldValue.innerText = window.totalGold;
    } catch (e) { console.warn("Economy Sync Error:", e); }
};

// v1.99.34.00: ELITE THEME ENGINE (Total Visual Shift)
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

// v1.99.34.00: ELITE HUD SYNC (Global Function)
function syncEliteHUD() {
    try {
        const langPack = translations[currentLang] || translations.en;

        if (cachedHud.lives) {
            var hearts = "";
            // v1.99.34.00: DİNAMİK KALP SİSTEMİ (Can sayısına göre kalp göster)
            for (var i = 0; i < Math.max(3, lives); i++) {
                hearts += (i < lives) ? "❤️" : "🖤";
            }
            if (cachedHud.lives.innerText !== hearts) cachedHud.lives.innerText = hearts;
        }

        if (cachedHud.sLabel) cachedHud.sLabel.innerText = langPack.scoreLabel || "SCORE:";
        if (cachedHud.gLabel) cachedHud.gLabel.innerText = langPack.goldLabel || "GOLD:";
        if (cachedHud.score) cachedHud.score.innerText = Math.max(0, Math.floor(score));
        if (cachedHud.gold) cachedHud.gold.innerText = Math.max(0, window.totalGold); // v1.99.34.00: BAKİYEYİ GÖSTER
        
        // v1.99.34.00: Correct Biome Mapping for Stage-based HUD
        if (cachedHud.progress) {
            // v1.99.34.00: ELITE PROGRESS ENGINE - Independent sync from raw time
            const absoluteProgress = levelProgressTime * 5;
            const currentVal = absoluteProgress % LOOP_THRESHOLD;
            const loopCount = Math.floor(absoluteProgress / LOOP_THRESHOLD);

            // Find current Biome
            var activeIdx = 0;
            for (var i = levelAssets.length - 1; i >= 0; i--) {
                if (currentVal >= levelAssets[i].threshold) {
                    activeIdx = i;
                    break;
                }
            }

            const biomeNum = activeIdx + 1;
            const stageNum = Math.floor((currentVal % 3000) / 1000) + 1;
            const formattedLvl = `${(loopCount * BIOME_COUNT) + biomeNum}-${stageNum}`;
            if (cachedHud.lvlName) {
                const lvlLabel = langPack.levelLabel || "LVL";
                cachedHud.lvlName.innerText = `${lvlLabel} ${formattedLvl}`;
            }

            const currentBiomeStart = levelAssets[activeIdx].threshold;
            const nextBiomeStart = (activeIdx < levelAssets.length - 1) ? levelAssets[activeIdx + 1].threshold : LOOP_THRESHOLD;
            const biomeDuration = nextBiomeStart - currentBiomeStart;
            const stageDuration = biomeDuration / STAGES_PER_BIOME;

            // Find current Stage progress
            const stageInBiomeProgress = (currentVal - currentBiomeStart) % stageDuration;
            const smoothWidth = (stageInBiomeProgress / stageDuration) * 100;

            cachedHud.progress.style.width = Math.min(100, Math.max(0, smoothWidth)).toFixed(2) + '%';

            // --- v1.99.34.00: VISUAL EVOLUTION (PRESTIGE FILTERS) ---
            // DISABLED in v1.99.36.99 to prevent color distortion/confusion in later loops
            canvas.style.filter = "none";
        }

        // v1.99.34.00: Profil Bilgisini Güncelle
        const pName = document.getElementById('player-name-val');
        if (pName && window.Leaderboard && Leaderboard.currentUser) {
            pName.innerText = Leaderboard.currentUser.displayName || "ELITE PLAYER";
        }
    } catch (e) { console.warn("HUD Sync Error:", e); }
}

// --- v1.99.34.00: ELITE PERK SYSTEM ---
function getActivePerk() {
    if (!window.ELITE_COLLECTIONS || !window.ELITE_COLLECTIONS.boats) return null;
    // v1.99.34.00: currentAsset.pKey aktif kayığın ID'idir
    const activeId = (typeof currentAsset !== 'undefined' && currentAsset) ? currentAsset.pKey : 'ilkbahar';
    return window.ELITE_COLLECTIONS.boats.find(b => b.id === activeId)?.perk || null;
}

function update(dt) {
    if (!isPlaying) return;

    // v1.99.34.00: MODULAR PERK ENGINE UPDATE
    if (window.PerkEngine) window.PerkEngine.update(dt);
    let scoreMult = (window.PerkEngine && window.PerkEngine.activePerk && window.PerkEngine.activePerk.type === 'score_boost') ? window.PerkEngine.activePerk.value : 1.0;


    // v1.99.36.86: DYNAMIC ELITE PROGRESSION (Speed-linked distance)
    levelProgressTime += dt * (bgScrollSpeed / 100); 
    const bIdx = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length;

    // --- v1.99.35.00: UNIFIED AMBIENT PARTICLE ENGINE ---
    if (isPlaying && !isPaused && Math.random() < 0.08) {
        // bIdx already defined above
        
        switch(bIdx) {
            case 2: // Autumn (Level 35-1)
                particles.push(new Particle(Math.random() * canvas.width, -20, "#ff6d00", "leaf"));
                break;
            case 4: // Lava
                particles.push(new Particle(Math.random() * canvas.width, canvas.height + 20, "#ff4500", "ember"));
                break;
            case 5: // Void
                const vColor = Math.random() > 0.5 ? "#00fbff" : "#ff00ff";
                particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, vColor, 'glitch'));
                break;
            case 6: // Lagoon
                particles.push(new Particle(Math.random() * canvas.width, canvas.height + 20, "rgba(255,255,255,0.4)", 'bubble'));
                break;
            case 7: // Cyber City
                particles.push(new Particle(Math.random() * canvas.width, -20, "#00e5ff", "glitch"));
                break;
            case 8: // Toxic Wasteland
                particles.push(new Particle(Math.random() * canvas.width, canvas.height + 20, "#32CD32", "bubble"));
                break;
        }
    }

    // v1.99.36.15: AMBIENT LIFE SPAWNER (Disabled in Toxic/Void for performance & visibility)
    if (isPlaying && !isPaused && bIdx !== 8 && bIdx !== 5) {
        if (Math.random() * (bgScrollSpeed / 200) < 0.008) ambientEntities.push(new AmbientLife('shadow'));
    }
    ambientEntities.forEach(ae => ae.update(dt));
    ambientEntities = ambientEntities.filter(ae => ae.life > 0);

    // v1.99.36.86: ELITE SPEED-SYNCED SCORING
    score += dt * (bgScrollSpeed / 20) * scoreMult;

    cameraZoom += (targetCameraZoom - cameraZoom) * 0.1;

    // --- v1.99.34.00: DYNAMIC SPEED SMOOTHING (ELITE LERP) ---
    // Hız patlamasından (450) hedef hıza (örn: 160) yumuşak geçiş sağlar.
    const tSpeed = window.targetLevelSpeed || 140;
    bgScrollSpeed += (tSpeed - bgScrollSpeed) * 0.02; // Süzülme hızı


    var totalProgressAbs = Math.floor(levelProgressTime * 5);
    var loopCount = Math.floor(totalProgressAbs / LOOP_THRESHOLD);
    var baseProgressVal = totalProgressAbs % LOOP_THRESHOLD;

    // 1. Find the current Biome Index
    var biomeIndex = 0;
    for (var i = levelAssets.length - 1; i >= 0; i--) {
        if (baseProgressVal >= levelAssets[i].threshold) {
            biomeIndex = i;
            break;
        }
    }

    // 2. Calculate Sub-Stage within that Biome
    const currentBiomeStart = levelAssets[biomeIndex].threshold;
    const nextBiomeStart = (biomeIndex < levelAssets.length - 1) ? levelAssets[biomeIndex + 1].threshold : LOOP_THRESHOLD;
    const biomeDuration = nextBiomeStart - currentBiomeStart;
    const stageDuration = biomeDuration / STAGES_PER_BIOME;
    
    var stageInBiome = Math.floor((baseProgressVal - currentBiomeStart) / stageDuration);
    if (stageInBiome >= STAGES_PER_BIOME) stageInBiome = STAGES_PER_BIOME - 1;

    // 3. Absolute Level Number (Infinite)
    var calculatedLevel = (loopCount * levelAssets.length * STAGES_PER_BIOME) + (biomeIndex * STAGES_PER_BIOME) + stageInBiome + 1;

    if (calculatedLevel > currentLevel) {
        // v1.99.33.71: Milestone reward only on actual Biome change or every level?
        // Let's give a smaller reward for stages, bigger for biomes.
        const isNewBiome = (calculatedLevel - 1) % STAGES_PER_BIOME === 0;
        score += isNewBiome ? 500 : 200;

        const lAsset = levelAssets[biomeIndex];

        // --- v1.99.30.05: START SEAMLESS MORPHING ---
        // Only trigger visual morph on Biome change to preserve performance
        currentLevel = calculatedLevel; 
        
        // v1.99.36.70: FORCE IMMEDIATE SYNC (Kill the soup)
        const forceBIdx = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length;
        const currentBIdx = Math.floor((currentLevel - 2) / STAGES_PER_BIOME) % levelAssets.length;
        const forceLAsset = levelAssets[forceBIdx];

        // Only morph if BIOME changed, not stage
        if (forceBIdx !== currentBIdx) {
            isMorphing = true;
            morphTimer = MORPH_DURATION / 1000;
            previousLevelAsset = levelAssets[currentBIdx] || currentAsset; 
            nextLevelAsset = forceLAsset;
            bgImg = bgImgs[previousLevelAsset.bgKey] || bgImgSpring;
            nextBgImg = bgImgs[forceLAsset.bgKey] || bgImgSpring;
        } else {
            isMorphing = false;
        }

        // ELITE HARDCORE SCALING: No Mercy! (With Cap)
        const loopSpeedBonus = Math.min(loopCount * 50, 150); // Cap bonus speed
        const stageSpeedBonus = stageInBiome * 12; 
        
        if (lAsset) window.targetLevelSpeed = lAsset.speed + loopSpeedBonus + stageSpeedBonus;

        // v1.98.x: Void Zırhı Kısıtlaması (Sadece Level 6 ve katlarında geçerli - Biyom bazlı)
        // Level 6 biyomu Stage 16, 17, 18'dir.
        var isArmorCycle = (Math.floor((currentLevel - 1) / STAGES_PER_BIOME) + 1) % 6 === 0;
        if (!isArmorCycle && armorCharge > 0) {
            armorCharge = 0;
            if (typeof showToast === 'function') showToast(translations[currentLang].armorDeactivated, false);
            saveGame();
            if (typeof updateArmorUI === 'function') updateArmorUI();
            if (typeof updateShopUI === 'function') updateShopUI();
        }

        // --- ADRENALİN PATLAMASI (Checkpoint Leap) ---
        bgScrollSpeed = 480; // Faster leap
        spawnInterval = lAsset.spawn * (1 - Math.min(0.65, loopCount * 0.18)); // Much more dense (was 0.4 / 0.1)

        if (currentLevel > 1) {
            if (typeof triggerVibration === 'function') triggerVibration([30, 20, 100, 50, 150]);
            for (var i = 0; i < 3; i++) setTimeout(playCoinSound, i * 150);
        }

        showLevelUp(currentLevel);
        syncEliteHUD(); // Force instant UI sync
        saveGame();
    }


    // v1.73.2 Master Init: Correct Biome Mapping for Stages
    const currentLAsset = levelAssets[biomeIndex];

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
        // v1.99.19.09: AUTO-FORWARD MOVEMENT 🚀
        // Karakter nehirde kendi kendine ilerler (Otomatik Pilot)
        const autoSpeed = 15; // Sabit akış hızı
        player.y -= autoSpeed * dt;
        // Alt sınır kontrolü (Ekranın çok dışına çıkmasın)
        if (player.y < 100) player.y = 100;

    }

    // v1.68 SCORE & GOLD TICKER (Yumuşak Geçiş)
    if (displayScore < Math.floor(score)) displayScore += Math.ceil((score - displayScore) * 0.1);
    else displayScore = Math.floor(score);

    if (displayGold < goldCount) displayGold++;
    const vGold = Number(window.totalGold || 0);
    if (displayTotalGold < vGold) displayTotalGold += Math.ceil((vGold - displayTotalGold) * 0.1);
    else displayTotalGold = vGold;

    // Dynamic Camera Zoom logic
    var targetZoom = 1.0;
    if (isPlaying && !isPaused) {
        targetZoom = 1.0 - Math.min(0.08, Math.max(0, (bgScrollSpeed - 200) * 0.0002));
    }
    targetZoom = Math.max(0.75, targetZoom); // Safety limit
    cameraZoom = (cameraZoom || 1.0); // Pre-initialization safety
    cameraZoom += (targetZoom - cameraZoom) * 0.05;

    // v1.99.31.00: SQASH & STRETCH INTERPOLATION (Global Engine)
    if (isPlaying && !isPaused) {
        if (isDashing) {
            targetScaleX = 0.72; targetScaleY = 1.38; targetSkew = 0;
        } else if (Math.abs(player.dx) > 0.05) { // Deadzone check
            targetScaleX = 0.85; targetScaleY = 1.15;
            targetSkew = (player.dx > 0 ? 0.08 : -0.08); // Reduced Skew
        } else {
            targetScaleX = 1; targetScaleY = 1; targetSkew = 0;
        }
    } else {
        targetScaleX = 1; targetScaleY = 1; targetSkew = 0;
    }
    // Smooth lerp (jöle kıvamı - Faster recovery)
    pScaleX += (targetScaleX - pScaleX) * 0.15;
    pScaleY += (targetScaleY - pScaleY) * 0.15;
    pSkew += (targetSkew - pSkew) * 0.2; // Faster tilt return



    var dx = 0;
    var dy = 0;

    if (keys.ArrowLeft || keys.a || keys.A) dx = -1;
    if (keys.ArrowRight || keys.d || keys.D) dx = 1;
    if (keys.ArrowUp || keys.w || keys.W) dy = 0; // v1.99.19.09.11: Manuel ileri gitme iptal
    if (keys.ArrowDown || keys.s || keys.S) dy = 0; // v1.99.19.09.11: Manuel geri gitme iptal

    if (touchX !== null && touchY !== null) {
        if (touchX < player.x + player.width / 2 - 15) dx = -1;
        else if (touchX > player.x + player.width / 2 + 15) dx = 1;

        // v1.99.19.09.11: Touch Y kontrolü pasifize edildi
        dy = 0;
    }

    // v1.99.19.09.11: Manuel hareket cezası kaldırıldı!
    // Skor artık sadece süreye bağlı olarak artacak, geri gitmeyecek.

    // X Ekseni Sınırları (Nehir Kanalı) - v1.97.0.3: Dinamik Büklüm Sistemi
    const pMargin = (currentLAsset && typeof currentLAsset.margin === 'number') ? currentLAsset.margin : 0.32;
    const riverShift = getRiverShift(player.y);
    // v1.99.19.09: L7 EXCLUSIVE PLAYER BUFFER - Strictly exclusive to Lagoon
    // v1.99.33.71: DYNAMIC PLAY BUFFER (Biome Based)
    const bIdxMove = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % levelAssets.length;
    const dynamicPlayBuffer = (bIdxMove === 6) ? 40 : (bIdxMove === 5 ? 8 : (bIdxMove >= 3 ? 25 : 10));
    const playRiverLeft = (canvas.width * pMargin) + riverShift + dynamicPlayBuffer;
    const playRiverRight = (canvas.width * (1 - pMargin)) + riverShift - player.width - dynamicPlayBuffer;


    // PLAYER X CLAMP: Karaya çıkışı fiziksel olarak da engelle!
    if (player.x < playRiverLeft) player.x = playRiverLeft;
    if (player.x > playRiverRight) player.x = playRiverRight;

    // KIYIYA SÜRTMÜ KONTROLÜ (Ölüm Yok, Sadece YAVAŞLATMA ve SARSINTI)
    var moveDt = dt;
    var isDZ = getDZStatus();

    if (player.x <= playRiverLeft + 1 || player.x >= playRiverRight - 1) {
        // Kıyıya sürtünce artık ÖLDÜRMÜYOR (Ölüm Bölgesi/isDZ olsa bile kaldırıldı)
        // Normal sürtünme mekaniği
        moveDt = dt * 0.4; // Sadece KAYIK yavaşlar!
    }

    // --- CHECKPOINT GEÇİŞ ZAMANLAYICISI v129 (Spawn Korumalı) ---
    if (isTransitioningLevel) {
        transitionTimer -= dt;
        spawnTimer = 0; // Seviye geçişinde engel çıkmasını engelle
        goldTimer = 0;  // Altın çıkmasını da engelle
        if (transitionTimer <= 0) {
            isTransitioningLevel = false;
            // v1.99.27.09: Sarsılmaz Hız Restorasyonu (Level 6 ve sonrası için mühürlendi)
            bgScrollSpeed = window.targetLevelSpeed || (currentLAsset ? currentLAsset.speed : 200);
        }
    }

    // v1.99.33.71: ELITE MANUAL CONTROL (No Auto-Drift for Lava) - Biome Index 4
    if (bIdxMove === 4) {
        player.relativeX = undefined; // Reset drift tracker
    }

    // --- v1.99.19.09.11: Yatay Hareket Sistemi (Fixed Horizontal) ---
    player.x += dx * player.speed * moveDt;

    // Y pozisyonunu sabitle (Kendi kendine ilerleme hissi)
    player.y = canvas.height - player.height - 100;

    // X Ekseni Sınırları (Nihai Koruma)
    if (player.x < playRiverLeft) player.x = playRiverLeft;
    if (player.x > playRiverRight) player.x = playRiverRight;

    // --- SU SIÇRATMA (PARTICLE) v1.99.33.71: Biome Aware Colors ---
    const bIdxUpdate = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % BIOME_COUNT;
    if (isPlaying && (dx !== 0 || dy !== 0 || Math.random() < 0.1)) {
        var pxL = player.x + player.width / 2 + (Math.random() - 0.5) * 20;
        var pyL = player.y + player.height - 5;
        var pColor = "rgba(255, 255, 255, 0.6)";
        if (bIdxUpdate === 3) pColor = "rgba(200, 230, 255, 0.7)"; // Winter
        else if (bIdxUpdate === 4) pColor = "rgba(255, 69, 0, 0.8)"; // Lava
        particles.push(new Particle(pxL, pyL, pColor));
    }
    // Parçacıkları güncelle ve ömrü biteni sil
    // --- KAR YAĞIŞI (SNOWFALL) v1.99.33.71 ---
    if (bIdxUpdate === 3 && Math.random() < 0.1) {
        particles.push(new Particle(Math.random() * canvas.width, -50, "rgba(255, 255, 255, 0.8)"));
    }
    // v1.99.35.00: Unified ambient block moved to top of update loop.

    particles.forEach((p, index) => {
        p.update(dt);
        if (p.life <= 0) particles.splice(index, 1);
    });

    spawnTimer += dt;
    var effectiveSpawnInterval = spawnInterval;
    // SEVİYE SONU %80 BARAJLARI: AGRESİF mod! (Ölümcül Hız) ama artık daha insaflı
    if (isDZ) {
        effectiveSpawnInterval = 0.42; // v1.99.32.05: EXTREME MODE SWARM (Kaosun Zirvesi)
    }

    if (spawnTimer >= effectiveSpawnInterval) {
        spawnObstacle();
        spawnTimer = 0;

        // Seviye içi kademeli zorlaşma (v1.99.35.09: MASTER ELITE)
        // v1.99.36.30: SAFE SPAWN ENGINE (Prevents corruption)
        var minSpawnInterval = Math.max(0.20, 0.55 - (currentLevel * 0.012)); 
        if (minSpawnInterval < 0.25) minSpawnInterval = 0.25; // Extreme Floor (Master)

        if (spawnInterval > minSpawnInterval) {
            spawnInterval -= (bIdxUpdate === 0 ? 0.04 : 0.05); // Master Elite Ramp-up
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
        // v1.99.19.09: Şampionluk yazısı kullanıcı talebiyle KALDIRILDI.
        // Oyun artık kesintisiz akmaya devam edecek.
    }



    // Kayığın Çarpışma Kutusu (Hitbox) - v1.99.32.00: DYNAMİC JUİCE SYNC
    var pw = (player.width - 8) * pScaleX;
    var ph = (player.height - 20) * pScaleY;
    var px = player.x + player.width / 2 - pw / 2;
    var py = player.y + player.height / 2 - ph / 2;

    if (powerupTimer > 0) powerupTimer -= dt;

    // Power-Uplar
    for (var i = powerups.length - 1; i >= 0; i--) {
        var p = powerups[i];
        p.y += p.speed * dt;

        // Lava Bonus collection radius (Biome 4)
        var pRadius = p.radius * (bIdxUpdate === 4 ? 1.25 : 1.0);

        if (px < p.x + pRadius && px + pw > p.x - pRadius &&
            py < p.y + pRadius && py + ph > p.y - pRadius) {
            playPowerupSound();
            if (p.type === 'magnet') powerupTimer = 3 + magnetLevel * 2;
            if (p.type === 'shield') hasShield = true;
            powerups.splice(i, 1);
            continue;
        }
    }
    powerups = powerups.filter(p => p.y < canvas.height + 50);

    // Altınlar Mıknatıs Etkisi
    for (var i = golds.length - 1; i >= 0; i--) {
        var g = golds[i];
        var cx = player.x + player.width / 2;
        var cy = player.y + player.height / 2;

        // v1.99.33.74: MODULAR MAGNET ENGINE
        var baseMagnetRange = (powerupTimer > 0) ? 400 : (bIdxUpdate === 4 ? 120 : 0);
        var magnetRange = window.PerkEngine ? window.PerkEngine.getMagnetRange(baseMagnetRange) : baseMagnetRange;

        if (magnetRange > 0) {
            var dxM = cx - g.x;
            var dyM = cy - g.y;
            var distM = Math.sqrt(dxM * dxM + dyM * dyM);
            if (distM < magnetRange) {
                var pullSpeed = (powerupTimer > 0) ? 450 : 250;
                g.x += (dxM / distM) * pullSpeed * dt;
                g.y += (dyM / distM) * pullSpeed * dt;
                if (bIdxUpdate === 4) g.relativeX = g.x - getRiverShift(g.y);
            } else {
                g.y += g.speed * dt;
                if (bIdxUpdate === 4) {
                    if (g.relativeX === undefined) g.relativeX = g.x - getRiverShift(g.y - g.speed * dt);
                    g.x = getRiverShift(g.y) + g.relativeX;
                }
            }
        } else {
            g.y += g.speed * dt;
        }

        g.angle += dt * 5;
        var gRadius = g.radius * (bIdxUpdate === 4 ? 1.3 : 1.0);

        if (px < g.x + gRadius && px + pw > g.x - gRadius &&
            py < g.y + gRadius && py + ph > g.y - gRadius) {
            triggerVibration(15); // Altın aldığında kısa titreşim
            if (typeof playCoinSound === 'function') playCoinSound();
            var collected = (g.value || 1);
            goldCount += collected;
            window.totalGold = Number(window.totalGold || 0) + Number(collected);
            score += collected * 100; // v1.199.13.0: SKOR ARTIK DEĞERLİ! (x100 Bonus)
            saveGame();

            // --- v1.99.30.06: MISSION HOOK & JUICY VFX ---
            if (window.MissionManager) window.MissionManager.notify('gold', goldCount);

            // Flying gold effect
            const gp = new Particle(g.x, g.y, "#FFD700");
            gp.targetX = 40; gp.targetY = 40; // HUD position
            particles.push(gp);

            golds.splice(i, 1);
            continue;
        }
    }
    golds = golds.filter(g => g.y < canvas.height + 50);

    // Kütükler ve Düşmanlar
    for (var i = obstacles.length - 1; i >= 0; i--) {
        var obs = obstacles[i];
        // --- CRITICAL GRAVITY RESTORATION (v1.99.33.73) ---
        var currentSpeedY = obs.speedY;
        if (isNaN(currentSpeedY) || currentSpeedY === undefined) {
             currentSpeedY = (typeof window.bgScrollSpeed !== 'undefined' ? window.bgScrollSpeed : 200);
             if (isNaN(currentSpeedY)) currentSpeedY = 200;
        }
        obs.y += currentSpeedY * dt;

        // v1.99.32.06: ELITE PHYSICS ENGINE (Diagonal & Bouncing)
        if (obs.speedX !== undefined) {
            obs.x += (obs.speedX || 0) * dt;
            obs.angle = (obs.angle || 0) + (obs.rotationSpeed || 0) * dt;
            
            // NEHİR SINIRI VE SEKMESİ (Relative bazda kontrol)
            const margin = (currentLAsset && typeof currentLAsset.margin === 'number') ? currentLAsset.margin : 0.32;
            const rShift = getRiverShift(obs.y);
            const rLeft = (canvas.width * margin) + rShift;
            const rRight = (canvas.width * (1 - margin)) + rShift - (obs.width || 40);
            
            if (obs.x < rLeft) {
                obs.x = rLeft;
                obs.speedX = Math.abs(obs.speedX || 0) * 0.9; // Sekince biraz enerji kaybet
                obs.rotationSpeed *= -1; // Ters yöne dönmeye başla
            } else if (obs.x > rRight) {
                obs.x = rRight;
                obs.speedX = -Math.abs(obs.speedX || 0) * 0.9;
                obs.rotationSpeed *= -1;
            }
        }

        // YAPAY ZEKA: Düşman Mantıkları
        if (obs.type === 'croc') {
            var cx = obs.x + obs.width / 2;
            var pxC = player.x + player.width / 2;

            // Gerçekçi S-şeklinde yüzme hareketi (Sinüs dalgası ile)
            obs.swimFactor = (obs.swimFactor || 0) + dt * 10;
            var naturalSway = Math.sin(obs.swimFactor) * 35;

            // v1.96.3: EĞER ZIKZAK TİMSAH İSE Hareket Genişliğini Artır
            if (obs.isZigZag) {
                obs.zigzagOffset = (obs.zigzagOffset || 0) + dt * 4;
                obs.speedX = Math.sin(obs.zigzagOffset) * 150; // Geniş zikzak
            } else {
                // Kayığa doğru yumuşak ve kurnazca takip et
                var diffX = pxC - cx;
                obs.speedX = (diffX > 0 ? 50 : -50) + naturalSway;
                if (Math.abs(diffX) < 15) obs.speedX = naturalSway * 0.5;
            }

            // v2.7: RIVER BOUNDARY FOR CROCS (Timsahlar karaya çıkamaz!)
            const cMargin = currentLAsset ? currentLAsset.margin : 0.35;
            const rShift = (typeof getRiverShift === 'function') ? getRiverShift(obs.y) : 0;
            const bLeft = (canvas.width * cMargin) + rShift + 10;
            const bRight = (canvas.width * (1 - cMargin)) + rShift - obs.width - 10;

            // Eğer karaya çok yaklaşırsa hızı ve konumu sınırla
            if (obs.x < bLeft) { obs.x = bLeft; if (obs.speedX < 0) obs.speedX = 0; }
            if (obs.x > bRight) { obs.x = bRight; if (obs.speedX > 0) obs.speedX = 0; }
        } else if (obs.type === 'whirlpool' || obs.type === 'leafTornado' || obs.type === 'blackHole') {
            obs.rotation += dt * (obs.type === 'blackHole' ? 120 : 300); // Görsel dönüş hızı

            if (obs.type === 'leafTornado') {
                if (bIdxUpdate === 4) { // Lava check
                    obs.relativeX = obs.baseRelX + Math.sin(performance.now() * obs.zigzagFreq) * obs.zigzagAmp;
                } else {
                    obs.x = obs.baseX + Math.sin(performance.now() * obs.zigzagFreq) * obs.zigzagAmp;
                }
            }

            // --- GİRDAP/HORTUM/KARA DELİK ÇEKİM KUVVETİ (PULL FORCE) ---
            var gx = obs.x + obs.width / 2;
            var gy = obs.y + obs.height / 2;
            var pxC = player.x + player.width / 2;
            var pyC = player.y + player.height / 2;

            var distToPlayer = Math.sqrt((pxC - gx) ** 2 + (pyC - gy) ** 2);
            var effectRadius = obs.type === 'blackHole' ? obs.pullRadius : 300;

            // Eğer oyuncu merkeze yeterince yakınsa, onu yavaşça kendine çeker
            if (distToPlayer < effectRadius && !isDashing) {
                var pullDirX = gx - pxC;
                var pullDirY = gy - pyC;
                // Merkeze yaklaştıkça çekim artar
                var pullStr = (1 - distToPlayer / effectRadius) * (obs.pullStrength || 120);
                player.x += (pullDirX / distToPlayer) * pullStr * dt;
                player.y += (pullDirY / distToPlayer) * pullStr * dt;
            }
        } else if (obs.type === 'toxicSerpent' || obs.type === 'magmaSerpent') {
            // v1.99.36.20: ELITE SMART TRACKING (Croc-Style)
            var cx = obs.x + obs.width / 2;
            var pxC = player.x + player.width / 2;
            var dx = pxC - cx;
            
            // Orantılı takip: Uzaktayken hızlı, yakındayken hassas yaklaşım
            var trackStr = (obs.type === 'magmaSerpent' ? 0.8 : 0.6); 
            if (obs.y < player.y - 20) {
                obs.speedX = dx * trackStr;
            } else {
                obs.speedX *= 0.9; // Oyuncuyu geçince yavaşla
            }

            // Yönünü kayığa bakacak şekilde hesapla (Rotation)
            // v1.99.36.25: Head-First Angular Tracking
            var headY = obs.y + obs.height; // Kafa artık en önde (altta)
            var dy = player.y - headY;
            obs.angle = Math.atan2(dy, dx) - Math.PI/2;

            // v2.7: RIVER BOUNDARY FOR SERPENTS
            const sMargin = currentLAsset ? currentLAsset.margin : 0.35;
            const sShift = (typeof getRiverShift === 'function') ? getRiverShift(obs.y) : 0;
            const sLeft = (canvas.width * sMargin) + sShift + 10;
            const sRight = (canvas.width * (1 - sMargin)) + sShift - obs.width - 10;

            if (obs.x < sLeft) { obs.x = sLeft; if (obs.speedX < 0) obs.speedX = 0; }
            if (obs.x > sRight) { obs.x = sRight; if (obs.speedX > 0) obs.speedX = 0; }
        } else if (obs.type === 'cyberSpear') {
            // v1.99.36.55: FAST CYBER TRACKING
            var cx = obs.x + obs.width / 2;
            var pxC = player.x + player.width / 2;
            var dx = pxC - cx;
            obs.speedX = dx * 0.95; // Çok hızlı takip
            obs.rotation = Math.atan2(obs.speedY || 200, dx) - Math.PI/2;
        } else if (obs.type === 'hippo') {
            // Su aygırı suyun altından gelir, oyuncuya 220px yaklaştığında aniden yüzeye çıkar!
            if (obs.isSubmerged && obs.y > player.y - 220) {
                obs.isSubmerged = false;
            }
        } else if (obs.type === 'laserGate') {
            // v1.99.36.50: ELITE LASER STATE ENGINE
            obs.timer -= dt;
            if (obs.timer <= 0) {
                if (obs.state === 'warning') {
                    obs.state = 'active';
                    obs.timer = 2.5; // 2.5 saniye aktif kalır
                } else {
                    // Aktif süre bitti, lazer söner ve engel silinir (veya tekrar uyarıya döner)
                    // Genelde engeller ekrandan çıkınca silinir, ama lazer sabit bir engeldir.
                    obs.isExpired = true; // Ekrandan çıkmadan önce silinmesi için
                }
            }
        }
        
        // --- RESTORED ELITE HITBOX BASE (v1.99.33.73 Fix) ---
        var ox = obs.x + (obs.width * 0.25);
        var oy = obs.y + (obs.height * 0.25);
        var ow = obs.width * 0.5;
        var oh = obs.height * 0.5;

        if (obs.type === 'lavaGeyser') {
            ox = obs.x + (obs.width * 0.1); 
            ow = obs.width * 0.8;
            oy = obs.y + (obs.height * 0.1);
            oh = obs.height * 0.8;
        } else if (obs.type === 'laserGate') {
            // v1.99.36.50: Full-Width Laser Hitbox
            ox = obs.x;
            ow = obs.width;
            oy = obs.y + 12;
            oh = 6; // İnce ve ölümcül lazer çizgisi
        }

        var isColliding = (px < ox + ow && px + pw > ox &&
            py < oy + oh && py + ph > oy);

        // v1.99.36.12: SYNCHRONIZED LONG-BODY COLLISION (Matches 64px height)
        if (!isColliding && (obs.type === 'toxicSerpent' || obs.type === 'magmaSerpent')) {
            var bodyOy = oy + (obs.height * 0.1); 
            var bodyOh = obs.height * 0.6; // Matches the new visual length
            isColliding = (px < ox + ow && px + pw > ox && py < bodyOy + bodyOh && py + ph > bodyOy);
        }

        if (isColliding) {

            // --- LEVEL UP GRACE PERIOD (Ölümsüzlük) ---
            if (levelUpInvuln || isDashing) continue;

            // v1.99.33.74: MODULAR GHOSTING PERK (Pixel Phantom)
            if (window.PerkEngine && window.PerkEngine.checkGhostDodge()) {
                // Glitch effect performed inside PerkEngine
                continue; // Skip the hit!
            }


            // Eğer su aygırı henüz yüzeye çıkmamışsa (su altındaysa) çarpma/sek!
            // v1.99.36.15: Toxic biome'da su aygırı hasarını tamamen devre dışı bırak (Ghost hit fix)
            if (obs.type === 'hippo' && (obs.isSubmerged || bIdx === 8)) continue;

            // v2.05: Lav Gayzeri sadece patlama anında (erupting) öldürür
            if (obs.type === 'lavaGeyser' && !obs.isDeadly) continue;

            // v1.99.19.09: Siber Lazer sadece aktifken öldürür
            if (obs.type === 'laserGate' && obs.state === 'warning') continue;

            // v1.99.19.09: Glitch Stream (Kontrol Bozulması) - Öldürmez ama yavaşlatır/saptırır
            if (obs.type === 'glitchStream') {
                player.x += (Math.random() - 0.5) * 15; // Kontrol titremesi
                continue;
            }

            // Zırh sadece kalkan Level 6 ve üstündeyse hasar bloklar, yoksa sadece roket çarpar! (v1.98 Level 6 Restriction)
            if (armorCharge > 0 && Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % BIOME_COUNT >= 5) { // Void or later
                // playCrashSound();
                armorCharge--;
                updateArmorUI();
                obstacles.splice(i, 1);
                if (window.MissionManager) window.MissionManager.notify('destroy_obstacle');
                // Patlama Efekti
                for (var p = 0; p < 15; p++) particles.push(new Particle(player.x + player.width / 2, player.y + player.height / 2, "#9b59b6"));
                if (armorCharge <= 0) showToast(translations[currentLang].armorEmpty, false);
            } else if (hasShield) {
                // Kalkan varken kırılır ve kütüğü/düşmanı imha eder
                hasShield = false;
                obstacles.splice(i, 1);
                if (window.MissionManager) window.MissionManager.notify('destroy_obstacle');
            } else {
                gameOver();
                return; // Kilitlenmeyi önler, frame'i anında sonlandırır
            }
        }
    }

    // v1.97.0.3: STRICT "ELITE" CLAMPING (Never touch walls)
    const finalPMargin = currentLAsset ? currentLAsset.margin : 0.32;
    const finalShift = getRiverShift(player.y);
    const wallSafeBuffer = 10; // v1.99.19.09: Elite 'Touch' Buffer (Reduced from 18)
    const fLeft = (canvas.width * finalPMargin) + finalShift + wallSafeBuffer;
    const fRight = (canvas.width * (1 - finalPMargin)) + finalShift - player.width - wallSafeBuffer;

    if (player.x < fLeft) player.x = fLeft;
    if (player.x > fRight) player.x = fRight;

    obstacles = obstacles.filter(obs => !obs.isExpired && obs.y < canvas.height + 50 && obs.x > -150 && obs.x < canvas.width + 150);

    // Gülleleri güncelle ve engellerle çarpıştır
    for (var i = bullets.length - 1; i >= 0; i--) {
        var b = bullets[i];
        b.y -= b.speed * dt;

        // Ekrandan çıkan gülleri sil
        if (b.y < -50) {
            bullets.splice(i, 1);
            continue;
        }

        // Engel çarpışması
        for (var j = obstacles.length - 1; j >= 0; j--) {
            var obs = obstacles[j];
            if (obs.type === 'hippo' && obs.isSubmerged) continue; // Su altındaki hipoya vurulmaz

            if (b.x < obs.x + obs.width && b.x > obs.x &&
                b.y < obs.y + obs.height && b.y > obs.y) {

                // v1.99.19.09: ELITE HEALTH SYSTEM
                if (obs.health !== undefined && obs.health > 1) {
                    obs.health--;
                    bullets.splice(i, 1);
                    // Hit Effect (Flashes white)
                    for (var p = 0; p < 5; p++) particles.push(new Particle(b.x, b.y, "#fff"));
                    shakeTimer = 0.1;
                } else {
                    obstacles.splice(j, 1);
                    bullets.splice(i, 1);
                    if (window.MissionManager) window.MissionManager.notify('destroy_obstacle');
                    shakeTimer = 0.25; // PATLAMA - EKRANI SALLA!
                }
                break;
            }
        }
    }
}

function spawnLog() {
    const bIdxAmbient = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % BIOME_COUNT;
    // v1.99.31.00: BOTTOM LAYER AMBIENTS (Shadows) - Gated for Void (Biome 5)
    if (bIdxAmbient !== 5) ambientEntities.forEach(ae => ae.draw('bottom'));
    const isHorizontal = Math.random() < 0.15; // Logların %85'i dikey gelsin (Daha nehirsel)

    // v152: LAV VE BOŞLUK SEVİYELERİNDEKİ KÜTÜKLERİ (LOGS) İPTAL ET!
    if (bIdxAmbient === 4 || bIdxAmbient === 5) return; // Lava/Void'da kuş/yaprak yok

    // ... (spawn logic continues)
}



// --- ELITE RENDERING HELPERS (OPTIMIZED) ---
function renderBackgroundLayer(bg, scrollY, alpha = 1.0) {
    if (!bg || bg.width <= 0) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    var H = Math.ceil(canvas.height) * 2;
    ctx.drawImage(bg, 0, Math.floor(scrollY), canvas.width, H);
    ctx.drawImage(bg, 0, Math.floor(scrollY) - H + 1, canvas.width, H);
    ctx.restore();
}

function drawProceduralBG(lvl, alpha = 1.0) {
    const asset = levelAssets[lvl] || levelAssets[0];
    const visuals = asset.visuals || {};
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // 0. Fill Base Ground
    ctx.fillStyle = visuals.groundColor || "#1e90ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (lvl === 5) { // Void
        for (var i = 0; i < 60; i++) {
            var seed = (i * 997) % 1000;
            var sy = (performance.now() / 6 + seed * 2) % canvas.height;
            var sx = (seed * 123) % canvas.width;
            var alphaStar = 0.3 + Math.sin(performance.now() / 350 + i) * 0.4;
            ctx.fillStyle = `rgba(255, 255, 255, ${alphaStar})`;
            ctx.beginPath(); ctx.arc(sx, sy, 1 + (i % 2), 0, Math.PI * 2); ctx.fill();
        }
    } else if (lvl === 7) { // Cyber
        ctx.strokeStyle = "rgba(255, 0, 255, 0.25)"; ctx.lineWidth = 1;
        for (var i = 0; i < 15; i++) {
            var lineY = ((performance.now() / 3 + i * (canvas.height / 15)) % canvas.height);
            ctx.beginPath(); ctx.moveTo(0, lineY); ctx.lineTo(canvas.width, lineY); ctx.stroke();
        }
    } else if (lvl === 8) { // Toxic
        for (var i = 0; i < 40; i++) {
            var bSeed = (i * 733) % 1000;
            var bx = (bSeed * 147) % canvas.width;
            var by = (performance.now() / 8 + bSeed * 3) % canvas.height;
            var bSize = 2 + (i % 5);
            ctx.fillStyle = `rgba(50, 205, 50, ${0.1 + (i % 3) * 0.1})`;
            ctx.beginPath(); ctx.arc(bx, by, bSize, 0, Math.PI * 2); ctx.fill();
        }
    } else { 
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        for (var i = 0; i < 20; i++) {
            var sSeed = (i * 443) % 1000;
            var sx = (sSeed * 197) % canvas.width;
            var sy = (performance.now() / 4 + sSeed * 5) % canvas.height;
            ctx.fillRect(sx, sy, 1, 10 + (i % 5));
        }
    }
    ctx.restore();
}

function draw(dt) {
    // v1.99.36.86: ELITE UNIFIED INDEX SYNC (No more soup)
    // 0. SANITIZE CANVAS STATE (Absolute Reset)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.filter = "none";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    const zoomPivotX = canvas.width / 2;
    const zoomPivotY = canvas.height * 0.7;
    ctx.translate(zoomPivotX, zoomPivotY);
    ctx.scale(cameraZoom, cameraZoom);
    ctx.translate(-zoomPivotX, -zoomPivotY);

    const syncBIdx = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % BIOME_COUNT;
    let syncLAsset = levelAssets[syncBIdx] || levelAssets[0];
    
    // v1.99.36.95: ELITE VISUAL SYNC (Fixes Color Soup)
    // Keep the previous asset active for water and effects until the background morph finishes.
    if (isMorphing && previousLevelAsset) {
        syncLAsset = previousLevelAsset;
    }

    // 1. KATMAN: ARKA PLAN (Texture or Procedural)
    if (isMorphing && previousLevelAsset && nextLevelAsset) {
        const oldKey = previousLevelAsset.bgKey;
        const newKey = nextLevelAsset.bgKey;
        const oldTex = bgImgs[oldKey];
        const newTex = bgImgs[newKey];
        const oldProc = previousLevelAsset.visuals.isProcedural;
        const newProc = nextLevelAsset.visuals.isProcedural;

        // Blending logic: old and new MUST draw their base color first
        if (oldTex && !oldProc) {
            ctx.save(); ctx.globalAlpha = 1.0 - transitionAlpha;
            ctx.fillStyle = previousLevelAsset.visuals.groundColor || "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            renderBackgroundLayer(oldTex, bgY, 1.0);
            ctx.restore();
        } else {
            drawProceduralBG(levelAssets.indexOf(previousLevelAsset), 1.0 - transitionAlpha);
        }

        if (newTex && !newProc) {
            ctx.save(); ctx.globalAlpha = transitionAlpha;
            ctx.fillStyle = nextLevelAsset.visuals.groundColor || "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            renderBackgroundLayer(newTex, bgY, 1.0);
            ctx.restore();
        } else {
            drawProceduralBG(levelAssets.indexOf(nextLevelAsset), transitionAlpha);
        }
    } else {
        // SINGLE LAYER MODE
        const bgKey = syncLAsset.bgKey;
        const currentBgTex = bgImgs[bgKey];
        const isProcedural = syncLAsset.visuals ? syncLAsset.visuals.isProcedural : false;

        // Ensure a solid ground is ALWAYS filled before anything else
        ctx.fillStyle = syncLAsset.visuals.groundColor || "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (currentBgTex && !isProcedural) {
            renderBackgroundLayer(currentBgTex, parallaxSkyY, 0.4);
            renderBackgroundLayer(currentBgTex, bgY, 1.0);
        } else {
            drawProceduralBG(syncBIdx, 1.0);
        }
    }

    // --- BIOME GUARD: AMBIENT ISOLATION (BOTTOM) ---
    const showAmbients = syncLAsset && syncLAsset.visuals ? !syncLAsset.visuals.hideAmbients : true;
    if (showAmbients) ambientEntities.forEach(ae => ae.draw('bottom'));

    drawProceduralWater(dt, syncLAsset);
    
    // v1.99.36.86: ELITE DYNAMIC WATER COLORS
    let waterColor = syncLAsset.visuals.waterColor || "rgba(0, 180, 255, 0.2)";
    ctx.fillStyle = waterColor; 
    const cMargin = (syncLAsset ? syncLAsset.margin : 0.35);
    const rLeft = canvas.width * cMargin;
    const rRight = canvas.width * (1 - cMargin);
    const rWidth = rRight - rLeft;
    ctx.fillRect(rLeft, 0, rWidth, canvas.height);

    // --- BIOME GUARD: NEON BOUNDARIES ---
    const drawBorders = syncLAsset && syncLAsset.visuals ? syncLAsset.visuals.neonBorders : false;
    if (drawBorders) {
        const borderColor = syncLAsset.visuals.auraColor || "#9b59b6";
        ctx.save();
        ctx.shadowBlur = 15; ctx.shadowColor = borderColor;
        ctx.strokeStyle = borderColor; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(rLeft, 0); ctx.lineTo(rLeft, canvas.height);
        ctx.moveTo(rRight, 0); ctx.lineTo(rRight, canvas.height);
        ctx.stroke();
        ctx.restore();
    }

    // --- BIOME GUARD: ATMOSPHERIC OVERLAYS ---
    if (syncBIdx === 8) {
        // v1.99.35.25: Visibility improvement (Mist opacity reduced)
        ctx.save();
        ctx.globalAlpha = 0.45; // Reduced from 0.8 to see obstacles better
        drawToxicMist();
        ctx.restore();
    }
    if (syncBIdx >= 3) {
        ctx.save();
        ctx.globalAlpha = 0.3 * (isMorphing ? (1 - transitionAlpha) : 1.0);
        for (var i = 0; i < 3; i++) {
            var fy = (parallaxFogY + i * canvas.height / 3) % canvas.height;
            var fx = Math.sin(performance.now() / 1000 + i) * 50;
            ctx.fillStyle = syncBIdx === 4 ? "rgba(255, 100, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(fx, fy, canvas.width, 150);
        }
        ctx.restore();
    }

    // YARI SAYDAM PARALLAX SİS/BULUT TABAKASI
    clouds.forEach(c => {
        // v1.99.33.71: Shadow skip for Lava/Void/Lagoon/Cyber/Toxic
        if (syncBIdx >= 4) return;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity})`;
        ctx.fill();
    });

    // v1.99.33.71: BIOME ATMOSPHERIC OVERLAYS
    if (syncBIdx === 3) { if (typeof drawFrostVignette === 'function') drawFrostVignette(); }
    if (syncBIdx === 4) {
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
        var text = (g.value === 1 || !g.value) ? "$" : g.value;
        ctx.fillText(text, 0, 0);
        ctx.restore();
    });

    obstacles.forEach(obs => {
        const tile = syncLAsset ? obsTiles[syncLAsset.bgKey] : null;

        ctx.save();
        // v1.99.32.06: DYNAMIC MATRIX ROTATION SUPPORT
        if (obs.angle) {
            ctx.translate((obs.x || 0) + (obs.width || 0) / 2, (obs.y || 0) + (obs.height || 0) / 2);
            ctx.rotate(obs.angle);
            ctx.translate(-((obs.x || 0) + (obs.width || 0) / 2), -((obs.y || 0) + (obs.height || 0) / 2));
        }

        // v2.00 UNIFIED ASSET SYSTEM (Support Individual & Grid)
        var drawSuccess = false;
        if (tile) {
            // New Individual System (Level 2+) // v2.03 Full Classic Revert
            if (tile.isIndividual) {
                // v1.99.19.09: ELITE ASSET FALLBACK (Check level tile first, then global pool)
                var img = tile[obs.type] || obsTiles[obs.type];
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
                        var tilt = obs.speedX ? (obs.speedX / 100) * 0.25 : 0; // Sağa sola kafa açısı
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
                var sx = 0, sy = 0;
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

                // v1.99.19.09: ONLY set drawSuccess if we actually drew a supported tileset type
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

                // 1. Ana Girdap (Turuncu-Altın Gradyan) - v1.99.35.00 CACHED
                if (!renderCache.leafTornado || renderCache.lastCanvasWidth !== canvas.width) {
                    var grad = ctx.createRadialGradient(0, 0, 5, 0, 0, obs.width / 2);
                    grad.addColorStop(0, "rgba(255, 109, 0, 0.45)"); // Deep Orange
                    grad.addColorStop(1, "transparent");
                    renderCache.leafTornado = grad;
                }
                ctx.fillStyle = renderCache.leafTornado;
                ctx.beginPath();
                ctx.arc(0, 0, obs.width / 2, 0, Math.PI * 2);
                ctx.fill();

                // 2. Spiral Rüzgar Çizgileri
                ctx.strokeStyle = "rgba(255, 215, 0, 0.6)"; // Gold
                ctx.lineWidth = 2;
                for (var j = 0; j < 4; j++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, (obs.width / 2.2) * (1 - j * 0.2), 0, Math.PI * 1.5);
                    ctx.stroke();
                }

                // 3. Uçuşan Yaprak Partikülleri (Procedural)
                ctx.fillStyle = "#ff6d00"; // Autumn Orange
                for (var k = 0; k < 8; k++) {
                    var angle = (performance.now() / 150 + k * 45) * Math.PI / 180;
                    var r = (obs.width / 3) + Math.sin(performance.now() / 200 + k) * 5;
                    var lx = Math.cos(angle) * r;
                    var ly = Math.sin(angle) * r;

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
                for (var j = 0; j < 3; j++) {
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
                for (var j = 0; j < 8; j++) {
                    var off = (performance.now() / 5 + j * 45) * Math.PI / 180;
                    var rx = Math.cos(off) * (obs.width / 1.2);
                    var ry = Math.sin(off) * (obs.width / 1.2);
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
                for (var a = 0; a < Math.PI * 2; a += Math.PI / 5) {
                    var r = (obs.width / 2.5) + Math.random() * 12;
                    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Craters / Shading (Elite Details)
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                for (var i = 0; i < 3; i++) {
                    var cx = (Math.random() - 0.5) * obs.width * 0.4;
                    var cy = (Math.random() - 0.5) * obs.width * 0.4;
                    var cr = Math.random() * (obs.width / 8) + 2;
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
                var tailX = -obs.speedX * 0.4;
                var tailY = -obs.speedY * 0.3;
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
                // --- v1.99.19.09: ELITE BLACK HOLE RENDERING ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                // Event Horizon (Pulsing Glow)
                var pulse = 0.85 + Math.sin(performance.now() / 200) * 0.15;
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
                for (var i = 0; i < 3; i++) {
                    ctx.rotate(Math.PI / 1.5);
                    ctx.beginPath();
                    ctx.arc(obs.width / 3, 0, obs.width / 4, 0, Math.PI);
                    ctx.stroke();
                }

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'laserGate') {
                // --- v1.99.19.09: NEON LASER BARRIER ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                if (obs.state === 'warning') {
                    // Titreyen Pembe Uyarı Işığı
                    var blink = Math.sin(performance.now() / 50) > 0 ? 0.8 : 0.2;
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
                // --- v1.99.19.09: ORBITAL CYBER DRONE ---
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
                // --- v1.99.19.09: DIGITAL GLITCH STREAM ---
                ctx.save();
                ctx.translate(obs.x, obs.y);

                // Parazit parçacıkları
                for (var i = 0; i < 5; i++) {
                    var rx = Math.random() * obs.width;
                    var ry = Math.random() * obs.height;
                    var rw = Math.random() * 40;
                    ctx.fillStyle = i % 2 === 0 ? "rgba(0, 229, 255, 0.4)" : "rgba(255, 0, 255, 0.4)";
                    ctx.fillRect(rx, ry, rw, 4);
                }

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'toxicRat') {
                // --- v1.99.19.09: ELITE MUTATED RAT (Redesign) ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                // 1. Su üstünde sülfürlü yeşil iz (Toxic Wake)
                ctx.fillStyle = "rgba(50, 205, 50, 0.2)";
                ctx.beginPath();
                ctx.arc(-obs.width / 2, 5, 10 + Math.sin(obs.time * 10) * 5, 0, Math.PI * 2);
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
                for (var i = 0; i < 15; i++) {
                    var tx = -obs.width / 2 - i * 3;
                    var ty = Math.sin(obs.time * 8 + i * 0.5) * 8;
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
                // v1.99.27.09: Simplified Barrel Design
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                // 3. Paslı Varil Gövdesi (Kavisli Silindir Formu)
                ctx.fillStyle = "#2c2c2c";
                // Ana Gövde
                ctx.beginPath();
                ctx.moveTo(-obs.width / 2 + 2, -obs.height / 2);
                ctx.quadraticCurveTo(0, -obs.height / 2 - 3, obs.width / 2 - 2, -obs.height / 2);
                ctx.lineTo(obs.width / 2, obs.height / 2);
                ctx.quadraticCurveTo(0, obs.height / 2 + 3, -obs.width / 2, obs.height / 2);
                ctx.closePath();
                ctx.fill();

                // Varil Boğumları (Ribs)
                ctx.strokeStyle = "#1a1a1a";
                ctx.lineWidth = 2;
                for (var i = -1; i <= 1; i++) {
                    ctx.beginPath();
                    var ry = i * (obs.height / 3.5);
                    ctx.moveTo(-obs.width / 2, ry);
                    ctx.quadraticCurveTo(0, ry + 2, obs.width / 2, ry);
                    ctx.stroke();
                }

                // Pas Lekeleri
                ctx.fillStyle = "#8b4513"; ctx.globalAlpha = 0.5;
                ctx.fillRect(-obs.width / 4, -obs.height / 3, 6, 12); ctx.globalAlpha = 1.0;

                // 4. İkon (Kuşak üzerinde)
                ctx.fillStyle = "#ffcc00"; ctx.fillRect(-obs.width / 2 + 2, -4, obs.width - 4, 10);

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'toxicSerpent' || obs.type === 'magmaSerpent') {
                // v1.99.36.05: REFINED ELITE SERPENT (Realistic & Small)
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                if (obs.angle) ctx.rotate(obs.angle);

                const segmentCount = 10;
                for (let i = segmentCount - 1; i >= 0; i--) {
                    const lagTime = obs.time - (i * 0.1);
                    const waveX = Math.sin(lagTime * 5.2) * (10 + i * 0.5);
                    // v1.99.36.25: Reverse Y (Kuyruk arkada kalsın)
                    const segmentY = obs.height / 2 - (i * 12); 
                    const segmentSize = (obs.width / 2) * (1 - (i / segmentCount) * 0.8);
                    
                    ctx.fillStyle = (i % 2 === 0) ? "#0a2d0a" : "#1a4d1a";
                    if (obs.type === 'magmaSerpent') ctx.fillStyle = (i % 2 === 0) ? "#4a0000" : "#8a0000";

                    ctx.beginPath();
                    ctx.arc(waveX, segmentY, segmentSize, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Head (Bottom - Front)
                const hWaveX = Math.sin(obs.time * 5.2) * 10;
                const hY = obs.height / 2;
                ctx.fillStyle = (obs.type === 'magmaSerpent') ? "#2a0000" : "#051a05";
                ctx.beginPath();
                ctx.moveTo(hWaveX, hY + 12); // Nose pointing DOWN
                ctx.lineTo(hWaveX + 12, hY);
                ctx.lineTo(hWaveX, hY - 8);
                ctx.lineTo(hWaveX - 12, hY);
                ctx.closePath();
                ctx.fill();

                // Tongue & Eyes (Front)
                if (Math.sin(performance.now() / 80) > 0.4) {
                    ctx.strokeStyle = (obs.type === 'magmaSerpent') ? "#ffff00" : "#ff3300"; 
                    ctx.lineWidth = 1.5; ctx.beginPath();
                    ctx.moveTo(hWaveX, hY + 12); ctx.lineTo(hWaveX + Math.sin(performance.now() / 40) * 4, hY + 22); ctx.stroke();
                }
                ctx.fillStyle = (obs.type === 'magmaSerpent') ? "#ffaa00" : "#39ff14"; ctx.beginPath();
                ctx.arc(hWaveX - 4, hY + 5, 2.5, 0, Math.PI * 2); ctx.arc(hWaveX + 4, hY + 5, 2.5, 0, Math.PI * 2); ctx.fill();
                
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'cyberSpear') {
                // --- v1.99.19.09: NEON GREEN ENERGY SPEAR ---
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
                // --- v1.99.19.09: NOSTALGIC TOY BALLOONS ---
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                // Balon İpi (Sallanan)
                ctx.beginPath();
                ctx.moveTo(0, obs.height / 2.5);
                ctx.bezierCurveTo(Math.sin(performance.now() / 200) * 10, obs.height / 2, -Math.sin(performance.now() / 200) * 10, obs.height * 0.8, 0, obs.height);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                ctx.stroke();

                // Balon Gövdesi (v1.99.19.09: Fixed Color Selection)
                const colors = ["#ff5252", "#448aff", "#ffeb3b", "#e040fb"];
                const colorIdx = Math.floor((obs.phase || 0) % colors.length);
                ctx.fillStyle = colors[colorIdx];
                ctx.beginPath();
                ctx.ellipse(0, 0, obs.width / 2.2, obs.height / 2.5, 0, 0, Math.PI * 2);
                ctx.fill();

                // Parlama (HighLight)
                ctx.fillStyle = "rgba(255,255,255,0.3)";
                ctx.beginPath();
                ctx.ellipse(-obs.width / 8, -obs.height / 8, obs.width / 6, obs.width / 8, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'paperPlane') {
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.rotate(Math.atan2(obs.speedY, obs.speedX) + Math.PI / 2);

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
                // --- v1.99.19.09: HIGH FLYING KITE ---
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
                for (var i = 0; i < 3; i++) {
                    ctx.lineTo(Math.sin(performance.now() / 150 + i) * 20, obs.height / 2 + (i + 1) * 25);
                }
                ctx.stroke();

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'lavaGeyser') {
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                if (obs.state === 'dormant' || obs.state === 'cooldown' || obs.state === 'warning') {
                    ctx.beginPath();
                    ctx.ellipse(0, 0, obs.width / 3, obs.height / 6, 0, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(40, 20, 10, 0.8)";
                    ctx.fill();

                    if (obs.state === 'warning') {
                        // Optimized Warning Glow (Reduced shadowBlur)
                        var pulse = 0.5 + Math.sin(performance.now() / 100) * 0.5;
                        ctx.shadowBlur = 8 * pulse;
                        ctx.shadowColor = "#ff4500";
                        ctx.strokeStyle = `rgba(255, 69, 0, ${pulse})`;
                        ctx.lineWidth = 3;
                        ctx.stroke();
                        ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
                    }
                } else if (obs.state === 'erupting') {
                    // --- v1.99.19.09 ULTRA ELITE SURPRISE ERUPTION ---
                    const grad = ctx.createLinearGradient(0, obs.height / 2, 0, -obs.height * 2.5);
                    grad.addColorStop(0, "rgba(255, 60, 0, 0.95)");
                    grad.addColorStop(0.3, "rgba(255, 165, 0, 0.9)");
                    grad.addColorStop(0.6, "rgba(255, 255, 0, 0.7)");
                    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

                    // Optimized Pillar & Sparks (v1.99.35.00)
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = "#ff4500";
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.moveTo(-obs.width / 2, obs.height / 2);
                    ctx.quadraticCurveTo(0, -obs.height * 2.2, obs.width / 2, obs.height / 2);
                    ctx.fill();

                    // Smart Particle Throttle (Reduced to 1-2 per eruption cycle)
                    if (Math.random() < 0.25) {
                        for (var k = 0; k < 2; k++) {
                            var sx = (Math.random() - 0.5) * obs.width;
                            var sy = (Math.random() - 1) * obs.height * 2;
                            particles.push(new Particle(obs.x + obs.width / 2 + sx, obs.y + obs.height / 2 + sy, "#ffaa00"));
                        }
                    }
                }
                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'burningPillar') {
                // v1.99.27.09: MAGMA SPIRE (Visual Overhaul - No More Rectangles!)
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

                // 1. Asymmetric Jagged Body (Procedural Spire)
                ctx.beginPath();
                ctx.moveTo(-obs.width * 0.4, obs.height / 2);
                ctx.lineTo(-obs.width / 2, obs.height / 3);
                ctx.lineTo(-obs.width * 0.2, -obs.height / 4);
                ctx.lineTo(0, -obs.height / 2); // Peak
                ctx.lineTo(obs.width * 0.3, -obs.height / 5);
                ctx.lineTo(obs.width / 2, obs.height / 4);
                ctx.lineTo(obs.width * 0.4, obs.height / 2);
                ctx.closePath();

                ctx.fillStyle = "#1a0f0f"; // Obsidian Black/Deep Red
                ctx.fill();

                // 2. Pulsing Magma Veins
                const pulse = 0.5 + Math.sin(performance.now() / 300) * 0.5;
                ctx.strokeStyle = `rgba(255, 69, 0, ${0.4 + pulse * 0.6})`;
                ctx.lineWidth = 2 + (pulse * 2);

                // Jagged Magma Vein 1
                ctx.beginPath();
                ctx.moveTo(-obs.width * 0.2, obs.height * 0.4);
                ctx.lineTo(0, 0);
                ctx.lineTo(-obs.width * 0.1, -obs.height * 0.3);
                ctx.stroke();

                // Jagged Magma Vein 2
                ctx.beginPath();
                ctx.moveTo(obs.width * 0.3, obs.height * 0.3);
                ctx.lineTo(obs.width * 0.15, -obs.height * 0.1);
                ctx.stroke();

                // 3. Optimized Glow Effect
                ctx.shadowBlur = 10 * pulse;
                ctx.shadowColor = "#ff4500";
                ctx.strokeStyle = `rgba(255, 69, 0, 0.8)`;
                ctx.lineWidth = 3;

                // Re-draw path for glow stroke
                ctx.beginPath();
                ctx.moveTo(-obs.width * 0.4, obs.height / 2);
                ctx.lineTo(-obs.width / 2, obs.height / 3);
                ctx.lineTo(-obs.width * 0.2, -obs.height / 4);
                ctx.lineTo(0, -obs.height / 2);
                ctx.lineTo(obs.width * 0.3, -obs.height / 5);
                ctx.lineTo(obs.width / 2, obs.height / 4);
                ctx.lineTo(obs.width * 0.4, obs.height / 2);
                ctx.closePath();
                ctx.stroke();

                // 4. Damaged Overlay
                if (obs.health < obs.maxHealth) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
                    ctx.fill();
                }

                ctx.restore();
                drawSuccess = true;
            } else if (obs.type === 'magmaSerpent') {
                // v1.99.35.20: ELITE PROCEDURAL MAGMA SERPENT
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                if (obs.angle) ctx.rotate(obs.angle);

                const currentBIdx = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % BIOME_COUNT;
                const isToxic = (currentBIdx === 8);
                const serpentGlow = isToxic ? "#39ff14" : "#ff4500";
                const serpentColor = isToxic ? "#1a4d1a" : "#331100";

                // 1. Body Segments (Firey texture)
                const segmentCount = 9;
                for (let i = segmentCount - 1; i >= 0; i--) {
                    const lagTime = (obs.time || 0) - (i * 0.14);
                    const waveX = Math.sin(lagTime * 5) * (12 + i);
                    const segmentY = -obs.height / 2 + (i * 15);
                    const segmentSize = (obs.width / 2) * (1 - (i / segmentCount) * 0.75);
                    
                    ctx.fillStyle = (i % 2 === 0) ? serpentColor : "#5a2200";
                    ctx.beginPath();
                    ctx.arc(waveX, segmentY, segmentSize, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Magma Glow
                    ctx.fillStyle = (i % 2 === 0) ? "rgba(255, 69, 0, 0.2)" : "rgba(255, 140, 0, 0.1)";
                    ctx.beginPath();
                    ctx.arc(waveX, segmentY, segmentSize * 0.7, 0, Math.PI * 2);
                    ctx.fill();
                }

                // 2. Diamond Head (Lava Style)
                const headWaveX = Math.sin(obs.time * 5) * 12;
                const headY = -obs.height / 2;
                ctx.fillStyle = "#220800";
                ctx.beginPath();
                ctx.moveTo(headWaveX, headY - 18);
                ctx.lineTo(headWaveX + 20, headY);
                ctx.lineTo(headWaveX, headY + 12);
                ctx.lineTo(headWaveX - 20, headY);
                ctx.closePath();
                ctx.fill();

                // 3. Fire Tongue
                if (Math.sin(performance.now() / 100) > 0.5) {
                    ctx.strokeStyle = "#ffff00";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(headWaveX, headY - 18);
                    ctx.lineTo(headWaveX + Math.sin(performance.now() / 40) * 5, headY - 30);
                    ctx.stroke();
                }

                // 4. Glowing Eyes
                ctx.fillStyle = "#ffffff";
                ctx.shadowBlur = 15; ctx.shadowColor = "#ff4500";
                ctx.beginPath();
                ctx.arc(headWaveX - 7, headY - 8, 4, 0, Math.PI * 2);
                ctx.arc(headWaveX + 7, headY - 8, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.restore();
                drawSuccess = true;
            }
        }
        ctx.restore(); // v1.99.32.07: ELITE MATRIX BALANCE
    });

    // --- PARÇACIKLARIN (Particles) ÇİZİMİ v126 ---
    particles.forEach(p => p.draw());

    // v1.99.33.71: Armor Aura (Requires Biome 5 - Void or later)
    const bIdxArmor = syncBIdx;
    if (armorCharge > 0 && bIdxArmor >= 5) {
        ctx.save();
        var cx = player.x + player.width / 2;
        var pulse = Math.sin(performance.now() / 150) * 3; // İleri-geri motor nefes efekti

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

    // --- BIOME GUARD: COSMIC AURA ---
    const auraColor = currentLAsset && currentLAsset.visuals ? currentLAsset.visuals.auraColor : null;
    if (auraColor) {
        ctx.save();
        ctx.shadowBlur = 20 + Math.sin(performance.now() / 150) * 10;
        ctx.shadowColor = auraColor;
        ctx.strokeStyle = auraColor + "80"; // 50% opacity
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.8, player.height * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = auraColor + "B3"; // 70% opacity
        for (var i = 0; i < 4; i++) {
            var auraAngle = (performance.now() / 250) + (i * Math.PI / 2);
            var pxX = player.x + player.width / 2 + Math.cos(auraAngle) * (player.width * 0.82);
            var pyY = player.y + player.height / 2 + Math.sin(auraAngle) * (player.height * 0.62);
            ctx.beginPath();
            ctx.arc(pxX, pyY, 3, 0, Math.PI * 2); 
            ctx.fill();
        }
        ctx.restore();
    }

    // v1.99.19.09: UNSTOPPABLE SPRITE ENGINE ⛵
    const bIdxDraw = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % BIOME_COUNT;
    var activePlayerImg = playerImg || iPI;
    var isImgReady = activePlayerImg && (activePlayerImg.tagName === 'CANVAS' || activePlayerImg.complete);

    // v1.99.31.00: TOP LAYER AMBIENTS (Birds) - Gated by Biome Guard
    if (showAmbients) ambientEntities.forEach(ae => ae.draw('top'));

    // Initialize global renderCache
    window.renderCache = window.renderCache || {};

    if (isImgReady) {
        ctx.save();
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

        // v1.99.35.00: GELİR TAKİBİ (Revenue Tracker)
        ctx.scale(pScaleX, (pScaleY || 1.0));
        ctx.rotate(pSkew);

        if (isDashing) {
            // Dash visual flare
            ctx.drawImage(activePlayerImg, -player.width / 2, -player.height / 2, player.width, player.height);
            ctx.globalAlpha = 0.3;
            ctx.drawImage(activePlayerImg, -player.width / 2, -player.height / 2 + 30, player.width, player.height);
        } else {
            ctx.drawImage(activePlayerImg, -player.width / 2, -player.height / 2, player.width, player.height);
        }
        ctx.restore();
    } else {
        // EMERGENCY FALLBACK: Draw a brown boat silhouette if image is missing
        ctx.save();
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        ctx.scale(pScaleX, (pScaleY || 1.0));
        ctx.rotate(pSkew);
        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.ellipse(0, 0, player.width / 2, player.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#5D2E0C";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }



    // v1.99.31.00: TOP LAYER AMBIENTS (Birds)
    ambientEntities.forEach(ae => ae.draw('top'));

    // v1.97.0.2: Haze wrap-up
    if (typeof endHeatHaze === 'function') endHeatHaze();

    ctx.restore(); // END DYNAMİC CAMERA 📷

    // v1.99.19.09: ELITE DEATH ZONE WARNING (Centralized & Aggressive)
    if (getDZStatus()) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const phase = performance.now() / 150;
        const alpha = 0.4 + Math.sin(phase) * 0.4;

        // DANGER VIGNETTE (Elite Atmosphere)
        var grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.height / 0.8);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, `rgba(255, 0, 0, ${alpha * 0.4})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        var coreGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
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
function drawProceduralWater(dt, overrideAsset = null) {
    const syncBIdx = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % BIOME_COUNT;
    const lAsset = overrideAsset || levelAssets[syncBIdx];
    const margin = (lAsset ? lAsset.margin : 0.35);
    const rLeft = canvas.width * margin;
    const rRight = canvas.width * (1 - margin);
    const rWidth = rRight - rLeft;
    const wColor = lAsset ? lAsset.color : "#00e5ff";
    const effect = (lAsset && lAsset.visuals) ? lAsset.visuals.waterEffect : "shimmer";

    ctx.save();
    if (effect === "shimmer") {
        ctx.strokeStyle = wColor;
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 1;
        for (var i = 0; i < 10; i++) {
            var waveY = ((performance.now() / 25) + (i * canvas.height / 10)) % canvas.height;
            ctx.beginPath();
            ctx.moveTo(rLeft, waveY); ctx.lineTo(rRight, waveY);
            ctx.stroke();
        }
    } else if (effect === "lava") {
        ctx.globalAlpha = 0.35;
        for (var i = 0; i < 6; i++) {
            var ly = (performance.now() / 8 + i * 150) % canvas.height;
            var sizzle = Math.sin(performance.now() / 200 + i) * 15;
            var grad = ctx.createLinearGradient(rLeft, ly, rRight, ly);
            grad.addColorStop(0, "rgba(255, 69, 0, 0)");
            grad.addColorStop(0.5, "rgba(255, 140, 0, 0.6)");
            grad.addColorStop(1, "rgba(255, 69, 0, 0)");
            ctx.fillStyle = grad;
            ctx.fillRect(rLeft + sizzle, ly, rRight - rLeft, 25);
        }
    } else if (effect === "neonPulse") {
        ctx.strokeStyle = wColor;
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 2;
        for (var i = 0; i < 8; i++) {
            var ny = (performance.now() / 12 + i * (canvas.height / 8)) % canvas.height;
            ctx.beginPath();
            ctx.moveTo(rLeft, ny); ctx.lineTo(rRight, ny);
            ctx.stroke();
        }
    } else if (effect === "ripples") {
        ctx.strokeStyle = "#00e5ff";
        ctx.globalAlpha = 0.2;
        for (var i = 0; i < 5; i++) {
            var ry = (performance.now() / 20 + i * 200) % canvas.height;
            ctx.beginPath();
            ctx.moveTo(rLeft, ry);
            ctx.bezierCurveTo(rLeft + rWidth/3, ry + 20, rLeft + 2*rWidth/3, ry - 20, rRight, ry);
            ctx.stroke();
        }
    } else if (effect === "bubbles") {
        ctx.fillStyle = "rgba(57, 255, 20, 0.15)";
        for (var i = 0; i < 8; i++) {
            var bx = rLeft + (Math.sin(performance.now() / 500 + i) * 0.5 + 0.5) * rWidth;
            var by = (performance.now() / 10 + i * 150) % canvas.height;
            var bSize = 5 + Math.sin(performance.now() / 200 + i) * 3;
            ctx.beginPath();
            ctx.arc(bx, by, bSize, 0, Math.PI * 2);
            ctx.fill();
        }
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

    var dt = (timestamp - lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    lastTime = timestamp;

    // v1.96.6.3: Akıllı Ambiyans Yönetimi 
    if (shakeTimer > 0) shakeTimer -= dt;

    // --- v1.99.30.05: ELITE OVERHAUL (Morphing & Parallax Update) ---
    if (isMorphing) {
        morphTimer -= dt;
        transitionAlpha = 1 - (morphTimer / MORPH_DURATION);
        if (morphTimer <= 0) {
            isMorphing = false;
            transitionAlpha = 0;
            // Morph bittiğinde asıl görselleri mühürle
            if (nextLevelAsset) {
                bgImg = bgImgs[nextLevelAsset.bgKey] || bgImgLava;
                playerImg = players[nextLevelAsset.pKey] || players.ilkbahar;
            }
        }
    }

    // v1.96.6.3: Menülerde akışı tamamen durdur (Kullanıcı tercihi)
    var ambientSpeed = (isPlaying && !isPaused) ? bgScrollSpeed : 0;
    bgY += ambientSpeed * dt;
    parallaxSkyY += (ambientSpeed * 0.2) * dt; // Layer 1 (Uzak)
    parallaxFogY += (ambientSpeed * 1.5) * dt; // Layer 3 (Yakın)

    var totalBgHeight = Math.ceil(canvas.height) * 2;
    if (bgY >= totalBgHeight) bgY -= totalBgHeight;
    if (parallaxSkyY >= totalBgHeight) parallaxSkyY -= totalBgHeight;
    if (parallaxFogY >= totalBgHeight) parallaxFogY -= totalBgHeight;


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

// v1.99.27.07: MASTER ZERO-LAG MENU TRANSITION
function goToMainMenu() {
    

    // v1.99.30.06: ELITE SESSION SUSPEND (Do not reset if voluntary exit)
    if (!isGameOver) {
        window.resumeLevel = currentLevel;
        window.resumeScore = score;
        window.resumeLives = lives;
        window.resumeProgressTime = levelProgressTime;
    } else {
        // Only reset if actually died
        window.resumeLevel = 1;
        window.resumeScore = 0;
        window.resumeLives = 3 + (window.extraLives || 0);
        window.resumeProgressTime = 0;
    }

    // 1. Oyun ve Döngü Mühürlerini Durdur
    isPaused = false;
    isPlaying = false;
    isGameOver = false;
    if (gameLoopRequestId) cancelAnimationFrame(gameLoopRequestId);
    if (typeof stopAllAudio === 'function') stopAllAudio();

    // 2. Tüm UI Katmanlarını Sarsılmaz Bir Kararlılıkla Temizle
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

    // 3. Ana Menü Logosu ve Düğmelerini Mühürle
    if (startScreen) {
        startScreen.classList.remove('hidden');
        startScreen.classList.add('active');
        startScreen.style.display = 'flex';
        startScreen.style.opacity = '1';

        // v1.99.33.61: Restore Missing Buttons
        const btnsToShow = ['start-btn', 'open-shop-btn', 'leaderboard-btn', 'spin-btn', 'open-settings-btn', 'mission-panel'];
        btnsToShow.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // If it's the action row buttons, use flex, otherwise block
                el.style.display = (id === 'mission-panel') ? 'block' : 'flex';
            }
        });
        
        // v1.99.33.74: Final UI Sync for Missions upon menu entry
        if (window.MissionManager) window.MissionManager.renderMissions();
    }

    // 4. HUD ve Kontrolleri Sarsılmaz Bir Hızla Gizle
    const hud = document.getElementById('modern-hud');
    const controls = document.getElementById('controls-ui');
    const pauseBtnEl = document.getElementById('pause-btn');
    if (hud) hud.style.display = 'none';
    if (controls) controls.style.display = 'none';
    if (pauseBtnEl) pauseBtnEl.style.display = 'none';

    // 5. Durumu Kaydet ve Hazırla
    saveGame();
}

if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
if (resumeBtn) resumeBtn.addEventListener('click', togglePause);

if (quitBtn) quitBtn.onclick = () => {
    // v1.99.27.07: Unified Speed Transition
    goToMainMenu();
};

const qbg = document.getElementById('quit-btn-gameover');
if (qbg) qbg.onclick = () => {
    // v1.99.27.07: Unified Speed Transition (GameOver context)
    window.totalGold = Number(window.totalGold || 0) + Number(goldCount || 0);
    goToMainMenu();
};

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
    var d = size;
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

// v1.99.19.09: MASTER UI FINAL SYNC (Cleanup Complete)
// Tüm ana menü butonları yukarıdaki haptik blokta mühürlenmiştir.


const shopPauseBtn = document.getElementById('open-shop-btn-pause');
// v1.99.19.09: Mühürlü Mağaza Dinleyicisi
if (shopPauseBtn) {
    shopPauseBtn.onclick = () => {
        const sScr = document.getElementById('shop-screen');
        const pScr = document.getElementById('pause-screen');
        if (sScr) {
            // v1.99.19.09: Pause menüsünü gizle (Mühürlü Geçiş)
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
    if (typeof playUIClick === 'function') playUIClick();
    totalGold += goldCount;
    // goldCount = 0; // v1.99.19.09.0: RESUME İÇİN SIFIRLAMAYI KALDIRDIK
    saveGame();
    startGame();
});

const resetYes = document.getElementById('confirm-reset-yes');
const resetNo = document.getElementById('confirm-reset-no');

if (resetYes) resetYes.addEventListener('click', () => {
    // 🛑 TAM EKONOMİ SIFIRLAMASI (Hard Reset) v1.99.27.06
    // Top Riders rekorları KORUNUR, envanter silinir.

    // 1. Durum Değişkenlerini Sıfırla
    totalGold = 0;
    magnetLevel = 0;
    shieldLevel = 0;
    bombCount = 0;
    armorCharge = 0;
    ownsArmorLicense = false;
    hasWeapon = false;
    currentLevel = 1;
    score = 0;
    lives = 3;

    // 2. Görsel Geçişleri Sıfırla
    displayScore = 0;
    displayGold = 0;
    displayTotalGold = 0;

    // 3. Görevleri ve Döngüleri Sıfırla v1.99.30.06
    if (window.MissionManager) window.MissionManager.reset();

    // 4. Bulut Mührü (Firebase Sync) - Force=true
    if (typeof triggerEliteEconomySync === 'function') {
        
        triggerEliteEconomySync(true);
    }

    // 4. Yerel Hafıza Temizliği (Hassas Dosyalar)
    localStorage.removeItem('riverEscapeSave');
    localStorage.removeItem('riverEscapeCurrentSession');
    // Not: re_best_score (Liderlik rekoru) sarsılmaz bir kararlılıkla KORUNUYOR.

    // 5. Elite Reboot
    setTimeout(() => {
        location.reload();
    }, 500);
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
            triggerEliteEconomySync(true); // v1.99.27.00: Reklam ödülü sarsılmaz bulut mührü!
            saveGame();
            updateShopUI();
            showToast(`${translations[currentLang].rewardPrefix} 100 GOLD! 💰`, true);
            for (var i = 0; i < 4; i++) setTimeout(playCoinSound, i * 100);
        });
    });
}

// Redundant saveGame removed (bottom version used)

function loadGame() {
    const saved = localStorage.getItem('riverEscapeSave');
    if (saved) {
        const data = JSON.parse(saved);
        totalGold = Number(data.gold || 0);
        // v1.99.33.76: ID MIGRATION (ilkbahar -> spring)
        let loadedBoats = data.ownedBoats || ['spring'];
        window.ownedBoats = loadedBoats.map(id => id === 'ilkbahar' ? 'spring' : id);
        if (!window.ownedBoats.includes('spring')) window.ownedBoats.push('spring');
        magnetLevel = data.magnet || 0;
        shieldLevel = data.shield || 0;
        isMusicVolume = (data.musicVol !== undefined) ? data.musicVol : 1.0;
        isSFXVolume = (data.sfxVol !== undefined) ? data.sfxVol : 1.0;
        isVibrationEnabled = (data.vib !== undefined) ? data.vib : true;
        hasWeapon = data.weapon || false;
        ownsArmorLicense = data.armorLicense || false;
        armorCharge = data.armorCharge || 0;
        bombCount = data.bombs || 0;

        // v1.99.19.09.9: Devam Etme Bilgileri
        window.resumeScore = data.sessionScore || 0;
        window.resumeLives = data.sessionLives || 3;
        window.resumeLevel = data.sessionLevel || 1;
        window.resumeProgressTime = data.sessionProgress || 0;

        // UI'yı güncelle
        const mSli = document.getElementById('music-slider');
        const sSli = document.getElementById('sfx-slider');
        const vTog = document.getElementById('vibration-toggle');

        if (mSli) { mSli.value = isMusicVolume * 100; document.getElementById('music-vol-txt').innerText = (isMusicVolume * 100) + '%'; }
        if (sSli) { sSli.value = isSFXVolume * 100; document.getElementById('sfx-vol-txt').innerText = (isSFXVolume * 100) + '%'; }
        if (vTog) vTog.checked = isVibrationEnabled;

        // v1.99.19.09.0: Buluttan Serveti Geri Yükle (Recovery)
        if (typeof Leaderboard !== 'undefined') {
            Leaderboard.restoreFromCloud();
        }

        updateShopUI();

        // v1.99.19.09: Tema Tercihini Uygula
        const savedTheme = localStorage.getItem('riverEscapeTheme') || 'dark';
        setTheme(savedTheme);
        const tTog = document.getElementById('theme-toggle');
        if (tTog) tTog.checked = (savedTheme === 'dark');

        // v1.99.33.74: Final UI Sync to reflect loaded gold
        triggerEliteEconomySync(true);
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
    const bIdxHaze = Math.floor((currentLevel - 1) / STAGES_PER_BIOME) % BIOME_COUNT;
    if (bIdxHaze === 4) ctx.restore();
}

// v1.99.36.00: ELITE TOXIC ATMOSPHERICS
function drawToxicMist() {
    ctx.save();
    const time = performance.now() / 1000;
    
    // v1.99.36.05: Subtle toxic vapors
    for (let i = 0; i < 6; i++) {
        const drift = (time * (15 + i * 5)) % canvas.width;
        const alpha = 0.08 + Math.sin(time + i) * 0.05; // Very transparent
        
        ctx.fillStyle = `rgba(57, 255, 20, ${alpha})`;
        ctx.beginPath();
        ctx.arc(drift, (i * 100) % canvas.height, 60, 0, Math.PI * 2);
        ctx.arc(canvas.width - drift, (i * 150) % canvas.height, 80, 0, Math.PI * 2);
        ctx.fill();
    }

    // Border Glow (Elite)
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width/2, canvas.width/2, canvas.height/2, canvas.width);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, "rgba(0, 30, 0, 0.25)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore();
}

// --- ELITE AUDIO ENGINE v3.31.0 ---

function showLevelUp(levelNum) {
    const biomeNum = Math.floor((levelNum - 1) / STAGES_PER_BIOME) + 1;
    const stageNum = ((levelNum - 1) % STAGES_PER_BIOME) + 1;
    const formattedLvl = `${biomeNum}-${stageNum}`;
    
    // v1.99.33.71: Show Elite Toast and Overlay
    if (typeof showToast === 'function') {
        const t = (translations[currentLang] || translations.tr);
        showToast(`${t.levelLabel || 'LVL'} ${formattedLvl} 🚀`, true);
    }
    
    // v1.99.33.71: Overlay Animation
    const overlay = document.getElementById('level-up-overlay');
    if (overlay) {
        overlay.innerHTML = `
            <div style="text-align: center; animation: eliteLevelPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="font-family: 'Press Start 2P', cursive; color: #FFD700; font-size: 3vmin; margin-bottom: 2vmin; text-shadow: 0 0 15px rgba(255,215,0,0.5);">LEVEL UP!</div>
                <div style="font-family: 'Outfit', sans-serif; font-weight: 900; color: #fff; font-size: 15vmin; text-shadow: 0 0 40px rgba(0,229,255,0.6);">${formattedLvl}</div>
            </div>
            <style>
                @keyframes eliteLevelPop {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
            </style>
        `;
        // v1.99.33.71: Transition Safety
        levelUpInvuln = true;
        obstacles = []; // Temiz başla
        
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'none'; // Ensure no interaction block
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            levelUpInvuln = false; // Normalleş
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.classList.add('hidden');
            }, 500);
        }, 1800);
    }
}

// v1.99.33.71: Final Initialization Call (User Startup Sync)
goToMainMenu();
