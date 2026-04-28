# River Escape Elite - Versioning Standard Procedure

## Neden Standartlaştırıldı?
Proje içerisinde versiyon numaraları; tarayıcı önbelleğini kırmak (cache-busting), arayüzdeki sürüm logoları, loglama ve debug sistemleri gibi birbirinden farklı birçok dosyaya dağılmıştır. Manuel değişiklik yapmak, önceki sürümlerde olduğu gibi tutarsızlıklara ve unutulan dosyalara yol açmaktadır.

## Uygulanacak Kural (AI için Zorunlu Talimat)
**Versiyon numarası değiştirileceği veya yeni sürüme geçileceği zaman ASLA dosyaları tek tek manuel editleme!**

### Otomatik Süreç (One-Click Deploy)
Ana dizinde yer alan `bump_version.js` betiğini çalıştırarak tüm senkronizasyonu saniyeler içinde hatasız tamamla.

**Terminal Komutu:**
```bash
node bump_version.js vX.XX.XX.XX
```
*Örnek: `node bump_version.js v1.99.64.00`*

### Script'in Yaptığı İşlemler
1. `index.html` içindeki global `VERSION` değişkenini bulur ve günceller.
2. `index.html` içindeki tüm `<script src="...?v=eski_versiyon">` uzantılarını (cache-buster) yeni versiyonla değiştirir.
3. Ekranda kullanıcıya görünen UI yazılarındaki `vX.XX` ibarelerini günceller.
4. `game_unbeatable_v3.js` içindeki sabitlenmiş versiyon const'larını (varsa) günceller.
5. Ana dizindeki `VERSION_vX.XX.txt` mühür dosyasının adını otomatik olarak yenisiyle değiştirir.

*Bu kurallar bütünü, insan hatasını sıfıra indirmek ve "Elite" standartlarına yakışır bir pipeline kurmak için yazılmıştır.*
