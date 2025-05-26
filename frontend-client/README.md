# Öğrenci Frontend Projesi

Bu proje, ders yönetim sistemi için öğrenci frontend uygulamasıdır. React.js ve TypeScript kullanılarak geliştirilmiştir.

## 🚀 Teknoloji Stack

- **React.js 18+** - UI Framework
- **TypeScript** - Type Safety
- **Material UI 5+** - UI Component Library
- **React Router v6** - Routing
- **Axios** - HTTP Client
- **Context API** - State Management

## 📁 Proje Yapısı

```
frontend-client/
├── public/                      # Statik dosyalar
├── src/
│   ├── components/              # UI bileşenleri
│   │   ├── common/              # Ortak bileşenler
│   │   ├── forms/               # Form bileşenleri
│   │   └── layout/              # Düzen bileşenleri
│   ├── contexts/                # Context API dosyaları
│   ├── hooks/                   # Özel React hooks
│   ├── pages/                   # Sayfa bileşenleri
│   │   ├── auth/                # Kimlik doğrulama sayfaları
│   │   └── student/             # Öğrenci sayfaları
│   ├── services/                # API servis katmanı
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Yardımcı fonksiyonlar
│   ├── routes/                  # Routing yapılandırması
│   └── theme/                   # Material UI tema
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Environment dosyasını yapılandırın:**
   ```bash
   cp .env.example .env
   ```
   
   `.env` dosyasında backend API URL'ini ayarlayın:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

3. **Uygulamayı başlatın:**
   ```bash
   npm start
   ```

   Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📋 Özellikler

### Öğrenci Özellikleri
- ✅ Giriş yapma
- ✅ Profil görüntüleme ve düzenleme
- ✅ Mevcut dersleri görüntüleme
- ✅ Derslere kayıt olma
- ✅ Kayıtlı derslerden çıkış yapma
- ✅ Kayıtlı dersleri görüntüleme

### Teknik Özellikler
- ✅ TypeScript ile type safety
- ✅ Responsive tasarım
- ✅ JWT token tabanlı kimlik doğrulama
- ✅ Otomatik token yenileme
- ✅ Error handling
- ✅ Loading states
- ✅ Form validasyonu

## 🔧 Geliştirme

### Mevcut Komutlar

```bash
# Geliştirme sunucusunu başlat
npm start

# Production build oluştur
npm run build

# Testleri çalıştır
npm test

# Linting
npm run lint
```

### Kod Yapısı

#### Components
- **common/**: Tüm uygulama boyunca kullanılan ortak bileşenler
- **forms/**: Form bileşenleri
- **layout/**: Sayfa düzeni bileşenleri

#### Services
- **api.ts**: Axios konfigürasyonu ve interceptors
- **authService.ts**: Kimlik doğrulama API çağrıları
- **studentService.ts**: Öğrenci profil API çağrıları
- **courseService.ts**: Ders API çağrıları
- **enrollmentService.ts**: Kayıt API çağrıları

#### Types
- TypeScript interface ve type tanımları
- API response types
- Component prop types

## 🔗 Backend Entegrasyonu

Bu frontend uygulaması aşağıdaki backend endpoint'lerini kullanır:

### Auth Endpoints
- `POST /api/auth/student/login` - Öğrenci girişi
- `POST /api/auth/logout` - Çıkış
- `POST /api/auth/refresh-token` - Token yenileme

### Student Endpoints
- `GET /api/students/profile` - Profil bilgileri
- `PUT /api/students/profile` - Profil güncelleme

### Course Endpoints
- `GET /api/courses` - Ders listesi
- `GET /api/courses/:id` - Ders detayı

### Enrollment Endpoints
- `GET /api/enrollments/students/:id` - Öğrenci kayıtları
- `POST /api/enrollments/student/courses/:courseId/enroll` - Derse kayıt
- `DELETE /api/enrollments/student/courses/:courseId/withdraw` - Dersten çıkış

## 🎨 UI/UX

- **Material UI 5+** component library kullanılmıştır
- **Responsive** tasarım (mobil uyumlu)
- **Dark/Light** tema desteği
- **Accessibility** standartlarına uygun
- **Loading states** ve **error handling**

## 🔒 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Otomatik token yenileme
- Protected routes
- XSS koruması
- CSRF koruması

## 📱 Browser Desteği

- Chrome (son 2 versiyon)
- Firefox (son 2 versiyon)
- Safari (son 2 versiyon)
- Edge (son 2 versiyon)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.