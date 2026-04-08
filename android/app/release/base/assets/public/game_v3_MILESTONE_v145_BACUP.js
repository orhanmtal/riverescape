// River Escape - Ana Oyun Motoru (Game Engine) - BUILD v145 (MILESTONE - DIAMOND)
// Developer: Antigravity

let canvas, ctx;
let particles = [], obstacles = [], golds = [];
let spawnTimer = 0, spawnInterval = 1.3, goldTimer = 0, goldSpawnInterval = 3.2; 
let hasMagnet = false, magnetTimer = 0, hasShield = false, shieldTimer = 0, isDoubleGoldActive = false;
let currentLang = (navigator.language || 'tr').startsWith('tr') ? 'tr' : 'en';

// KALICI KAYIT VE MAĞAZA (v145 Orijinal Sistem)
let magnetLevel = parseInt(localStorage.getItem('riverMagnetLevel')) || 0;
let shieldLevel = parseInt(localStorage.getItem('riverShieldLevel')) || 0;
let goldCountTotal = parseInt(localStorage.getItem('riverGoldCount')) || 0;
let highPlayerScore = parseInt(localStorage.getItem('riverHighScore')) || 0;

let lives = 3, score = 0, goldCount = 0, currentLevel = 1;
let isPlaying = false, isGameOver = false, isPaused = false, isTransitioningLevel = false, transitionTimer = 0;
let bgY = 0; let bgScrollSpeed = 160; 
let screenFlash = 0; let lastTime = 0;

const levelAssets = [
    { threshold: 0,    bgKey: 'ilkbahar', speed: 160, spawn: 0.70, color: "#64dd17" },
    { threshold: 500,  bgKey: 'yaz',      speed: 240, spawn: 0.52, color: "#ffd600" },
    { threshold: 1200, bgKey: 'sonbahar', speed: 320, spawn: 0.42, color: "#ff6d00" },
    { threshold: 3000, bgKey: 'kis',      speed: 400, spawn: 0.32, color: "#00e5ff" }
];

const player = { x: 0, y: 0, width: 38, height: 65, speed: 280, targetX: 0, isMoving: false };

/* --- v145 MILESTONE: CRITICAL CLASSES --- */
class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.vx = (Math.random() - 0.5) * 40; this.vy = Math.random() * 50 + 20;
        this.life = 1.0; this.size = Math.random() * 4 + 2;
    }
    update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; this.life -= dt * 1.5; }
    draw(ctx) { ctx.globalAlpha = this.life; ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1.0; }
}

/* --- v145 MILESTONE: CORE PHYSICS & LOOP --- */
function mainLoop(time) {
    if (!lastTime) lastTime = time;
    let dt = (time - lastTime) / 1000;
    if (dt > 0.08) dt = 0.08;
    lastTime = time;
    if (isPlaying && !isPaused && !isGameOver) updateGameLogic(dt);
    renderGame(dt);
    requestAnimationFrame(mainLoop);
}

function updateGameLogic(dt) {
    score += dt * 5; bgY = (bgY + bgScrollSpeed * dt) % (canvas.height * 2);

    let nextL = levelAssets[currentLevel];
    if (nextL && score >= nextL.threshold && !isTransitioningLevel) {
        currentLevel++; bgScrollSpeed = levelAssets[currentLevel-1].speed;
    }

    const moveStep = player.speed * dt;
    if (player.isMoving) {
        if (Math.abs(player.x - player.targetX) < moveStep) { player.x = player.targetX; player.isMoving = false; }
        else player.x += (player.targetX > player.x ? 1 : -1) * moveStep;
    }

    spawnTimer += dt;
    let si = (getIsDZ()) ? 0.44 : (levelAssets[currentLevel-1].spawn || 0.7);
    if (spawnTimer >= si) { spawnObstacleAction(); spawnTimer = 0; }

    obstacles.forEach((o, i) => {
        let sy = (o.type === 'rock' ? bgScrollSpeed : (o.speedY || 200));
        o.y += sy * dt;
        if (checkCollision(player, o)) {
            if (o.type === 'hippo' && o.isSubmerged) return;
            if (hasShield) { hasShield = false; shieldTimer = 0; obstacles.splice(i, 1); playCrashSound(); }
            else { lives--; obstacles.splice(i, 1); if (lives <= 0) gameOverAction(); else triggerVibration(60); }
        }
    });

    golds.forEach((g, i) => { g.y += bgScrollSpeed * dt; if (checkCollision(player, g)) { goldCount++; golds.splice(i, 1); playCoinSound(); } });
    obstacles = obstacles.filter(o => o.y < canvas.height + 150);
}

