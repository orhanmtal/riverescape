# River Escape Elite - Proje Yasaları 🏛️🛡️⚖️

Bu belge, projenin "Elite" standartlarını korumak ve Google Play yayın süreçlerinde hata payını sıfıra indirmek için oluşturulmuştur.

## 1. Versiyonlama Sistemi (Version Control Logic) 🏗️🏁
Google Play Console'a yükleme yaparken `versionCode` ve `versionName` uyumu mutlak bir kuraldır.

### A. VersionName (İnsan Okunabilir Sürüm) ✨
- Format: `Major.Minor.Patch.Build` (Örn: `1.99.3.13`)
- Bu isim tüm dosyalarda (`index.html`, `game_v3.js`, `translations.js` vb.) senkronize olmalıdır.

### B. VersionCode (Google Play İndeksi) 🏹
- Format: `MajorMinorPatchBuild` (8 haneli veya ardışık tam sayı)
- **KURAL:** Her yeni `.aab` yüklemesinde bu sayı eski sayıdan en az **+1** büyük olmalıdır.
- **ELİTE STRATEJİ:** `1.99.3.13` sürümü için önerilen kod: **`1990313`**
- **DİKKAT:** Eğer Google Play `19723` gibi bir kodun kullanıldığını söylüyorsa, yeni kod her zaman bu sayının üstünde (`1990313` gibi) seçilmelidir.

## 2. Gmail / Cloud Sync Koruması ☁️🛡️
- Her sürümde `game_leaderboard.js` üzerindeki Firestore bağlantıları test edilmelidir.
- Sürüm yükseltildiğinde (`versionName` değiştiğinde), Firestore'daki `lastSeen` ve `version` etiketleri güncellenmelidir.

## 3. UI Standartları 🎨✨
- Font: Her zaman `Outfit` veya `Press Start 2P` kullanılmalıdır.
- Versiyon etiketi (`index.html` alt kısımdaki) her zaman güncel sürümü yansıtmalıdır.

---
*Bu yasalar River Escape krallığının selameti için mühürlenmiştir.* 🏛️⚔️✅
