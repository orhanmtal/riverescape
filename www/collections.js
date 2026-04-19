/**
 * River Escape - Elite Collection Config v1.0
 * Define skins, perks and rarity here.
 */

window.ELITE_COLLECTIONS = {
    boats: [
        { 
            id: 'ilkbahar', 
            nameTR: 'Baharcı', nameEN: 'Spring Rider', 
            asset: 'assets/Kayik.png', 
            price: 0, 
            rarity: 'Common',
            perk: { type: 'gold_boost', value: 1.0, descTR: 'Standart kayık.', descEN: 'Standard boat.' }
        },
        { 
            id: 'lava', 
            nameTR: 'Magma Overlord', nameEN: 'Magma Overlord', 
            asset: 'assets/magma_overlord.png', 
            price: 5000, 
            rarity: 'Epic',
            perk: { type: 'armor_regen', value: 20, descTR: 'Zırhı otomatik doldurur (20s).', descEN: 'Auto-recharges armor (20s).' }
        },
        { 
            id: 'nostalji', 
            nameTR: 'Pixel Phantom', nameEN: 'Pixel Phantom', 
            asset: 'assets/pixel_phantom.png', 
            price: 7500, 
            rarity: 'Rare',
            perk: { type: 'ghost_chance', value: 0.1, descTR: '%10 şansla hasarı engeller.', descEN: '10% chance to ghost through hits.' }
        },
        { 
            id: 'void', 
            nameTR: 'Nebula Zenith', nameEN: 'Nebula Zenith', 
            asset: 'assets/nebula_zenith.png', 
            price: 15000, 
            rarity: 'Elite',
            perk: { type: 'elite_magnet', value: 220, descTR: 'Gelişmiş Altın Mıknatısı (Sürekli).', descEN: 'Constant Elite Gold Magnet.' }
        }
    ]
};
