/**
 * RİVER ESCAPE ELİTE - game_store.js
 * Google Play Satın Alma (In-App Purchases - IAP) Modülü
 * v1.99.3.30
 */

const IAP_PACKS = [
    { id: 'gold_pack_1', amount: 5000, price: '$0.99', priceVal: 0.99, label: '5.000 GOLD' },
    { id: 'gold_pack_2', amount: 10000, price: '$1.49', priceVal: 1.49, label: '10.000 GOLD' },
    { id: 'gold_pack_3', amount: 25000, price: '$2.99', priceVal: 2.99, label: '25.000 GOLD' },
    { id: 'gold_pack_4', amount: 50000, price: '$4.99', priceVal: 4.99, label: '50.000 GOLD' }
];

const GameStore = {
    // Ürün Tanımları (Google Play Console ID'leri buraya gelecek)
    // Fiyatlandırma: 0.99$ - 1.49$ - 2.99$ - 4.99$
    PRODUCTS: IAP_PACKS.map(p => ({ id: p.id, title: p.label, amount: p.amount, priceVal: p.priceVal, type: 'consumable' })),

    init() {
        if (!window.CdvPurchase) {
            console.warn("IAP Store Plugin Not Found. (CdvPurchase)");
            return; 
        }

        const { store, ProductType, Platform } = window.CdvPurchase;

        // Ürünleri Kaydet v13+
        this.PRODUCTS.forEach(p => {
            store.register({
                id:    p.id,
                type:  p.type === 'consumable' ? ProductType.CONSUMABLE : ProductType.NON_CONSUMABLE,
                platform: Platform.GOOGLE_PLAY
            });
        });

        // Satın Alma Onaylandığında
        store.when().approved(p => {
            console.log("Purchase Approved:", p.id);
            this.handleFinalizePurchase(p);
            p.verify().then(() => p.finish()); 
        });

        // Hata Yönetimi
        store.error(e => {
            console.error("Store Error:", e);
        });

        // Mağazayı Başlat
        store.initialize([Platform.GOOGLE_PLAY]);
        console.log("IAP Store v13+ Initialized.");
    },

    // Satın Alma İşlemini Başlat
    buy(productId) {
        if (!window.CdvPurchase) {
            console.error("Store not ready.");
            // Simülasyon (Sadece Test modunda/Browserda parayı ekle)
            if (window.location.protocol === 'file:') this.handleFinalizePurchase({ id: productId });
            return;
        }
        
        const p = window.CdvPurchase.store.get(productId);
        if (p) {
            console.log("Ordering Product:", productId);
            p.order();
        } else {
            console.error("Product not found in Store:", productId);
            if (typeof showToast === 'function') showToast("Ürün Bulunamadı! Konsol ID Kontrol Et.", false);
        }
    },

    // Satın Almayı Oyuna Uygula (Altın Ekleme vb.)
    handleFinalizePurchase(p) {
        const product = this.PRODUCTS.find(item => item.id === p.id);
        if (!product) return;

        if (product.id.includes('gold')) {
            // v1.99.3.31.3: Doğrudan global değişkeni güncelle (Shared Scope)
            totalGold += product.amount; 
            if (typeof saveGame === 'function') saveGame();
            
            // v1.99.4.1.10: Harcamayı Firebase'e Raporla (Revenue Tracking) 🏦📊
            if (typeof Leaderboard !== 'undefined' && Leaderboard.reportPurchase) {
                Leaderboard.reportPurchase(product.priceVal || 0);
            }
            
            if (typeof triggerEliteEconomySync === 'function') triggerEliteEconomySync(true); // v1.99.27.05: Instant IAP Sync Mührü!
            
            const msg = (translations[currentLang] && translations[currentLang].purchaseSuccess) 
                        ? `${translations[currentLang].purchaseSuccess} +${product.amount} GOLD! 💰`
                        : `PURCHASE SUCCESSFUL! +${product.amount} GOLD! 💰`;
                        
            if (typeof showToast === 'function') showToast(msg, true);
        }
        
        // Ses Efekti (v1.99.27.10 Elite Synergy)
        if (typeof initAudio === 'function') initAudio();
        if (typeof playPowerupSound === 'function') playPowerupSound();
        for(let i=0; i<5; i++) setTimeout(() => { if (typeof playCoinSound === 'function') playCoinSound(); }, 200 + (i*150));
    }
};

// Sistemi Başlat
GameStore.init();
