# Frontend Uygulama Mimarisi ve Yapısı

## Proje Yapısı
```
frontend/
├── public/                    # Statik dosyalar
│   ├── index.html             # Ana HTML dosyası
│   └── favicon.ico            # Site ikonu
├── src/
│   ├── assets/                # Resimler, fontlar vs.
│   ├── components/            # Paylaşılan UI bileşenleri
│   │   ├── common/            # Genel bileşenler
│   │   │   ├── Navbar.js      # Navigasyon çubuğu
│   │   │   ├── Footer.js      # Alt bilgi
│   │   │   ├── Pagination.js  # Sayfalama bileşeni
│   │   │   ├── Loader.js      # Yükleme göstergesi
│   │   │   └── Modal.js       # Modal/popup bileşeni
│   │   ├── forms/             # Form bileşenleri
│   │   │   ├── StudentForm.js # Öğrenci form bileşeni
│   │   │   ├── CourseForm.js  # Ders form bileşeni
│   │   │   └── LoginForm.js   # Giriş formu
│   │   └── tables/            # Tablo bileşenleri
│   │       ├── StudentTable.js # Öğrenci tablosu
│   │       ├── CourseTable.js  # Ders tablosu
│   │       └── EnrollmentTable.js # Kayıt tablosu
│   ├── contexts/              # Context API dosyaları
│   │   ├── AuthContext.js     # Kimlik doğrulama context'i
│   │   └── NotificationContext.js # Bildirim context'i
│   ├── hooks/                 # Özel React hook'ları
│   │   ├── useAuth.js         # Auth işlemleri için
│   │   ├── usePagination.js   # Sayfalama için
│   │   └── useFetch.js        # API istekleri için
│   ├── pages/                 # Sayfa bileşenleri
│   │   ├── auth/              # Kimlik doğrulama sayfaları
│   │   │   ├── Login.js       # Giriş sayfası
│   │   │   └── Logout.js      # Çıkış sayfası
│   │   ├── admin/             # Admin sayfaları
│   │   │   ├── Dashboard.js   # Ana panel
│   │   │   ├── StudentManagement.js # Öğrenci yönetimi
│   │   │   ├── CourseManagement.js  # Ders yönetimi
│   │   │   └── EnrollmentManagement.js # Kayıt yönetimi
│   │   ├── student/           # Öğrenci sayfaları
│   │   │   ├── Profile.js     # Profil sayfası
│   │   │   ├── MyCourses.js   # Kayıtlı dersler
│   │   │   └── CourseEnrollment.js # Ders kayıt sayfası
│   │   ├── Home.js            # Ana sayfa
│   │   └── NotFound.js        # 404 sayfası
│   ├── services/              # API servis işlemleri
│   │   ├── api.js             # Ana API yapılandırması
│   │   ├── authService.js     # Kimlik doğrulama istekleri
│   │   ├── studentService.js  # Öğrenci API istekleri
│   │   ├── courseService.js   # Ders API istekleri
│   │   └── enrollmentService.js # Kayıt API istekleri
│   ├── utils/                 # Yardımcı fonksiyonlar
│   │   ├── formatters.js      # Format işlevleri
│   │   ├── validators.js      # Doğrulama işlevleri
│   │   └── storageUtils.js    # Local storage işlevleri
│   ├── App.js                 # Ana uygulama bileşeni
│   ├── index.js               # Giriş noktası
│   └── theme.js               # Material UI tema yapılandırması
├── .env                       # Ortam değişkenleri
├── .gitignore                 # Git ignore dosyası
├── Dockerfile                 # Frontend için Dockerfile
├── package.json               # Bağımlılıklar ve scriptler
└── README.md                  # Frontend dökümantasyonu
```

## Sayfa ve Kullanıcı Akışları

### Ortak Arayüzler
1. **Login Sayfası**
   - Kullanıcı adı ve şifre giriş formu
   - Giriş türü seçimi (Admin/Öğrenci)
   - Giriş doğrulama ve hata gösterimi

2. **Ana sayfa**
   - Karşılama ekranı
   - Kullanıcı rolüne göre farklı navigasyon seçenekleri

### Admin Kullanıcı Arayüzleri
1. **Dashboard**
   - Genel istatistikler (öğrenci sayısı, ders sayısı vb.)
   - Hızlı işlemler için kısayollar

2. **Öğrenci Yönetimi**
   - Öğrenci listesi (pagination destekli)
   - Öğrenci arama/filtreleme
   - Öğrenci ekleme/düzenleme/silme modal'ları
   - Öğrenci detay görünümü

3. **Ders Yönetimi**
   - Ders listesi (pagination destekli)
   - Ders arama/filtreleme
   - Ders ekleme/düzenleme/silme modal'ları
   - Derse kayıtlı öğrencileri görüntüleme

4. **Kayıt Yönetimi**
   - Tüm öğrenci-ders kayıtları listesi
   - Yeni kayıt ekleme
   - Kayıt silme

### Öğrenci Kullanıcı Arayüzleri
1. **Profil Sayfası**
   - Öğrenci bilgilerini görüntüleme
   - Bilgileri güncelleme

2. **Derslerim**
   - Kayıtlı olduğu derslerin listesi
   - Dersten çekilme seçeneği

3. **Ders Kayıt**
   - Mevcut derslerin listesi
   - Derse kayıt olma seçeneği
   - Henüz kayıt olmadığı dersleri filtreleme

## UI Bileşenleri ve Etkileşimler

### Tablolar
- Tüm tablo görünümlerinde sayfalama desteği
- Sıralama ve filtreleme özellikleri
- İşlem sütunları (düzenle/sil/detay)

### Modaller/Popuplar
- Öğrenci detay modalı
- Ders detay modalı
- Form modalları (ekleme/düzenleme)
- Onay modalları (silme işlemleri için)

### Formlar
- Veri girişi doğrulama (validation)
- Hata mesajları gösterimi
- Başarılı işlem bildirimleri

### Navigasyon
- Rol tabanlı menü
- Aktif sayfa vurgusu
- Responsive tasarım (mobil uyumlu)