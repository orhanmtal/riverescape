// River Escape - Görsel ve Sahne Motoru (Assets & Scene) - v109

// GÖRSELLERİ ŞEFFAFLAŞTIRAN SİHİRLİ FONKSİYON - v110 (Yüksek Çözünürlük & Local Mühür)
function makeWhiteTransparent(imageElement) {
    if (imageElement.src.includes('ArkaPlan')) return imageElement; 

    const offCanvas = document.createElement('canvas');
    const w = imageElement.naturalWidth || imageElement.width;
    const h = imageElement.naturalHeight || imageElement.height;
    
    // Çözünürlüğü mühürle
    offCanvas.width = w;
    offCanvas.height = h;
    const offCtx = offCanvas.getContext('2d');
    
    offCtx.drawImage(imageElement, 0, 0);
    try {
        const imgData = offCtx.getImageData(0, 0, w, h);
        const data = imgData.data;

        for (var i = 0; i < data.length; i += 4) {
            let r = data[i], g = data[i+1], b = data[i+2];
            // ELITE v1.99.3.31.9: Daha agresif beyaz temizliği (230+)
            if (r > 230 && g > 230 && b > 230) { 
                data[i+3] = 0; 
            }
        }
        offCtx.putImageData(imgData, 0, 0);
    } catch(e) {
        console.warn("Local security block detected: Transparency might fail on some browsers via file:// protocol.");
    }
    
    const newImg = new Image();
    newImg.src = offCanvas.toDataURL();
    return newImg;
}


let bgImgs = {};
function loadBg(key, src) {
    let img = new Image();
    img.onload = () => {
        try {
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
            bgImgs[key] = offCtx;
            console.log(`🖼️ [ELITE ASSETS] Arka Plan Yüklendi: ${key}`);
        } catch(e) {
            console.error(`❌ [ELITE ASSETS] Arka Plan Hatası (${key}):`, e);
        }
    };
    img.src = src;
    return img;
}

// ASSETS YÜKLEME SİSTEMİ v1.99.3.30C (ZIRHLI BAŞLATMA)
console.log("🎨 [ELITE ASSETS] Başlatılıyor...");

let assetsLoadedCount = 0;
function trackAsset(name) {
    assetsLoadedCount++;
    console.log(`🖼️ [ELITE ASSETS] Yüklendi: ${name} (${assetsLoadedCount})`);
}

function safeLoad(name, src, processor = null) {
    let img = new Image();
    img.onload = () => {
        try {
            if (processor) processor(img);
            trackAsset(name);
        } catch(e) {
            console.error(`❌ [ELITE ASSETS] İşleme Hatası (${name}):`, e);
            trackAsset(name + " (FAIL)");
        }
    };
    img.onerror = (e) => {
        console.error(`❌ [ELITE ASSETS] Yükleme Hatası (${name}):`, src);
        trackAsset(name + " (FATAL)");
    };
    img.src = src;
    return img;
}

// ASSETS YÜKLEME
let bgImgIlkbahar = loadBg('ilkbahar', 'assets/ArkaPlan_Elite_Spring_Straight.png');
let bgImgYaz = loadBg('yaz', 'assets/ArkaPlan_Yaz.png');
let bgImgSonbahar = loadBg('sonbahar', 'assets/ArkaPlan_Sonbahar.png');
let bgImgKis = loadBg('kis', 'assets/ArkaPlan_Kis.png');
let bgImgLava = loadBg('lava', 'assets/ArkaPlan_Lav.png');
let bgImgVoid = loadBg('void', 'assets/ArkaPlan_Lav.png'); // v1.97.2.3: ArkaPlan_Void eksik olduğu için Lav ofsetli kullanıldı.

const players = { ilkbahar: null, yaz: null, sonbahar: null, kis: null, lava: null, void: null };

let iPI = safeLoad('Kayik_Spring', 'assets/Kayik.png', (img) => { 
    players.ilkbahar = makeWhiteTransparent(img); 
    if (typeof currentLevel !== 'undefined' && currentLevel===1) playerImg = players.ilkbahar; 
});
let iPY = safeLoad('Kayik_Yaz', 'assets/Kayik_Yaz.png', (img) => { players.yaz = makeWhiteTransparent(img); });
let iPS = safeLoad('Kayik_Sonbahar', 'assets/Kayik_Sonbahar.png', (img) => { players.sonbahar = makeWhiteTransparent(img); });
let iPK = safeLoad('Kayik_Kis', 'assets/Kayik_Kis.png', (img) => { players.kis = makeWhiteTransparent(img); });

let bgImg = bgImgIlkbahar; 
let playerImg = iPI; 

let obsImg = safeLoad('Kutuk', 'assets/Kutuk.png', (img) => { obsImg = makeWhiteTransparent(img); });
let magImg = safeLoad('Miknatis', 'assets/Miknatis.png', (img) => { magImg = makeWhiteTransparent(img); });
let shdImg = safeLoad('Kalkan', 'assets/Kalkan.png', (img) => { shdImg = makeWhiteTransparent(img); });
let crocImg = safeLoad('Timsah', 'assets/Timsah.png', (img) => { crocImg = makeWhiteTransparent(img); });
let hippoImg = safeLoad('Hippo', 'assets/Hippo.png', (img) => { hippoImg = makeWhiteTransparent(img); });

// --- v2.00 INDIVIDUAL ELITE ASSETS (No more Grid!) ---
let obsTiles = {};
function loadIndividualTiles(key, rockSrc, logSrc, crocSrc, hippoSrc) {
    obsTiles[key] = { isIndividual: true };
    const load = (type, src) => {
        if (!src) return;
        safeLoad(`${key}_${type}`, src, (img) => {
            obsTiles[key][type] = makeWhiteTransparent(img);
        });
    };
    load('rock', rockSrc);
    load('horizontal_log', logSrc);
    load('vertical_log', logSrc);
    load('vertical', logSrc); // Geri uyumluluk
    load('croc', crocSrc);
    load('hippo', hippoSrc);
}

// Level-Specific Assets (Elite Individual System)
loadIndividualTiles('ilkbahar', 'assets/rock_elite_spring.png', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');
loadIndividualTiles('yaz', 'assets/rock_elite_summer.png', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');
loadIndividualTiles('sonbahar', 'assets/rock_elite_autumn.png', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');

loadIndividualTiles('kis', '', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');
loadIndividualTiles('lava', '', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');
loadIndividualTiles('void', '', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');

// PARALLAX SİSTEMİ (BULUTLAR/SİS)
let clouds = [];
function initClouds() {
    clouds = [];
    for(let i=0; i<8; i++) {
        clouds.push({
            x: Math.random() * 800 - 100, 
            y: Math.random() * 800, 
            r: Math.random() * 100 + 50,
            opacity: Math.random() * 0.15 + 0.05
        });
    }
}
initClouds();
