// River Escape - Varlık Yükleyici (Asset Loader) - v1.99.31.00 (ATMOSPHERIC MASTER)
const version = "1.99.32.00";
const players = { ilkbahar: null, yaz: null, sonbahar: null, kis: null, lava: null, void: null, nostalji: null };
var iPI = null; // v1.99.31.00: Universal Default Ship Identifier
var playerImg = null;

// GÖRSELLERİ ŞEFFAFLAŞTIRAN SİHİRLİ FONKSİYON - v110 (Yüksek Çözünürlük & Local Mühür)
function makeWhiteTransparent(imageElement, isAggressive = false) {
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
            let r = data[i], g = data[i + 1], b = data[i + 2];
            // ELITE v1.99.3.31.9.5: Daha agresif beyaz temizliği (210+)
            if (r > 210 && g > 210 && b > 210) {
                data[i + 3] = 0;
            } else if (isAggressive) {
                // Anti-Alias Halation Cleanup (Grey/White fringing pixels)
                let maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
                if (r > 60 && g > 60 && b > 60 && maxDiff < 40) {
                    data[i + 3] = 0;
                }
            }
        }
        offCtx.putImageData(imgData, 0, 0);
    } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
let bgImgVoid = loadBg('void', 'assets/ArkaPlan_Lav.png'); // v1.99.27.09: ELITE VOID FALLBACK
let bgImgLagoon = loadBg('lagoon', 'assets/ArkaPlan_Lagoon.png'); // v1.99.14.0: ELITE LAGOON

// v1.99.30.06: MODULAR COLLECTION LOADER
if (window.ELITE_COLLECTIONS && window.ELITE_COLLECTIONS.boats) {
    window.ELITE_COLLECTIONS.boats.forEach(boat => {
        safeLoad('Boat_' + boat.id, boat.asset, (img) => {
            players[boat.id] = makeWhiteTransparent(img);
            // Default player image assignment
            if (boat.id === 'ilkbahar') {
                iPI = players.ilkbahar;
                playerImg = players.ilkbahar;
            }
        });
    });
}

let bgImg = bgImgIlkbahar;
// playerImg initialized globally above

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
            obsTiles[key][type] = makeWhiteTransparent(img, key === 'lava');
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

loadIndividualTiles('kis', 'assets/rock_elite_winter.png', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');
loadIndividualTiles('lava', 'assets/rock_elite_lava.png', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');
safeLoad('lava_geyser', 'assets/lava_geyser.png', (img) => {
    obsTiles['lava_geyser'] = makeWhiteTransparent(img, true);
});
safeLoad('kite_elite', 'assets/kite_elite.png', (img) => {
    obsTiles['kite_elite'] = makeWhiteTransparent(img, false);
});
loadIndividualTiles('void', '', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');
loadIndividualTiles('lagoon', 'assets/duck_elite.png', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');
safeLoad('plane_elite', 'assets/plane_elite.png', (img) => {
    obsTiles['plane_elite'] = makeWhiteTransparent(img, false);
});

// v1.99.14.4: INDIVIDUAL SCATTERED BALLOONS (Elite)
safeLoad('balloon_red', 'assets/balloon_red_elite.png', (img) => { obsTiles['balloon_red'] = makeWhiteTransparent(img, false); });
safeLoad('balloon_blue', 'assets/balloon_blue_elite.png', (img) => { obsTiles['balloon_blue'] = makeWhiteTransparent(img, false); });
safeLoad('balloon_yellow', 'assets/balloon_yellow_elite.png', (img) => { obsTiles['balloon_yellow'] = makeWhiteTransparent(img, false); });

// PARALLAX SİSTEMİ (BULUTLAR/SİS)
let clouds = [];
function initClouds() {
    clouds = [];
    for (let i = 0; i < 8; i++) {
        clouds.push({
            x: Math.random() * 800 - 100,
            y: Math.random() * 800,
            r: Math.random() * 100 + 50,
            opacity: Math.random() * 0.15 + 0.05
        });
    }
}
initClouds();
