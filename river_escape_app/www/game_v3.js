// CACHE BUSTER V3 (Tüm Önbellek Kırıldı, Yeni Mekanikler Eklendi)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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

let deathCountForX2 = 0;
let startingDoubleGold = false;
let isDoubleGoldActive = false;
let isMusicEnabled = true;
let isSFXEnabled = true;

// --- ADMOB YÖNETİCİSİ (ÖDÜLLÜ REKLAMLAR) ---
const ADMOB_APP_ID = "ca-app-pub-7739440971804169~2645131828";
const REWARDED_AD_UNIT_ID = "ca-app-pub-7739440971804169/6392805140";

function showRewardedAd(btnElem, defaultText, callback) {
    btnElem.innerText = "Reklam Yükleniyor...";
    btnElem.disabled = true;
    
    // Uygulama telefonda (Cordova/AdMob) çalışıyorsa:
    if (typeof admob !== 'undefined') {
        document.addEventListener('admob.reward_video.reward', function onReward() {
            document.removeEventListener('admob.reward_video.reward', onReward);
            callback(); // Parayı/Gücü ver
            btnElem.innerText = defaultText;
            btnElem.disabled = false;
        });

        document.addEventListener('admob.reward_video.load_fail', function onFail() {
            document.removeEventListener('admob.reward_video.load_fail', onFail);
            alert("Reklam yüklenemedi. Lütfen internet bağlantınızı kontrol edin.");
            btnElem.innerText = defaultText;
            btnElem.disabled = false;
        });
        
        // Cordova admob plus gösterimi
        admob.rewardVideo.show().catch((err) => {
            alert("Bağlantı hatası: " + err);
            btnElem.innerText = defaultText;
            btnElem.disabled = false;
        });
    } 
    // Tarayıcıdaki Hızlı Test (Simülasyon) Modu
    else {
        setTimeout(() => {
            callback();
            btnElem.innerText = defaultText;
            btnElem.disabled = false;
        }, 1500);
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); 

// ----------------------------------------------------
// SES EFEKTLERİ (Web Audio API) 
// ----------------------------------------------------
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if(!audioCtx) audioCtx = new AudioContext();
    if(audioCtx.state === 'suspended') audioCtx.resume();
}

// 8-Bit Oyun Müziği Jeneratörü (Sequencer)
const scale = [220.00, 261.63, 329.63, 440.00, 523.25, 659.25, 392.00, 293.66]; // Yepyeni macera müzik gamı (A minör temelli)
const melody = [0, 1, 2, 3,  0, 1, 2, 4,  5, 4, 3, 0,  6, 7, 1, 2]; // Hızlı ritimli yeni müzik melodisi
let currentNote = 0;
let nextNoteTime = 0;

function bgMusicScheduler() {
    if (!isPlaying) return; 
    
    if (!isPaused) {
        // Gelecekte çalacak notaları planla (Web Audio hilesi)
        while (nextNoteTime < audioCtx.currentTime + 0.1) {
            playMelodyNote(melody[currentNote], nextNoteTime);
            nextNoteTime += 0.2; // Oynatma Hızı (0.2 saniyede bir nota atar)
            currentNote = (currentNote + 1) % melody.length;
        }
    } else {
        nextNoteTime = audioCtx.currentTime + 0.1;
    }
    // 25ms sonra tekrar kontrol et
    setTimeout(bgMusicScheduler, 25);
}

function playMelodyNote(noteIndex, time) {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle'; // Arka plan müziğinde çok kafa yormayan "Triangle" dalgası
    osc.frequency.value = scale[noteIndex];
    
    if(!isMusicEnabled) {
        gainNode.gain.setValueAtTime(0, time);
    } else {
        gainNode.gain.setValueAtTime(0.08, time); // Ses şiddeti (Sessiz arka ses %8)
        gainNode.gain.linearRampToValueAtTime(0.01, time + 0.15); // Notalar arası yumuşama 
    }    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + 0.2);
}

// Altın Sesi (İnce çiling)
function playCoinSound() {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.1); 
    if(!isSFXEnabled) {
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    } else {
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    }
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

// Çarpma Sesi (Kalın bum)
function playCrashSound() {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3); 
    if(!isSFXEnabled) {
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    } else {
        gainNode.gain.setValueAtTime(0.8, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    }
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.3);
}

