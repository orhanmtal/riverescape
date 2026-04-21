# River Escape Elite - Proje Yasaları 🏛️🛡️⚖️

Bu belge, projenin "Elite" standartlarını korumak ve Google Play yayın süreçlerinde hata payını sıfıra indirmek için oluşturulmuştur.

## 1. Versiyonlama Sistemi (Version Control Logic) 🏗️🏁
Google Play Console'a yükleme yaparken `versionCode` ve `versionName` uyumu mutlak bir kuraldır.

### A. VersionName (İnsan Okunabilir Sürüm) ✨
- Format: `Major.Minor.Patch.Build` (Örn: `1.99.3.20`)
- Bu isim tüm dosyalarda (`index.html`, `game_v3.js`, `translations.js` vb.) senkronize olmalıdır.

### B. VersionCode (Google Play İndeksi) 🏹
- Format: `MajorMinorPatchBuild` (8 haneli veya ardışık tam sayı)
- **KURAL:** Her yeni `.aab` yüklemesinde bu sayı eski sayıdan en az **+1** büyük olmalıdır.
- **ELİTE STRATEJİ:** `1.99.3.20` sürümü için önerilen kod: **`1990320`**
- **DİKKAT:** Eğer Google Play `19723` gibi bir kodun kullanıldığını söylüyorsa, yeni kod her zaman bu sayının üstünde (`1990320` gibi) seçilmelidir.

## 2. Gmail / Cloud Sync Koruması ☁️🛡️
- Her sürümde `game_leaderboard.js` üzerindeki Firestore bağlantıları test edilmelidir.
- Sürüm yükseltildiğinde (`versionName` değiştiğinde), Firestore'daki `lastSeen` ve `version` etiketleri güncellenmelidir.

## 3. UI Standartları 🎨✨
- Font: Her zaman `Outfit` veya `Press Start 2P` kullanılmalıdır.
- Versiyon etiketi (`index.html` alt kısımdaki) her zaman güncel sürümü yansıtmalıdır.

## 4. Kimlik Güvenliği ve Yerel Veri İzolasyonu (Identity Safety) 🔐🧼
Birden fazla kullanıcının aynı cihazda (özellikle mobilde) çakışmasını önlemek "Elite" güvenliğin temelidir.

### A. Veri İzolasyonu (Deep Purge)
- **KURAL:** Bir kullanıcı çıkış yaptığında veya yeni bir kullanıcı giriş yaptığında, sadece `localStorage` değil, oyunun o anki hafızasındaki (RAM) tüm global değişkenler (`window.totalGold`, `window.ownedBoats` vb.) anında sıfırlanmalıdır.
- Bu işlem için `Leaderboard.resetGlobalGameState()` metoduna sadık kalınmalıdır.

### B. Bulut Hakimiyeti (Cloud Dominance)
- **KURAL:** Bulut senkronu yapılırken (Restore), yerel veri ile bulut verisi `Math.max` ile **BİRLEŞTİRİLEMEZ**. 
- Buluttaki veri, o anki oturumun tek gerçeğidir ve yerel verinin üzerine tam yazım (`=`) yapılmalıdır. Bu, verilerin kullanıcılar arasında sızmasını (Miras/Inheritance) engeller.

### C. Görev ve Kayıkhale Senkronu
- Her satın alım veya görev ilerlemesi anında `Leaderboard.submitProgress()` ile buluta mühürlenmelidir.
- Görev döngüleri (`missionCycle`) ve sahiplikler (`ownedBoats`) kimliğe özeldir, asla paylaşılamaz.

---
*Bu yasalar River Escape krallığının selameti ve oyuncu kimliğinin kutsallığı için mühürlenmiştir.* 🏛️⚔️✅🛡️
