# 💸 Sistem Pembayaran SPP - Laravel 12 + Inertia.js + React

Aplikasi manajemen pembayaran SPP (Sumbangan Pembinaan Pendidikan) berbasis web yang dibangun menggunakan:

- ⚙️ Laravel 12 (Backend)
- ⚛️ React.js (Frontend via Inertia.js)
- 💨 Tailwind CSS
- 🛠️ Vite

---

## 🚀 Fitur

- Manajemen data Siswa, Petugas, Kelas, dan Pembayaran
- Role-based Access (Admin & Petugas)
- Single Page Application (SPA) dengan React + Inertia
- Riwayat transaksi dan laporan pembayaran

---

## 🛠️ Cara Instalasi

Jalankan perintah berikut di terminal step-by-step:

```bash
git clone https://github.com/mahyudindev/laravel12-Sistem-SPP.git
cd laravel12-Sistem-SPP

composer install
cp .env.example .env
php artisan key:generate

# Edit file .env dan sesuaikan database:
# DB_DATABASE=nama_database
# DB_USERNAME=root
# DB_PASSWORD=

php artisan migrate --seed

npm install
npm run dev
# atau jika tersedia:
composer run dev
