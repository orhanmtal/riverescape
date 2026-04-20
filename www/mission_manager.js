/**
 * River Escape - Elite Mission Engine v1.0
 * Manages daily quests, milestones and rewards.
 */

window.MissionManager = (function() {
window.MissionManager = (function() {
    let missions = [
        { id: 'destroy_obstacle_100', labelTR: 'Engel Avcısı', labelEN: 'Obstacle Destroyer', descTR: '100 engeli bomba veya kalkanla yok et.', descEN: 'Destroy 100 obstacles with bombs or shield.', target: 100, current: 0, reward: 500, type: 'destroy_obstacle', completed: false },
        { id: 'gold_200', labelTR: 'Altın Avcısı', labelEN: 'Gold Hunter', descTR: '200 altın topla.', descEN: 'Collect 200 gold in one run.', target: 200, current: 0, reward: 500, type: 'gold', completed: false }
    ];

    let missionCycle = 1;

    function init() {
        const saved = localStorage.getItem('riverEscapeMissions');
        const cycleSaved = localStorage.getItem('riverEscapeMissionCycle');
        
        if (cycleSaved) missionCycle = parseInt(cycleSaved);
        if (missionCycle > 5) missionCycle = 1; // v1.99.33.70: Limit protect

        if (saved) {
            const savedData = JSON.parse(saved);
            missions.forEach(m => {
                const s = savedData.find(dm => dm.id === m.id);
                if (s) {
                    m.current = s.current;
                    m.completed = s.completed;
                }
                // Ölçeklenmiş hedefleri/ödülleri uygula (v1.99.33.70: Her zaman init sırasında skalalamalı)
                applyCycleScaling(m);
            });
        } else {
            missions.forEach(m => applyCycleScaling(m));
        }
        console.log(`🎯 [MISSION ENGINE] System Initialized. Cycle: ${missionCycle}/5`);
    }

    function applyCycleScaling(mission) {
        // v1.99.33.70: LINEAR SCALING PER USER REQUEST
        // Target: +50% per set. Reward: +25% per set.
        const targetMultiplier = 1 + (0.5 * (missionCycle - 1));
        const rewardMultiplier = 1 + (0.25 * (missionCycle - 1));

        const baseValues = {
            destroy_obstacle_100: { t: 100, r: 500 },
            gold_200: { t: 200, r: 500 }
        };
        
        if (baseValues[mission.id]) {
            mission.target = Math.ceil(baseValues[mission.id].t * targetMultiplier);
            mission.reward = Math.ceil(baseValues[mission.id].r * rewardMultiplier);
        }
    }

    function save() {
        localStorage.setItem('riverEscapeMissions', JSON.stringify(missions));
        localStorage.setItem('riverEscapeMissionCycle', missionCycle);
    }

    function notify(type, value = 1) {
        let changed = false;
        missions.forEach(m => {
            if (m.id.includes(type) && !m.completed) {
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
                if (missionCycle > 5) {
                    missionCycle = 1;
                    if (typeof window.showToast === 'function') {
                        window.showToast("💎 TÜM SETLER BİTTİ! DÖNGÜ SIFIRLANDI.", true);
                    }
                }

                missions.forEach(m => {
                    m.completed = false;
                    m.current = 0;
                    applyCycleScaling(m);
                });
                save();
                if (typeof window.showToast === 'function') {
                    window.showToast(`🔥 SET ${missionCycle}/5 BAŞLADI`, true);
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
        if (header) {
            const setLabel = window.currentLang === 'tr' ? 'SET' : 'SET';
            header.innerText = `${window.currentLang === 'tr' ? 'HEDEFLER' : 'MISSIONS'} [${setLabel} ${missionCycle}/5] 🎯`;
        }

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
