# 🛍️ Blangkis - Modern E-Commerce Blangkon

Blangkis adalah platform e-commerce modern untuk menjual blangkon, produk tradisional Indonesia, dengan sentuhan teknologi masa kini. Dirancang untuk pengalaman belanja yang futuristik, responsif, dan ramah pengguna, Blangkis menggabungkan keindahan budaya dengan kemudahan digital.

Repo: [https://github.com/dimalahmad/E-commerce](https://github.com/dimalahmad/E-commerce)

---

## 🚀 Fitur Unggulan
- **Dark & Light Mode**: Tampilan adaptif, nyaman di segala kondisi cahaya.
- **Dashboard Admin & User**: Kelola produk, pesanan, laporan, dan pengguna dengan mudah.
- **Laporan Penjualan & Analitik**: Statistik real-time, profit, produk terlaris, user terbanyak, dan status order.
- **PDF Invoice Generator**: Download invoice profesional langsung dari dashboard.
- **Upload & Verifikasi Bukti Pembayaran**: Proses pembayaran lebih aman dan transparan.
- **Filter & Pencarian Produk Canggih**: Temukan produk dengan filter harga, diskon, kategori, rating, dan lainnya.
- **Desain Futuristik**: Animasi, glassmorphism, neon effect, dan UI modern.
- **Responsif & Mobile Friendly**: Nyaman diakses dari perangkat apapun.

---

## 🛠️ Teknologi
- **Frontend**: Next.js 13+, React, TailwindCSS, Framer Motion, Lucide Icons
- **Backend**: Express.js, File-based JSON storage (tanpa database)
- **PDF**: pdf-lib
- **State Management**: Zustand
- **Lainnya**: Toast notifications, custom hooks, glassmorphism, dark mode

---

## 📦 Struktur Folder
```
E-commerce/
  apps/
    backend/         # Backend Express API (JSON file storage)
      controllers/   # Logic laporan, produk, user, order
      data/          # Data produk, order, user (JSON)
      routes/        # API endpoints
      models/        # Model data
      ...
    frontend/        # Next.js 13+ App Directory
      app/           # Halaman utama, admin, produk, order, dsb
      components/    # Komponen UI reusable
      lib/           # API client, PDF generator, utils
      store/         # Zustand stores
      types/         # TypeScript types
      ...
  README.md
```

---

## ⚡ Cara Instalasi & Menjalankan

1. **Pastikan sudah install Node.js**  
   Download & install dari [nodejs.org](https://nodejs.org/) (minimal versi 16, rekomendasi 18+).

2. **Install yarn (jika belum):**
   ```bash
   npm install -g yarn
   ```

3. **Clone repo:**
   ```bash
   git clone https://github.com/dimalahmad/E-commerce.git
   cd E-commerce
   ```

4. **Install dependencies:**
   ```bash
   cd apps/backend && yarn install
   cd ../../frontend && yarn install
   ```

5. **Jalankan backend (port 4000):**
   ```bash
   cd apps/backend
   yarn dev
   # API berjalan di http://localhost:4000
   ```

6. **Jalankan frontend:**
   ```bash
   cd apps/frontend
   yarn dev
   # App berjalan di http://localhost:3000
   ```

---

## ✨ Keunikan Blangkis
- **Mengangkat budaya Indonesia** ke ranah digital dengan UI modern.
- **Tanpa database**: Semua data disimpan di file JSON, mudah diatur & diporting.
- **Laporan super lengkap**: Dari global, periodik, detail order, produk terlaris, user terbanyak, hingga status order.
- **PDF invoice & upload bukti transfer**: Fitur premium yang jarang ada di project e-commerce sederhana.
- **Desain & animasi kekinian**: Glassmorphism, neon, dark mode, dan animasi interaktif.

---

## 👨‍💻 Kontribusi
Pull request, issue, dan feedback sangat diterima! Mari bersama-sama memajukan digitalisasi produk tradisional Indonesia.

---

## 📞 Kontak
- Email: support@blangkis.com
- Instagram: [@blangkis.id](https://instagram.com)


> "Blangkis: Tradisi Bertemu Teknologi. Belanja Blangkon, Lebih Mudah & Modern!"

# 🎭 Blangkis E-Commerce

Modern, futuristik e-commerce platform untuk produk Blangkon dengan desain yang elegan dan fitur lengkap.

## ✨ Fitur Utama

### 🛍️ Frontend (Customer)
- **Modern UI/UX Futuristik** - Desain yang elegan dan responsif
- **Product Catalog** - Katalog produk dengan filter dan pencarian
- **Shopping Cart** - Keranjang belanja yang intuitif
- **Checkout Process** - Proses checkout yang smooth
- **Order Tracking** - Tracking pesanan real-time
- **User Dashboard** - Dashboard pengguna dengan riwayat pesanan
- **Social Login** - Login dengan Google/Facebook (opsional)

### 🔧 Backend (Admin)
- **Admin Dashboard** - Dashboard admin yang powerful
- **Product Management** - Kelola produk, kategori, dan inventory
- **Order Management** - Kelola pesanan dan status pengiriman
- **User Management** - Kelola pengguna dan admin
- **Sales Reports** - Laporan penjualan dengan export Excel/PDF
- **Payment Integration** - Integrasi pembayaran dan bukti transfer

### 🚀 Technical Features
- **API RajaOngkir** - Kalkulasi ongkos kirim otomatis
- **PDF Generation** - Generate invoice dan laporan PDF
- **File Upload** - Upload bukti pembayaran
- **Real-time Updates** - Update status pesanan real-time
- **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: MySQL (XAMPP compatible)
- **Authentication**: JWT, Social Login
- **UI Components**: Custom components with modern design
- **State Management**: Zustand
- **API**: RESTful API with Express

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn 3.5+
- MySQL (XAMPP)
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd blangkis-ecommerce

# Install dependencies
yarn install

# Setup environment
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Setup database
yarn db:migrate
yarn db:seed

# Start development servers
yarn dev
```

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:3000/admin

## 📁 Project Structure

```
blangkis-ecommerce/
├── apps/
│   ├── frontend/          # Next.js frontend
│   └── backend/           # Express.js backend
├── packages/
│   ├── ui/               # Shared UI components
│   └── types/            # Shared TypeScript types
├── turbo.json            # Turborepo config
└── package.json          # Root package.json
```

## 🎨 Design System

Menggunakan desain modern futuristik dengan:
- **Color Palette**: Dark theme dengan aksen neon
- **Typography**: Modern sans-serif fonts
- **Components**: Custom components dengan glassmorphism effect
- **Animations**: Smooth transitions dan micro-interactions
- **Layout**: Grid-based responsive layout

## 🔐 Development Mode

Selama development, sidebar akan terbuka untuk kedua role (Admin & User) untuk memudahkan testing. Setelah final, akan di-hide sesuai role user yang login.

## 📝 License

MIT License

---

**Blangkis E-Commerce** - Modern platform untuk produk Blangkon Indonesia 🇮🇩 
 
 
 
 
 
 
 