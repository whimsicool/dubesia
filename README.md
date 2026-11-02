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

## 6. Menjalankan Project dengan Docker (Tanpa Install PHP, Node, atau Database)

Bagian ini adalah jalur alternatif dari Langkah 2 sampai Langkah 4. Seluruh kebutuhan aplikasi sudah dibungkus di dalam container, jadi kamu tidak perlu menginstall PHP, Composer, Node.js, maupun MariaDB secara manual di komputer.

Project ini memakai dua container:

| Container | Isi | Port |
| :--- | :--- | :--- |
| `app` | PHP 8.4, kode Laravel, hasil build React (Vite) | `8000` |
| `db` | MariaDB 11.4 sebagai database | hanya internal, tidak dibuka ke komputer |

---

### 6.1 Prasyarat (Prerequisites)

| Kebutuhan | Keterangan | Cara Cek |
| :--- | :--- | :--- |
| Docker Engine + Compose v2 | Menjalankan container aplikasi dan database | `docker --version` dan `docker compose version` |
| Git | Mengunduh kode project | `git --version` |
| RAM minimal 4 GB | Build pertama butuh memori lebih, disarankan 6-8 GB | - |
| Ruang disk minimal 5 GB | Image dasar PHP, Node.js, dan MariaDB | `docker system df` |

Kedua perintah di kolom "Cara Cek" harus menampilkan nomor versi. Kalau muncul `command not found`, install Docker sesuai sistem operasi kamu:

**Windows 10/11 (PowerShell sebagai Administrator)**

```powershell
wsl --install -d Ubuntu
```

Setelah restart, install Docker Desktop dari https://www.docker.com/products/docker-desktop/, buka aplikasinya, lalu aktifkan:

1. Settings > General > centang **Use the WSL 2 based engine**
2. Settings > Resources > WSL Integration > nyalakan distro **Ubuntu**

**macOS**

```bash
brew install --cask docker
```

Alternatifnya, unduh Docker Desktop dari situs resmi lalu buka aplikasinya.

**Linux (Ubuntu/Debian)**

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
```

Logout lalu login kembali agar izin grup `docker` berlaku. Kalau paket di atas tidak tersedia di repositori distro kamu, ikuti panduan resmi di https://docs.docker.com/engine/install/.

**Linux (Fedora)**

```bash
sudo dnf install -y docker docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

**Linux (Arch)**

```bash
sudo pacman -S --needed docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

> Catatan untuk pengguna Windows: jalankan seluruh perintah Docker di bawah ini di dalam terminal **Ubuntu (WSL)**, bukan Command Prompt. Kalau memakai Docker Desktop langsung dari PowerShell, perintahnya sama, hanya cara mengatur variabel lingkungan yang berbeda (lihat bagian 6.6).

---

### 6.2 Mengunduh dan Menjalankan Project

**Windows (PowerShell)**

```powershell
cd $HOME\Documents
git clone <URL_REPOSITORY_GITHUB_KAMU>
cd dubesia
docker compose up -d
```

**Windows (WSL Ubuntu), Linux, dan macOS**

```bash
cd ~
git clone <URL_REPOSITORY_GITHUB_KAMU>
cd dubesia
docker compose up -d
```

> Penting untuk pengguna WSL: simpan project di dalam filesystem WSL (contoh `~/dubesia`), jangan di `/mnt/c/...`. Build dari `/mnt/c` bisa 10-20 kali lebih lambat dan sering gagal karena masalah izin file.

Build pertama memakan waktu sekitar 3-5 menit karena mengunduh image dasar PHP, Node.js, dan MariaDB (total sekitar 1,5 GB). Build berikutnya jauh lebih cepat karena layer sudah tersimpan.

---

### 6.3 Mengisi Data Awal (Sekali Saja)

Migration database berjalan otomatis setiap container `app` start, tetapi data contoh tidak. Jalankan seeder satu kali agar akun demo tersedia:

```bash
docker compose exec app php artisan db:seed --force
```

Proses ini memakan waktu sekitar 30 detik.

---

### 6.4 Mengakses Aplikasi

Buka browser dan ketik:

```text
http://localhost:8000
```

Akun demo (semua memakai password `password`):

| Email | Peran |
| :--- | :--- |
| `admin@dubesia.id` | Admin |
| `tutor@dubesia.id` | Tutor |
| `student@dubesia.id` | Siswa (Beginner) |
| `student-intermediate@dubesia.id` | Siswa (Middle Intermediate) |
| `student-advance@dubesia.id` | Siswa (Upper Intermediate) |

---

### 6.5 Cheatsheet Perintah Harian

Semua perintah dijalankan dari folder project (`cd dubesia`).

| Tujuan | Perintah |
| :--- | :--- |
| Menyalakan aplikasi | `docker compose up -d` |
| Mematikan aplikasi (data tetap aman) | `docker compose down` |
| Melihat status container | `docker compose ps` |
| Melihat log aplikasi secara real-time | `docker compose logs -f app` |
| Melihat log database | `docker compose logs -f db` |
| Masuk ke shell container | `docker compose exec app bash` |
| Menjalankan perintah artisan | `docker compose exec app php artisan <perintah>` |
| Rebuild setelah kode berubah | `docker compose up -d --build` |
| Restart tanpa rebuild | `docker compose restart app` |
| Menghapus database dan mulai dari nol | `docker compose down -v` lalu `docker compose up -d` dan seed ulang |

> Peringatan: `docker compose down -v` menghapus volume `dubesia_db-data`, artinya seluruh data database hilang. Untuk sekadar mematikan aplikasi, gunakan `docker compose down` tanpa `-v`.

> Kode aplikasi di-*copy* ke dalam image saat build. Jadi setiap kali kamu mengubah file PHP atau React, jalankan `docker compose up -d --build` agar perubahan terlihat.

---

### 6.6 Mengganti Port (Kalau Port 8000 Sudah Dipakai)

Port default adalah `8000`. Kalau port tersebut sudah dipakai aplikasi lain (misalnya XAMPP, IIS, atau server lain), jalankan dengan port berbeda, misalnya `8081`.

**Windows (PowerShell)**

```powershell
$env:APP_PORT="8081"; docker compose up -d
```

**Windows (CMD)**

```bat
set "APP_PORT=8081" && docker compose up -d
```

**WSL Ubuntu, Linux, dan macOS**

```bash
APP_PORT=8081 docker compose up -d
```

Agar tidak perlu mengetik ulang setiap kali, simpan nilainya di file `.env` pada folder project (file ini tidak ikut ter-commit):

```bash
echo "APP_PORT=8081" >> .env
```

Setelah itu cukup `docker compose up -d`, lalu buka `http://localhost:8081`.

