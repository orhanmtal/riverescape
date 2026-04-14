// River Escape - Ses Motoru (Audio Engine) - v1.99.14.28 (AUDIO REBORN)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if(!audioCtx) audioCtx = new AudioContext();
    if(audioCtx.state === 'suspended') audioCtx.resume();
}

// 8-Bit Oyun Müziği Jeneratörü (Sequencer)
const scale = [220.00, 261.63, 329.63, 440.00, 523.25, 659.25, 392.00, 293.66]; 
const melody = [0, 1, 2, 3,  0, 1, 2, 4,  5, 4, 3, 0,  6, 7, 1, 2]; 
let isMusicScheduled = false;
let currentNote = 0;
let nextNoteTime = 0;

function bgMusicScheduler() {
    if (!isPlaying) { isMusicScheduled = false; return; }
    isMusicScheduled = true;

    if (!isPaused && audioCtx) {
        // nextNoteTime geride kaldıysa (pause sonrası), şimdiden devam et
        if (nextNoteTime < audioCtx.currentTime) {
            nextNoteTime = audioCtx.currentTime + 0.05;
        }
        while (nextNoteTime < audioCtx.currentTime + 0.1) {
            // v1.99.14.23: ELITE DZ SYNC - Zaman bazlı (levelProgressTime) kesin %10 kuralı
            let pVal = (typeof levelProgressTime !== 'undefined') ? (levelProgressTime * 5) % 18000 : score; 
            let isDZ = (typeof getDZStatus === 'function') ? getDZStatus() : (
                (currentLevel === 1 && pVal >= 900) || 
                (currentLevel === 2 && pVal >= 2350) || 
                (currentLevel === 3 && pVal >= 4300) || 
                (currentLevel === 4 && pVal >= 6750) || 
                (currentLevel === 5 && pVal >= 9700) || 
                (currentLevel === 6 && pVal >= 13600) ||
                (currentLevel >= 7 && (pVal % 1000 >= 900))
            );

            playMelodyNote(melody[currentNote], nextNoteTime, isDZ);
            nextNoteTime += isDZ ? 0.10 : 0.2; // Ölüm Vadisi'nde tempo hızlanır
            currentNote = (currentNote + 1) % melody.length;
        }
    }
    // Pause'da da setTimeout devam eder, resume'da hemen devreye girer
    setTimeout(bgMusicScheduler, 30);
}

let isMusicVolume = 1.0; 
let isSFXVolume = 1.0;
let isVibrationEnabled = true;

function playMelodyNote(noteIndex, time, isPanic = false) {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = isPanic ? 'sawtooth' : 'triangle'; 
    osc.frequency.value = scale[noteIndex] * (isPanic ? 0.8 : 1); 
    
    // Ses Seviyesi Ayarı (Sayısal volume üzerinden)
    let baseGain = isPanic ? 0.12 : 0.08;
    let finalGain = baseGain * isMusicVolume;
    
    gainNode.gain.setValueAtTime(finalGain, time); 
    gainNode.gain.linearRampToValueAtTime(finalGain * 0.1, time + (isPanic ? 0.08 : 0.15)); 
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + 0.2);
}

function playCoinSound() {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.1); 
    
    let finalGain = 0.5 * isSFXVolume;
    gainNode.gain.setValueAtTime(finalGain, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function playCrashSound() {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15); 
    
    let finalGain = 0.5 * isSFXVolume;
    gainNode.gain.setValueAtTime(finalGain, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.15);
}

function playDeathSound() {
    if(!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // v1.99.14.28: Elite Death Sound (Explosion + Pitch Dive)
    
    // 1. White Noise Explosion
    const bufferSize = audioCtx.sampleRate * 0.4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = audioCtx.createGain();
    const noiseFilter = audioCtx.createBiquadFilter();
    
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(10, now + 0.4);
    
    noiseGain.gain.setValueAtTime(0.3 * isSFXVolume, now);
    noiseGain.gain.linearRampToValueAtTime(0, now + 0.4);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);
    
    // 2. Square Power-Down Tone
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);
    
    oscGain.gain.setValueAtTime(0.2 * isSFXVolume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
}

function playPowerupSound() {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime); 
    osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.1); 
    osc.frequency.linearRampToValueAtTime(1600, audioCtx.currentTime + 0.2); 
    gainNode.gain.setValueAtTime(0.5 * isSFXVolume, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.4);
}

