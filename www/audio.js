// River Escape - Ses Motoru (Audio Engine) - v1.96.9.5 (FINAL L4)
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
            // v1.96.5.0: DİNAMİK ÖLÜM VADİSİ (DZ) MANTIĞI
            let isDZ = 
                (currentLevel === 1 && score >= 900) || 
                (currentLevel === 2 && score >= 2200) || 
                (currentLevel === 3 && score >= 4200) || 
                (currentLevel === 4 && score >= 6700) || 
                (currentLevel === 5 && score >= 9600) || 
                (currentLevel === 6 && score >= 13500) ||
                (currentLevel >= 7 && (score % 1000 >= 800));

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
    const startTime = audioCtx.currentTime;
    const notes = [523.25, 392.00, 329.63, 261.63]; 
    
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime + i * 0.15);
        gain.gain.setValueAtTime(0.3 * isSFXVolume, startTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + (i + 1) * 0.15);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(startTime + i * 0.15);
        osc.stop(startTime + (i + 1) * 0.15);
    });
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

function updateAmbientWind(level, isPlaying) {
    if(!audioCtx) return;
    if(!windSource) initWindGenerator();
    
    // v1.96.9.2: Oyun durunca rüzgar da DURUR.
    const targetGain = (level === 4 && isPlaying) ? (0.15 * isSFXVolume) : 0;
    const now = audioCtx.currentTime;
    
    // Yumuşak geçiş (Fade In/Out)
    windGain.gain.setTargetAtTime(targetGain, now, 0.5);
    
    if (level === 4 && isPlaying) {
        // Rüzgar uğultu dalgalanması (Modulation)
        const howl = 400 + Math.sin(now * 0.5) * 200 + Math.random() * 100;
        windFilter.frequency.setTargetAtTime(howl, now, 0.2);
    }
}
