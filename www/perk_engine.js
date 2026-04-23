/**
 * River Escape Elite - Perk Engine v1.99.61.81
 * Modular system for boat abilities.
 */

const PerkEngine = {
    activePerk: null,
    armorRegenTimer: 0,
    regenInterval: 20, // seconds

    init() {
        console.log("🚀 [PERK ENGINE] Initializing Modular Abilities...");
        this.sync();
    },

    // Her karede çağrılacak (Logical Update)
    update(dt) {
        if (!this.activePerk) this.sync();
        if (!this.activePerk) return;

        // 1. ARMOR REGEN LOGIC
        if (this.activePerk.type === 'armor_regen') {
            this.armorRegenTimer += dt;
            if (this.armorRegenTimer >= this.regenInterval) {
                this.armorRegenTimer = 0;
                this.applyArmorRegen();
            }
        }
    },

    applyArmorRegen() {
        // window.armorCharge ve window.updateArmorUI global engine değişkenleridir
        if (typeof window.armorCharge !== 'undefined' && window.armorCharge < 10) {
            window.armorCharge++;
            if (typeof window.showToast === 'function') {
                window.showToast(translations[window.currentLang].armorRegenToast, true);
            }
            if (typeof window.updateArmorUI === 'function') {
                window.updateArmorUI();
            }
            if (typeof window.saveGame === 'function') window.saveGame();
        }
    },

    // Collision anında çağrılacak
    checkGhostDodge() {
        if (this.activePerk && this.activePerk.type === 'ghost_chance') {
            if (Math.random() < this.activePerk.value) {
                if (typeof window.showToast === 'function') window.showToast(translations[window.currentLang].ghostedToast, true);
                if (typeof window.playWhooshSound === 'function') window.playWhooshSound();
                return true; // Dodge successful
            }
        }
        return false;
    },

    // Mıknatıs mesafesini hesapla
    getMagnetRange(baseLevelRange) {
        if (this.activePerk && this.activePerk.type === 'elite_magnet') {
            // Eğer powerup aktifse (baseLevelRange > 0), eliti üstüne ekle veya en yükseği al
            return Math.max(baseLevelRange, this.activePerk.value);
        }
        return baseLevelRange;
    },

    // Aktif kayığa göre yeteneği eşitle
    sync() {
        if (!window.ELITE_COLLECTIONS || !window.ELITE_COLLECTIONS.boats) return;
        
        // currentAsset.pKey aktif kayığın ID'sini tutar
        const activeId = (typeof window.currentAsset !== 'undefined' && window.currentAsset) ? window.currentAsset.pKey : 'spring';
        const boat = window.ELITE_COLLECTIONS.boats.find(b => b.id === activeId);
        
        if (boat) {
            this.activePerk = boat.perk;
            console.log(`✨ [PERK ENGINE] Active Perk synced: ${this.activePerk.type} (${activeId})`);
        }
    }
};

// Global erişim için mühürle
window.PerkEngine = PerkEngine;
window.PerkEngine.init();
