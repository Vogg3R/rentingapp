# MVP Kapsam Belgesi — P2P Tersine Kiralama Platformu

Bu belge, ilk ürün sürümünde **nelerin yapılacağını ve nelerin yapılmayacağını** netleştirir. Vizyon, roller ve özellik ayrıntıları için [PRD.md](./PRD.md) esas alınır.

## MVP tanımı

MVP; talep ilanı → teklif → kabul → cüzdan/escrow → yüz yüze teslim ve onay döngüsünün **uçtan uca tek kez sorunsuz işlediği** en küçük ürün dilimidir. Amaç, pazar yerini kanıtlamaktan önce **güvenli ödeme ve teslim onayı** akışını doğrulamaktır.

## Başarı ölçütleri (MVP sonu için hedef)

| Metrik | Hedef (yönlendirici) |
|--------|----------------------|
| Tam kiralama döngüsü | En az bir uçtan uca “ilan → teklif → kabul → ödeme → teslim onayı → hakediş” senaryosu tamamlanmış |
| Ödeme güvenilirliği | Escrow ve cüzdan hareketleri tutarlı; kritik akışlarda regresyon yok |
| Temel kullanılabilirlik | Talep eden ve tedarikçi rolleri ile iki farklı hesaptan akış test edilebilir |
| Operasyonel hazırlık | Staging ortamında CI ile test + dağıtım pipeline’ı çalışır (bkz. PRD) |

Sayısal eşikler (ör. “X ilan”) iş modelinize göre sonra sıkılaştırılabilir; MVP için öncelik **döngünün çalışması**dır.

## Kapsamda (MVP — yapılacaklar)

- **Kimlik (basit):** E-posta tabanlı kayıt ve giriş; rol seçimi veya ilan/teklif sırasında rolün doğal oluşması.
- **Talep ilanı:** Ürün adı, kategori, kiralama tarih aralığı, lokasyon.
- **Teklif:** Fiyat ve kısa açıklama; talep edenin teklifleri listelemesi ve birini kabul etmesi.
- **Cüzdan:** Bakiye yükleme (kart) ve çekme talebi (IBAN) — MVP’de çekim operasyonel olarak manuel onay ile de başlayabilir (ürün kararı).
- **Escrow:** Kabul sonrası tutarın havuzda bloklanması; teslim onayı ile tedarikçi cüzdanına aktarım.
- **İletişim:** Kabul sonrası sınırlı mesajlaşma (metin; konum paylaşımı PRD ile uyumlu basit düzey).
- **Teslimat:** Yüz yüze teslim; alıcının uygulamada “teslim alındı” onayı ile akışın kapanması.

## Kapsam dışı (MVP — yapılmayacaklar)

Aşağıdakiler **bilerek** MVP’ye dahil edilmez; ayrıntıları PRD’deki V2 ve geniş gereksinimler kapsar:

- KYC, kimlik doğrulama servisleri, yaş sınırı veya hukuki uyumluluk paketi (MVP’de minimal güven varsayımı).
- Kullanıcı puanı, yorumlar, itibar rozetleri.
- QR/PIN ile teslim doğrulama, gelişmiş anlaşmazlık çözümü.
- AI fiyat önerisi, dinamik komisyon kuralları, çoklu para birimi.
- Native mobil uygulama (MVP web veya tek istemci stratejisi ürün kararına bırakılır; PRD’de backend odaklıdır).
- Otomatik çekim, anında ödeme — ödeme kuruluşu ve ürün politikasına bağlı süreçler basit tutulur.

## Öncelikli kullanıcı akışları

1. **Talep eden:** Kayıt → talep ilanı oluştur → gelen teklifleri gör → teklif kabul et → (gerekirse) cüzdana yükle → ödeme bloklansın → tedarikçi ile mesajlaş → teslim al → onay ver.
2. **Tedarikçi:** Kayıt → ilanları keşfet → teklif ver → kabul edilirse mesajlaş → teslim et → alıcı onayı sonrası hakedişin cüzdana yansıdığını gör.

## Riskler ve bağımlılıklar

- **Ödeme geçidi:** Iyzico (veya seçilen sağlayıcı) marketplace/escrow uyumu ve sandbox ile erken entegrasyon.
- **Güven ve dolandırıcılık:** MVP’de sınırlı güven önlemi; kullanıcı sayısı ve işlem hacmi artınca KYC ve itibar mekanizmaları gerekir (PRD V2).
- **Hukuk ve veri:** Kişisel veri ve mesafeli sözleşme konularında ürün yayını öncesi yerel danışmanlık önerilir (bu belge hukuki tavsiye değildir).

## Teknik özet

Hedef yığın PRD ile aynıdır: Python (FastAPI/Django), PostgreSQL, ödeme geçidi entegrasyonu; test ve CI/CD beklentisi için bkz. [PRD.md](./PRD.md) bölüm 4–5.

## PRD ile ilişki

| Belge | Amaç |
|--------|------|
| [PRD.md](./PRD.md) | Tam ürün gereksinimleri, mimari ve kalite stratejisi |
| **MVP.md (bu dosya)** | İlk sürüm kapsam çizgisi, metrikler ve bilinçli dışarıda bırakılanlar |

MVP sonrası özellikler PRD “Gelecek Planları (V2)” ile hizalanır.
