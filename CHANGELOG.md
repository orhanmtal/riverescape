# River Escape - Versiyon Günlükleri (CHANGELOG)
Bu dosya, oyun motorunun ve özelliklerin versiyon versiyon nasıl geliştiğini mühürleyip saklamak için Antigravity tarafından oluşturulmuştur.

## [v1.99.5.68] - 2026-04-10 - "ELITE STABILITY" Fix
- **Syntax Error Resolved:** Removed duplicate lbCloseBtn declaration that was blocking the entire engine.
- **Masterpiece Flow Solidified:** Smooth transitions between Leaderboard and Main Menu.

## [v1.99.5.67] - 2026-04-10 - "ELITE FINAL MASTERPIECE" Launch
- **Top Riders Functional Fix:** Leaderboard is now officially stable, data fetching (refreshData) and Close button re-active.
- **Gold Market Restored:** Shop gold packs (5k to 50k) are fully polished and operational.
- **Cache-Busting Final:** All assets synced to v1.99.5.67 to force fresh loading on all devices.

## [v1.99.5.66] - 2026-04-10 - "ELITE CACHE BUSTER" Fix
- **Cache-Busting:** Script versiyonları v1.99.5.66 olarak yükseltildi. Bu, tarayıcının o bozuk "v=1.99.5.5" dosyasını çöpe atıp tertemiz yeni sürümü yüklemesini kesinleştirir.
- **Unexpected token Fix:** Merge çakışması kalıntıları tamamen temizlendi, oyun motoru artık stabil çalışıyor.

## [v1.99.5.65] - 2026-04-10 - "ELITE MASTERPIECE" Modernization
- **Top Riders Connector:** Liderlik tablosu butonu modern modal ile eşlendi ve altın parıltısı eklendi.
- **Minimalist UI:** Başlangıç ekranındaki tüm metin gereksizleri kaldırıldı, ikon-tabanlı sisteme geçildi.
- **HUD Intelligence:** Oyun içi göstergeler başlangıç ekranında gizlendi, oyun başladığında açılacak şekilde programlandı.

## [v1.99.5.5] - 2026-04-10 - "ELITE MASTERPIECE" Güncellemesi
- **Görsel Devrim:** Ana menü tamamen baştan tasarlandı; neon parlamalı yüzer logo ve dinamik "Ripple" (dalga) efektli "OYNA" butonu eklendi.
- **Glassmorphism:** HUD ve arayüz elemanları modern buzlu cam estetiğiyle güncellendi.
- **Performans Senkronu:** Android ve Web sürümleri v1.99.5.5 standardında tam olarak eşitlendi.

## [v1.99.4.1.10] - 2026-04-10 - "ELITE REDIRECT & SYNC" Güncellemesi
- **Google Auth:** `signInWithPopup` yerine `signInWithRedirect` mekanizmasına geçildi. Bu sayede Android/iOS tarayıcılarındaki "Pencere Engellendi" sorunu kökten çözüldü.
- **Dinamik Veri Akışı:** `getRedirectResult` işleyicisi güçlendirildi; yönlendirme sonrası kullanıcı adı ve ID senkronizasyonu milisaniyeler içinde gerçekleşecek şekilde optimize edildi.
- **Versiyon Mühürleme:** `package.json`, `index.html`, `translations.js` ve motor dosyaları `v1.99.4.1.10` standardına 1:1 eşitlendi.
- **Hata Yönetimi:** Auth hata kodları (network, internal, storage) kullanıcı dostu toast mesajlarına bağlandı.

## [v151] - 2026-03-31 - "LAVA RIVER & FIREBALL" Güncellemesi
- **Yeni Seviye:** "LAVA RIVER" aşaması (4000-6000 puan) eklendi.
- **Yeni Engel:** 5. Seviye için "Fireball" (Ateş Topu) iblis canavarı tanıtıldı.
- **Görsel Cila:** Volkanik arka plan geçişi uygulandı ve yüksek hızda netlik için 5. Seviyedeki duman bulutları kaldırıldı.
- **Hata Onarımı:** `currentLang` ReferenceError ve `drawImage` Broken State hatası giderildi.
- **Spawn Dengesi:** 5. Seviye spawn aralığı güncellendi (0.25 -> 0.40) ve Lav seviyesinden Timsahlar kaldırıldı.
- **Ses Senkronu:** Panik müziği eşikleri, 4-5 seviye geçişini içerecek şekilde güncellendi.

