# EldenEle — Proje İlerlemesi

Bu dosya, projede şimdiye kadar yapılanları **kronolojik sırayla** özetler. Son güncelleme: 8 Haziran 2026 (akşam oturumu).

---

## 1. Ürün tanımı ve dokümantasyon

- **PRD** (`PRD.md`): P2P tersine kiralama platformunun tam ürün gereksinimleri, mimari hedefleri ve kalite stratejisi yazıldı.
- **MVP kapsamı** (`MVP.md`): İlk sürümde yapılacaklar / yapılmayacaklar netleştirildi (talep ilanı → teklif → kabul → escrow → teslim).
- **README** (`README.md`): Vizyon, roller, MVP özellikleri ve teknoloji yığını özetlendi; MVP ve PRD belgelerine bağlantılar eklendi.
- **Geliştirme planı** (`plan.md`): LLM ile adım adım ilerleme için aşamalı yol haritası oluşturuldu (Aşama 1–6).

---

## 2. Proje iskeleti ve geliştirme kuralları

- **Monorepo yapısı:** `frontend/` (Next.js) ve `backend/` (FastAPI) dizinleri ayrıldı.
- **Cursor kuralları** (`.cursor/rules/`):
  - Taşınabilir mimari (UI / services / state ayrımı)
  - Frontend standartları (Next.js, TypeScript strict)
  - Backend standartları (router / service / crud katmanları)
- **Aşama 1 — Kurulum ve CORS:**
  - Frontend: Next.js 16, TypeScript, Tailwind CSS 4
  - Backend: FastAPI, temel uygulama iskeleti
  - Frontend ↔ Backend: `http://localhost:3000` için CORS ayarı

---

## 3. EldenEle markası ve ilk MVP arayüzü

- **Marka:** Uygulama adı EldenEle; metadata, `icon.svg` ve el sıkışma sembolü (`elden-ele-handshake-symbol.svg`) güncellendi.
- **Logo:** İki el kenetlenme motifi ve orantılı EldenEle yazı tipi (`EldenEleLogoLink`).
- **Ana sayfa:** Öne çıkan ilanlar grid’i, arama, üst şerit; backend kapalıyken uyarı mesajı (demo ilan fallback kaldırıldı — bkz. §18).
- **Ekran görüntüsü:** Ana sayfa görseli `docs/screenshots/homepage.png` olarak README’ye eklendi.

---

## 4. Kimlik doğrulama ve servis katmanı (ilk sürüm)

- **Backend auth:**
  - `POST /auth/register` — e-posta veya telefon + şifre
  - `POST /auth/login` — tanımlayıcı + şifre
- **Frontend:**
  - `/auth` — giriş / kayıt sayfası (`AuthPage`)
  - `services/auth.ts` ve `services/api.ts` — API çağrıları UI’dan ayrıldı
  - `types/auth.ts` — tip tanımları

---

## 5. İlan ve talep formları (UI)

- **Ürün ilanı:** `/ilan-ver` — çok adımlı form, canlı önizleme, fotoğraf sıralama (`PhotoDropzone`, `ListingFormPage`).
- **Talep ilanı:** `/istek-ilani` — talep formu ve önizleme kartı (`RequestListingFormPage`).
- **Profil:** `/profil`, `/profil/duzenle` — kullanıcı profil ve düzenleme sayfaları.
- **Ortak UI:** Alt navigasyon, üst header, tema değiştirici, arama modalı, etkileşimli sayfa kabuğu (`InteractivePageShell`), kiralama kartları.

---

## 6. Harita ve zengin UX

- **Harita:** `MapWidget` — Google Maps (`@react-google-maps/api`); Places Autocomplete, sürüklenebilir pin, karanlık mod stili (bkz. §18.8).
- **Animasyon:** Framer Motion ile ana sayfa parallax, istek ilanı sayfasında tema ve scroll davranışları.
- **Kategoriler ve sabitler:** `listing-categories`, `CategorySelect`, motion sabitleri.

---

## 7. Backend API genişlemesi (router + şema)

- **Router’lar:**
  - `/listings` — ürün ilanları
  - `/requests` — talep ilanları
- **Katmanlı yapı:**
  - `routers/` — HTTP girişi
  - `services/` — iş kuralları (`listings`, `item_requests`, `accounts`, `home_feed`)
  - `crud/` — veritabanı sorguları
  - `schemas/` — Pydantic istek/yanıt modelleri
- **Kök endpoint:** `GET /` — ana sayfa feed verisi (`home_feed`)
- **Sağlık kontrolü:** `GET /health`

---

## 8. PostgreSQL entegrasyonu

- **Veritabanı:** SQLAlchemy + PostgreSQL bağlantısı (`database.py`); uygulama başlangıcında tablo oluşturma (`create_all`).
- **Modeller** (`models.py`):
  - `User`, `Wallet`, `WalletTransaction`
  - `ItemRequest`, `Listing`, `Offer`
  - `RentalDeal`, `MessageThread`, `Message`