function spawnObstacleAction() {
    let margin = (currentLevel === 4) ? 0.38 : 0.33;
    const rLeft = canvas.width * margin; const rRight = canvas.width*(1-margin)-45;
    const rWidth = rRight-rLeft;
    
    // v145 MIHENK TAŞI: FORMATION HELL DALGALARI (%60-%85 BANDI)
    const currT = levelAssets[currentLevel-1].threshold;
    const nextT = levelAssets[currentLevel]?.threshold || (currT + 2500);
    const rangeS = currT + (nextT-currT)*0.6; const rangeE = currT + (nextT-currT)*0.85;

    let types = (currentLevel === 1 && score < 400) ? ['rock'] : ['hippo', 'croc', 'rock'];
    if (Math.random() < 0.48) {
        let t = types[Math.floor(Math.random() * types.length)];
        if (t === 'rock' && score >= rangeS && score < rangeE) {
            const gap = Math.min(rWidth * 0.44, 90); const cnt = Math.random()*(rWidth-gap)+rLeft+gap/2;
            [cnt-gap/2-25, cnt+gap/2].forEach(x => obstacles.push({ type: 'rock', x, y: -100, width: 55, height: 48, speedY: bgScrollSpeed }));
            return;
        }
        obstacles.push({ type: t, x: Math.random()*rWidth+rLeft, y:-100, width:60, height:60, speedY: bgScrollSpeed+25, isSubmerged: (t==='hippo') });
    }
}

function renderGame(dt) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (typeof bgImg !== 'undefined' && bgImg && bgImg.complete) {
        ctx.drawImage(bgImg, 0, bgY - canvas.height * 2, canvas.width, canvas.height * 2);
        ctx.drawImage(bgImg, 0, bgY, canvas.width, canvas.height * 2);
    }
    obstacles.forEach(o => {
        ctx.save(); if (o.type === 'hippo' && o.isSubmerged) ctx.globalAlpha = 0.45;
        let img = (o.type === 'croc' ? crocImg : (o.type === 'hippo' ? hippoImg : obsImg));
        if (img && img.complete) ctx.drawImage(img, o.x, o.y, o.width, o.height);
        ctx.restore();
    });
    particles.forEach(p => p.draw(ctx));
    if (typeof playerImg !== 'undefined' && playerImg && playerImg.complete) ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    
    // v145 MILESTONE: TAM HUD
    if (typeof translations !== 'undefined' && translations[currentLang]) {
        const t = translations[currentLang];
        ctx.fillStyle = "white"; ctx.font = "bold 20px Outfit";
        ctx.fillText(`${t.scoreLabel} ${Math.floor(score)}`, 20, 50);
        ctx.fillText(`${t.goldLabel} ${goldCount}`, 20, 85);
        ctx.fillStyle = "#FFD700"; ctx.fillText(`${t.vaultLabel} ${goldCountTotal}`, 20, 120);
    }
}

function updateLanguageUI() {
    if (typeof translations === 'undefined') return;
    const t = translations[currentLang];
    const uiMap = {
        'start-btn': t.startBtn, 'shop-open-btn': t.shopBtn, 'settings-open-btn': t.settingsBtn,
        'revive-btn': t.reviveBtn, 'x2-gold-start-btn': t.x2GoldBtn, 'restart-btn': t.hardResetBtn,
        'settings-close-btn': t.saveCloseBtn, 'gameover-title': t.gameOver, 'resume-btn': t.resumeBtn
    };
    for (let id in uiMap) { let el = document.getElementById(id); if (el) el.innerText = uiMap[id]; }
}