// Güçlendirici Sesi (Sihirli Yükseliş)
function playPowerupSound() {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    
    // Hızlı sweeping (Glissando arpej etkisi)
    osc.frequency.setValueAtTime(400, audioCtx.currentTime); 
    osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.1); 
    osc.frequency.linearRampToValueAtTime(1600, audioCtx.currentTime + 0.2); 
    
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.4);
}

// ----------------------------------------------------
// GÖRSELLERİ ŞEFFAFLAŞTIRAN SİHİRLİ FONKSİYON 
// ----------------------------------------------------
function makeWhiteTransparent(imageElement) {
    if (imageElement.src.includes('ArkaPlan')) return imageElement; 

    const offCanvas = document.createElement('canvas');
    offCanvas.width = imageElement.width;
    offCanvas.height = imageElement.height;
    const offCtx = offCanvas.getContext('2d');
    
    offCtx.drawImage(imageElement, 0, 0);
    const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const data = imgData.data;

    // Eşik 200'e düşürüldü ki kirli beyazlar (anti-aliasing) tam silinsin
    for (var i = 0; i < data.length; i += 4) {
        let r = data[i], g = data[i+1], b = data[i+2];
        if (r > 190 && g > 190 && b > 190) { 
            data[i+3] = 0; // Alpha'yı 0 yap (saydam)
        }
    }
    
    offCtx.putImageData(imgData, 0, 0);
    const newImg = new Image();
    newImg.src = offCanvas.toDataURL();
    return newImg;
}

let bgImgs = {};

function loadBg(key, src) {
    let img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        let offCtx = document.createElement('canvas');
        offCtx.width = img.width;
        offCtx.height = img.height * 2;
        let c = offCtx.getContext('2d');
        c.drawImage(img, 0, 0, img.width, img.height);
        c.save();
        c.translate(0, img.height * 2);
        c.scale(1, -1);
        c.drawImage(img, 0, 0, img.width, img.height);
        c.restore();
        bgImgs[key] = offCtx; // Kusursuz ve GPU dostu Dikişsiz doku!
    };
    img.src = src;
    return img;
}

// ASSETS YÜKLEME
let bgImgIlkbahar = loadBg('ilkbahar', 'assets/ArkaPlan.png?v=6');
let bgImgYaz = loadBg('yaz', 'assets/ArkaPlan_Yaz.png?v=6');
let bgImgSonbahar = loadBg('sonbahar', 'assets/ArkaPlan_Sonbahar.png?v=6');
let bgImgKis = loadBg('kis', 'assets/ArkaPlan_Kis.png?v=6');

const players = { ilkbahar: null, yaz: null, sonbahar: null, kis: null };

let iPI = new Image(); iPI.crossOrigin="Anonymous";
iPI.onload = () => { players.ilkbahar = makeWhiteTransparent(iPI); if (currentLevel===1) playerImg = players.ilkbahar; }; iPI.src = 'assets/Kayik.png';

let iPY = new Image(); iPY.crossOrigin="Anonymous";
iPY.onload = () => { players.yaz = makeWhiteTransparent(iPY); }; iPY.src = 'assets/Kayik_Yaz.png';

let iPS = new Image(); iPS.crossOrigin="Anonymous";
iPS.onload = () => { players.sonbahar = makeWhiteTransparent(iPS); }; iPS.src = 'assets/Kayik_Sonbahar.png';

let iPK = new Image(); iPK.crossOrigin="Anonymous";
iPK.onload = () => { players.kis = makeWhiteTransparent(iPK); }; iPK.src = 'assets/Kayik_Kis.png';

const levelAssets = [
    { threshold: 0,    bgKey: 'ilkbahar', speed: 100, spawn: 1.3, title: "İLKBAHAR", color: "#64dd17", pKey: "ilkbahar" },
    { threshold: 500,  bgKey: 'yaz',      speed: 160, spawn: 1.0, title: "🌞 YAZ NEHRİ", color: "#ffd600", pKey: "yaz" },
    { threshold: 1000, bgKey: 'sonbahar', speed: 210, spawn: 0.8, title: "🍂 KIZIL BASTIRDI", color: "#ff6d00", pKey: "sonbahar" },
    { threshold: 2000, bgKey: 'kis',      speed: 260, spawn: 0.55, title: "❄️ DONDURUCU KIŞ", color: "#00e5ff", pKey: "kis" }
];

