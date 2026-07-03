# Teknoloji Yığını (Tech Stack)

Bu doküman, **EldenEle** (Future Talent 2026 bitirme projesi) platformunda kullanılan teknolojileri ve bu teknolojilerin tercih edilme gerekçelerini özetler.

---

## Frontend

**Teknolojiler:** Next.js (App Router), Tailwind CSS, TypeScript

Kullanıcı arayüzü, sunucu tarafı render (SSR) ve statik üretim yeteneklerini bir arada sunan **Next.js**'in App Router mimarisi üzerine inşa edilmiştir. Stil yönetimi utility-first yaklaşımıyla **Tailwind CSS** ile sağlanır; tüm uygulama **TypeScript** ile katı (strict) tip güvenliği altında geliştirilir.

**Gerekçe:**

- **SEO uyumu:** Sunucu tarafı render sayesinde ilan sayfaları arama motorları tarafından kolayca taranabilir ve indekslenebilir.
- **Hızlı sayfa yüklemeleri:** Otomatik kod bölme (code splitting), önbellekleme ve görsel optimizasyonları ile yüksek performans elde edilir.
- **Modern UI/UX geliştirme esnekliği:** Bileşen tabanlı yapı ve Tailwind'in yardımcı sınıfları, hızlı ve tutarlı arayüz geliştirmeye olanak tanır.

---

## Backend

**Teknolojiler:** FastAPI, Python, SQLAlchemy

Sunucu tarafı iş mantığı, asenkron destekli modern bir web çatısı olan **FastAPI** üzerine kuruludur. Veritabanı erişimi ve nesne-ilişkisel eşleme (ORM) **SQLAlchemy** ile yönetilir.

**Gerekçe:**

- **Yüksek performans:** FastAPI, Starlette ve Pydantic temelinde çalışarak Python ekosisteminde en hızlı framework'lerden biridir.
- **Asenkron yapı:** Eşzamanlı isteklerin verimli işlenmesini ve yüksek eşzamanlılık (concurrency) ihtiyaçlarının karşılanmasını sağlar.
- **Yapay zeka (LLM) entegrasyonuna doğal uyum:** Python ekosisteminin AI/ML kütüphaneleriyle olan zengin uyumu, harici LLM API'lerinin sorunsuz entegrasyonunu kolaylaştırır.

---

## Veritabanı ve Altyapı


| Katman               | Teknoloji / Servis                |
| -------------------- | --------------------------------- |
| **Veritabanı**       | Neon.tech (Serverless PostgreSQL) |
| **Backend Hosting**  | Render                            |
| **Frontend Hosting** | Vercel                 |
| **Domain & DNS**     | Cloudflare (`eldenelekktc.com`)   |


Veritabanı olarak, otomatik ölçeklenme ve kullandığın kadar öde modeli sunan **Neon.tech (Serverless PostgreSQL)** tercih edilmiştir. Backend servisleri **Render** üzerinde, frontend uygulaması ise **Vercel/Netlify** üzerinde barındırılır. Alan adı yönetimi ve DNS hizmetleri **Cloudflare** üzerinden sağlanır.

---

## Yapay Zeka (AI) Kullanımı

Yapay zeka, projede hem ürünün çekirdeğinde hem de geliştirme sürecinde aktif olarak kullanılmıştır.

### 1. Ürün Çekirdeğinde

**Gemini API** kullanılarak, kullanıcıların girdiği ilan başlıklarından otomatik olarak **SEO uyumlu ve dikkat çekici ilan açıklamaları** üreten akıllı asistan entegrasyonu sağlandı. Bu özellik, kullanıcıların daha az çabayla daha etkili ilanlar oluşturmasına ve ilanların aranabilirliğinin artmasına katkıda bulunur.

### 2. Geliştirme Sürecinde

**Cursor IDE** kullanılarak geliştirme verimliliği önemli ölçüde artırıldı:

- Full-stack mimarinin kurulması ve katmanlı yapının oluşturulması,
- z-index ve UI/UX hatalarının giderilmesi,
- özel (custom) dropdown bileşenlerinin yazılması,
- veritabanı migration süreçlerinin hızlandırılması.

