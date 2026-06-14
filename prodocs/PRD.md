# Ürün Gereksinim Belgesi (PRD): P2P Tersine Kiralama Platformu (MVP)

## 1. Giriş ve Vizyon
Bu proje, geleneksel pazar yeri modellerini tersine çevirerek "talep odaklı" bir kiralama deneyimi sunar. Kullanıcıların ihtiyaç duydukları ürünler için ilan açtığı, ürün sahiplerinin ise rekabetçi teklifler sunduğu dinamik bir ekosistem yaratmayı hedefler.

## 2. Kullanıcı Rolleri
* **Talep Eden (Requester):** İhtiyacı olan ürünü, tarih aralığını ve konumunu belirterek ilan açan kullanıcı.
* **Tedarikçi (Owner):** İlanları inceleyen, uygun ürünü olan ve fiyat teklifi veren kullanıcı.

## 3. Minimum Viable Product (MVP) Kapsamı

### 3.1. İlan Yönetimi
* **İlan Açma:** Ürün adı, kategori, tarih aralığı ve lokasyon bilgisi ile talep oluşturma.
* **Teklif Verme:** Tedarikçilerin ilanlara fiyat ve açıklama içeren teklifler iletmesi.
* **Teklif Kabulü:** Talep edenin gelen teklifler arasından en uygun olanı seçmesi.

### 3.2. Finansal Modül (Cüzdan ve Escrow)
* **Cüzdan Sistemi:** Para yatırma (Kredi Kartı) ve para çekme (IBAN) işlemleri.
* **Güvenli Ödeme (Escrow):** Teklif kabul edildiğinde ücretin havuz hesabına alınması.
* **Hakediş Transferi:** Teslimat onaylandığında ücretin tedarikçinin cüzdanına aktarılması.

### 3.3. İletişim ve Teslimat
* **Mesajlaşma:** Teklif kabulünden sonra aktif olan, konum ve detay paylaşımı için basit sohbet ekranı.
* **Yüz Yüze Teslimat:** Fiziksel ürün teslimi için kullanıcı onayı mekanizması.

## 4. Teknik Gereksinimler ve Mimari
* **Backend:** Python (FastAPI/Django) ile ölçeklenebilir API mimarisi.
* **Veritabanı:** Finansal işlemler için ACID uyumlu PostgreSQL.
* **Ödeme Altyapısı:** Iyzico veya benzeri bir ödeme geçidi entegrasyonu.

## 5. Kalite Güvencesi (QA) ve SDLC Stratejisi
* **Birim Testleri (Unit Tests):** Cüzdan ve ödeme akışları için %100 test kapsamı hedefi.
* **Entegrasyon Testleri:** Teklif verme ve kabul etme süreçlerinin uçtan uca doğrulanması.
* **CI/CD:** GitHub Actions üzerinden otomatik test ve staging ortamına dağıtım süreçleri.

## 6. Gelecek Planları (V2)
* Kullanıcı puanlama ve gelişmiş yorum sistemi.
* Teslimat güvenliği için QR kod doğrulaması.
* AI destekli fiyat öneri motoru.
