/**
 * River Escape - Elite Mission Engine v1.0
 * Manages daily quests, milestones and rewards.
 */

window.MissionManager = (function() {
    let missions = [
        { id: 'dash_5', labelTR: 'Hızlı Gidiş', labelEN: 'Speedster', descTR: '5 kez Dash kullan.', descEN: 'Use Dash 5 times.', target: 5, current: 0, reward: 300, type: 'dash', completed: false },
        { id: 'destroy_obstacle_20', labelTR: 'Engel Avcısı', labelEN: 'Obstacle Destroyer', descTR: '20 engeli bomba veya kalkanla yok et.', descEN: 'Destroy 20 obstacles with bombs or shield.', target: 20, current: 0, reward: 600, type: 'destroy_obstacle', completed: false },
        { id: 'gold_100', labelTR: 'Altın Avcısı', labelEN: 'Gold Hunter', descTR: 'Tek seferde 100 altın topla.', descEN: 'Collect 100 gold in one run.', target: 100, current: 0, reward: 400, type: 'gold', completed: false }
    ];

    let missionCycle = 1;

    function init() {
        const saved = localStorage.getItem('riverEscapeMissions');
        const cycleSaved = localStorage.getItem('riverEscapeMissionCycle');
        
        if (cycleSaved) missionCycle = parseInt(cycleSaved);

        if (saved) {
            const savedData = JSON.parse(saved);
            missions.forEach(m => {
                const s = savedData.find(dm => dm.id === m.id);
                if (s) {
                    m.current = s.current;
                    m.completed = s.completed;
                    // Ölçeklenmiş hedefleri/ödülleri uygula
                    applyCycleScaling(m);
                }
            });
        } else {
            // İlk kurulum ölçekleme
            missions.forEach(m => applyCycleScaling(m));
        }
        console.log(`🎯 [MISSION ENGINE] System Initialized. Cycle: ${missionCycle}`);
    }

    function applyCycleScaling(mission) {
        const multiplier = Math.pow(1.25, missionCycle - 1);
        // Orijinal değerleri korumak için baseTarget gibi bir yapıya ihtiyaç var ama basitlik için direkt çarpalım
        // Not: Bu basit uygulama her seferinde baz değerden hesaplamalı.
        const baseValues = {
            dash_5: { t: 5, r: 120 },
            destroy_obstacle_20: { t: 20, r: 240 },
            gold_100: { t: 100, r: 160 }
        };
        
        if (baseValues[mission.id]) {
            mission.target = Math.ceil(baseValues[mission.id].t * multiplier);
            mission.reward = Math.ceil(baseValues[mission.id].r * multiplier);
        }
    }

    function save() {
        localStorage.setItem('riverEscapeMissions', JSON.stringify(missions));
        localStorage.setItem('riverEscapeMissionCycle', missionCycle);
    }

    function notify(type, value = 1) {
        let changed = false;
        missions.forEach(m => {
            if (m.type === type && !m.completed) {
                if (type === 'gold') {
                    m.current = value;
                } else {
                    m.current += value;
                }

                if (m.current >= m.target) {
                    m.current = m.target;
                    m.completed = true;
                    claimReward(m);
                }
                changed = true;
            }
        });
        if (changed) {
            save();
            checkAllCompleted();
        }
    }

    function checkAllCompleted() {
        const allDone = missions.every(m => m.completed);
        if (allDone) {
            setTimeout(() => {
                missionCycle++;
                missions.forEach(m => {
                    m.completed = false;
                    m.current = 0;
                    applyCycleScaling(m);
                });
                save();
                if (typeof window.showToast === 'function') {
                    window.showToast(`🔥 TÜM HEDEFLER BİTTİ! SET ${missionCycle} BAŞLADI (+%25 ZOR)`, true);
                }
                renderMissions();
            }, 2000);
        }
    }

    function claimReward(mission) {
        console.log(`🎁 [MISSION ENGINE] Reward Claimed: ${mission.labelTR} (+${mission.reward} Gold)`);
        if (window.totalGold !== undefined) {
            window.totalGold += mission.reward;
            if (typeof window.triggerEliteEconomySync === 'function') {
                window.triggerEliteEconomySync(true);
            }
        }
        if (typeof window.showToast === 'function') {
            const label = window.currentLang === 'tr' ? mission.labelTR : mission.labelEN;
            window.showToast(`🏆 ${label} TAMAMLANDI! +${mission.reward}G`, true);
        }
    }

    function getMissions() {
        return missions;
    }

    function renderMissions() {
        const list = document.getElementById('mission-list');
        const panel = document.getElementById('mission-panel');
        if (!list || !panel) return;

        panel.style.display = 'block';
        list.innerHTML = '';

        // Döngü Başlığını Ekle
        const header = panel.querySelector('h3');
        if (header) header.innerText = `${window.currentLang === 'tr' ? 'HEDEFLER' : 'MISSIONS'} [SET ${missionCycle}] 🎯`;

        missions.forEach(m => {
            const pct = (m.current / m.target) * 100;
            const item = document.createElement('div');
            item.className = 'mission-item' + (m.completed ? ' completed' : '');
            
            const label = window.currentLang === 'tr' ? m.labelTR : m.labelEN;
            
            item.innerHTML = `
                <div class="mission-info">
                    <span>${label} (${m.current}/${m.target})</span>
                    <span>${m.reward}G</span>
                </div>
                <div class="mission-bar-bg">
                    <div class="mission-bar-fill" style="width: ${pct}%"></div>
                </div>
            `;
            list.appendChild(item);
        });
    }

    function reset() {
        missionCycle = 1;
        missions.forEach(m => {
            m.current = 0;
            m.completed = false;
            applyCycleScaling(m);
        });
        localStorage.removeItem('riverEscapeMissions');
        localStorage.removeItem('riverEscapeMissionCycle');
        console.log("♻️ [MISSION ENGINE] System Reset to defaults.");
    }

    return {
        init,
        notify,
        getMissions,
        renderMissions,
        reset
    };
})();

// Initialize on load
window.MissionManager.init();
