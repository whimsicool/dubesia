# Dubesia Project - Beginners Guide: Setup Environment Dari Nol

---

## 0. Stack Overview

Sebelum mulai mengetik perintah, pahami dulu 4 komponen utama project ini:
1. Laravel (PHP): Berperan sebagai Backend (mengelola logika aplikasi, basis data, API, server).
2. React JS (JavaScript): Berperan sebagai Frontend (mengatur tampilan antarmuka/UI yang interaktif).
3. Inertia.js: Jembatan yang menghubungkan Laravel dan React tanpa perlu repot bikin REST API terpisah.
4. Vite: Mesin pembangun (build tool) super cepat yang melakukan kompilasi file React/CSS agar bisa dibaca browser secara real-time (Hot Module Replacement / HMR).

---

## 1. Prasyarat Sistem & Aplikasi (Prerequisites)

Sebelum mulai, komputer/laptop kamu wajib memiliki 4 aplikasi dasar berikut:

| Aplikasi | Fungsi | Cara Cek di Terminal |
| :--- | :--- | :--- |
| PHP (v8.1+) | Bahasa pemrograman mesin utama Laravel | `php -v` |
| Composer | Manajer paket/library khusus PHP | `composer --version` |
| Node.js (v18+) & npm | Lingkungan pengeksekusi JavaScript & Manajer paket React/Vite | `node -v` dan `npm -v` |
| Git | Pengelola versi kode (version control) | `git --version` |

(Jika ada yang belum terinstall, install aplikasi yang bersangkutan terlebih dahulu di laptop kamu).

---

## 2. Langkah-Langkah Setup Project dari Nol

Buka terminal (Command Prompt, Git Bash, atau Terminal Linux/macOS) dan ikuti langkah berikut secara berurutan:

### Langkah 2.1: Menyiapkan Folder Project

Opsi A: Jika membuat project bersih dari awal
Perintah ini akan mengunduh kerangka dasar framework Laravel versi terbaru dan membuat folder bernama dubesia:
```bash
composer create-project laravel/laravel dubesia
cd dubesia
```

Opsi B: Jika mengunduh project dari GitHub (Git Clone)
```bash
git clone <URL_REPOSITORY_GITHUB_KAMU>
cd dubesia
```

Catatan Penting:
Pastikan kamu selalu berada di dalam folder project dubesia sebelum menjalankan perintah-perintah selanjutnya di terminal!

---

### Langkah 2.2: Mengunduh Library Backend (vendor)

Dalam project Laravel, seluruh pustaka dasar tidak di-upload ke GitHub karena ukurannya yang besar. Kamu perlu mendownloadnya secara manual di laptopmu.

Jalankan perintah:
```bash
composer install
```
- Apa yang terjadi? Perintah ini membaca file composer.json lalu mendownload ribuan file dependency ke dalam folder bernama vendor.

Penyelesaian Masalah (Troubleshooting):
Jika muncul error perihal perbedaan versi PHP (misal PHP laptop kamu lebih tinggi/rendah), jalankan perintah abaikan batasan versi:
```bash
composer install --ignore-platform-reqs
```

---

### Langkah 2.3: Membuat & Mengatur File Konfigurasi .env

Laravel membutuhkan file rahasia bernama .env untuk menyimpan konfigurasi seperti koneksi database, port server, dan kunci enkripsi.

1. Duplikat file contoh bawaan Laravel (.env.example) menjadi .env:
   ```bash
   cp .env.example .env
   ```
   (Untuk pengguna Windows CMD jika cp tidak bekerja: gunakan `copy .env.example .env`)

2. Generate Kunci Enkripsi Aplikasi (App Key):
   ```bash
   php artisan key:generate
   ```
   - Mengapa wajib? Tanpa App Key, Laravel menolak berjalan demi alasan keamanan enkripsi session dan data pengguna.

---

### Langkah 2.4: Menginstall Stack Laravel Breeze (React + Inertia)

Laravel Breeze adalah starter kit resmi yang mengintegrasikan sistem autentikasi (Login/Register) serta memasang React JS dan Inertia secara otomatis.

1. Install Breeze ke dalam Composer:
   ```bash
   composer require laravel/breeze --dev
   ```

2. Jalankan Installer Breeze Khusus Pilihan React:
   ```bash
   php artisan breeze:install react
   ```
   - Saat muncul pertanyaan di terminal (opsi Dark mode / SSR / Testing framework), tekan Enter saja untuk menggunakan konfigurasi standar (default).

---

### Langkah 2.5: Menginstall Library Frontend (node_modules)

Sama seperti Composer untuk PHP, JavaScript butuh npm untuk mendownload library React, Vite, dan Tailwind CSS.

Jalankan perintah:
```bash
npm install --legacy-peer-deps
```
- Mengapa perlu --legacy-peer-deps?
  Flag ini sangat krusial digunakan untuk mengatasi bentrok ketergantungan versi (peer dependencies) antara Vite versi terbaru dengan plugin React (@vitejs/plugin-react). Ini memastikan folder node_modules terbuat sempurna tanpa error dibatalkan.
