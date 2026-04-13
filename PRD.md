Ürün Gereksinim Belgesi (PRD): P2P
Tersine Müzayede Kiralama Platformu

1. Ürün Vizyonu ve Hedefleri
Vizyon: İnsanların ihtiyaç duydukları eşyalara anında ulaşabilmeleri için, eşya sahipleriyle talep
edenleri güvenilir, hızlı ve tersine açık artırma mantığıyla buluşturan lider platform olmak.
İş Hedefi: İlk 3 ay içinde platformda aktif bir kiralama döngüsü (liquidity) yaratmak ve cüzdan
sistemi üzerinden güvenli para transferini doğrulamak.

2. Kullanıcı Rolleri
● Talep Eden (Requester): Belirli bir tarihte, belirli bir eşyaya ihtiyaç duyan ve ilan açan
kullanıcı.
● Tedarikçi / Eşya Sahibi (Owner): Talep edilen eşyaya sahip olan ve kiralama için fiyat
teklifi veren kullanıcı.
● Not: Her kullanıcı her iki rolde de bulunabilir.

3. Temel Özellikler (MVP Kapsamı)

3.1. Kullanıcı Yönetimi ve Güvenlik
● Kayıt ve Giriş: E-posta, Google ve Apple ID ile hızlı kayıt.
● Kimlik Doğrulama (KYC): Teslimatlar yüz yüze olacağı için platform güvenliğini sağlamak
adına telefon onayı ve temel kimlik doğrulaması (TCKN veya benzeri bir servis
entegrasyonu).
● Profil ve Puanlama: Kullanıcıların önceki işlemlerinden aldıkları puanlar ve yorumlar profil
sayfasında görünmelidir.

3.2. Talep İlanı Oluşturma (Tersine İlan)
● İlan Detayları: Aranılan ürünün kategorisi, adı, kısa açıklaması ve (opsiyonel) referans
görseli.
● Zaman Aralığı: Kiralama başlangıç ve bitiş tarih/saatleri.
● Lokasyon: Talep edenin bulunduğu il/ilçe veya tahmini buluşma noktası.
● Maksimum Bütçe (Opsiyonel): Talep edenin ödemeyi düşündüğü maksimum tavan fiyat.

3.3. Teklif (Bidding) Sistemi
● Teklif Verme: Eşya sahiplerinin, ilanı görüp kendi kiralama bedellerini ve teslimat
koşullarını (örn. "Akşam 6'dan sonra teslim edebilirim") belirterek teklif sunması.
● Teklif Yönetimi: Talep edenin gelen teklifleri fiyat, eşya sahibinin puanı ve teslimat
uzaklığına göre listelemesi.

3.4. Cüzdan ve Ödeme Altyapısı (Fintech Modülü)
● Uygulama İçi Cüzdan: Kullanıcıların platforma bakiye yükleyebileceği ve çekebileceği bir
arayüz.
● Güvenli Ödeme (Escrow): Talep eden teklifi kabul ettiğinde, kiralama bedeli cüzdandan
çekilir ve "havuzda (escrow)" bekletilir.
● Para Yatırma / Çekme: Kredi kartı ile cüzdana para yükleme ve IBAN'a bakiye çekme
işlemleri.
● Ödeme Onayı: Eşya yüz yüze teslim alınıp uygulama üzerinden "Teslim Aldım" onayı
verildiğinde (veya kiralama süresi sorunsuz bittiğinde) para eşya sahibinin cüzdanına
aktarılır.

3.5. Yüz Yüze Teslimat ve İletişim
● Uygulama İçi Mesajlaşma: Teklif kabul edildikten sonra iki taraf arasında açılan, konum
paylaşımı destekli güvenli sohbet ekranı.
● Teslimat Onay Kodu (QR / Pin): Yüz yüze buluşulduğunda eşyanın teslim edildiğini dijital
olarak doğrulamak için QR kod veya 4 haneli PIN sistemi.

4. Teknik ve Mimari Gereksinimler
● Backend & Veritabanı: Hızlı geliştirme, ölçeklenebilirlik ve güçlü veri analizi altyapısı
kurmak için Python (FastAPI veya Django) iyi bir tercih olacaktır. Veritabanı olarak
ilişkisel veri bütünlüğü (özellikle cüzdan işlemleri için) sağlayan PostgreSQL kullanılmalıdır.
● Ödeme Geçidi (Payment Gateway): İyzico, Stripe veya PayTR gibi cüzdan/pazar yeri
mantığını (marketplace split payments) destekleyen bir altyapı entegrasyonu.
● Mobil Uygulama: Çift platforma (iOS & Android) hızlı çıkmak için React Native veya
Flutter.

5. Kalite Güvencesi (QA) ve CI/CD Planı
● Test Piramidi: Özellikle cüzdan işlemleri ve açık artırma mantığı için güçlü birim (unit)
testleri yazılmalıdır. Yanlış para transferleri uygulamanın sonu olabilir.
● CI/CD Pipeline: Kodun ana branch'e her aktarımında otomatik testlerin koştuğu ve
hatasız kodun staging (test) ortamına aktarıldığı bir pipeline kurulmalıdır.
