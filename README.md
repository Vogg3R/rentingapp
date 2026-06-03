# P2P Tersine Kiralama Platformu (MVP) — EldenEle

Talep odaklı kiralama: kullanıcılar ihtiyaç duydukları ürünler için **istek ilanı** açar; ürün sahipleri **teklif** verir. Kabul sonrası **escrow**, **mesajlaşma** ve **teslim onayı** ile döngü tamamlanır.

> [PRD.md](./PRD.md) · [MVP.md](./MVP.md) · [progress.md](./progress.md) · [plan.md](./plan.md)

## Teknoloji

| Katman | Yığın |
|--------|--------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, PostgreSQL |
| Auth | JWT + refresh token |
| Ödeme | MVP simülasyon; opsiyonel Iyzico sandbox iskelet |

## Hızlı başlangıç

### 1. PostgreSQL

Veritabanı: `eldenele_db` (varsayılan kullanıcı/şifre `postgres` / `123456` — `backend/database.py`).

### 2. Backend

```bash
cd backend
py -m pip install -r requirements.txt
# Ortam değişkenleri için kökteki .env.example dosyasına bakın
py -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API dokümantasyonu: http://127.0.0.1:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
# frontend/.env.local: BACKEND_URL=http://127.0.0.1:8000
npm run dev
```

Uygulama: http://localhost:3000

### 4. Testler

```bash
cd backend
set DATABASE_URL=postgresql://postgres:123456@127.0.0.1:5432/eldenele_db
py -m pytest -q
```

## Ortam değişkenleri

Kök `.env.example` dosyasındaki değişkenleri kopyalayın:

- `JWT_SECRET`, `ADMIN_API_KEY`
- `IYZICO_API_KEY`, `IYZICO_SECRET_KEY` (opsiyonel)
- `BACKEND_URL` (frontend)

## Admin (çekim onayı)

```bash
curl -H "X-Admin-Key: YOUR_ADMIN_KEY" http://127.0.0.1:8000/admin/withdrawals/pending
curl -X POST -H "X-Admin-Key: YOUR_ADMIN_KEY" http://127.0.0.1:8000/admin/withdrawals/{id}/approve
```

Anlaşmazlık iadesi: `POST /admin/deals/{deal_id}/refund`

## Ana sayfalar

| Yol | Açıklama |
|-----|----------|
| `/auth` | Giriş / üye ol |
| `/istek-ilani` | Talep ilanı aç |
| `/ilan-ver` | Ürün ilanı aç |
| `/talep/[id]` | Teklif ver / kabul et |
| `/ilan/[id]` | Ürün ilanı detay |
| `/cuzdan` | Bakiye yükle / çekim |
| `/mesajlar` | Kiralama işlemleri |
| `/islem/[dealId]` | Mesaj + teslim onayı |
| `/profil` | İlanlarım / isteklerim |

## Arayüz ön izlemesi

![EldenEle ana sayfa](./docs/screenshots/homepage.png)

## Lisans

Belirtilmedi.
