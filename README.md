# Kuafor Randevu Sistemi

Kuafor salonlari icin online randevu alma ve yonetim platformu. Musteriler mobil uygulama veya web linki uzerinden randevu alabilir, kuaforler randevulari yonetebilir.

## Teknolojiler

### Backend
- **Node.js** + **Express 5** + **TypeScript**
- **PostgreSQL** (veritabani)
- **JWT** (kimlik dogrulama)
- **bcrypt** (sifre hashleme)
- **express-validator** (input dogrulama)
- **helmet** + **express-rate-limit** (guvenlik)

### Mobile
- **React Native** + **Expo** (SDK 54)
- **TypeScript**
- **React Navigation 7** (navigasyon)
- **Axios** (HTTP istemci)
- **AsyncStorage** (yerel depolama)

### Web
- Server-side rendered HTML booking form
- Responsive, mobil uyumlu tasarim

## Mimari

```
backend/
├── src/
│   ├── config/          # Veritabani, ortam degiskenleri, migration
│   ├── controllers/     # HTTP istek yoneticileri
│   ├── services/        # Is mantigi katmani
│   ├── repositories/    # Veritabani erisim katmani
│   ├── models/          # Veri modelleri ve DTO'lar
│   ├── middlewares/      # Auth, hata, validasyon, rate limit
│   ├── validators/      # express-validator kurallari
│   ├── routes/          # API endpoint tanimlamalari
│   ├── interfaces/      # Repository interface'leri
│   └── utils/           # Yardimci siniflar (AppError)

mobile/
├── src/
│   ├── screens/         # Uygulama ekranlari
│   ├── navigation/      # Tab ve stack navigasyon
│   ├── context/         # Auth context (global state)
│   ├── services/        # API istemci katmani
│   └── constants/       # Tema, renkler, API URL
```

## API Endpointleri

### Auth
| Method | Endpoint | Aciklama |
|--------|----------|----------|
| POST | `/api/auth/register/customer` | Musteri kayit |
| POST | `/api/auth/register/provider` | Kuafor kayit |
| POST | `/api/auth/login` | Giris |
| GET | `/api/auth/profile` | Profil goruntule |
| DELETE | `/api/auth/account` | Hesap sil |
| GET | `/api/auth/providers` | Tum kuaforler |
| GET | `/api/auth/providers/:id/services` | Kuaforun hizmetleri |
| GET | `/api/auth/book/:providerId` | Web randevu formu |

### Randevular
| Method | Endpoint | Aciklama |
|--------|----------|----------|
| POST | `/api/appointments/public` | Misafir randevu (web) |
| POST | `/api/appointments` | Randevu olustur (auth) |
| GET | `/api/appointments/my` | Randevularim |
| PATCH | `/api/appointments/:id/confirm` | Onayla |
| PATCH | `/api/appointments/:id/cancel` | Iptal |
| PATCH | `/api/appointments/:id/complete` | Tamamla |
| GET | `/api/appointments/earnings` | Kazanc istatistikleri |

### Hizmetler
| Method | Endpoint | Aciklama |
|--------|----------|----------|
| GET | `/api/services/my` | Kendi hizmetlerim |
| POST | `/api/services` | Hizmet ekle |
| PUT | `/api/services/:id` | Hizmet guncelle |
| DELETE | `/api/services/:id` | Hizmet sil |

## Kurulum

### Gereksinimler
- Node.js >= 18
- PostgreSQL
- Expo CLI (`npm install -g expo-cli`)

### Backend
```bash
cd backend
cp .env.example .env   # .env dosyasini duzenle
npm install
npm run migrate        # Veritabani tablolarini olustur
npm run dev            # Gelistirme sunucusu
```

### Mobile
```bash
cd mobile
npm install
npx expo start         # Expo Go ile calistir
```

### Production Build
```bash
cd mobile
eas build --platform android --profile production   # AAB (Play Store)
eas build --platform android --profile preview       # APK (test)
```

## Ozellikler

- Musteri ve kuafor rolleri
- Coklu hizmet secimi
- Dolu saat gosterimi
- Web uzerinden misafir randevu
- Kazanc istatistikleri (gunluk/haftalik/aylik)
- Randevu linki paylasma (WhatsApp/SMS)
- Hesap silme
- Rate limiting ve guvenlik headerlari
- Gizlilik politikasi sayfasi

## Canli Demo

- **API:** https://kuafor-randevu-sistemi-3shp.onrender.com/api/health
- **Web Randevu:** https://kuafor-randevu-sistemi-3shp.onrender.com/api/auth/book/{providerId}

## Lisans

MIT
