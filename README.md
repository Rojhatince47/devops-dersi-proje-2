# Abonelik Takipçisi

Öğrencilerin aylık aboneliklerini tek yerde topladığı, aylık ve yıllık toplamı
ile yaklaşan yenilemeleri gösteren küçük bir web uygulaması.

## Problem

Spotify, Netflix, okul hesapları gibi ödemeler tek tek küçük görünür; ama
birikince bütçenin önemli bir parçası olur. Yenileme günleri unutulur, ödeme
sürpriz olarak çıkar. Bu uygulama, öğrencinin kendi bütçesini yönetmesi için
tüm tekrar eden ödemeleri tek ekranda toplar: ne kadar ödüyorum, sırada ne var?

**Hedef kullanıcı:** Kendi harcamalarını yöneten öğrenciler.

## Özellikler

- **Abonelik ekleme ve listeleme:** Ad, aylık tutar ve yenileme günü girilir;
  kayıt PostgreSQL'e yazılır ve sayfa yenilense de korunur.
- **Toplam ve yaklaşan yenileme:** Aylık/yıllık toplam gösterilir; 7 gün içinde
  yenilenecek abonelikler "Yaklaşan" etiketi alır.

Yol haritasındaki kartlar: silme/düzenleme (#3), form doğrulama ve boş/hata
durumları (#4), mobil uyum (#5). Bunlar panoda "Yapılacak" sütununda durur.

## Pano

[GitHub Projects panosu](https://github.com/users/Rojhatince47/projects/2)
— Yapılacak / Devam Ediyor / Tamamlandı sütunları, her görev için kabul
kriterleri ve PR bağlantıları.

Depo ve pano herkese açıktır; değerlendirme için ek erişim gerekmez.

## Hızlı başlangıç (Docker)

Gereken: Docker ve Docker Compose.

```bash
docker compose up --build
```

Uygulama http://localhost:8080 adresinde açılır. Veritabanı `pgdata` volume'unda
tutulur; `docker compose down` veriyi korur, `docker compose down -v` siler.

Yayınlanan imaj GitHub Container Registry'de:

```bash
docker pull ghcr.io/rojhatince47/devops-dersi-proje-2:latest
```

İmaj tek başına bir PostgreSQL'e ihtiyaç duyar; en kolay yol Compose'dur.

## Yerel geliştirme

Gereken: Node.js 22 veya üzeri, Docker.

```bash
npm ci
cp .env.example .env
docker compose up -d db
```

İki terminalde:

```bash
npm run dev:api   # API, http://localhost:3000
npm run dev       # Arayüz, http://localhost:5173
```

Vite, `/api` isteklerini 3000 portuna yönlendirir.

## İki özelliği deneme

1. Tarayıcıda http://localhost:8080 adresini aç.
2. **Özellik 1:** "Spotify", aylık tutar `60`, yenileme günü `25` gir ve
   **Aboneliği ekle** düğmesine bas. Kayıt listede görünür.
3. Sayfayı yenile (F5). Kayıt yerinde durur.
4. **Özellik 2:** "Netflix", aylık tutar `99`, yenileme günü olarak bugünden
   **6 gün sonrasını** gir. Kayıt "Yaklaşan" etiketiyle görünür.
5. Üstteki şeritte **Aylık toplam ₺159,00** ve **Yıllık toplam ₺1.908,00**
   yazar.
6. `docker compose restart` çalıştır ve sayfayı yenile; kayıtlar korunur.

Not: Yenileme günü 31 olan bir kayıt, şubat gibi kısa aylarda ayın son gününe
düşer.

## API

| Uç | Girdi | Çıktı |
| --- | --- | --- |
| `GET /api/health` | — | `200 {"status":"ok"}` |
| `GET /api/subscriptions` | — | Kayıtlar, yenileme günü artan |
| `POST /api/subscriptions` | `{name, monthlyAmount, renewalDay}` | `201` kayıt / `400` hata |

## Testler

```bash
docker compose up -d db
npm test
npm run lint
npm run build
```

`npm test` gerçek PostgreSQL'e karşı çalışır; varsayılan test veritabanı
`postgres://abonelik:abonelik_dev@localhost:5432/abonelik_test`. Farklı bir
veritabanı için `TEST_DATABASE_URL` tanımla.

## Mimari

```
Tarayıcı ── :8080 ──> app (Fastify + React build)
                          │
                          └──> db (PostgreSQL 17, pgdata volume)
```

- **Arayüz:** React + Vite, saf CSS. Toplam ve tarih hesapları istemcide,
  kullanıcının yerel saat diliminde yapılır.
- **API:** Fastify, JSON Schema doğrulaması, `pg` sürücüsü.
- **Veritabanı:** PostgreSQL 17; şema açılışta `CREATE TABLE IF NOT EXISTS`
  ile kurulur.
- **CI/CD:** GitHub Actions testleri ve derlemeyi çalıştırır; `main` dalına
  yapılan push'ta imajı GHCR'a yükler.

## Ortam değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `DATABASE_URL` | PostgreSQL bağlantı adresi (zorunlu) |
| `TEST_DATABASE_URL` | Testlerin kullanacağı veritabanı |
| `PORT` | API portu (varsayılan `3000`) |

Compose dosyasındaki `abonelik_dev` şifresi yalnızca yerel geliştirme içindir.

## Commit düzeni

Her commit tek satır ve tek cümledir; `tür: ne yapıldı` biçiminde geçmiş zaman
kullanılır. Örnekler:

```
feat: abonelik formu ve listesi arayüze eklendi
test: yenileme tarihi sınırları test edildi
docs: README kurulum ve deneme adımlarıyla güncellendi
```

## Proje yapısı

```
api/src/        Fastify uygulaması, şema ve veritabanı bağlantısı
api/test/       API ve şema testleri
src/            React arayüzü, saf hesap fonksiyonları
db/init/        Test veritabanını oluşturan init betiği
compose.yaml    app + db servisleri
Dockerfile      Çok aşamalı üretim imajı
```

## Kapsam dışı

Kullanıcı hesabı, e-posta bildirimi, çoklu para birimi ve canlı barındırma.
Teslim, Docker Compose ve GHCR imajı üzerinden yapılır.
