# 🛡️ Siber Ajan Akademisi

Siber güvenlik temalı, tarayıcıda çalışan interaktif bir web oyunu. Saf **HTML + CSS + JavaScript** ile yazıldı: kurulum, bağımlılık ya da internet bağlantısı gerekmez.

Arka planda 0 ve 1'lerden oluşan "Matrix" yağmuru akar. Oyuncu 3 görevi tamamlayarak **Çaylak → Uzman → Ajan** rütbelerine yükselir ve adına özel bir **Resmi Siber Ajan Sertifikası** kazanır.

## 🎮 Nasıl oynanır?

`index.html` dosyasını tarayıcıda açmanız yeterli.

```bash
git clone https://github.com/<kullanici-adi>/siber-ajan-akademisi.git
cd siber-ajan-akademisi
# index.html dosyasına çift tıklayın veya:
python3 -m http.server 8000   # sonra http://localhost:8000
```

## 🎯 Görevler

| Görev | Açıklama | Puan |
|-------|----------|------|
| 🔐 **1. Kırılmaz Şifre** | 7 kurallı (12+ karakter, büyük/küçük harf, rakam, özel karakter, yaygın kalıp yok, ad içermez) şifre oluştur. Anlık güç barı ve kırılma süresi (1 saniye → 100 yıl) gösterilir. | +100 |
| 🎣 **2. Oltalama E-posta Avı** | 10 e-postadan rastgele 6'sı, rastgele sırayla gelir. Her biri için 35 saniye süre vardır. "Güvenli" mi "Tuzak" mı? | 100 (ilk deneme) / 50 (sonraki), +20 hız bonusu |
| 🕵️ **3. Sezar Şifre Çözücü** | 10 mesajdan rastgele 3'ü: anahtar önce sabit, sonra bilinen, son turda bilinmeyen. Alfabe kaydırma cetveliyle çöz. | 150'den başlar, her yanlışta -25 (en az 50) |

## 🏅 Rütbeler

- 🐣 **Çaylak** → başlangıç
- 🛡️ **Uzman** → 2. görev bitince
- 🕵️ **Ajan** → 3. görev bitince

Her rütbe atlamada animasyon, havai fişek ve ses efekti çalar. Oyun sonunda konfeti ve fanfar eşliğinde sertifika açılır (yazdırılabilir).

## ✨ Özellikler

- Koyu tema, Matrix 0/1 yağmuru, tarama çizgisi ve neon efektleri
- Web Audio API ile üretilen ses efektleri (dosya gerekmez), sağ üstten kapatılabilir
- Konfeti ve havai fişek parçacık efektleri (Canvas)
- Rastgele e-posta ve mesaj seçimi, her oyun farklı
- Mobil uyumlu, yazdırılabilir sertifika
- Şifre hiçbir yere gönderilmez, tamamen yerelde kontrol edilir

## 📁 Proje yapısı

```
siber-ajan-akademisi/
├── index.html   # sayfa iskeleti (HTML)
├── style.css    # tasarım ve animasyonlar (CSS)
├── script.js    # oyun mantığı, ses ve efektler (JavaScript)
├── README.md
├── LICENSE
├── .gitignore
└── .nojekyll    # GitHub Pages için
```

## 🔧 Özelleştirme

`script.js` içindeki şu değerleri değiştirerek oyunu ayarlayabilirsiniz:

- `MAIL_COUNT`: oyunda çıkacak e-posta sayısı (varsayılan 6)
- `MAIL_TIME`: her e-posta için süre, saniye (varsayılan 35)
- `SPEED_BONUS_SEC`: hız bonusu için süre sınırı (varsayılan 12)
- `MAILS`: e-posta havuzu (yeni örnek ekleyebilirsiniz)
- `CAESAR_MSGS`: Sezar mesaj havuzu (yalnızca A-Z harfleri ve boşluk)

## 🌐 GitHub Pages ile yayınlama

1. Depoyu GitHub'a yükleyin.
2. **Settings → Pages** bölümünden kaynak olarak `main` dalını ve `/ (root)` klasörünü seçin.
3. Birkaç dakika sonra oyun `https://<kullanici-adi>.github.io/siber-ajan-akademisi/` adresinde yayında olur.

## 📚 Eğitim amacı

Oyundaki e-postalar, markalar ve alan adları tamamen kurgusaldır. Amaç; güçlü şifre, oltalama (phishing) tanıma ve temel şifreleme mantığını eğlenceli bir şekilde öğretmektir.

## 📄 Lisans

[MIT](LICENSE)