- **Kimlik:**
  - Şifreler bcrypt ile hashleniyor
  - `POST /users/register` — yapılandırılmış kullanıcı kaydı
  - Auth ve kayıt akışları PostgreSQL’e taşındı (bellek içi store kaldırıldı)
- **Güncelleme (Haziran 2026):** Sabit `mvp-login-token` kaldırıldı; **PyJWT** ile gerçek oturum token’ı kullanılıyor (bkz. §9).

---

## 9. MVP kiralama döngüsü (Haziran 2026)

`progress.md` §9’daki “henüz tamamlanmayanlar” listesi bu oturumda büyük ölçüde kapatıldı. Amaç: **talep → teklif → kabul → escrow → mesaj → teslim onayı → hakediş** akışını uçtan uca çalışır hale getirmek.

### 9.1 Backend — yeni / güncellenen parçalar

| Dosya / alan | Ne yapıldı |
|--------------|------------|
| `jwt_tokens.py` | `create_access_token`, `decode_access_token` (HS256, `JWT_SECRET`, `JWT_EXPIRE_HOURS`) |
| `deps.py` | `get_current_user`, `get_optional_current_user` — `Authorization: Bearer` |
| `main.py` | Login/register gerçek JWT döner; `/wallet`, `/deals` router’ları eklendi |
| `crud/wallets.py` | Cüzdan oluşturma, işlem kaydı, bakiye |
| `crud/offers.py` | Teklif CRUD |
| `crud/rental_deals.py` | `RentalDeal`, mesaj thread’i, mesaj listesi |
| `crud/users.py` | Kayıtta otomatik `Wallet` oluşturma |
| `crud/item_requests.py` | `get_item_request_by_id`, durum filtresi |
| `services/offers.py` | Teklif verme, listeleme, kabul (iş kuralları) |
| `services/escrow.py` | `escrow_lock` (kabul), `escrow_release` (teslim onayı) |
| `services/wallet.py` | Bakiye özeti, demo yükleme, IBAN çekim talebi |
| `services/deals.py` | İşlem listesi, mesajlar, teslim onayı |
| `services/home_feed.py` | Kök yanıta açık `itemRequests` eklendi |
| `services/item_requests.py` | Talep oluşturma oturumlu kullanıcıdan (`requester_id` body’den kaldırıldı) |
| `services/accounts.py` | Auth yanıtına `user.id` eklendi |
| `schemas/offers.py`, `deals.py`, `wallet.py` | Yeni Pydantic şemaları |
| `routers/requests.py` | Teklif ve kabul endpoint’leri genişletildi |
| `routers/wallet.py` | `/wallet/me`, `/deposit`, `/withdraw` |
| `routers/deals.py` | İşlemler, mesajlar, `confirm-delivery` |
| `requirements.txt` | `PyJWT`, `pytest`, `httpx` |
| `tests/test_api.py` | Health + korumalı endpoint 401 testi |
| `.github/workflows/ci.yml` | Postgres servisi + pytest; frontend lint |

