// TEMEL ELEMENTLER --------------------------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElem = document.getElementById('scoreValue');
const goldElem = document.getElementById('goldValue');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreElem = document.getElementById('finalScoreValue');
const finalGoldElem = document.getElementById('finalGoldValue');

function resizeCanvas() {
    canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); 

// SES EFEKTLERİ (Web Audio API) -------------------------
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if(!audioCtx) {
        audioCtx = new AudioContext();
    }
}

// Para sesi (Tatlı yüksek frekanslı bip)
function playCoinSound() {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime); // Yüksek nota
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1); // Daha da tizleş
    
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// Çarpışma sesi (Kalın boğuk patlama)
function playCrashSound() {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3); 
    
    gainNode.gain.setValueAtTime(0.8, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

// GÖRSELLERİ ŞEFFAFLAŞTIRAN SİHİRLİ FONKSİYON -------------
// Beyaz arka planı siler (Chroma Keying / Magic Wand mantığı)
function makeWhiteTransparent(imageElement) {
    if (imageElement.src.includes('ArkaPlan')) return imageElement; // Sadece obje sprite'larında sil

    const offCanvas = document.createElement('canvas');
    offCanvas.width = imageElement.width;
    offCanvas.height = imageElement.height;
    const offCtx = offCanvas.getContext('2d');
    
    offCtx.drawImage(imageElement, 0, 0);
    const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const data = imgData.data;

    // Her pikselin RGBA değerini kontrol et (Beyaza yakınsa saydam yap)
    for (var i = 0; i < data.length; i += 4) {
        let r = data[i], g = data[i+1], b = data[i+2];
        if (r > 220 && g > 220 && b > 220) { // Saf beyazdan hafif grilere kadar olan aralık
            data[i+3] = 0; // Alpha'yı (Şeffaflık) 0 yap 
        }
    }
    
    offCtx.putImageData(imgData, 0, 0);
    
    // Değiştirilmiş transparan resmi döndür
    const newImg = new Image();
    newImg.src = offCanvas.toDataURL();
    return newImg;
}

// RESİMLER (Assets)
let bgImg = new Image();
bgImg.src = 'assets/ArkaPlan.png'; // Arkaplanda silinme yok

let playerImg = new Image();
playerImg.onload = () => { playerImg = makeWhiteTransparent(playerImg); };
playerImg.src = 'assets/Kayik.png';

let obsImg = new Image();
obsImg.onload = () => { obsImg = makeWhiteTransparent(obsImg); };
obsImg.src = 'assets/Kutuk.png';

// OYUN DEĞİŞKENLERİ ---------------------------------------
let isPlaying = false;
let isGameOver = false;
let score = 0;
let goldCount = 0;
let lastTime = 0;

let bgY = 0; 
const bgScrollSpeed = 100; 

// PLAYER
const player = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    width: 60,
    height: 100,
    speed: 300 
};

// KONTROLLER
const keys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };
window.addEventListener('keydown', (e) => {
    if(keys.hasOwnProperty(e.key) || e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'd'){
        const key = e.key.toLowerCase();
        if(key === 'a') keys['a'] = true;
        if(key === 'd') keys['d'] = true;
        if(e.key === 'ArrowLeft') keys['ArrowLeft'] = true;
        if(e.key === 'ArrowRight') keys['ArrowRight'] = true;
    }
});
window.addEventListener('keyup', (e) => {
    if(keys.hasOwnProperty(e.key) || e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'd'){
        const key = e.key.toLowerCase();
        if(key === 'a') keys['a'] = false;
        if(key === 'd') keys['d'] = false;
        if(e.key === 'ArrowLeft') keys['ArrowLeft'] = false;
        if(e.key === 'ArrowRight') keys['ArrowRight'] = false;
    }
});

let touchX = null;
canvas.addEventListener('touchstart', (e) => { 
    e.preventDefault(); 
    if(e.touches.length > 0) touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
}, {passive: false});
canvas.addEventListener('touchmove', (e) => { 
    e.preventDefault();
    if(e.touches.length > 0) touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
}, {passive: false});
canvas.addEventListener('touchend', () => { touchX = null; });

// SPAWNERLAR
let obstacles = [];
let golds = [];
let spawnInterval = 1.5; 
let spawnTimer = 0;
let goldSpawnInterval = 2.0;
let goldTimer = 0;

function spawnObstacle() {
    obstacles.push({
        x: Math.random() * (canvas.width - 50 - 20) + 10,
        y: -100,
        width: 50,
        height: 50,
        speed: 250 + Math.random() * 100
    });
}