let bgImg = bgImgIlkbahar; // Aktif arkaplan
let playerImg = iPI; // Loadlanana kadar orjinal resim

let obsImg = new Image();
obsImg.crossOrigin = "Anonymous";
obsImg.onload = () => { obsImg = makeWhiteTransparent(obsImg); };
obsImg.src = 'assets/Kutuk.png';

let magImg = new Image(); magImg.crossOrigin = "Anonymous"; 
magImg.onload = () => { magImg = makeWhiteTransparent(magImg); }; magImg.src = 'assets/Miknatis.png';

let shdImg = new Image(); shdImg.crossOrigin = "Anonymous"; 
shdImg.onload = () => { shdImg = makeWhiteTransparent(shdImg); }; shdImg.src = 'assets/Kalkan.png';

let crocImg = new Image(); crocImg.crossOrigin = "Anonymous";
crocImg.onload = () => { crocImg = makeWhiteTransparent(crocImg); }; crocImg.src = 'assets/Timsah.png';

let hippoImg = new Image(); hippoImg.crossOrigin = "Anonymous";
hippoImg.onload = () => { hippoImg = makeWhiteTransparent(hippoImg); }; hippoImg.src = 'assets/Hippo.png';

// PARALLAX SİSTEMİ (BULUTLAR/SİS)
let clouds = [];
function initClouds() {
    clouds = [];
    for(let i=0; i<8; i++) {
        // Random sis bulutları oluştur at
        clouds.push({
            x: Math.random() * 800 - 100, 
            y: Math.random() * 800, 
            r: Math.random() * 100 + 50,
            opacity: Math.random() * 0.15 + 0.05
        });
    }
}
initClouds();


// ----------------------------------------------------
// OYUN SİSTEMİ 
// ----------------------------------------------------
let isPlaying = false, isGameOver = false, isPaused = false;
let score = 0, goldCount = 0, lastTime = 0;
let currentLevel = 1;
let bgY = 0; let bgScrollSpeed = 100; 

// KALICI KAYIT VE MAĞAZA
let totalGold = parseInt(localStorage.getItem('totalGold')) || 0;
let magnetLevel = parseInt(localStorage.getItem('magnetLevel')) || 0;
let shieldLevel = parseInt(localStorage.getItem('shieldLevel')) || 0;
let powerupTimer = 0;
let hasShield = false;

function saveGame() {
    localStorage.setItem('totalGold', totalGold);
    localStorage.setItem('magnetLevel', magnetLevel);
    localStorage.setItem('shieldLevel', shieldLevel);
    updateShopUI();
}

function updateShopUI() {
    const tg = document.getElementById('totalGoldValue');
    if(tg) tg.innerText = totalGold;
    
    let ml = document.getElementById('magnet-lvl');
    if(ml) {
        ml.innerText = magnetLevel;
        document.getElementById('magnet-duration').innerText = magnetLevel > 0 ? (3 + magnetLevel * 2) + 'sn' : '0sn';
        document.getElementById('magnet-price').innerText = magnetLevel < 5 ? (500 + magnetLevel * 250) : "MAX";
    }
    
    let sl = document.getElementById('shield-lvl');
    if(sl) {
        sl.innerText = shieldLevel;
        document.getElementById('shield-chance').innerText = '%' + (shieldLevel * 5);
        document.getElementById('shield-price').innerText = shieldLevel < 5 ? (750 + shieldLevel * 300) : "MAX";
    }
}
setTimeout(updateShopUI, 100);

// MAĞAZA BUTONLARI HİLELERİ
const shopBtn = document.getElementById('shop-open-btn');
if(shopBtn) shopBtn.addEventListener('click', () => {
    document.getElementById('shop-screen').classList.remove('hidden');
    document.getElementById('shop-screen').style.display = 'flex';
});

const shopBtnGameOver = document.getElementById('gameover-shop-btn');
if(shopBtnGameOver) shopBtnGameOver.addEventListener('click', () => {
    document.getElementById('shop-screen').classList.remove('hidden');
    document.getElementById('shop-screen').style.display = 'flex';
});

const closeShopBtn = document.getElementById('shop-close-btn');
if(closeShopBtn) closeShopBtn.addEventListener('click', () => {
    document.getElementById('shop-screen').classList.add('hidden');
    document.getElementById('shop-screen').style.display = '';
});