function updateShopDisplay() {
    const gE = document.getElementById('totalGoldValue'); if (gE) gE.innerText = goldCountTotal;
    const mE = document.getElementById('magnet-lvl'); if (mE) mE.innerText = magnetLevel;
    const sE = document.getElementById('shield-lvl'); if (sE) sE.innerText = shieldLevel;
}

function gameOverAction() {
    isPlaying = false; isGameOver = true; goldCountTotal += goldCount;
    localStorage.setItem('riverGoldCount', goldCountTotal);
    if (Math.floor(score) > highPlayerScore) { highPlayerScore = Math.floor(score); localStorage.setItem('riverHighScore', highPlayerScore); }
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('finalScoreValue').innerText = Math.floor(score);
    document.getElementById('finalGoldValue').innerText = goldCount;
    if(typeof playDeathSoundEffect !== 'undefined') playDeathSoundEffect();
}

function init() {
    canvas = document.getElementById('gameCanvas'); ctx = canvas.getContext('2d');
    resizeCanvas(); loadPersistentData(); updateLanguageUI();
    document.getElementById('start-btn').onclick = () => {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('pause-btn').style.display = 'block';
        resetGameParams(); isPlaying = true;
        if(typeof initAudio !== 'undefined') initAudio();
    };
    document.getElementById('shop-open-btn').onclick = () => { document.getElementById('shop-screen').classList.remove('hidden'); updateShopDisplay(); };
    document.getElementById('settings-open-btn').onclick = () => document.getElementById('settings-screen').classList.remove('hidden');
    document.getElementById('settings-close-btn').onclick = () => document.getElementById('settings-screen').classList.add('hidden');
    document.getElementById('pause-btn').onclick = () => { isPaused = true; document.getElementById('pause-screen').classList.remove('hidden'); };
    document.getElementById('resume-btn').onclick = () => { isPaused = false; document.getElementById('pause-screen').classList.add('hidden'); };
    window.onresize = resizeCanvas;
    requestAnimationFrame(mainLoop);
}

function resetGameParams() {
    score = 0; goldCount = 0; lives = 3; currentLevel = 1;
    obstacles = []; golds = []; particles = [];
    bgScrollSpeed = levelAssets[0].speed;
    hasShield = false; hasMagnet = false;
}

function loadPersistentData() {
    goldCountTotal = parseInt(localStorage.getItem('riverGoldCount')) || 0;
    magnetLevel = parseInt(localStorage.getItem('riverMagnetLevel')) || 0;
    shieldLevel = parseInt(localStorage.getItem('riverShieldLevel')) || 0;
    highPlayerScore = parseInt(localStorage.getItem('riverHighScore')) || 0;
    updateShopDisplay(); 
}

function getIsDZ() {
    const n = levelAssets[currentLevel]; if (!n) return score >= 5000;
    return score >= levelAssets[currentLevel-1].threshold + ((n.threshold - levelAssets[currentLevel-1].threshold) * 0.85);
}

function resizeCanvas() { if(!canvas) return; canvas.width = window.innerWidth; canvas.height = window.innerHeight; player.x = canvas.width/2 - player.width/2; player.y = canvas.height-180; player.targetX = player.x; }
function checkCollision(p, o) { let ox = o.x+o.width*0.25, oy = o.y+o.height*0.2, ow = o.width*0.5, oh = o.height*0.65; return p.x<ox+ow && p.x+p.width>ox && p.y<oy+oh && p.y+p.height>oy; }
function triggerVibration(ms) { if (navigator.vibrate) navigator.vibrate(ms); }
function playCoinSound() { if (typeof playCoinSoundEffect !== 'undefined') playCoinSoundEffect(); }
function playCrashSound() { if (typeof playCrashSoundEffect !== 'undefined') playCrashSoundEffect(); }

document.addEventListener('DOMContentLoaded', init);