### 9.2 Backend — API özeti

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/auth/register`, `/auth/login`, `/auth/refresh` | JWT + refresh + `user.id` |
| GET | `/requests` | Açık talepler listesi |
| POST | `/requests` | Talep oluştur (auth) |
| GET | `/requests/{id}` | Talep detayı |
| POST | `/requests/{id}/offers` | Teklif ver (auth) |
| GET | `/requests/{id}/offers` | Teklifleri listele |
| POST | `/requests/{id}/offers/{offer_id}/accept` | Kabul + escrow kilidi + `RentalDeal` |
| GET | `/wallet/me` | Bakiye + son işlemler |
| POST | `/wallet/deposit` | Simülasyon veya Iyzico başlatma |
| POST | `/wallet/deposit/iyzico/complete` | Iyzico MVP tamamlama |
| GET | `/listings`, `/listings/{id}` | Ürün ilanları (arama + detay) |
| POST | `/listings` | Ürün ilanı oluştur (auth) |
| GET | `/profile/me` | Profil özeti |
| POST | `/deals/{id}/dispute` | Anlaşmazlık |
| GET/POST | `/admin/...` | Çekim onay / iade (admin) |
| POST | `/wallet/withdraw` | IBAN çekim talebi (`pending`) |
| GET | `/deals` | Kullanıcının kiralama işlemleri |
| GET/POST | `/deals/{id}/messages` | Mesajlaşma |
| POST | `/deals/{id}/confirm-delivery` | Teslim onayı (talep eden) → hakediş |
| POST | `/ai/generate-listing` | AI ile ilan alanları üret (auth) — bkz. §13, §16 |
| PUT | `/profile/me` | Profil güncelle (ad, konum, bio, sosyal, fotoğraf Base64) — bkz. §15 |
| POST | `/auth/google` | Google id_token ile giriş / otomatik üyelik — bkz. §17 |

### 9.3 Frontend — yeni / güncellenen parçalar

| Dosya / sayfa | Ne yapıldı |
|---------------|------------|
| `lib/session.ts` | `persistAuthSession`, `getAuthToken`, `getAuthUser` |
| `services/http.ts` | `authorizedFetch` + hata mesajı çıkarımı |
| `services/requests.ts` | Talep ve teklif API çağrıları |
| `services/wallet.ts` | Cüzdan yükleme / çekim |
| `services/deals.ts` | İşlemler, mesaj, teslim onayı |
| `types/requests.ts`, `wallet.ts` | Yeni tipler |
| `types/auth.ts`, `api.ts` | `user.id`; `itemRequests` feed alanı |
| `AuthPage.tsx` | `persistAuthSession` kullanımı |
| `RequestListingFormPage.tsx` | Yayınlama → `POST /requests` → `/talep/{id}` |
| `RequestDetailPage.tsx` | Teklif ver / kabul et UI |
| `WalletPage.tsx` + `/cuzdan` | Cüzdan ekranı |
| `DealWorkspacePage.tsx` + `/islem/[dealId]` | Mesaj + teslim onayı + temalı toast/dialog (§18.4) |
| `/mesajlar` | İşlem listesi + ilan kiralama sohbetleri (§18.2) |
| `app/page.tsx` | Talep kartları API’den; “Teklif Ver” → `/talep/{id}` |
| `BottomNav.tsx` | Mesajlar linki `/mesajlar` |
| `UserProfilePage.tsx` | Cüzdan linki |

### 9.4 İş kuralları (özet)

1. Teklif yalnızca **açık** taleplere; talep sahibi kendi talebine teklif veremez.
2. Kabul yalnızca **talep sahibi** tarafından; diğer bekleyen teklifler `rejected`, talep `closed`.
3. Kabulde talep edenin cüzdanından **teklif tutarı** düşülür (`escrow_lock`); yetersiz bakiyede işlem geri alınır (`rollback`).
4. Teslim onayında tutar **tedarikçi** cüzdanına aktarılır (`escrow_release`).
5. Kabul anında `MessageThread` oluşturulur; mesajlar işlem katılımcılarına açıktır.

### 9.5 Tamamlanan vs kalan (§9 tablosu)

| Alan | Durum |
|------|--------|
| Teklif verme / kabul API + UI | **Tamamlandı** |
| Cüzdan yükleme / çekme | **Tamamlandı** (ödeme simülasyon; gerçek kart yok) |
| Escrow (havuz) | **Tamamlandı** (iş mantığı `services/escrow.py`) |
| Mesajlaşma | **Tamamlandı** |
| Teslim onayı | **Tamamlandı** |
| Iyzico / ödeme entegrasyonu | **Kısmen** — simülasyon + sandbox iskelet (bkz. §12) |
| CI/CD (GitHub Actions) | **Tamamlandı** |
| Birim / entegrasyon testleri | **Tamamlandı** (temel + E2E kiralama akışı; bkz. §12) |

---

## 10. Geliştirme oturumu — uygulama ayağa kaldırma (20 Mayıs 2026)

- Frontend bağımlılıkları doğrulandı (`npm install`).
- Next.js geliştirme sunucusu `npm run dev` ile http://localhost:3000 üzerinde çalıştırıldı (Next.js 16.2.4, Turbopack).
- Kullanıcı isteğiyle geliştirme sunucusu kapatıldı.

---

## 11. Geliştirme oturumu — MVP döngüsü (3 Haziran 2026)

- `progress.md` oluşturuldu ve proje geçmişi dokümante edildi.
- Kullanıcı isteğiyle §9 “henüz tamamlanmayanlar” maddeleri **yavaş yavaş** kapatılmaya başlandı; bu oturumda uçtan uca kiralama akışı kodlandı.
- Backend + frontend birlikte çalıştırıldı (FastAPI `:8000`, Next.js `:3000`, PostgreSQL `:5432`).

### Manuel test akışı (önerilen)

1. İki ayrı hesap: talep eden + tedarikçi (`/auth`).
2. Talep eden: `/cuzdan` → demo yükleme (ör. ₺500).
3. Talep eden: `/istek-ilani` → yayınla.
4. Tedarikçi: `/talep/{id}` → teklif ver.
5. Talep eden: teklifi **Kabul et**.
6. `/mesajlar` → işlem → mesajlaş.
7. Talep eden: **Teslim aldım — onayla**.

> Eski oturumlardaki `mvp-login-token` artık geçersiz; tüm kullanıcıların **yeniden giriş** yapması gerekir.

Aynı gün devamında kalan MVP maddeleri tamamlandı — ayrıntılar **§12**.

---

## Özet tablo (commit sırası)

| Sıra | Commit özeti |
| ---- | ------------ |
| 1 | PRD ve MVP dokümantasyonu |
| 2 | README ve plan |
| 3 | Frontend + Backend kurulum, CORS |
| 4 | EldenEle MVP: auth, ilan ver, servis katmanı |
| 5 | Ana sayfa ekran görüntüsü |
| 6 | Logo ve wordmark |
| 7 | Formlar, harita, router’lar, profil, arama UX |
| 8 | PostgreSQL, CRUD, servisler, DB destekli API’ler |
| 9 | *(yerel / henüz commit yok)* MVP döngüsü (§9): JWT, teklif, escrow, mesaj, CI |
| 10 | *(yerel / henüz commit yok)* Kalan maddeler (§12): refresh, ilan API, profil, admin, Iyzico iskelet, E2E, README |
| 11 | AI İlan Asistanı (§13): Gemini backend, `/ilan-ver` AI UI — `3bfe8c4` |
| 12 | *(yerel / henüz commit yok)* İlan detay, profil, istek AI, Google OAuth (§14–§17) |
| 13 | *(yerel / henüz commit yok)* Kategori filtresi, mesajlaşma, UX iyileştirmeleri, Google Maps (§18) |

---

## 12. Kalan MVP maddelerinin tamamlanması (3 Haziran 2026)

Önceki “yapılacaklar” listesindeki maddeler (refresh token, ürün ilanı API, profil, Iyzico iskelet, admin çekim, anlaşmazlık, E2E test, dokümantasyon) bu oturumda kodlandı.

### 12.1 Backend — eklenen / güncellenen dosyalar

| Dosya / alan | Ne yapıldı |
|--------------|------------|
| `jwt_tokens.py` | `create_refresh_token`, `decode_refresh_token`; access token `type: access` |
| `main.py` | `POST /auth/refresh`; login/register’da `refresh_token` |
| `routers/listings.py` | Oturumlu `POST /listings`; `GET` arama (`q`, `category`); `GET /{id}` |
| `routers/profile.py` | `GET /profile/me` |
| `routers/admin.py` | Çekim listesi, onay, red, anlaşmazlık iadesi (`X-Admin-Key`) |
| `routers/wallet.py` | `DepositResponse`; `POST /deposit/iyzico/complete` |
| `routers/deals.py` | `POST /{id}/dispute` |
| `services/listings.py` | Oturumlu ilan oluşturma; detay ve filtreli liste |
| `services/profile.py` | Profil özeti (ilan, istek, teklif, işlem sayıları) |
| `services/admin.py` | Admin anahtar doğrulama; çekim onay/red |
| `services/payments/iyzico.py` | Iyzico yapılandırma kontrolü; checkout placeholder URL |
| `services/wallet.py` | `provider=simulated \| iyzico`; tamamlama endpoint’i |
| `services/deals.py` | `open_dispute`, `refund_disputed_deal` (admin) |
| `crud/listings.py` | `get_listing_by_id`, filtreli `list_listings`, `list_by_owner` |
| `crud/offers.py` | `list_offers_by_supplier` |
| `crud/item_requests.py` | `list_item_requests_by_requester` |
| `crud/wallets.py` | `list_pending_withdrawals`, `get_transaction_by_id` |
| `schemas/profile.py`, `listings.py` (güncelleme) | `owner_id` kaldırıldı; profil şeması |
| `tests/test_rental_flow.py` | Tam kiralama döngüsü + refresh token testi |
| `.env.example` | Tüm ortam değişkenleri şablonu |

### 12.2 Backend — yeni API uçları

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/auth/refresh` | Yeni access + refresh token |
| POST | `/listings` | Ürün ilanı oluştur (auth) |
| GET | `/listings?q=&category=` | Arama / filtre |
| GET | `/listings/{id}` | İlan detayı |
| GET | `/profile/me` | Profil özeti + listeler |
| POST | `/wallet/deposit` | `provider`: `simulated` veya `iyzico` |
| POST | `/wallet/deposit/iyzico/complete` | Iyzico MVP ödeme tamamlama |
| POST | `/deals/{id}/dispute` | Anlaşmazlık aç |
| GET | `/admin/withdrawals/pending` | Bekleyen çekimler (admin) |
| POST | `/admin/withdrawals/{id}/approve` | Çekim onayı |
| POST | `/admin/withdrawals/{id}/reject` | Çekim reddi (bakiye iade) |
| POST | `/admin/deals/{id}/refund` | Anlaşmazlık iadesi (admin) |

