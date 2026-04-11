# River Escape - Proje Ve Oyun Mantığı Kuralları (RULES.md)

## ⚖️ KUTSAL MOBİL YASA (MOBILE-FIRST DECREE)
> **DİKKAT:** Bu proje her şeyden önce bir **MOBİL UYGULAMA (Mobile App)** projesidir. Yapılan tüm optimizasyonlar, ekran yerleşimleri (responsiveness), dokunmatik kontroller (touch points) ve performans iyileştirmeleri öncelikli olarak mobil cihazlar (Telefon/Tablet) hedef alınarak tasarlanmak **ZORUNDADIR.** Her türlü UI değişikliği, küçük ekranlarda kusursuz çalışacak şekilde "Mobile-First" felsefesiyle inşa edilmelidir.

Bu dosya, projenin "Mihenk Taşı" kalitesinde kalması ve gelecekte yapılacak her eklemede Antigravity'nin ve senin sadık kalacağın **kutsal mimari kuralları** içerir.

## 0. Seviye İlerleme ve Zorluk Kademeleri
   - LEVEL 1: 0-1000 (Spring)
   - LEVEL 2: 1000-2000 (Summer)
   - LEVEL 3: 2000-3000 (Autumn)
   - LEVEL 4: 3000-4000 (Winter)
   - LEVEL 5: 4000-6000 (Lava River)
   - DANGER ZONES: 900-1000, 1900-2000, 2900-3000, 3900-4000 (Lava Gate).

## 1. Altın Kural: "Sıfır Umut Tuzağı Yok" (Hope Gap Kuralı)
- Oyun kesinlikle **%100 tıkanmış geçilmez** bölümler (tuzaklar) KESİNLİKLE OLUŞTURAMAZ.
- Her düşman ve kütük yerleşiminde, kayığın (Player) geçebileceği milimetrik de olsa "jilet gibi" bir umut boşluğu (gap) hesaplanmak **ZORUNDADIR.** Oyuncu ancak refleksleri yetersiz kaldığında yanmalıdır; haksızlığa uğradığını asla hissetmemelidir.

## 2. Pürüzsüz Render ve Çözünürlük (Görsel Mühür)
- Tuval (Canvas) ve görseller her zaman `Bilinear (Auto)` render ayarında çalışır. CSS dosyalarındaki `image-rendering: pixelated;` kodlaması artık yasaktır! 
- Oyuncu ekrana baktığında HD ve "cam gibi" bir UI/Görsel derinliği hissetmelidir. 

## 3. Hinlik Mekaniği (Reklam ve Ödül Keskinliği)
- Oyuncu eğer reklam izleyerek veya bir hile kullanarak haksız (bedava) puan kazanmaya çalışıyorsa (örneğin 480 puanda bilerek ölüp canlanarak bir sonraki Level'e beleş geçmeye çalışmak), ceza kuralları (skoru 400'e bariyer yuvarlaması) anında tetiklenmelidir. **Oyunun kendi zekası oyuncunun hırsıyla savaşmalıdır.**

## 4. Geriye Düşme Engelleyici
- Animasyonlar ve zorluklar puanlarla ayarlandığı için, çarpma cezası skoru sıfıra indirmese de geçilen mevsimin (Level) ASLA geri sarmaması kuraldır. Bir defa kışa gelindiyse oyun kışta devam eder!

## 5. Çeviri Paritesi (Global Uyum)
- Arayüzde hiçbir zaman "hardcoded" (elle yazılmış metin) bulunmamalıdır! Bütün metinler, harfi harfine `translations.js` (Dil paketleri) üzerinden `TR` ve `EN` dillerinde tam 1:1 satır uyumuyla çağrılmalıdır.

## 6. Sadelik ve Güç Temsili
- Oyuna devasa kütüphaneler (ör: eklenti plugin'leri, dev kütüphaneler) eklenmesi gerekmeden tamamen Vanilla JS ve Native Canvas ile kodlanmalıdır. "Performans her şeydir."
- 1656 satırlık "v145-MT" (Mihenk Taşı) dengesi projenin merkez temelidir. Bu temel esnetilebilir ancak kuralları tamamen hiçe sayılarak yıkılamaz!

## 7. Saf Arcade Tasarım Standartı (Minimalist UI)
- **Görsel Fonksiyon:** Butonlar ve metinler her zaman `'Press Start 2P'` (Arcade) fontunda olmalı, arayüz gereksiz ikonlardan (emoji, karmaşık resimler) temizlenmelidir. "Cam gibi" görüntü sade ama vuruş gücü yüksek (v148-149 Arınma) bir tasarımla taçlandırılmalıdır.
- **Sistem Mimarisi:** Mağaza ve ekran tasarımları "brittle" (kırılgan) selector'lardan kurtarılmalı, her zaman spesifik ID'lere (`shop-mag-title` vb.) bağlanarak JS üzerinden kontrollü bir şekilde güncellenmelidir.

## 8. Dash (Zıplama) Mekaniği Kuralı
- **Stratejik Kurtarış:** Dash (Gök Kesici) mekaniği her zaman bir "Umut Boşluğu" kurtarıcısı olarak var olmalı, tıkanmış geçitlerde oyuncuya 0.8 saniyelik bir zırh ve dikey hareket kabiliyeti sunmalıdır. Ancak bu sistem enerji tabanlı olmalı ve oyuncunun tüm engelleri Dash ile geçmesine (abuse) izin vermemeli, stratejik kullanımı zorunlu kılmalıdır.

## 9. Versiyonlama Standartı (Elite Mühür)
- **Elite Base:** Projenin ana "Elite" sürümü `v1.96.0` olarak kabul edilir.
- **Minor Geliştirme:** Bu sürümden sonra yapılacak her küçük iyileştirme, hata onarımı veya minor özellik eklemesi `v1.96.1.x` (Örn: 1.96.1.1, 1.96.1.2) şeklinde ilerlemelidir.
- **Senkronizasyon:** Her versiyon artışında; `game_v3.js` (header), `index.html` (tag & cache-bust), `package.json` ve `build.gradle` (versionName) dosyaları harfiyen aynı numarada mühürlenmelidir.
