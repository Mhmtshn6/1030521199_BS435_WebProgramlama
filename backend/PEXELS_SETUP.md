# Pexels API Kurulumu

## 1. Pexels Hesabı Oluştur
1. https://www.pexels.com/api adresine git
2. "Get Started" butonuna tıkla
3. Email ile kayıt ol (çok kolay, sadece email yeterli)

## 2. API Key'i Al
1. Giriş yaptıktan sonra otomatik olarak API key gösterilir
2. "Your API Key" bölümünden key'i kopyala
3. Örnek format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 3. Environment Variable Olarak Ayarla

### Windows (PowerShell)
```powershell
$env:PEXELS_API_KEY="your_api_key_here"
```

### Windows (CMD)
```cmd
set PEXELS_API_KEY=your_api_key_here
```

### Linux/Mac
```bash
export PEXELS_API_KEY="your_api_key_here"
```

### .env Dosyası (Önerilen)
1. `backend/.env` dosyası oluştur (yoksa)
2. İçine şunu ekle:
   ```
   PEXELS_API_KEY=your_api_key_here
   ```
3. Backend'i çalıştırdığında otomatik yüklenecek

**Not:** `.env` dosyasını git'e commit etme! (zaten .gitignore'da olmalı)

## 4. Limitler
- **Free tier:** 200 istek/saat (Unsplash'tan daha fazla!)
- Çok yeterli, normal kullanımda limit aşılmaz
- Limit aşılırsa otomatik fallback (Picsum Photos) kullanılır

## 5. Avantajlar
- ✅ Başvuru çok kolay (sadece email)
- ✅ Hemen onaylanıyor
- ✅ Unsplash'tan daha fazla limit (200/saat vs 50/saat)
- ✅ Gerçek, yüksek kaliteli fotoğraflar

