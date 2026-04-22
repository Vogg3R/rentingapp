# P2P Tersine Kiralama Platformu - LLM Geliştirme Planı

Bu belge, yapay zeka (LLM) asistanının projeyi adım adım geliştirmesi için hazırlanmış bir yol haritasıdır. Proje, "Separation of Concerns" prensibine uygun olarak `frontend` ve `backend` olarak iki ayrı dizinde geliştirilecektir.

## Aşama 1: Proje İskeleti ve Kurulum (Şu Anki Aşama)
- [x] Frontend ve Backend klasörlerinin ayrılması.
- [x] Cursor kurallarının (`.mdc` dosyaları) ayarlanması.
- [ ] Backend: FastAPI ve sanal ortam (venv) kurulumu.
- [ ] Frontend: Next.js, TypeScript ve Tailwind CSS kurulumu.

## Aşama 2: Veritabanı ve Modeller (Backend)
- [ ] PostgreSQL bağlantısının kurulması (SQLAlchemy veya SQLModel ile).
- [ ] Kullanıcı (User), İlan (Request) ve Teklif (Offer) tablolarının oluşturulması.
- [ ] Pydantic şemalarının (Request/Response modelleri) yazılması.

## Aşama 3: Temel API Uç Noktaları (Backend)
- [ ] Kullanıcı kayıt ve giriş (JWT Auth) endpoint'leri.
- [ ] İlan açma, listeleme ve detaya bakma endpoint'leri.
- [ ] İlana teklif verme ve teklifleri listeleme endpoint'leri.

## Aşama 4: Arayüz İskeleti (Frontend)
- [ ] Ortak bileşenlerin (Navbar, Butonlar, Kartlar) Tailwind ile tasarlanması.
- [ ] Ana sayfa (İlan arama/listeleme) tasarımının yapılması.
- [ ] İlan detay ve teklif verme formlarının oluşturulması.
- [ ] Kullanıcı paneli (Cüzdan ve aktif ilanlar) arayüzü.

## Aşama 5: Entegrasyon ve İş Mantığı (Full-Stack)
- [ ] Frontend 'services/' klasöründen Backend API'sine isteklerin atılması.
- [ ] CORS ayarlarının yapılıp iki sistemin birbiriyle konuşturulması.
- [ ] İlan açma ve teklif kabul etme senaryolarının uçtan uca test edilmesi.

## Aşama 6: Ödeme Havuzu (Escrow) ve Sonlandırma
- [ ] Iyzico (veya benzeri) API entegrasyonu ile cüzdan altyapısının kurulması.
- [ ] Teklif kabulünde paranın havuzda tutulması mantığının eklenmesi.
- [ ] Teslimat onayı ve paranın satıcıya aktarılması.