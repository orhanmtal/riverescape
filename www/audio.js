// River Escape - Ses Motoru (Audio Engine) - v1.99.32.08 (SCOPE PROTECTION)
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
    const now = audioCtx.currentTime;
    
    // v1.99.14.31: Elite Golden Shine (Two-tone crystal chime)
    // Layer 1: Fundamental "Ping"
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(987.77, now); // B5 note
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1); // E6 note
    gain1.gain.setValueAtTime(0.3 * isSFXVolume, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc1.connect(gain1); gain1.connect(audioCtx.destination);
    osc1.start(now); osc1.stop(now + 0.15);

    // Layer 2: High-frequency "Sparkle"
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.53, now + 0.05); // B6 note
    gain2.gain.setValueAtTime(0.15 * isSFXVolume, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc2.connect(gain2); gain2.connect(audioCtx.destination);
    osc2.start(now + 0.05); osc2.stop(now + 0.2);
}

function playCrashSound() {
    if(!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // v1.99.14.30: Elite Hit Sound (Shorter, punchy version of death)
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
    
    gain.gain.setValueAtTime(0.4 * isSFXVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.3);
}

function playEliteDeathEffect() {
    if(!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // v1.99.14.29: Extreme Death (Sawtooth Sweep + Low Rumble)
    // Eski "tıp-tıp" sesinden tamamen farklı, agresif bir ses.

    // 1. Derin Patlama (Low Rumble)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.5);
    gain1.gain.setValueAtTime(0.4 * isSFXVolume, now);
    gain1.gain.linearRampToValueAtTime(0, now + 0.5);
    osc1.connect(gain1); gain1.connect(audioCtx.destination);
    osc1.start(now); osc1.stop(now + 0.5);

    // 2. Metalik Siren İnişi (Falling Alarm)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 1.2);
    gain2.gain.setValueAtTime(0.15 * isSFXVolume, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    osc2.connect(gain2); gain2.connect(audioCtx.destination);
    osc2.start(now); osc2.stop(now + 1.2);
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
// --- v1.99.30.06: DYNAMIC ENGINE GENERATOR (MASTER RUMBLE REMOVED v1.99.33.00) ---
// Procedural ambient sounds removed to restore original sound profile.

function playWhooshSound() {
    if(!audioCtx) return;
    const now = audioCtx.currentTime;
    const noise = audioCtx.createBufferSource();
    const bSize = audioCtx.sampleRate * 0.25;
    const buffer = audioCtx.createBuffer(1, bSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0; i<bSize; i++) data[i] = Math.random()*2-1;
    noise.buffer = buffer;
    
    const f = audioCtx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(3000, now);
    f.frequency.exponentialRampToValueAtTime(500, now + 0.2);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.2 * isSFXVolume, now + 0.05);
    g.gain.linearRampToValueAtTime(0, now + 0.25);
    noise.connect(f); f.connect(g); g.connect(audioCtx.destination);
    noise.start(now); noise.stop(now + 0.25);
}

function playUIClick() {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
    g.gain.setValueAtTime(0.12 * isSFXVolume, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

// v1.99.61.81: ELITE ACTION SOUNDS
function playShootSound() {
    if(!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
    g.gain.setValueAtTime(0.2 * isSFXVolume, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.15);
}

function playArmorSound() {
    if(!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(1760, now + 0.1);
    osc.frequency.linearRampToValueAtTime(880, now + 0.2);
    g.gain.setValueAtTime(0.3 * isSFXVolume, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.2);
}

function playJumpSound() {
    if(!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.2);
    g.gain.setValueAtTime(0.25 * isSFXVolume, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.2);
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
