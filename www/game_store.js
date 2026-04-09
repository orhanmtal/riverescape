/**
 * RİVER ESCAPE ELİTE - game_store.js
 * Google Play Satın Alma (In-App Purchases - IAP) Modülü
 * v1.99.3.30
 */

const IAP_PACKS = [
    { id: 'gold_pack_1', amount: 5000, price: '$0.99', label: '5.000 GOLD' },
    { id: 'gold_pack_2', amount: 10000, price: '$1.49', label: '10.000 GOLD' },
    { id: 'gold_pack_3', amount: 25000, price: '$2.99', label: '25.000 GOLD' },
    { id: 'gold_pack_4', amount: 50000, price: '$4.99', label: '50.000 GOLD' }
];

const GameStore = {
    // Ürün Tanımları (Google Play Console ID'leri buraya gelecek)
    // Fiyatlandırma: 0.99$ - 1.49$ - 2.99$ - 4.99$
    PRODUCTS: IAP_PACKS.map(p => ({ id: p.id, title: p.label, amount: p.amount, type: 'consumable' })),

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
            // v1.99.3.31.3: Doğrudan global değişkeni güncelle (Shared Scope)
            totalGold += product.amount; 
            if (typeof saveGame === 'function') saveGame();
            if (typeof updateShopUI === 'function') updateShopUI();
            
            const msg = (translations[currentLang] && translations[currentLang].purchaseSuccess) 
                        ? `${translations[currentLang].purchaseSuccess} +${product.amount} GOLD! 💰`
                        : `PURCHASE SUCCESSFUL! +${product.amount} GOLD! 💰`;
                        
            if (typeof showToast === 'function') showToast(msg, true);
        }
        
        // Ses Efekti
        for(let i=0; i<3; i++) setTimeout(() => { if (typeof playCoinSound === 'function') playCoinSound(); }, i*200);
    }
};

// Sistemi Başlat
GameStore.init();
