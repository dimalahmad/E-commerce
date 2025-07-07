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


## 📝 License

MIT License

---

**Blangkis E-Commerce** - Modern platform untuk produk Blangkon Indonesia 🇮🇩 
 
 
 
 
 
 
 