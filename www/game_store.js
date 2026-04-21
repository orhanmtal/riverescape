/**
 * RİVER ESCAPE ELİTE - game_store.js
 * Google Play Satın Alma (In-App Purchases - IAP) Modülü
 * v1.99.30.04
 */

const IAP_PACKS = [
    { id: 'gold_pack_1', amount: 5000, price: '$0.99', priceVal: 0.99, label: '5.000 GOLD' },
    { id: 'gold_pack_2', amount: 10000, price: '$1.49', priceVal: 1.49, label: '10.000 GOLD' },
    { id: 'gold_pack_3', amount: 25000, price: '$2.99', priceVal: 2.99, label: '25.000 GOLD' },
    { id: 'gold_pack_4', amount: 50000, price: '$4.99', priceVal: 4.99, label: '50.000 GOLD' }
];

const GameStore = {
    PRODUCTS: IAP_PACKS,
    isReady: false,

    init() {
        
        
        document.addEventListener('deviceready', () => {
            this.setupStore();
        }, false);

        // Browser simülasyonu için hazırla (Mobil değilse)
        if (!window.cordova) {
            
            this.isReady = true;
        }
    },

    setupStore() {
        if (!window.CdvPurchase) {
            console.error("Purchase plugin not found.");
            return;
        }

        const { store, ProductType, Platform } = window.CdvPurchase;

        // Ürünleri Kaydet
        this.PRODUCTS.forEach(p => {
            store.register({
                id: p.id,
                type: ProductType.CONSUMABLE,
                platform: Platform.GOOGLE_PLAY
            });
        });

        // Event Listeners
        store.when().approved(transaction => {
            // v1.99.30.02: FIX - Get productId from transaction products array (v13 API)
            const productId = transaction.products && transaction.products[0] ? transaction.products[0].id : null;
            
            if (productId) {
                
                this.handleFinalizePurchase(productId);
                
                // Onay ve Bitirme (Consume)
                transaction.verify().then(() => transaction.finish());
            } else {
                console.warn("⚠️ Approved transaction has no product info.");
            }
        });

        store.initialize();
        this.isReady = true;
    },

    // Satın Alma İşlemini Başlat
    buy(productId) {
        if (!window.CdvPurchase) {
            console.error("Store not ready.");
            // v1.99.30.02: Simulation Support
            if (window.location.protocol === 'file:' || window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
                
                this.handleFinalizePurchase(productId);
            }
            return;
        }
        
        const { store } = window.CdvPurchase;
        const p = store.get(productId);

        if (p && p.canPurchase) {
            const offer = p.getOffer();
            if (offer) {
                
                store.order(offer);
            } else {
                console.error("No Offer found for product:", productId);
                if (typeof showToast === 'function') showToast("Teklif Bulunamadı!", false);
            }
        } else {
            console.error("Product not available for purchase:", productId);
            if (typeof showToast === 'function') showToast("Ürün Marketten Çekilemedi!", false);
        }
    },

    // Altın Teslimatı ve Firebase Senkronizasyonu
    handleFinalizePurchase(productId) {
        const product = this.PRODUCTS.find(item => item.id === productId);
        if (!product) {
            console.error("Invalid Product ID for Finalize:", productId);
            return;
        }

        if (product.id.includes('gold')) {
            // 1. Yerel Bakiye Güncelle (Global Scope Protection)
            if (typeof window.totalGold !== 'undefined') {
                window.totalGold += product.amount;
                
            }

            // 2. Yerel Kayıt
            if (typeof window.saveGame === 'function') window.saveGame();
            
            // 3. Firebase Raporu (Revenue)
            if (typeof Leaderboard !== 'undefined' && Leaderboard.reportPurchase) {
                
                Leaderboard.reportPurchase(product.priceVal || 0);
            }
            
            // 4. Bulut Senkronu (Total Gold)
            if (typeof triggerEliteEconomySync === 'function') {
                
                triggerEliteEconomySync(true); 
            }
            
            // 5. Verileri Yenile (UI)
            if (typeof updateShopUI === 'function') updateShopUI();

            // 6. Başarı Bildirimi
            if (typeof showToast === 'function') {
                showToast(`BAŞARILI! +${product.amount} ALTIN EKLENDİ! 🏛️`, true);
            }
        }
        
        // Ses Efekti (v1.99.27.10 Elite Synergy)
        if (typeof initAudio === 'function') initAudio();
        if (typeof playPowerupSound === 'function') playPowerupSound();
        for(let i=0; i<5; i++) setTimeout(() => { if (typeof playCoinSound === 'function') playCoinSound(); }, 200 + (i*150));
    }
};

// v1.99.30: Sabırlı Başlatma (Device Ready Bekle)
document.addEventListener('deviceready', () => {
    
    GameStore.init();
}, false);

// Browser Fallback (Geliştirme modu için)
if (window.location.protocol !== 'file:' && !window.Capacitor) {
    setTimeout(() => {
        if (!window.CdvPurchase) {
            
            GameStore.init();
        }
    }, 1000);
}
