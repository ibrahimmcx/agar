# 🚀 Render'a Deploy Etme Rehberi

## Adım 1: GitHub'a Yükle

1. GitHub'da yeni bir repository oluştur (örn: `agar-io-clone`)
2. Terminalden şu komutları çalıştır:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/agar-io-clone.git
git push -u origin main
```

## Adım 2: Render'a Kayıt Ol

1. https://render.com adresine git
2. "Get Started" butonuna tıkla
3. GitHub ile giriş yap (Sign up with GitHub)
4. Render'a GitHub erişimi ver

## Adım 3: Web Service Oluştur

1. Dashboard'da "New +" butonuna tıkla
2. "Web Service" seç
3. GitHub repo'nu bul ve "Connect" tıkla
4. Şu ayarları yap:

**Name:** agar-io-clone (istediğin ismi ver)
**Region:** Frankfurt (Avrupa'ya en yakın)
**Branch:** main
**Root Directory:** (boş bırak)
**Runtime:** Node
**Build Command:** `npm install`
**Start Command:** `npm start`
**Instance Type:** Free

5. "Create Web Service" butonuna tıkla

## Adım 4: Deploy Bekle

- Render otomatik olarak deploy edecek (2-3 dakika sürer)
- "Live" yazısını görünce hazır demektir
- URL'i kopyala (örn: https://agar-io-clone.onrender.com)

## ⚠️ Önemli Notlar

- **İlk açılış yavaş olabilir** (30 saniye): Free plan'da server uyur, ilk istekte uyanır
- **15 dakika kullanılmazsa uyur**: Tekrar açılması 30 saniye sürer
- **Aylık 750 saat ücretsiz**: Yeterli olur

## 🔄 Güncelleme Yapmak

Kod değişikliği yaptığında:

```bash
git add .
git commit -m "Güncelleme mesajı"
git push
```

Render otomatik olarak yeni versiyonu deploy eder!

## 🎮 Oyunu Test Et

Deploy tamamlandıktan sonra verilen URL'i aç ve oyna!

## 💡 İpuçları

- Custom domain ekleyebilirsin (ücretsiz)
- Environment variables ekleyebilirsin
- Logları "Logs" sekmesinden görebilirsin
- Metrics'ten performansı izleyebilirsin
