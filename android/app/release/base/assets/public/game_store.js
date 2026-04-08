/**
 * RİVER ESCAPE ELİTE - game_store.js
 * Google Play Satın Alma (In-App Purchases - IAP) Modülü
 * v1.99.3.30
 */

const GameStore = {
    // Ürün Tanımları (Google Play Console ID'leri buraya gelecek)
    // Fiyatlandırma: 0.99$ - 3.99$ - 6.99$ - 14.99$
    PRODUCTS: [
        { id: 'gold_25000', title: 'A Handful of Gold', amount: 25000, type: 'consumable' },
        { id: 'gold_125000', title: 'Golden Chest', amount: 125000, type: 'consumable' },
        { id: 'gold_250000', title: 'Treasure Bag', amount: 250000, type: 'consumable' },
        { id: 'gold_750000', title: 'Elite Fortune', amount: 750000, type: 'consumable' }
    ],

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
            // Simülasyon
            this.handleFinalizePurchase({ id: productId });
            return;
        }
        window.CdvPurchase.store.get(productId).order();
    },

    // Satın Almayı Oyuna Uygula (Altın Ekleme vb.)
    handleFinalizePurchase(p) {
        const product = this.PRODUCTS.find(item => item.id === p.id);
        if (!product) return;

        if (product.id.includes('gold')) {
            window.totalGold += product.amount; 
            if (typeof saveGame === 'function') saveGame();
            if (typeof updateShopUI === 'function') updateShopUI();
            if (typeof showToast === 'function') showToast(`CONSULATED: +${product.amount} GOLD! 💰`, true);
        }
        
        // Ses Efekti
        for(let i=0; i<3; i++) setTimeout(() => { if (typeof playCoinSound === 'function') playCoinSound(); }, i*200);
    }
};

// Sistemi Başlat
GameStore.init();
