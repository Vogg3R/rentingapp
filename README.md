# P2P Tersine Kiralama Platformu (MVP) — EldenEle

Talep odaklı kiralama: kullanıcılar ihtiyaç duydukları ürünler için **istek ilanı** açar; ürün sahipleri **teklif** verir. Kabul sonrası **escrow**, **mesajlaşma** ve **teslim onayı** ile döngü tamamlanır. Ürün sahipleri ayrıca doğrudan **kiralık ilan** yayınlayabilir; kiracılar ilan üzerinden **kiralama talebi** gönderip mesajlaşabilir.

> [prodocs/PRD.md](./prodocs/PRD.md) · [prodocs/MVP.md](./prodocs/MVP.md) · [prodocs/progress.md](./prodocs/progress.md) · [prodocs/plan.md](./prodocs/plan.md) · [prodocs/tech-stack.md](./prodocs/tech-stack.md) · [prodocs/DesignSystem.md](./prodocs/DesignSystem.md)

## MVP özellikleri (özet)


| Alan                                                    | Durum                                |
| ------------------------------------------------------- | ------------------------------------ |
| Talep ilanı → teklif → kabul → escrow → mesaj → teslim  | Çalışır                              |
| Ürün ilanı oluşturma ve detay                           | Çalışır                              |
| İlan detayından kiralama talebi + sohbet                | Çalışır                              |
| İlan sahibi kiralama talebini kabul / reddet            | Çalışır                              |
| Cüzdan (simülasyon yükleme / çekim talebi)              | Çalışır                              |
| Admin paneli (çekim, iade, kullanıcı yönetimi)          | Çalışır (`/admin`, `X-Admin-Key`)  |
| JWT + refresh token; Google ile giriş                   | Çalışır                              |
| AI ilan asistanı (Gemini) — `/ilan-ver`, `/istek-ilani` | Çalışır                              |
| Kategori filtresi (header + ana sayfa)                  | Çalışır                              |
| Profil düzenleme, herkese açık profil                   | Çalışır                              |
| Google Maps konum seçici (ilan / istek formları)        | Çalışır                              |


Ana sayfa yalnızca API’den gelen gerçek ilanları gösterir (demo/mock veri yok).

## Teknoloji


| Katman   | Yığın                                                          |
| -------- | -------------------------------------------------------------- |
| Frontend | Next.js 16, TypeScript (strict), Tailwind CSS 4, Framer Motion |
| Backend  | FastAPI, SQLAlchemy, PostgreSQL, PyJWT                         |
| Auth     | JWT + refresh; Google OAuth (`@react-oauth/google`)            |
| Harita   | Google Maps (`@react-google-maps/api`), Places Autocomplete    |
| AI       | Google Gemini (`google-genai`) — `POST /ai/generate-listing`   |
| Ödeme    | MVP simülasyon (cüzdan UI); backend'de Iyzico iskelet (V2)     |


**Mimari:** UI bileşenleri yalnızca `frontend/services/` katmanını çağırır; backend’de `routers` → `services` → `crud` ayrımı uygulanır (mobil geçişe uygun).

## Hızlı başlangıç

### 1. PostgreSQL

Veritabanı: `eldenele_db` (varsayılan `postgres` / `123456` — bkz. `backend/database.py`).

### 2. Backend