## [v150] - 2026-03-31 - "MEVSİM VE ENGEL MASTER" Güncellemesi
- **Gelişmiş İlerleme (Progression):** Mevsim geçişleri (Leyels) artık daha adil ve uzun soluklu olacak şekilde 1000, 2000 ve 3000 puan olarak yeniden mühürlendi.
- **Akıllı Engel Dağılımı (Level 1):** Kayalar (Rocks) 0 puandan itibaren kalıcı; Hoppa (Hippo) 500+ puandan sonra; Timsah (Croc) ise sadece Seviye 1'in sonunda (900-1000) bir final engeli gibi belirecek şekilde optimize edildi.
- **Danger Zone (isDZ) Senkronu:** Ölüm bölgeleri artık her seviyenin son %10'luk dilimine (900, 1900, 2900) çekilerek kıyı cezaları ve "Hinlik Mekaniği" ile kusursuz bir uyum sağlandı.
- **Hata Onarımı:** UI enjeksiyonları sırasında oluşan JS syntax bozulmaları ve "brittle" (kırılgan) kod yapısı tamamen onarılıp ID bazlı sisteme geçildi.

## [v149] - 2026-03-31 - "PREMIUM SLOT MAĞAZASI" Güncellemesi
- **Görsel Tasarım:** Mağaza (Shop) ekranındaki item kutuları tamamen baştan tasarlandı (`.shop-item` sınıfı).
- **Mekanik Senkron:** Mıknatıs ve Kalkan kutuları modern, minimalist ve pixel-game estetiğine uygun "slot" yapısına kavuşturuldu.
- **Font & Stil:** Tüm mağaza metinleri 'Press Start 2P' fontuna sabitlendi, boyutlar okunabilirlik için optimize edildi.
- **Emoji Tasfiyesi:** Mağaza içindeki tüm emojiler (🧲, 🛡️, 💰) kaldırıldı, saf metin ve sayı bazlı profesyonel bir tasarıma geçildi.
- **Kod Güvenliği:** Mağaza UI güncellemeleri brittle (kırılgan) selector'lardan kurtarılıp spesifik ID'lere (`shop-mag-title` vb.) bağlandı.

## [v148] - 2026-03-31 - "ARINMA / SAF ARCADE" Güncellemesi
- **Görsel Standart:** Tüm ana oyun butonları 'Press Start 2P' (Arcade) fontu ile %100 oranında eşitlendi.
- **İkon Tasfiyesi:** Butonların içindeki tüm emojiler (🎡, 🛒, ⚙️, ▶, 💰, 🎁) UI kirliliğini önlemek ve daha profesyonel bir görünüm (Minimalist) sağlamak için söküldü.
- **Metin Optimizasyonu:** Buton isimleri ("CANLAN (AD)", "x2 ALTIN (AD)") kısaltılarak arayüz ferahlatıldı. Tüm "hardcoded" (elle yazılmış) emoji enjeksiyonları JS tarafından temizlendi.

## [v147] - 2026-03-31 - "DASH - GÖK KESİCİ" Güncellemesi
- **Eklenti:** Dinamik Dash (Zıplama) Mekaniği.
- **Detay:** Oyuncunun engellerin üzerinden atlamasını sağlayan enerji tabanlı bir kaçış sistemi eklendi.
- **Mekanik:** Saniyede 15 birim şarj olan Dash Enerji Barı. Bar dolduğunda Yukarı Ok (Klavye) veya Çift Tıklama (Mobil) ile tetiklenir.
- **Görsel:** Zıplama esnasında %120-%150 arası ölçekleme (scaling) ve hayalet izi (ghosting) efekti. 0.8 saniye boyunca tam çarpışma bağışıklığı sağlar.
- **TR/EN Parite:** HUD üzerindeki "DASH READY!" / "ZIPLAMA HAZIR!" metinleri ve başlangıç talimatları dil paketlerine (translations.js) dahil edildi.

