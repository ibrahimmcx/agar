# ⚡ Hızlı Başlangıç - 5 Dakikada Deploy

## 📋 Ön Hazırlık

✅ GitHub hesabın var mı? Yoksa: https://github.com/signup
✅ Git yüklü mü? Test et: `git --version`

## 🚀 3 Basit Adım

### 1️⃣ GitHub'a Yükle (2 dakika)

Terminalde şunları yaz (sırayla):

```bash
git init
git add .
git commit -m "Agar.io clone ilk versiyon"
```

Şimdi GitHub'a git:
- https://github.com/new
- Repository name: `agar-io-game` (istediğin ismi ver)
- Public seç
- "Create repository" tıkla

Sayfada gösterilen komutları kopyala ve terminale yapıştır:
```bash
git remote add origin https://github.com/SENIN_KULLANICI_ADIN/agar-io-game.git
git branch -M main
git push -u origin main
```

### 2️⃣ Render'a Bağla (1 dakika)

- https://render.com adresine git
- "Get Started for Free" tıkla
- "GitHub" ile giriş yap
- İzin ver

### 3️⃣ Deploy Et (2 dakika)

Render dashboard'da:

1. **"New +"** butonuna tıkla
2. **"Web Service"** seç
3. Repo'nu bul ve **"Connect"** tıkla
4. Şu ayarları yap:

```
Name: agar-io-game
Region: Frankfurt
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

5. **"Create Web Service"** tıkla

### ✅ Bitti!

2-3 dakika bekle. "Live" yazısını görünce oyun hazır!

URL'i kopyala ve arkadaşlarınla paylaş! 🎮

---

## 🔧 Sorun mu var?

**"Build failed" hatası:**
- package.json dosyasının doğru olduğundan emin ol
- Node version 18+ olmalı

**"Application failed to respond":**
- server.js'de PORT doğru mu kontrol et: `process.env.PORT || 3000`

**Oyun açılmıyor:**
- 30 saniye bekle (ilk açılış yavaş)
- Tarayıcı konsolunu aç (F12) hata var mı bak

## 💬 Yardım

Sorun olursa Render'ın "Logs" sekmesine bak, hatayı gösterir.