```bash
cd backend
py -m pip install -r requirements.txt
# backend/.env — kökteki .env.example şablonunu kopyalayın
py -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- API dokümantasyonu: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Sağlık: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 3. Frontend

```bash
cd frontend
npm install
# frontend/.env.local — aşağıdaki ortam değişkenlerine bakın
npm run dev
```

Uygulama: [http://localhost:3000](http://localhost:3000)

> Windows’ta backend adresi için `127.0.0.1` tercih edin (`localhost` IPv6 sorunlarına yol açabilir).

### 4. Testler

```bash
cd backend
set DATABASE_URL=postgresql://postgres:123456@127.0.0.1:5432/eldenele_db
py -m pytest -q
```

## Ortam değişkenleri

Şablon: kök `.env.example`. Üretimde gerçek secret kullanın; `.env` ve `.env.local` commit edilmez.

### Backend (`backend/.env`)


| Değişken                                                    | Açıklama                     |
| ----------------------------------------------------------- | ---------------------------- |
| `DATABASE_URL`                                              | PostgreSQL bağlantı dizesi   |
| `JWT_SECRET`, `JWT_EXPIRE_HOURS`, `JWT_REFRESH_EXPIRE_DAYS` | Oturum token’ları            |
| `ADMIN_API_KEY`                                             | Admin uçları (`X-Admin-Key`) |
| `GEMINI_API_KEY`, `GEMINI_MODEL`                            | AI ilan asistanı (opsiyonel) |
| `GOOGLE_CLIENT_ID`                                          | Google OAuth doğrulama       |
| `IYZICO_*`, `FRONTEND_URL`                                  | Ödeme sandbox (opsiyonel)    |


### Frontend (`frontend/.env.local`)


| Değişken                          | Açıklama                               |
| --------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_BACKEND_URL`         | API kökü, örn. `http://127.0.0.1:8000` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`    | Google ile giriş butonu                |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Harita + Places + Geocoding            |


**Google Cloud Console:** OAuth için Authorized JavaScript origins → `http://localhost:3000`. Maps için **Maps JavaScript API**, **Places API** ve **Geocoding API** etkin olmalı.

## Admin paneli

Tarayıcı: [http://localhost:3000/admin](http://localhost:3000/admin) — `ADMIN_API_KEY` ile giriş.

Sekmeler: para çekme onay/red, anlaşmazlık iadesi, kullanıcı listeleme ve silme (zincirleme).

API (curl) örneği:

```bash
curl -H "X-Admin-Key: YOUR_ADMIN_KEY" http://127.0.0.1:8000/admin/withdrawals/pending
curl -X POST -H "X-Admin-Key: YOUR_ADMIN_KEY" http://127.0.0.1:8000/admin/withdrawals/{id}/approve
```

Anlaşmazlık iadesi: `POST /admin/deals/{deal_id}/refund`

## Ana sayfalar


| Yol                              | Açıklama                                               |
| -------------------------------- | ------------------------------------------------------ |
| `/`                              | Öne çıkan ilanlar + istek ilanları (kategori filtresi) |
| `/auth`                          | Giriş / üye ol (e-posta, telefon, Google)              |
| `/ilan-ver`                      | Ürün ilanı aç (AI asistanı, Google Maps)               |
| `/ilan/[id]`                     | İlan detay, kiralama talebi gönder                     |
| `/istek-ilani`                   | Talep ilanı aç (AI asistanı, Google Maps)              |
| `/talep/[id]`                    | Teklif ver / kabul et                                  |
| `/cuzdan`                        | Bakiye yükle / çekim talebi                            |
| `/mesajlar`                      | İlan kiralama sohbetleri + kabul edilen teklifler      |
| `/mesajlar/kiralama/[requestId]` | İlan kiralama sohbeti (ilan sahibi: kabul / reddet)  |
| `/islem/[dealId]`                | Talep işlemi: mesaj, teslim onayı, anlaşmazlık         |
| `/admin`                         | Admin paneli (çekim, iade, kullanıcılar)               |
| `/profil`                        | Kendi profilim (ilanlar, istekler)                     |
| `/profil/duzenle`                | Profil ve fotoğraf düzenleme                           |
| `/profil/[id]`                   | Herkese açık kullanıcı profili                         |


## Önerilen manuel test akışı

1. İki hesap: talep eden + tedarikçi (`/auth`).
2. Talep eden: `/cuzdan` → demo yükleme.
3. Talep eden: `/istek-ilani` → yayınla **veya** tedarikçi: `/ilan-ver` → ilan yayınla.
4. Tedarikçi: `/talep/{id}` → teklif ver **veya** kiracı: `/ilan/{id}` → kiralama talebi → ilan sahibi `/mesajlar` → **Kabul et / Reddet**.
5. Talep eden: teklifi **Kabul et** → `/mesajlar` → mesajlaş.
6. Talep eden: **Teslim aldım — onayla**.

## Arayüz ön izlemesi

![EldenEle ana sayfa](./docs/screenshots/homepage.png)

*(Ekran görüntüsü eski bir sürümden olabilir; güncel arayüz için `npm run dev` ile yerelde kontrol edin.)*

## Lisans

Belirtilmedi.
