# P2P Tersine Kiralama Platformu - LLM Geliştirme Planı

Bu belge, yapay zeka (LLM) asistanının projeyi adım adım geliştirmesi için hazırlanmış bir yol haritasıdır.

## Aşama 1: Proje İskeleti ve Kurulum
- [x] Frontend ve Backend klasörlerinin ayrılması.
- [x] Cursor kurallarının (`.mdc` dosyaları) ayarlanması.
- [x] Backend: FastAPI kurulumu.
- [x] Frontend: Next.js, TypeScript ve Tailwind CSS kurulumu.

## Aşama 2: Veritabanı ve Modeller (Backend)
- [x] PostgreSQL bağlantısı (SQLAlchemy).
- [x] User, ItemRequest, Listing, Offer, Wallet, RentalDeal, Message tabloları.
- [x] Pydantic şemaları.

## Aşama 3: Temel API Uç Noktaları (Backend)
- [x] Kullanıcı kayıt ve giriş (JWT + refresh).
- [x] İlan ve talep CRUD.
- [x] Teklif verme, listeleme, kabul.

## Aşama 4: Arayüz İskeleti (Frontend)
- [x] Ortak bileşenler, ana sayfa, formlar.
- [x] Profil, cüzdan, talep/teklif, işlem sayfaları.

## Aşama 5: Entegrasyon ve İş Mantığı (Full-Stack)
- [x] `services/` katmanından API.
- [x] CORS.
- [x] Uçtan uca kiralama senaryosu (manuel + `test_rental_flow.py`).

## Aşama 6: Ödeme Havuzu (Escrow) ve Sonlandırma
- [x] Escrow kilidi ve hakediş aktarımı.
- [x] Cüzdan simülasyon + Iyzico iskelet (anahtarlarla sandbox akışı).
- [ ] Tam Iyzico Checkout Form SDK entegrasyonu (üretim öncesi).

## Sonraki (V2)
- [ ] Değerlendirme / yorumlar.
- [ ] Staging deploy otomasyonu.
- [ ] Native mobil istemci.
