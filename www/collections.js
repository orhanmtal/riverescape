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
            nameTR: 'Lav Bekçisi', nameEN: 'Lava Warden', 
            asset: 'assets/Kayik.png', 
            price: 5000, 
            rarity: 'Epic',
            perk: { type: 'shield_resistence', value: 1.2, descTR: 'Kalkanlar %20 daha dayanıklı.', descEN: 'Shields are 20% more durable.' }
        },
        { 
            id: 'nostalji', 
            nameTR: 'Klasik 8-Bit', nameEN: 'Retro 8-Bit', 
            asset: 'assets/Kayik_Nostalji.png', 
            price: 2500, 
            rarity: 'Rare',
            perk: { type: 'score_boost', value: 1.1, descTR: 'Skor %10 daha hızlı artar.', descEN: 'Score increases 10% faster.' }
        },
        { 
            id: 'void', 
            nameTR: 'Boşluk Gezgini', nameEN: 'Void Walker', 
            asset: 'assets/Kayik.png', 
            price: 15000, 
            rarity: 'Elite',
            perk: { type: 'ascension_speed', value: 1.5, descTR: 'Ascension %50 daha hızlı dolar.', descEN: 'Ascension charges 50% faster.' }
        }
    ]
};