function playSpinClick() {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15 * isSFXVolume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.05);
}

function playSpinReward() {
    if(!audioCtx) return;
    const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
    const now = audioCtx.currentTime;
    notes.forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.1);
        gain.gain.setValueAtTime(0.3 * isSFXVolume, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.3);
    });
}

function playVictoryFanfare() {
    if(!audioCtx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00]; // C5, E5, G5, C6, E6, G6, C7
    const now = audioCtx.currentTime;
    notes.forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = (i % 2 === 0) ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.12);
        gain.gain.setValueAtTime(0.8 * isSFXVolume, now + i * 0.12); // v157: SES %100 ARTTI
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.6);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.6);
    });
}

function triggerVibration(pattern) {
    if (isVibrationEnabled && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}
// --- PROCEDURAL WIND GENERATOR (DONDURUCU VADİ) v1.96.8.4 ---
let windSource, windGain, windFilter;
function initWindGenerator() {
    if(!audioCtx || windSource) return;
    
    // White Noise Buffer
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }

    windSource = audioCtx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    windFilter = audioCtx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 400;

    windGain = audioCtx.createGain();
    windGain.gain.value = 0; // Kapalı başlar

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(audioCtx.destination);
    windSource.start();
}

// --- v1.97.0.1: PROCEDURAL LAVA BUBBLING (LAVA RIVER) ---
let lavaSource, lavaGain, lavaFilter, lavaRumble;
function initLavaGenerator() {
    if(!audioCtx || lavaSource) return;
    
    // 1. Deep Rumble (Low Frequency Noise)
    const rumbleSize = 2 * audioCtx.sampleRate;
    const rumbleBuffer = audioCtx.createBuffer(1, rumbleSize, audioCtx.sampleRate);
    const rumbleData = rumbleBuffer.getChannelData(0);
    for (let i = 0; i < rumbleSize; i++) { rumbleData[i] = Math.random() * 2 - 1; }
    
    lavaRumble = audioCtx.createBufferSource();
    lavaRumble.buffer = rumbleBuffer;
    lavaRumble.loop = true;
    
    lavaFilter = audioCtx.createBiquadFilter();
    lavaFilter.type = 'lowpass';
    lavaFilter.frequency.value = 100; // Çok derin uğultu
    
    lavaGain = audioCtx.createGain();
    lavaGain.gain.value = 0;
    
    lavaRumble.connect(lavaFilter);
    lavaFilter.connect(lavaGain);
    lavaGain.connect(audioCtx.destination);
    lavaRumble.start();
}

function updateAmbientLava(level, isPlaying) {
    if(!audioCtx) return;
    if(!lavaRumble) initLavaGenerator();
    
    const targetGain = (level === 5 && isPlaying) ? (0.25 * isSFXVolume) : 0;
    const now = audioCtx.currentTime;
    
    lavaGain.gain.setTargetAtTime(targetGain, now, 0.5);
    
    if (level === 5 && isPlaying) {
        // Rastgele Lav Fokurtusu (Random Pops)
        if (Math.random() < 0.05) {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(50 + Math.random()*100, now);
            osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
            g.gain.setValueAtTime(0.1 * isSFXVolume, now);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.connect(g); g.connect(audioCtx.destination);
            osc.start(); osc.stop(now + 0.3);
        }
    }
}

// --- v1.96.8.4: PROCEDURAL WIND UPDATE (DONDURUCU VADİ) ---
function updateAmbientWind(level, isPlaying) {
    if(!audioCtx) return;
    if(!windSource) initWindGenerator();
    
    const targetGain = (level === 4 && isPlaying) ? (0.15 * isSFXVolume) : 0;
    const now = audioCtx.currentTime;
    
    if(windGain) {
        windGain.gain.setTargetAtTime(targetGain, now, 1.0); // Yavaşça yükselir/alçalır
    }
    
    if(level === 4 && isPlaying && windFilter) {
        // Rüzgarın uğultusu (Filtre frekansını hafifçe oynat)
        const fMod = 350 + Math.sin(now) * 150;
        windFilter.frequency.setTargetAtTime(fMod, now, 0.5);
    }
}
// --- v1.96.9.5: ARKA PLAN SES GÜVENLİĞİ (Elite Safe) ---
document.addEventListener('visibilitychange', () => {
    if(!audioCtx) return;
    if (document.visibilityState === 'hidden') {
        audioCtx.suspend();
    } else {
        audioCtx.resume();
    }
});