---

### 6.7 Troubleshooting

| Gejala | Penyebab | Solusi |
| :--- | :--- | :--- |
| `failed to bind host port 0.0.0.0:8000: address already in use` | Port 8000 dipakai aplikasi lain di komputer | Ganti port seperti pada bagian 6.6 |
| `docker: command not found` di WSL | WSL Integration untuk Ubuntu belum aktif | Nyalakan di Docker Desktop > Settings > Resources > WSL Integration |
| Build berhenti dengan `exit code: 137` | Memori Docker Desktop kurang | Naikkan memory di Settings > Resources, minimal 6 GB |
| Container `db` tidak pernah `healthy` | Inisialisasi MariaDB gagal | Jalankan `docker compose logs db` untuk melihat pesan error |
| Semua password ditolak saat login | Seeder belum dijalankan | `docker compose exec app php artisan db:seed --force` |
| Halaman error 500 | Konfigurasi atau izin folder `storage` bermasalah | `docker compose logs -f app`, lalu cek pesan di `storage/logs/laravel.log` |
| Build sangat lambat | Project disimpan di `/mnt/c` (WSL) | Pindahkan project ke `~/dubesia` di dalam WSL |

---

### 6.8 Yang Tidak Perlu Dilakukan

Kalau memakai Docker, langkah-langkah berikut tidak diperlukan:

- Install PHP, Composer, Node.js, npm, atau MariaDB di komputer.
- Membuat file `.env` secara manual. Container membuatnya sendiri dari `.env.example`.
- Menjalankan `npm run dev` dan `php artisan serve` di dua terminal.
- Menjalankan `composer install` atau `npm install` di komputer.

Yang **tidak** boleh dilakukan:

- Menjalankan `php artisan` atau `npm` langsung di komputer (Windows/macOS) untuk project ini, karena hasilnya akan berbeda dengan isi container. Selalu lewat `docker compose exec app ...`.

### 6.9 Do's and Don'ts Saat Development

Kode aplikasi di-*copy* ke dalam image saat build. Artinya, perubahan di komputer kamu tidak otomatis masuk ke container yang sedang berjalan.

#### Yang Sebaiknya Dilakukan

| Kebiasaan | Perintah |
| :--- | :--- |
| Ubah kode di komputer, lalu rebuild | `docker compose up -d --build` |
| Jalankan artisan lewat container | `docker compose exec app php artisan <perintah>` |
| Tambah migration, lalu rebuild | `docker compose up -d --build`, migration jalan otomatis saat start |
| Seed ulang setelah skema berubah | `docker compose exec app php artisan db:seed --force`, aman diulang karena memakai `updateOrCreate` |
| Jalankan test di dalam container | `docker compose exec app php artisan test` |
| Matikan aplikasi di akhir hari | `docker compose down` |
| Pantau error | `docker compose logs -f app` |
| Tambah package PHP | `composer require` di komputer, commit `composer.json` dan `composer.lock`, lalu rebuild |

#### Yang Sebaiknya Tidak Dilakukan

