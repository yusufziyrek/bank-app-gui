# README

## Genel Bakış

Bu proje, Wails 2 ile hazırlanmış ve BankApp REST servisiyle konuşan masaüstü bir uygulamanın temelini oluşturur. Go tarafında tüm bankacılık işlevleri (kimlik doğrulama, kullanıcı, hesap, kart ve işlem işlemleri) hazırdır; frontend şu an konfigürasyon ve oturum durumunu göstermek için geçici bir pano sunar. Tasarım ve kullanıcı akışları tamamlandığında aynı altyapı üzerine inşa edilebilir.

## Mimari

- **Go Backend** (`app.go`): BankApp API’sine çağrıları yöneten `App` yapısı; kimlik doğrulama, kullanıcı yönetimi, hesap/kart/işlem CRUD operasyonlarını ve oturum saklamayı içerir.
- **Internal Paketler**:
	- `internal/api`: HTTP istemcisi, veri transfer modelleri ve servis katmanı.
	- `internal/storage`: Oturum bilgilerinin `%AppData%/desktop-app/session.json` altında saklanmasını sağlayan dosya tabanlı Store.
- **Frontend (Vite)** (`frontend/src/main.js`): Şimdilik konfigürasyon ve mevcut oturumu gösteren basit bir arayüz. Bankacılık ekranları bu katmanda geliştirilecek.

## Yapılandırma

- `BANKAPP_API_URL`: BankApp REST servisinin temel adresi. Boş bırakılırsa varsayılan olarak `http://localhost:8080` kullanılır.
- Oturum dosyası Windows için `%AppData%/desktop-app/session.json` altında tutulur. Duruma göre `internal/storage` içerisindeki `defaultSessionPath` fonksiyonunu güncelleyebilirsiniz.

## Önemli Backend Metotları

- **Oturum Yönetimi**: `Register`, `Login`, `RefreshSession`, `Logout`, `AppInfo`.
- **Kullanıcılar**: `ListUsers`, `GetUser`, `UpdateUserEmail`, `UpdateUserPassword`, `UpdateUserStatus`, `DeleteUser`.
- **Hesaplar**: `ListAccounts`, `GetAccount`, `CreateAccount`, `UpdateAccount`, `DeleteAccount`.
- **Kartlar**: `ListCards`, `GetCard`, `CreateCard`, `UpdateCard`, `UpdateCardStatus`, `DeleteCard`.
- **İşlemler**: `ListTransactions`, `GetTransaction`, `CreateTransaction`, `UpdateTransaction`, `DeleteTransaction`.

Frontend tarafında yeni ekranlar geliştirildiğinde bu metotlar `frontend/wailsjs/go/main/App` üzerinden çağrılabilir.

## Geliştirme Komutları

- Geliştirme deneyimi: `wails dev`
- Backend & binding yenileme: `wails generate module`
- Üretim paketi: `wails build`
- Sadece frontend derlemesi: `cd frontend && npm run build`

`wails dev` çalışırken Vite (frontend) ve Go (backend) süreçleri eşzamanlı olarak devreye girer. Yeni Go fonksiyonları ekledikten sonra Wails otomatik olarak `frontend/wailsjs` çıktısını günceller.

## Sonraki Adımlar

- Bankacılık arayüzü için oturum açma, hesap listesi, işlem geçmişi vb. ekranları tasarlayın.
- Frontend bileşenlerinden Go metodlarına çağrılar yapmadan önce `AppInfo` ile başlangıç durumunu okuyun ve gerekli oturum kontrollerini uygulayın.
- Geliştirilecek ekranlar için gerekirse ek tipler veya yardımcı fonksiyonları `frontend/src` altında yapılandırın.