### 12.3 Frontend — eklenen / güncellenen

| Dosya / sayfa | Ne yapıldı |
|---------------|------------|
| `services/listings.ts` | İlan oluşturma, detay, arama |
| `services/profile.ts` | `GET /profile/me` |
| `services/http.ts` | 401’de otomatik `POST /auth/refresh` |
| `types/listings.ts`, `profile.ts` | Yeni tipler |
| `types/auth.ts` | `refresh_token` alanı |
| `lib/session.ts` | Refresh token saklama |
| `ListingFormPage.tsx` | Yayınlama → `POST /listings` → `/ilan/{id}` |
| `ListingDetailPage.tsx` + `/ilan/[id]` | İlan detay sayfası |
| `RentalCard.tsx` | Kartlar `/ilan/{id}` linkli |
| `UserProfilePage.tsx` | API’den ilanlar ve istekler; dinamik sekmeler |
| `WalletPage.tsx` | Simülasyon + Iyzico butonları; URL’den ödeme tamamlama |
| `DealWorkspacePage.tsx` | Anlaşmazlık bildir butonu |
| `services/deals.ts` | `openDispute` |
| `ThemeToggle.tsx` | ESLint uyumu (lint geçişi) |

### 12.4 Test ve CI sonuçları

- `pytest -q` → **4 passed** (`test_api.py` + `test_rental_flow.py`, PostgreSQL gerekir).
- `npm run lint` → **0 error** (2 a11y uyarısı `AppHeader.tsx` — önceden var).
- CI: `ADMIN_API_KEY` test ortamına eklendi; `staging-placeholder` job (deploy secret’ları için yer tutucu).