```bash
npm install -D @vitejs/plugin-react@^6
```
- @vitejs/plugin-react adalah plugin Vite untuk React.
  
```bash
npm install lucide-react
```
- lucide-react menyediakan ikon untuk komponen React.
---

### Langkah 2.6: Membuat File bootstrap.js (Perbaikan Isu Impor Vite)

Pada beberapa versi installasi Laravel Breeze + React, Vite sering mengeluhkan hilangnya file penunjang bootstrap.js saat mencoba membaca resources/js/app.jsx.

1. Buat file bootstrap.js secara manual:
   ```bash
   touch resources/js/bootstrap.js
   ```
   (Untuk Windows jika touch tidak ada, buat file kosong bernama bootstrap.js di dalam folder resources/js/ via VS Code).

2. Buka file resources/js/bootstrap.js tersebut, lalu masukkan kode berikut:
   ```javascript
   import axios from 'axios';
   window.axios = axios;

   window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
   ```
   - Fungsi kode ini: Menyiapkan pustaka axios agar React frontend dapat mengirim request HTTP ke backend Laravel secara lancar.

---

---

### Langkah 2.7: Menyiapkan Database

Sebelum menjalankan aplikasi, buat tabel database dan isi data awal (seeder).

Pastikan konfigurasi database di file `.env` sudah sesuai, lalu jalankan dari folder project:

```bash
php artisan migrate --seed
```
- Mengapa langkah ini perlu?
Laravel membutuhkan tabel database untuk menyimpan data aplikasi, seperti akun pengguna dan jadwal. Perintah `php artisan migrate` membuat tabel berdasarkan file migration. Opsi `--seed` menjalankan seeder untuk mengisi data awal yang dibutuhkan aplikasi, misalnya data contoh atau akun awal. Tanpa langkah ini, aplikasi bisa dibuka, tetapi fitur yang membutuhkan data mungkin tidak berjalan atau tampil kosong.

## 3. Cara Menjalankan Aplikasi (Development Server)

Untuk memuat aplikasi Laravel + React secara utuh, kamu harus menjalankan 2 perintah server di 2 window/tab terminal terpisah:

### Terminal 1: Menjalankan Server Frontend (Vite)
Terminal ini bertugas memantau perubahan file React (.jsx) dan CSS secara live update.
```bash
npm run dev
```
Jangan tutup terminal ini selama kamu ngoding frontend!

---

### Terminal 2: Menjalankan Server Backend (Laravel Artisan)
Buka tab/window terminal baru, masuk ke folder dubesia, lalu jalankan server PHP:
```bash
php artisan serve
```
Terminal ini juga harus tetap running!

---

## 4. Mengakses Aplikasi di Browser

Setelah kedua terminal di atas berjalan tanpa error:
1. Buka browser kesayangan kamu (Chrome, Firefox, Edge, Brave, dll).
2. Ketik alamat URL berikut pada address bar:
   ```text
   http://127.0.0.1:8000
   ```
3. Kamu akan melihat halaman utama Laravel lengkap dengan tombol Log in dan Register di pojok kanan atas yang sudah ditenagai oleh React JS!

---

## 5. Struktur Folder Penting (Lokasi Ngoding)

Bagi pemula yang baru pertama kali membuka VS Code project ini, berikut adalah peta lokasi file utama:

```text
dubesia/
├── app/
│   ├── Http/Controllers/     <-- Tempat logika Backend (PHP)
│   └── Models/               <-- Tempat struktur Database & Model (PHP)
├── routes/
│   └── web.php               <-- Tempat mengatur URL / Routing alamat web (PHP)
├── resources/
│   ├── css/
│   │   └── app.css           <-- Tempat pengaturan styling Tailwind CSS
│   └── js/
│       ├── Pages/            <-- LOKASI UTAMA HALAMAN REACT (.jsx)
│       ├── Components/       <-- Tempat meletakkan komponen UI React reusable
│       ├── app.jsx           <-- Entry point utama React JS
│       └── bootstrap.js     <-- Konfigurasi Axios HTTP Client
├── .env                      <-- File rahasia pengaturan koneksi database & environment
└── vite.config.js            <-- File konfigurasi compiler Vite
```

---

## Cheatsheet: Cara Menjalankan Project di Hari Berikutnya

Jika setup di atas sudah pernah dilakukan dan kamu ingin lanjut ngoding di hari berikutnya, kamu tidak perlu mengulang langkah setup dari awal. 

Cukup buka 2 terminal dan jalankan:

1. Terminal 1: `npm run dev`
2. Terminal 2: `php artisan serve`

---
Dokumen ini dibuat agar proses pembelajaran Laravel + React menjadi lebih mudah dan menyenangkan. Happy Coding!