1. **Jangan menjalankan `composer require` atau `npm install` di dalam container.** Perubahan hanya tersimpan di layer container dan hilang saat build berikutnya, sedangkan `composer.json` di komputer tidak ikut berubah.
2. **Jangan mengedit file lewat shell container.** Kalau kamu masuk dengan `docker compose exec app bash` lalu mengedit file di sana, perubahan itu tertimpa saat rebuild. Edit selalu di komputer.
3. **Jangan menjalankan `php artisan migrate` dari komputer host.** File `.env` di komputer menunjuk ke MariaDB native di `127.0.0.1:3306`, berbeda dengan MariaDB milik container. Keduanya bernama `dubesia_db`, tetapi datanya terpisah.
4. **Jangan memakai `docker compose down -v` tanpa alasan.** Perintah itu menghapus volume database beserta seluruh isinya.
5. **Jangan mengandalkan file upload agar tetap ada setelah rebuild.** Foto profil dan bukti pembayaran disimpan di `storage/app/public` di dalam container, sehingga hilang saat container dibuat ulang.
6. **Jangan menaruh password asli di `compose.yaml`.** Nilai `secret` yang ada sekarang hanya untuk pengembangan lokal dan terlihat di Git.
7. **Jangan meng-commit file `.env`.** File itu sudah masuk `.gitignore`.

---

### 6.10 Panduan Setelah Mengubah Kode

#### Perintah berdasarkan jenis perubahan

| Yang kamu ubah | Perintah | Perkiraan waktu |
| :--- | :--- | :--- |
| File PHP (`app/`, `routes/`, `config/`) | `docker compose up -d --build` | 20-30 detik |
| File React atau CSS (`resources/js`, `resources/css`) | `docker compose up -d --build` | 20-30 detik |
| Migration baru (`database/migrations`) | `docker compose up -d --build` | 20-30 detik |
| `composer.json` atau `composer.lock` | `docker compose up -d --build` | 30-60 detik |
| `package.json` atau `package-lock.json` | `docker compose up -d --build` | 30-60 detik |
| `compose.yaml` atau `APP_PORT` di `.env` | `docker compose up -d` | 2-5 detik |
| Tidak ada perubahan, hanya menyalakan aplikasi | `docker compose up -d` | 5-10 detik |

#### Langkah rutin setelah mengubah kode

1. Pastikan container sedang berjalan.

   ```bash
   docker compose ps
   ```

2. Build ulang image dan jalankan container.

   ```bash
   docker compose up -d --build
   ```

3. Tunggu sampai aplikasi siap, lalu hentikan log dengan `Ctrl+C`.

   ```bash
   docker compose logs -f app
   ```

   Tanda berhasil: muncul baris `INFO  Server running on [http://0.0.0.0:8000]` dan tidak ada pesan `ERROR`.

4. Muat ulang browser dengan `Ctrl+Shift+R` supaya cache tidak menampilkan aset lama.

5. Kalau perubahan tetap tidak muncul, pastikan container benar-benar dibuat ulang.

   ```bash
   docker compose ps
   ```

   Container dengan status `Up` beberapa detik berarti baru dibuat. Kalau statusnya `Up 2 hours`, artinya rebuild belum berjalan.

#### Kalau muncul error setelah perubahan

| Gejala | Yang perlu dicek |
| :--- | :--- |
| Halaman error 500 | `docker compose logs -f app`, lalu buka `storage/logs/laravel.log` di dalam container |
| Migration gagal | `docker compose logs app`, dan pastikan nama file migration tidak bertabrakan |
| Perubahan React tidak muncul | Pastikan `npm run build` berhasil di log build, lalu hard refresh browser |
| Container langsung berhenti | `docker compose logs app` untuk melihat error PHP saat start |

#### Setelah menarik perubahan dari GitHub

Kalau kamu atau temanmu menjalankan `git pull`, jalankan tiga perintah berikut:

```bash
git pull
docker compose up -d --build
docker compose exec app php artisan db:seed --force
```

Migration baru dijalankan otomatis saat container start. Seed hanya perlu diulang kalau data contoh berubah, dan aman dijalankan berkali-kali.

> Untuk iterasi tampilan yang cepat, alur native pada bagian 3 (`npm run dev` dan `php artisan serve`) masih lebih cepat daripada rebuild Docker. Gunakan Docker untuk menguji hasil akhir, dan alur native untuk mengubah tampilan.

---

## Cheatsheet: Cara Menjalankan Project di Hari Berikutnya

Jika setup di atas sudah pernah dilakukan dan kamu ingin lanjut ngoding di hari berikutnya, kamu tidak perlu mengulang langkah setup dari awal. 

Cukup buka 2 terminal dan jalankan:

1. Terminal 1: `npm run dev`
2. Terminal 2: `php artisan serve`

---
Dokumen ini dibuat agar proses pembelajaran Laravel + React menjadi lebih mudah dan menyenangkan. Happy Coding!