### 12.5 Dokümantasyon

| Dosya | İçerik |
|-------|--------|
| `README.md` | Kurulum (Postgres, backend, frontend), admin curl örnekleri, sayfa tablosu |
| `.env.example` | `JWT_*`, `ADMIN_API_KEY`, `IYZICO_*`, `BACKEND_URL` |
| `plan.md` | Aşama 1–6 checkbox’ları güncellendi |
| `progress.md` | Bu bölüm (§12) |

### 12.6 Ortam değişkenleri (özet)

```env
JWT_SECRET=...
JWT_EXPIRE_HOURS=24
JWT_REFRESH_EXPIRE_DAYS=30
ADMIN_API_KEY=...          # Admin API
IYZICO_API_KEY=...         # Opsiyonel
IYZICO_SECRET_KEY=...
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://127.0.0.1:8000  # frontend .env.local
```

### 12.7 Güncel durum tablosu (eski “kalanlar” listesi)

| Alan | Durum |
|------|--------|
| Refresh token | **Tamamlandı** |
| `/ilan-ver` → API | **Tamamlandı** |
| Profil sekmeleri (API) | **Tamamlandı** (yorumlar V2 placeholder) |
| Çekim operasyonu (admin API) | **Tamamlandı** (UI yok; curl/README) |
| Iyzico | **İskelet** — tam SDK üretim öncesi |
| E2E pytest | **Tamamlandı** |
| README / `.env.example` | **Tamamlandı** |
| Staging deploy | **Placeholder** (CI job; gerçek deploy yok) |
| Anlaşmazlık / iade | **Tamamlandı** (API) |
| Git commit | **Bekliyor** — tüm değişiklikler yerelde |

---

## 13. AI İlan Asistanı (3 Haziran 2026)

Kullanıcıların dağınık metin girdisini yapılandırılmış ilan alanlarına dönüştüren Gemini tabanlı asistan; backend API + `/ilan-ver` arayüz entegrasyonu.

### 13.1 Backend — eklenen / güncellenen dosyalar

| Dosya / alan | Ne yapıldı |
|--------------|------------|
| `schemas/ai.py` | `AIGenerateRequest` (`raw_text`), `AIGenerateResponse` (`title`, `description`, `category`, `daily_price`) |
| `services/ai_assistant.py` | Google **google-genai** SDK; `generate_listing_from_text` (async thread pool); JSON şema zorunluluğu; `.env` yükleme |
| `routers/ai.py` | `POST /ai/generate-listing` — oturum zorunlu (`get_current_user`) |
| `main.py` | `/ai` router eklendi |
| `requirements.txt` | `google-genai>=1.0.0`, `python-dotenv>=1.0.0` (eski `google-generativeai` / `openai` kaldırıldı) |
| `.env` / `.env.example` | `GEMINI_API_KEY`, isteğe bağlı `GEMINI_MODEL` |

**Model:** Varsayılan `gemini-2.5-flash` (kod içi sabit; ortam değişkeni ile override edilebilir).

**Hata yönetimi:** Eksik API anahtarı → 503; Gemini / JSON parse hatası → 502; detaylı log `print` ile backend konsoluna.

