/**
 * RİVER ESCAPE ELİTE - game_store.js
 * Google Play Satın Alma (In-App Purchases - IAP) Modülü
 * v1.99.3.2
 */

const GameStore = {
    // Ürün Tanımları (Google Play Console ID'leri buraya gelecek)
    PRODUCTS: [
        { id: 'gold_1000', title: 'Small Pouch', amount: 1000, type: 'consumable' },
        { id: 'gold_5000', title: 'Large Chest', amount: 5000, type: 'consumable' },
        { id: 'gold_10000', title: 'Grand Sack', amount: 10000, type: 'consumable' },
        { id: 'gold_20000', title: 'Elite Vault', amount: 20000, type: 'consumable' }
    ],

    init() {
        if (!window.store) {
            console.warn("IAP Store Plugin Not Found. (Cordova Purchase Plugin)");
            return; 
        }

        // Ürünleri Kaydet
        this.PRODUCTS.forEach(p => {
            window.store.register({
                id:    p.id,
                type:  p.type === 'consumable' ? window.store.CONSUMABLE : window.store.NON_CONSUMABLE
            });
        });

        // Ürün Onaylandığında (Satın Alındığında)
        window.store.when("product").approved(p => {
            console.log("Purchase Approved:", p.id);
            this.handleFinalizePurchase(p);
            p.finish(); // İşlemi bitir
        });

        // Satın Alma Hataları
        window.store.error(e => {
            console.error("Store Error:", e.message);
            if (typeof showToast === 'function') showToast("Purchase Error: " + e.message, false);
        });

        // Mağazayı Senkronize Et
        window.store.refresh();
        console.log("IAP Store Initialized.");
    },

    // Satın Alma İşlemini Başlat
    buy(productId) {
        if (!window.store) {
            console.error("Store not ready.");
            // Test için doğrudan veriyoruz (Simülasyon Modu)
            const p = this.PRODUCTS.find(p => p.id === productId);
            if (p) this.handleFinalizePurchase({ id: productId });
            return;
        }

        window.store.order(productId);
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