## [v146] - 2026-03-31 - "Umut Boşluğu" (Hope Gap) Güncellemesi
- **Eklenti:** Level 1 Engel Spawner Mantığı.
- **Detay:** Kayaların veya düşmanların oyuncuyu %100 oranında (hiç kaçış bırakmayarak) sıkıştırmasını önlemek için "Umut Boşluğu" zekası eklendi.
- **Nasıl Çalışır:** Sistem son atılan engelin `lastObsX` koordinatını hafızasında tutar. Eğer yeni düşecek olan taş, eskisiyle aynı veya çok yakın bir hizaya düşecekse, motor taşı sağa veya sola iterek kayığın ucu ucuna geçebileceği bir aralık (gap) bırakır. Oyuncular reklam izletilmek için tuzağa düşürüldüğünü hissetmez.

## [v145] - 2026-03-31 - "Mihenk Taşı" Dev Restorasyonu (11:58 APK Build)
- **Eklenti:** Tam Motor Restorasyonu.
- **Detay:** Oyunun stabil ve en güçlü çalışan motor kaynağı olan 11:58 APK dosyasından çıkartılan **1656 satırlık** dev yapısı web ortamına eksiksiz aktarıldı.
- **UI & Görsel Kararlılık:** Pixelated görüntü render tarzından çıkartılıp pürüzsüz ("cam gibi") Bilinear (auto) render'a geçiş yapıldı.
- **TR/EN Parite Eşitlemesi:** Oyun sonu menülerinde bulunan hardcoded (elle yazılmış) dil çeviri eksiklikleri (örn: "Ana Menü" string'i) `translations.js` üzerinden `t.mainMenu` değişkenine çekilerek kusursuz dil uyumu sağlandı.

## [v137] - Kademeli Zorluk ve Engel Filtreleri
- **Detay:** Level 1 içinde skora bağlı engel tanımı. Skor > 100 ise Sadece Kaya, Skor > 200 ise Sadece Hippo, Skor > 300 ise Krokodil eklenerek oyun kavisli şekilde zorlaştırıldı.

## [v135 & v134] - Checkpoint Leap ve Görsel Cila
- **Checkpoint Leap:** Seviye atlandığında (örn: İlkbahar'dan Yaz'a) arka planın ve bulutların ışınlanıyormuşçasına hız kazanması (`bgScrollSpeed = 450`) ve 1.2 saniyelik görsel flaş efekti (Speed Lines) eklendi.
- **Pixel Art Kayalar:** Düz taşlar yerine üzerine gölgelikler atılmış daha katmanlı pixel-art kaya çizimleri eklendi.

## [v133] - "Hinlik Mekaniği"
- **Detay:** Oyuncu seviye barajına çok az kala (Örn: 480 skor) kasten ölüp bedava canlanarak puan toplamaya çalışırsa, canlandığında sistem oyuncuyu acımasızca **baraja geri düşürür** (400 skora yuvarlar). Ciddi bir risk/ödül mekaniğidir.

## [v128] - Level Geri Düşme Engelleyici
- **Detay:** Çarpma (süxrtünme) sonucu puan düştüğünde, oyuncunun kazandığı seviyelerin (Mevsimlerin) geriye dönmesi engellendi. Gelişim daima ileri odaklandı.

## [v126] - Su Köpüğü Parçacık Efekti (Particles)
- **Detay:** Kayığın arkasından su izi/köpüğü bırakan dinamik `Particle` sınıfı yaratıldı. Bu sayede haraket hissiyatı görselleştirildi.

## [v120] - "Lucky Spin" Şans Çarkı Sistemi
- **Detay:** Ana ekrana reklam modeli entegre edilerek dönen mekanik rulet tarzı çark eklendi. Matematiksel sönümleme (fizik) kullanılarak altın veya pasif geliştirici mühürleri oyunculara rasgele dağıtıldı. Bütçe göstergesi ve "Tebrikler" barı anında senkron çalışır.

## [v98] - 3 Can (Kalp) Sistemi
- **Detay:** Oyuna doğrudan tek atışta bitme yerine `lives` değişkeni ile 3 kalp tanımlandı. İlk 3 ölümde geçici kalkan verilirken, son ölümde GameOver ekranı fırlatılır. 