### 13.2 Backend — API

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/ai/generate-listing` | Ham metni ilan alanlarına dönüştür (auth) |

**İstek gövdesi:** `{ "raw_text": "..." }` (3–4000 karakter)

**Yanıt:** `{ "title", "description", "category", "daily_price" }`

### 13.3 Frontend — eklenen / güncellenen

| Dosya / sayfa | Ne yapıldı |
|---------------|------------|
| `services/ai.ts` | `generateListingWithAI` — `authorizedFetch` ile JWT + otomatik refresh |
| `types/ai.ts` | `AIGenerateListingResponse` tipi |
| `ListingFormPage.tsx` | Formun üstünde **“AI ile İlan Oluştur”** bölümü; textarea + **✨ Yapay Zeka ile Doldur** butonu |
| `ListingFormPage.tsx` | `generateWithAI` — loading (“Yükleniyor...”), hata mesajı, başarıda `title` / `description` / `category` / `daily_price` state’lerine yazma |
| `services/ai.ts` | AI kategori metnini `LISTING_CATEGORIES` select değerine eşleme (`normalizeAiCategory`) |

**Mimari:** UI yalnızca `services/ai.ts` çağırır; token `services/http.ts` → `Authorization: Bearer` ile eklenir. Giriş yoksa `/auth` yönlendirmesi.

### 13.4 Manuel test akışı (önerilen)

1. Backend çalışır durumda olsun; `.env` içinde geçerli `GEMINI_API_KEY` tanımlı olsun.
2. `/auth` ile giriş yap.
3. `/ilan-ver` → üstteki AI textarea’ya kısa bir eşya açıklaması yaz.
4. **✨ Yapay Zeka ile Doldur** → başlık, açıklama, kategori ve günlük fiyat alanlarının dolduğunu doğrula.
5. Fotoğraf ve adres ekleyip ilanı yayınla.

### 13.5 Bilinen notlar

- Google AI Studio anahtarı genelde `AIza...` ile başlar; geçersiz anahtar 502 döner (backend ayakta kalır).
- `ai_assistant.py` refactor sırasında oluşan `IndentationError` (`_get_client` tanımı) giderildi; uvicorn worker import hatası çözüldü.
- Windows’ta API tabanı `127.0.0.1:8000` (`resolveBackendRootUrl`); `localhost` IPv6 sorunlarından kaçınılır.

### 13.6 Güncel durum

| Alan | Durum |
|------|--------|
| AI backend endpoint | **Tamamlandı** |
| Gemini entegrasyonu (google-genai) | **Tamamlandı** |
| `/ilan-ver` AI UI | **Tamamlandı** |
| Git commit (§13) | **Tamamlandı** — `3bfe8c4` GitHub’a push |
| Git commit (§14–§17) | **Bekliyor** — yerel değişiklikler |

---

## 14. İlan detay sayfası — pazar yeri düzeni (Haziran 2026)

`/ilan/[id]` sayfası metin-only görünümden modern kiralama deneyimine taşındı.

### 14.1 Frontend

| Dosya | Ne yapıldı |
|-------|------------|
| `ListingDetailPage.tsx` | `md:grid-cols-3` düzen: sol 2 kolon (görsel, başlık, rozetler, şartlar, açıklama); sağ 1 kolon yapışkan kiralama kartı |
| `ListingRentalCard.tsx` | Günlük fiyat, tarih seçimi, toplam gün/fiyat hesabı, `min_days` / `max_days` doğrulama, **Kiralama Talebi Gönder** |
| `DateRangePicker.tsx` | Native `type="date"` yerine özel takvim; aralık seçimi (pill vurgu), açık/koyu tema, **Temizle** / **Bugün** |
| `lib/dates.ts` | ISO tarih yardımcıları, kiralama günü hesabı |

**Aksiyon:** Giriş yoksa `/auth`; giriş varsa kiralama talebi → ilan sahibiyle mesajlaşma (§18.2).

---

## 15. Profil güncelleme ve UX (Haziran 2026)

### 15.1 Backend

| Dosya / alan | Ne yapıldı |
|--------------|------------|
| `models.py` | `name`, `location`, `bio`, `instagram`, `linkedin`, `avatar_base64`, `cover_base64` |
| `database.py` | `apply_schema_patches()` — mevcut DB’ye sütun ekleme |
| `schemas/profile.py` | `ProfileUpdate`, genişletilmiş `ProfileSummary` |
| `routers/profile.py` | `PUT /profile/me` |
| `crud/users.py` | `update_user_profile`, `create_user(name=...)` |
| `services/profile.py` | `update_profile`, özet yanıtta profil alanları |

### 15.2 Frontend

| Dosya / sayfa | Ne yapıldı |
|---------------|------------|
| `ProfileEditPage.tsx` | Form ön-doldurma, kaydetme, loading, toast, `/profil` yönlendirme |
| `services/profile.ts` | `updateProfile` (JWT) |
| `UserProfilePage.tsx` | Kapak gradient düzeltmesi (mavi bug kaldırıldı); isim kapak üzerinde `text-white`; tutarlı outlined butonlar |
| `ProfileEditPage.tsx` | Kapak/avatar tıklanabilir; `input[type=file]` + `URL.createObjectURL` önizleme; Base64 ile kayıt |
| `lib/profile-images.ts` | `fileToDataUrl`, e-posta fallback adı |

---

## 16. İstek ilanı — AI asistanı (Haziran 2026)

`ListingFormPage` ile aynı AI altyapısı `/istek-ilani` sayfasına taşındı.

| Dosya | Ne yapıldı |
|-------|------------|
| `RequestListingFormPage.tsx` | **AI ile İstek Oluştur** kutusu (textarea + buton) |
| `services/ai.ts` | Mevcut `generateListingWithAI` + `normalizeAiCategory` (export) |
| State eşlemesi | `title`, `category` (label), `description`, `daily_price` → `maxDailyBudget` |
| UX | Yükleniyor..., başarı/hata toast bildirimleri |

Backend değişikliği yok — `POST /ai/generate-listing` yeniden kullanıldı.

---

## 17. Google ile giriş (OAuth) (Haziran 2026)

### 17.1 Backend

| Dosya / alan | Ne yapıldı |
|--------------|------------|
| `requirements.txt` | `google-auth>=2.0.0` |
| `routers/auth.py` | `/auth/login`, `/auth/register`, `/auth/refresh`, **`/auth/google`** (main’den taşındı) |
| `schemas/auth.py` | `GoogleAuthRequest` (`credential` = id_token) |
| `services/google_auth.py` | `verify_oauth2_token` |
| `services/accounts.py` | `login_or_register_with_google` — yoksa rastgele şifre ile otomatik üye |

### 17.2 Frontend

| Dosya | Ne yapıldı |
|-------|------------|
| `AuthPage.tsx` | Apple/Facebook kaldırıldı; Giriş + Üye ol sekmelerinde Google butonu |
| `GoogleAuthButton.tsx` | `@react-oauth/google` `GoogleLogin`, tam genişlik |
| `AppProviders.tsx` | `GoogleOAuthProvider` |
| `services/auth.ts` | `loginWithGoogle(credential)` → `POST /auth/google` |

### 17.3 Ortam değişkenleri

```env
# backend/.env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com

