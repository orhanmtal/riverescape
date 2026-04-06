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
            // Ekstra güvenlik: Çok parlak beyazları da uçur
            if (r > 245 && g > 245 && b > 245) { 
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
    // crossOrigin silindi local icin 

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
        bgImgs[key] = offCtx; 
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
let bgImgVoid = loadBg('void', 'assets/ArkaPlan_Void.png');

const players = { ilkbahar: null, yaz: null, sonbahar: null, kis: null, lava: null, void: null };

let iPI = new Image(); // crossOrigin silindi (local ship)



iPI.onload = () => { players.ilkbahar = makeWhiteTransparent(iPI); if (typeof currentLevel !== 'undefined' && currentLevel===1) playerImg = players.ilkbahar; }; iPI.src = 'assets/Kayik.png';

let iPY = new Image(); // crossOrigin silindi (local)

iPY.onload = () => { players.yaz = makeWhiteTransparent(iPY); }; iPY.src = 'assets/Kayik_Yaz.png';

let iPS = new Image(); // crossOrigin silindi (local)

iPS.onload = () => { players.sonbahar = makeWhiteTransparent(iPS); }; iPS.src = 'assets/Kayik_Sonbahar.png';

let iPK = new Image(); // crossOrigin silindi (local)

iPK.onload = () => { players.kis = makeWhiteTransparent(iPK); }; iPK.src = 'assets/Kayik_Kis.png';

let bgImg = bgImgIlkbahar; 
let playerImg = iPI; 

let obsImg = new Image();
// crossOrigin silindi (local)

obsImg.onload = () => { obsImg = makeWhiteTransparent(obsImg); };
obsImg.src = 'assets/Kutuk.png';

let magImg = new Image(); // crossOrigin silindi (local)
 
magImg.onload = () => { magImg = makeWhiteTransparent(magImg); }; magImg.src = 'assets/Miknatis.png';

let shdImg = new Image(); // crossOrigin silindi (local)
 
shdImg.onload = () => { shdImg = makeWhiteTransparent(shdImg); }; shdImg.src = 'assets/Kalkan.png';

let crocImg = new Image(); // crossOrigin silindi (local)

crocImg.onload = () => { crocImg = makeWhiteTransparent(crocImg); }; crocImg.src = 'assets/Timsah.png';

let hippoImg = new Image(); // crossOrigin silindi (local)

hippoImg.onload = () => { hippoImg = makeWhiteTransparent(hippoImg); }; hippoImg.src = 'assets/Hippo.png';

// --- v2.00 INDIVIDUAL ELITE ASSETS (No more Grid!) ---
let obsTiles = {};
function loadIndividualTiles(key, rockSrc, logSrc, crocSrc, hippoSrc) {
    obsTiles[key] = { isIndividual: true };
    const load = (type, src) => {
        if (!src) return;
        let img = new Image();
        img.onload = () => { obsTiles[key][type] = makeWhiteTransparent(img); };
        img.src = src;
    };
    load('rock', rockSrc);
    load('horizontal_log', logSrc);
    load('vertical_log', logSrc);
    load('vertical', logSrc); // Geri uyumluluk
    load('croc', crocSrc);
    load('hippo', hippoSrc);
}

// Level-Specific Assets (Elite Individual System)
loadIndividualTiles('ilkbahar', '', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');
loadIndividualTiles('yaz', '', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');
loadIndividualTiles('sonbahar', '', 'assets/Kutuk.png', 'assets/Timsah.png', 'assets/Hippo.png');

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