const btnMag = document.getElementById('buy-magnet-btn');
if(btnMag) btnMag.addEventListener('click', () => {
    let cost = 500 + magnetLevel * 250;
    if(totalGold >= cost && magnetLevel < 5) {
        totalGold -= cost; magnetLevel++; saveGame();
        for(let i=0; i<3; i++) setTimeout(playCoinSound, i*150);
    }
});

const btnShd = document.getElementById('buy-shield-btn');
if(btnShd) btnShd.addEventListener('click', () => {
    let cost = 750 + shieldLevel * 300;
    if(totalGold >= cost && shieldLevel < 5) {
        totalGold -= cost; shieldLevel++; saveGame();
        for(let i=0; i<3; i++) setTimeout(playCoinSound, i*150);
    }
});

const player = { x: canvas.width / 2, y: canvas.height - 150, width: 45, height: 80, speed: 320 };

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
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); initAudio(); if(e.touches.length > 0) { touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left; touchY = e.touches[0].clientY - canvas.getBoundingClientRect().top; } }, {passive: false});
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
    // Güçlendirici Çıkması
    if (Math.random() < 0.1 && (magnetLevel > 0 || shieldLevel > 0)) {
        spawnPowerup(); return;
    }

    const baseSpeed = 200 + Math.random() * 100;
    const riverLeft = canvas.width * 0.35;
    const riverRight = canvas.width * 0.65 - 50; 
    
    // Yüzde 15 ihtimalle Düşman (Timsah veya Su Aygırı)
    if (Math.random() < 0.15 && currentLevel > 1) { // Sadece 2. seviyeden sonra düşman çıksın
        if (Math.random() < 0.5) {
            obstacles.push({
                type: 'hippo',
                x: Math.random() * (riverRight - riverLeft) + riverLeft,
                y: -100,
                width: 60,  
                height: 60, 
                speedY: baseSpeed - 20, // Daha yavaş gelir
                speedX: 0,
                isSubmerged: true
            });
        } else {
            obstacles.push({
                type: 'croc',
                x: Math.random() * (riverRight - riverLeft) + riverLeft,
                y: -100,
                width: 40,  
                height: 90, 
                speedY: baseSpeed + 40, // Daha hızlı yüzer
                speedX: 0
            });
        }
        return;
    }
    
    obstacles.push({
        type: 'vertical',
        x: Math.random() * (riverRight - riverLeft) + riverLeft,
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
            y: gy + 80, // Oyuncuya daha yakın doğar
            width: 45,  
            height: 50, 
            speedY: speed,
            speedX: 0
        });

        // Altın yandadır
        gx += trapDir * 75;
        if (gx < riverLeft + 30) gx = riverLeft + 30;
        if (gx > riverRight - 30) gx = riverRight - 30;

        // Altını almak isterse, hemen yanından sıfır mesafeyle geçecek bir kütük daha belirir!
        obstacles.push({
            type: 'vertical',
            x: gx - (trapDir * 62), 
            y: gy - 20, // Altının biraz arkası, kayık geçerken sıyırmak zorunda
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
    
    if (isPaused) {
        if(pauseScreen) {
            pauseScreen.classList.remove('hidden');
            pauseScreen.classList.add('active');
            pauseScreen.style.display = 'flex';
        }
        if(pauseBtn) pauseBtn.innerText = "▶ DEVAM";
        if(audioCtx && audioCtx.state === 'running') audioCtx.suspend();
    } else {
        if(pauseScreen) {
            pauseScreen.classList.remove('active');
            pauseScreen.classList.add('hidden');
            pauseScreen.style.display = '';
        }
        if(pauseBtn) pauseBtn.innerText = "⏸ DURDUR";
        lastTime = performance.now(); // Fazla zıplamayı önle
        if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    initAudio(); 
    isPlaying = true; isGameOver = false; isPaused = false;
    score = 0; goldCount = 0;
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
    if(players.ilkbahar) playerImg = players.ilkbahar; else playerImg = iPI;
    bgScrollSpeed = 100;
    lastTime = performance.now();
    
    startScreen.classList.remove('active'); startScreen.classList.add('hidden');
    gameOverScreen.classList.remove('active'); gameOverScreen.classList.add('hidden');
    if(pauseScreen) { pauseScreen.classList.remove('active'); pauseScreen.classList.add('hidden'); pauseScreen.style.display = ''; }
    if(pauseBtn) { pauseBtn.style.display = 'block'; pauseBtn.innerText = "⏸ DURDUR"; }
    
    // Revive butonlarını UI üzerinde sıfırla
    if(reviveBtn) {
        reviveBtn.disabled = false;
        reviveBtn.innerText = "▶ Reklam İzle & Canlan";
        reviveBtn.style.opacity = '1';
    }
    if(x2GoldBtn) {
        x2GoldBtn.disabled = false;
        x2GoldBtn.innerText = "💰 x2 Altın Katlayıcıyla Başla (Reklam)";
        x2GoldBtn.style.opacity = '1';
        x2GoldBtn.style.display = deathCountForX2 >= 3 ? 'block' : 'none';
    }
    
    // Arka Plan Müziğini Başlat
    currentNote = 0;
    nextNoteTime = audioCtx.currentTime + 0.1;
    bgMusicScheduler();
    
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    if (isGameOver) return; // Çoklu çarpışmayı engelle
    
    deathCountForX2++;
    
    try {
        playCrashSound(); 
        isPlaying = false; isGameOver = true;
        if(finalScoreElem) finalScoreElem.innerText = Math.floor(score);
        if(finalGoldElem) finalGoldElem.innerText = goldCount;
        
        if (x2GoldBtn) x2GoldBtn.style.display = deathCountForX2 >= 3 ? 'block' : 'none';
        
        gameOverScreen.classList.remove('hidden'); gameOverScreen.classList.add('active');
        if(pauseBtn) pauseBtn.style.display = 'none';
        
        totalGold += goldCount;
        saveGame();
    } catch (e) {
        alert("Oyun biterken hata dondu: " + e.message);
    }
}

function update(dt) {
    if (!isPlaying) return;

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
        
        if (touchY < player.y + player.height/2 - 15) dy = -1;
        else if (touchY > player.y + player.height/2 + 15) dy = 1;
    }

    // SADECE ileri-geri (Y ekseni) hareket edildiğinde skordan düş (0'ın altına inmez)
    if (dy !== 0) {
        score = Math.max(0, score - (Math.abs(dy) * player.speed * dt * 0.1));
    }

    // X Ekseni Sınırları (Nehir Kanalı)
    const playRiverLeft = canvas.width * 0.33;
    const playRiverRight = canvas.width * 0.67 - player.width;
    
    player.x += dx * player.speed * dt;
    if (player.x < playRiverLeft) player.x = playRiverLeft;
    if (player.x > playRiverRight) player.x = playRiverRight;
    
    // Y Ekseni Sınırları (Ekranın üstüne veya altına çıkmasın)
    player.y += dy * player.speed * dt;
    if (player.y < 50) player.y = 50; 
    if (player.y > canvas.height - player.height - 20) player.y = canvas.height - player.height - 20;

    spawnTimer += dt;
    if (spawnTimer >= spawnInterval) {
        spawnObstacle();
        spawnTimer = 0;
        if(spawnInterval > 0.5) spawnInterval -= 0.02; // Zorlaştır
    }

    goldTimer += dt;
    if(goldTimer >= goldSpawnInterval) {
        spawnGold();
        goldTimer = 0;
    }

    // DİNAMİK 4 MEVSİM SEVİYE GÜNCELLEMESİ (SKOR/ZAMAN BAZLI REKLAM KURGUSUNA ÖZEL GEÇİŞ)
    let targetLevelIndex = 0;
    for (let i = levelAssets.length - 1; i >= 0; i--) {
        if (Math.floor(score) >= levelAssets[i].threshold) {
            targetLevelIndex = i;
            break;
        }
    }
    
    // Eğer yeni bir seviyeye geçildiyse (Level 2, 3, 4)
    if (currentLevel !== targetLevelIndex + 1) {
        currentLevel = targetLevelIndex + 1; // 1 tabanlı indeks
        const lAsset = levelAssets[targetLevelIndex];
        
        bgImg = bgImgs[lAsset.bgKey]; 
        if(players[lAsset.pKey]) playerImg = players[lAsset.pKey]; // KAYIK ANINDA DEĞİŞİR!
        bgScrollSpeed = lAsset.speed; 
        spawnInterval = lAsset.spawn; 
        
        if (currentLevel > 1) { // 2, 3, 4. seviyelerde animasyon oynat
            for(let i=0; i<3; i++) setTimeout(playCoinSound, i*150); 
            
            // Ekranda Dinamik Miktar Yazısını belirleme
            levelUpOverlay.innerHTML = `
                <div style="text-align: center;">
                    <h1 style="color: #ffffff; font-size: 36px; font-family: 'Press Start 2P', cursive; text-shadow: 4px 4px 0 #000; margin: 0;">LEVEL ${currentLevel}</h1>
                    <h2 style="color: ${lAsset.color}; font-size: 24px; font-family: 'Outfit', sans-serif; text-shadow: 3px 3px 0 #000; margin-top: 10px; font-weight: 900; letter-spacing: 5px;">${lAsset.title}</h2>
                </div>
            `;
            
            levelUpOverlay.classList.remove('hidden');
            levelUpOverlay.classList.add('active');
            levelUpOverlay.style.opacity = '1';
            
            // Animasyon Sönüşü
            setTimeout(() => {
                levelUpOverlay.style.opacity = '0';
                setTimeout(() => {
                    levelUpOverlay.classList.remove('active');
                    levelUpOverlay.classList.add('hidden');
                }, 500);
            }, 2500);
        }
    }

    // Kayığın Çarpışma Kutusu (Hitbox) - Daha Affedici (Sadece merkeze vurursa yanar)
    let px = player.x + 20, py = player.y + 30, pw = player.width - 40, ph = player.height - 60;

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
    if (currentLAsset && bgImgs[currentLAsset.bgKey]) {
        currentBgTex = bgImgs[currentLAsset.bgKey];
    } else if (bgImgs['ilkbahar']) {
        currentBgTex = bgImgs['ilkbahar'];
    }

    if(currentBgTex) {
        let H = Math.ceil(canvas.height) * 2;
        ctx.drawImage(currentBgTex, 0, Math.floor(bgY), canvas.width, H);
        ctx.drawImage(currentBgTex, 0, Math.floor(bgY) - H + 1, canvas.width, H);
    } else {
        ctx.fillStyle = "#1e90ff"; // Resim yüklenene kadar mavi
        ctx.fillRect(0,0, canvas.width, canvas.height);
    }
    
    // YARI SAYDAM PARALLAX SİS/BULUT TABAKASI (Su Katmanı Üzerinde, Objelerin Altında)
    clouds.forEach(c => {
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
        } else if (obs.type === 'croc' && crocImg.complete) {
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
                if (hippoImg.complete) {
                    ctx.drawImage(hippoImg, obs.x, obs.y, obs.width, obs.height);
                } else {
                    ctx.fillStyle = "#8b008b"; // Timsah/Hippo mor fallback rengi
                    ctx.beginPath();
                    ctx.arc(obs.x+obs.width/2, obs.y+obs.height/2, obs.width/2, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        }
    });

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
        // Canvas is drawn without complete check, images wait for complete
        if (playerImg.tagName === 'CANVAS' || playerImg.complete) {
            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
        }
    }

    // --- CANVAS TABANLI UI (JİLET GİBİ SİMETRİK) ---
    ctx.font = "bold 9px 'Press Start 2P', cursive";
    ctx.shadowBlur = 5; ctx.shadowColor = "rgba(0,0,0,0.8)";
    
    // SOL TARAF (SKOR & ALTIN)
    ctx.fillStyle = "#ffffff"; 
    ctx.textAlign = "left";
    let targetText = "";
    if (levelAssets[currentLevel-1]) {
        targetText = currentLevel < levelAssets.length ? `/${levelAssets[currentLevel].threshold}` : "/MAX";
    }
    ctx.fillText(`SKOR: ${Math.floor(score)}${targetText}`, 15, 25);
    
    ctx.fillStyle = "#ffd600";
    ctx.fillText(`ALTIN: ${goldCount}`, 15, 42);
    
    // SAĞ TARAF (KASA & LEVEL)
    ctx.textAlign = "right";
    ctx.fillStyle = "#f2c94c";
    ctx.fillText(`💰KASA: ${totalGold}`, canvas.width - 15, 25);
    
    // Level Kutusu (Daha Şık ve Simetrik)
    let lvlText = `LVL ${currentLevel}`;
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
}

function gameLoop(timestamp) {
    if (!isPlaying || isPaused) return;
    let dt = (timestamp - lastTime) / 1000; 
    if (dt > 0.1) dt = 0.1;
    lastTime = timestamp;

    update(dt);
    if(isPlaying){
        draw();
        requestAnimationFrame(gameLoop);
    } else draw();
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => { 
    if (deathCountForX2 >= 3) deathCountForX2 = 0; // Teklifi pas geçip baştan başlarsa 3 el daha ceza!
    startGame(); 
});

if(pauseBtn) pauseBtn.addEventListener('click', togglePause);
if(resumeBtn) resumeBtn.addEventListener('click', togglePause);
if(quitBtn) quitBtn.addEventListener('click', () => {
    isPaused = false;
    isPlaying = false;
    if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    if(pauseScreen) {
        pauseScreen.classList.remove('active');
        pauseScreen.classList.add('hidden');
        pauseScreen.style.display = '';
    }
    if(pauseBtn) pauseBtn.style.display = 'none';
    
    startScreen.classList.remove('hidden');
    startScreen.classList.add('active');
    
    totalGold += goldCount;
    saveGame();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

if(reviveBtn) {
    reviveBtn.addEventListener('click', () => {
        showRewardedAd(reviveBtn, "▶ Reklam İzle & Canlan", () => {
            // Oyunu Puan ve Altın silmeden Kaldırıldığı Yerden Devam Ettir
            player.y = canvas.height - 150; // Güvenli bölgeye al
            player.x = canvas.width / 2 - player.width / 2;
            obstacles = []; // Ekrandaki kütükleri sil
            
            gameOverScreen.classList.remove('active'); 
            gameOverScreen.classList.add('hidden');
            if(pauseBtn) pauseBtn.style.display = 'block';
            
            isPlaying = true;
            isGameOver = false;
            lastTime = performance.now();
            
            initAudio();
            if (audioCtx) {
                nextNoteTime = audioCtx.currentTime + 0.1;
            }
            bgMusicScheduler();
            
            requestAnimationFrame(gameLoop);
        });
    });
}

if(x2GoldBtn) {
    x2GoldBtn.addEventListener('click', () => {
        showRewardedAd(x2GoldBtn, "💰 x2 Altın Katlayıcıyla Başla (Reklam)", () => {
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
        showRewardedAd(adGoldBtn, "🎁 +50 Altın (Reklam İzle)", () => {
            totalGold += 50; 
            saveGame();
            updateShopUI();
            for(let i=0; i<4; i++) setTimeout(playCoinSound, i*100);
        });
    });
}

function saveGame() {
    const data = {
        gold: totalGold,
        magnet: magnetLevel,
        shield: shieldLevel,
        music: isMusicEnabled,
        sfx: isSFXEnabled
    };
    localStorage.setItem('riverEscapeSave', JSON.stringify(data));
}

function loadGame() {
    const saved = localStorage.getItem('riverEscapeSave');
    if (saved) {
        const data = JSON.parse(saved);
        totalGold = data.gold || 0;
        magnetLevel = data.magnet || 0;
        shieldLevel = data.shield || 0;
        isMusicEnabled = (data.music !== undefined) ? data.music : true;
        isSFXEnabled = (data.sfx !== undefined) ? data.sfx : true;
        
        // UI'yı güncelle
        const mTog = document.getElementById('music-toggle');
        const sTog = document.getElementById('sfx-toggle');
        if(mTog) mTog.checked = isMusicEnabled;
        if(sTog) sTog.checked = isSFXEnabled;

        updateShopUI();
    }
}

// AYARLAR EVENTLERI
const settingsScreen = document.getElementById('settings-screen');
const settingsOpenBtn = document.getElementById('settings-open-btn');
const settingsCloseBtn = document.getElementById('settings-close-btn');

if(settingsOpenBtn) {
    settingsOpenBtn.addEventListener('click', () => {
        settingsScreen.classList.remove('hidden');
        settingsScreen.classList.add('active');
    });
}

const pSettingsOpenBtn = document.getElementById('pause-settings-open-btn');
if(pSettingsOpenBtn) {
    pSettingsOpenBtn.addEventListener('click', () => {
        settingsScreen.classList.remove('hidden');
        settingsScreen.classList.add('active');
    });
}

if(settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', () => {
        isMusicEnabled = document.getElementById('music-toggle').checked;
        isSFXEnabled = document.getElementById('sfx-toggle').checked;
        saveGame();
        settingsScreen.classList.remove('active');
        settingsScreen.classList.add('hidden');
    });
}

loadGame();