# frontend/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

Google Cloud Console: Authorized JavaScript origins → `http://localhost:3000`

### 17.4 Güncel durum

| Alan | Durum |
|------|--------|
| Google OAuth backend | **Tamamlandı** |
| Google OAuth UI | **Tamamlandı** |
| Üretim OAuth ayarları | **Bekliyor** — canlı domain + secret’lar |

---

## 18. Geliştirme oturumu — kategori, mesajlaşma, UX ve Google Maps (8 Haziran 2026)

Bu oturumda ana sayfa filtreleme, ilan/talep mesajlaşması, profil/header iyileştirmeleri, mock veri temizliği ve harita entegrasyonu tamamlandı.

### 18.1 Kategori seçimi ve ana sayfa filtresi

| Dosya / alan | Ne yapıldı |
|--------------|------------|
| `constants/listing-categories.ts`, `lib/categories.ts` | Ortak kategori listesi ve slug/label eşlemesi |
| `CategorySelect.tsx` | `-Seçiniz-` yalnızca placeholder; listede görünmez |
| `CategoryFilterProvider` | Layout’ta global kategori filtresi |
| `AppHeader.tsx` | Üst şerit kategorileri filtreye bağlandı |
| `app/page.tsx` | Seçili kategoriye göre ilan grid’i filtrelenir |
| `backend/services/home_feed.py`, `crud/listings.py` | Feed’e `category`; tam slug eşleşmesi |
| AI asistanı | `category` alanı AI yanıtından ve formlardan kaldırıldı — kategori kullanıcı seçer |

### 18.2 İlan kiralama talebi ve mesajlaşma

**Backend**

| Dosya / alan | Ne yapıldı |
|--------------|------------|
| `models.py` | `ListingRentalRequest`, `ListingConversation`, `ListingMessage` |
| `routers/listings.py` (genişletme) | `POST /listings/{id}/rental-requests`; mesaj listesi/gönderimi; inbox özeti |
| `services/listing_rentals.py`, `crud/listing_rentals.py` | Kiralama talebi ve sohbet iş kuralları |
| `schemas/listing_rentals.py` | Mesajlarda `sender_name` |

**Frontend**

| Dosya / sayfa | Ne yapıldı |
|---------------|------------|
| `services/listing-rentals.ts`, `types/listing-rentals.ts` | API servis katmanı |
| `RentalConversationChat.tsx`, `ListingRentalChatPage.tsx` | Sohbet UI; gönderen adı gösterimi |
| `ListingDetailPage.tsx` | Kiralama talebi gönder → mesajlar akışı |
| `app/mesajlar/page.tsx` | İlan kiralama sohbetleri + kabul edilen teklifler listesi |
| `app/mesajlar/kiralama/[requestId]/page.tsx` | Kiralama sohbet detay rotası |
| `AppHeader.tsx` | Masaüstü **Mesajlar** butonu (`/mesajlar`) |

**Ortam:** `frontend/.env.local` → `NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000` (stale backend “Not Found” hatası giderildi).

### 18.3 Profil, header ve kart iyileştirmeleri

