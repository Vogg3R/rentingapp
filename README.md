# P2P Tersine Kiralama Platformu (MVP)

Talep odaklı bir kiralama deneyimi: kullanıcılar ihtiyaç duydukları ürünler için ilan açar; ürün sahipleri rekabetçi teklifler sunar. Bu depo, ürünün **MVP** kapsamını ve teknik yönlerini özetler.

> Ayrıntılı gereksinimler için [PRD.md](./PRD.md) dosyasına bakın.

## Vizyon

Geleneksel pazar yeri modelini tersine çevirerek, talep ve teklifin buluştuğu dinamik bir kiralama ekosistemi hedeflenir.

## Kullanıcı rolleri

| Rol | Açıklama |
|-----|----------|
| **Talep Eden (Requester)** | İhtiyaç duyduğu ürün, tarih aralığı ve konum ile ilan açan kullanıcı |
| **Tedarikçi (Owner)** | İlanları inceleyen, uygun ürünü olan ve fiyat teklifi veren kullanıcı |

## MVP özellikleri

### İlan yönetimi
- Talep ilanı oluşturma (ürün, kategori, tarih aralığı, lokasyon)
- Tedarikçilerden teklif alma
- Talep edenin teklifleri karşılaştırıp kabul etmesi

### Cüzdan ve escrow
- Kredi kartı ile yükleme, IBAN ile çekme
- Teklif kabulünde ödemenin havuz (escrow) hesabında tutulması
- Teslimat onayı sonrası tedarikçiye hakediş aktarımı

### İletişim ve teslimat
- Kabul sonrası basit mesajlaşma ve konum/detay paylaşımı
- Yüz yüze teslimat için kullanıcı onayı

## Teknoloji (hedef mimari)

- **Backend:** Python (FastAPI veya Django)
- **Veritabanı:** PostgreSQL
- **Ödeme:** Iyzico veya benzeri ödeme geçidi

## Kalite ve süreç

- Cüzdan ve ödeme akışları için güçlü birim testleri
- Teklif ve kabul akışları için entegrasyon testleri
- GitHub Actions ile CI/CD ve staging dağıtımı

## Yol haritası (V2)

- Gelişmiş puanlama ve yorumlar
- Teslimatta QR kod doğrulama
- AI destekli fiyat önerisi

## Proje durumu

Geliştirme aşamasında — çalıştırma ve kurulum adımları kod tabanı eklendikçe burada güncellenecektir.

## Lisans

Belirtilmedi.
