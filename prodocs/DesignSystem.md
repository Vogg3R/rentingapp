# Tasarım Sistemi (Design System)

Bu doküman, **EldenEle** platformunun görsel tasarım dilini, renk paletini, tipografi kurallarını ve bileşen (component) standartlarını tanımlar. Amaç, uygulama genelinde tutarlı, modern ve erişilebilir bir kullanıcı deneyimi sağlamaktır.

---

## Renk Paleti

| Amaç | Renk | Tailwind Tonu |
| --- | --- | --- |
| **Ana eylem (Primary)** | Güven veren mavi | `blue-600` |
| **Arka plan (Dark Mode)** | Koyu lacivert / gri | `slate-800` / `slate-900` |
| **Arka plan (Light Mode)** | Temiz beyaz / gri tonları | `white` / `slate-50` |
| **Başarı / onay** | Yeşil | `green-*` |
| **Ret / silme** | Kırmızı | `red-*` |
| **"Aranıyor" rozetleri** | Turuncu / sarı | `orange-*` / `amber-*` |

- **Primary (Mavi `blue-600`):** Tüm birincil eylem butonları, bağlantılar ve aktif durumlarda kullanılır; kullanıcıya güven verir.
- **Arka planlar:** Dark Mode'da koyu lacivert/gri (`slate-800`/`slate-900`) tonları gözü yormayan bir okuma deneyimi sunarken, Light Mode'da temiz beyaz ve açık gri tonları kullanılır.
- **Durum renkleri:** Başarılı işlemler ve onaylar **yeşil**, ret ve silme işlemleri **kırmızı**, ürün talebini ifade eden "Aranıyor" rozetleri **turuncu/sarı** ile vurgulanır.

---

## Tipografi

- **Font ailesi:** Okunabilirliği yüksek, modern bir **sans-serif** font ailesi kullanılır (Next.js / Tailwind varsayılanı).
- **Başlıklar:** Kalın ağırlık (`font-bold`) ile görsel hiyerarşi güçlendirilir.
- **Gövde metinleri:** Standart ağırlıklar (`font-normal` / `font-medium`) ile rahat okuma sağlanır.

---

## Bileşen (Component) Kuralları

### Form Elemanları
- Native HTML etiketleri yerine **özel (custom) tasarlanmış** bileşenler kullanılır.
- Hover ve focus state'leri belirgindir (örn. `focus:ring`), kullanıcıya net görsel geri bildirim verir.
- Köşeler hafif yuvarlatılmıştır (`rounded-md`).

### İlan Kartları (RentalCard)
- Fotoğraflar en-boy oranını koruyacak şekilde `object-cover` ile yerleştirilir.
- Standart bir görsel yüksekliği (`h-48`) kullanılır.
- Kartlar responsive bir **grid** yapısı içinde dizilir.

### Geri Bildirim ve Etkileşim
- Kullanıcı etkileşimlerinde anlık geri bildirim sağlayan **Toast** bildirim sistemi kullanılır.
- Onay gerektiren işlemler için **temiz ve sade modal pencereler** (ConfirmDialog) tercih edilir.