function spawnGold() {
    golds.push({
        x: Math.random() * (canvas.width - 30 - 20) + 10,
        y: -50,
        radius: 15,
        speed: 250, // Sabit hızda nehirle aksın
        angle: 0    // Dönme animasyonu için
    });
}

// OYUN DÖNGÜSÜ ------------------------------------------

function startGame() {
    initAudio(); // Kullanıcı dokunduğunda sesi başlat ki tarayıcı güvenlik onayı versin
    isPlaying = true;
    isGameOver = false;
    score = 0;
    goldCount = 0;
    obstacles = [];
    golds = [];
    player.x = canvas.width / 2 - player.width / 2;
    spawnTimer = 0;
    goldTimer = 0;
    lastTime = performance.now();
    
    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');
    gameOverScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    playCrashSound(); // Çarpma Sesi
    isPlaying = false;
    isGameOver = true;
    finalScoreElem.innerText = Math.floor(score);
    finalGoldElem.innerText = goldCount;
    
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('active');
}

function update(dt) {
    if (!isPlaying) return;

    // Skor ve UI Güncelle
    score += dt * 5; 
    scoreElem.innerText = Math.floor(score);
    goldElem.innerText = goldCount;

    // Arka Plan
    bgY += bgScrollSpeed * dt;
    if (bgY >= canvas.height) bgY = 0;

    // Hareket
    let dx = 0;
    if (keys.ArrowLeft || keys.a) dx = -1;
    if (keys.ArrowRight || keys.d) dx = 1;

    if(touchX !== null) {
        if (touchX < player.x + player.width/2 - 10) dx = -1;
        else if (touchX > player.x + player.width/2 + 10) dx = 1;
    }

    player.x += dx * player.speed * dt;
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

    // Engle Doğdurması
    spawnTimer += dt;
    if (spawnTimer >= spawnInterval) {
        spawnObstacle();
        spawnTimer = 0;
        if(spawnInterval > 0.6) spawnInterval -= 0.02; // Zorlaştır
    }

    // Altın Doğdurması
    goldTimer += dt;
    if(goldTimer >= goldSpawnInterval) {
        spawnGold();
        goldTimer = 0;
    }

    // Hitbox Sınırları (Kayık)
    let px = player.x + 10, py = player.y + 10, pw = player.width - 20, ph = player.height - 20;

    // Altın Çarpışma Testi
    for (let i = golds.length - 1; i >= 0; i--) {
        let g = golds[i];
        g.y += g.speed * dt;
        g.angle += dt * 5; // Altını döndür
        
        // AABB (Altın dairesini kare gibi kontrol ediyoruz basitlik için)
        if (px < g.x + g.radius && px + pw > g.x - g.radius &&
            py < g.y + g.radius && py + ph > g.y - g.radius) {
            playCoinSound(); // Altın Parası Sesi
            goldCount++;
            golds.splice(i, 1); // Toplandıysa sil
            continue;
        }
    }
    golds = golds.filter(g => g.y < canvas.height + 50);

    // Kütük Çarpışma Testi
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.y += obs.speed * dt; 

        if (px < obs.x + obs.width && px + pw > obs.x &&
            py < obs.y + obs.height && py + ph > obs.y) {
            gameOver();
        }
    }
    obstacles = obstacles.filter(obs => obs.y < canvas.height + 100);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(bgImg.complete) {
        let sy = bgY - canvas.height;
        ctx.drawImage(bgImg, 0, sy, canvas.width, canvas.height + 5); 
        ctx.drawImage(bgImg, 0, bgY, canvas.width, canvas.height + 5);
    }

    // Altın Çizimi (Canvas ile Sarıp Parlatılmış Daire)
    golds.forEach(g => {
        ctx.save();
        ctx.translate(g.x, g.y);
        // Spin Animasyonu Yanılsaması (Y Ekseni daralma)
        ctx.scale(Math.abs(Math.sin(g.angle)), 1); 
        
        ctx.beginPath();
        ctx.arc(0, 0, g.radius, 0, Math.PI * 2);
        ctx.fillStyle = "gold";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#D4AF37"; // Koyu sarı kenar
        ctx.stroke();
        
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", 0, 0); // Üzerinde altın işareti
        
        ctx.restore();
    });

    // Kütük
    obstacles.forEach(obs => {
        if(obsImg.complete) ctx.drawImage(obsImg, obs.x, obs.y, obs.width, obs.height);
    });

    // Kayık (Şeffaflaştırılmış)
    if(playerImg.complete) {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    }
}

function gameLoop(timestamp) {
    if (!isPlaying) return;
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
    spawnInterval = 1.5; 
    startGame();
});