| Dosya / sayfa | Ne yapıldı |
|---------------|------------|
| `home_feed.py` + `RentalCard.tsx` | İlan kartlarında sahip adı ve profil fotoğrafı |
| `RequestDetailPage.tsx` | İstek ilanı detayı — iki kolon düzen, `RequestOfferCard`, `RequestRequesterCard` |
| `crud/item_requests.py` | Talep detayında `requester` önizlemesi (`avatar_base64`) |
| `AppHeader.tsx` | Giriş yapınca profil butonunda kullanıcının kendi avatarı (`/profile/me`); tema toggle ile hizalama düzeltmesi |
| `AppHeader.tsx` + `lib/session.ts` | Çıkış: `clearAuthSession()` + `/` yönlendirme; temalı profil menüsü |

### 18.4 Bildirimler ve işlem ekranı UX

| Dosya | Ne yapıldı |
|-------|------------|
| `AppToast.tsx` | Temalı alt toast (success / error) |
| `ListingFormPage.tsx`, `ListingDetailPage.tsx`, `RequestDetailPage.tsx` | `window.alert` → `AppToast` |
| `PromptDialog.tsx` | Temalı metin girişli dialog (tarayıcı `prompt` yerine) |
| `DealWorkspacePage.tsx` | Teslim onayı → yeşil toast; anlaşmazlık → `PromptDialog` + toast |
| `RequestDetailPage.tsx` | “Kabul et (escrow)” → **Kabul et** |
| `app/mesajlar/page.tsx` | Kabul edilen tekliflerde `supplier` / `escrow` metinleri kaldırıldı; yalnızca **Teklif: ₺…** |
| `app/mesajlar/page.tsx` | `offer_price` string geldiğinde `Number()` ile formatlama (runtime hata düzeltmesi) |

### 18.5 Mock veri temizliği ve ana sayfa düzeni

| Değişiklik | Açıklama |
|------------|----------|
| `constants/demo-listings.ts` | **Silindi** |
| `lib/listings.ts` | API boşsa boş dizi; demo fallback yok |
| `app/page.tsx` | `REQUEST_DEMOS` kaldırıldı; boş durum mesajları + CTA butonları |
| `app/page.tsx` | Yükleme sırasında `ListingSkeleton`; veri gelince gerçek ilan veya boş durum |
| `app/page.tsx` | **Kiralamak İstediğiniz Ürün İçin İlan Açın** butonu → **İstek İlanları** başlığının sağına taşındı |
| `services/api.ts` | “Örnek ilanlar gösteriliyor” metni kaldırıldı |

### 18.6 Google Maps harita entegrasyonu

| Dosya / alan | Ne yapıldı |
|--------------|------------|
| `package.json` | `@react-google-maps/api`, `@types/google.maps` eklendi; `leaflet`, `react-leaflet` kaldırıldı |
| `MapWidget.tsx` | Tamamen yenilendi: `useLoadScript`, `GoogleMap`, sürüklenebilir `Marker`, `Autocomplete` |
| `constants/google-maps.ts` | Lefkoşa merkez, karanlık mod stil JSON, Places kütüphanesi sabiti |
| `types/map.ts` | `MapCoordinates` tipi |
| `ListingFormPage.tsx`, `RequestListingFormPage.tsx` | `address` + `mapPosition` state; harita `onChange` entegrasyonu |
| `.env.example` | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` şablonu |

**Harita davranışı:** Tıklama / pin sürükleme → `lat/lng` güncelleme; reverse geocoding ile adres alanı; Places arama → harita odaklanır. Koordinatlar şimdilik yalnızca form state’inde (backend’de `lat/lng` alanı henüz yok).

### 18.7 Güncel durum tablosu (bu oturum)

| Alan | Durum |
|------|--------|
| Kategori filtresi (header + ana sayfa) | **Tamamlandı** |
| İlan kiralama talebi + mesajlaşma | **Tamamlandı** |
| Profil fotoğrafı header’da | **Tamamlandı** |
| Temalı toast / dialog (alert/prompt kaldırıldı) | **Tamamlandı** |
| Mock demo ilanlar | **Kaldırıldı** |
| Google Maps harita | **Tamamlandı** |
| Koordinatların API’ye kaydı | **Bekliyor** |
| Git commit (§18) | **Bekliyor** — yerel değişiklikler |

### 18.8 Ortam değişkenleri (ek)

```env
# frontend/.env.local
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

Google Cloud Console: **Maps JavaScript API**, **Places API**, **Geocoding API** etkin olmalı.

---

## Sonraki adımlar (V2 / üretim öncesi)

1. **Tam Iyzico Checkout Form SDK** — üretim ödeme akışı.
2. **Değerlendirme / yorumlar** — profil “Değerlendirmeler” sekmesi.
3. **Staging deploy** — barındırma sağlayıcısı secret’ları ile CI job’ı doldurma.
4. **Playwright** — tarayıcı tabanlı E2E.
5. **Git commit** — §14–§18 değişikliklerinin kaydı ve push.
6. **Konum koordinatları** — `lat/lng` alanlarının backend modeline ve ilan/talep API’sine eklenmesi.
7. **İstek ilanı mesajları** — `Mesajlar` sayfasında item request sohbetlerinin listelenmesi (opsiyonel).
