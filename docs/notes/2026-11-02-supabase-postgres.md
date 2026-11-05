# Supabase untuk Postgres — Catatan Setup

Catatan ini ditulis dari langkah yang benar-benar dijalankan di Fedora. Bagian Windows adalah padanan yang belum diuji di mesin ini. Tandai sendiri saat mencoba.

## 1. Tujuan dan hasil akhir

Pindahkan database aplikasi ke Supabase Postgres. Auth tetap pakai Laravel Breeze, upload file tetap di disk lokal. Supabase hanya jadi tempat Postgres.

Hasil akhir yang sudah tercapai:

- `php artisan migrate:fresh --seed` jalan bersih di Supabase.
- Aplikasi tampil normal dengan data dari Supabase.
- Test tetap hijau di SQLite.

## 2. Path project, stack, versi

| Item | Nilai |
| --- | --- |
| Path | `/home/nabila/Documents/Projects/dubesia` |
| OS | Fedora 42, bash |
| PHP | 8.4.21 dari paket Fedora, di `/usr/bin/php` |
| Ekstensi wajib | `pdo_pgsql` |
| Framework | Laravel 13.29.0 |
| Frontend | Inertia 2, React 18, Vite 8 |
| Test | PHPUnit 12.5, SQLite `:memory:` |
| Database | Supabase Postgres 17.11, session pooler, port 5432 |

Penting: PHP yang aktif di `PATH` adalah PHP milik FlyEnv. PHP itu **tidak punya** `pdo_pgsql`. Selalu panggil `/usr/bin/php`.

## 3. Langkah-langkah

### Langkah 1 — Pasang driver Postgres

Linux (Fedora):

```bash
sudo dnf install -y php-pgsql
```

Windows (XAMPP / Laragon): buka `php.ini`, hapus `;` di dua baris ini, lalu restart Apache.

```ini
extension=pdo_pgsql
extension=pgsql
```

Pastikan `extension_dir` menunjuk ke folder `ext` dan `libpq.dll` ada di folder PHP.

Cek:

```bash
/usr/bin/php -m | grep pdo_pgsql
```

Windows:

```bat
php -m | findstr pdo_pgsql
```

Output yang benar:

```text
pdo_pgsql
```

### Langkah 2 — Buat project Supabase dan isi `.env`

1. Buka https://supabase.com/dashboard, buat project, region **Southeast Asia (Singapore)**.
2. Simpan database password. Password tidak bisa dilihat lagi.
3. Klik **Connect**, pilih tab **Direct**, pilih **Session pooler**, Type **URI**, lalu copy.

Isi `.env`:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.<project-ref>
DB_PASSWORD=<password-database>
DB_SSLMODE=require
```

Cara memecah URI:

| Bagian URI | Key `.env` |
| --- | --- |
| host sebelum `:5432` | `DB_HOST` |
| `5432` | `DB_PORT` |
| kata setelah `/` terakhir | `DB_DATABASE` |
| teks sebelum `:` (bentuk `postgres.xxxx`) | `DB_USERNAME` |
| password | `DB_PASSWORD` |

Jangan pakai host `db.<ref>.supabase.co`. Host itu hanya IPv6 dan akan gagal. Jangan pakai Transaction pooler di port 6543, karena prepared statement Laravel rusak di sana.

Windows: edit `.env` manual di editor. Tidak ada `sed`.

Cek:

```bash
/usr/bin/php artisan config:clear
/usr/bin/php artisan db:show
```

Output yang benar:

```text
PostgreSQL ........ 17.x
Host .............. aws-0-ap-southeast-1.pooler.supabase.com
Port .............. 5432
```

### Langkah 3 — Jalankan migrasi dan seeder

Linux:

```bash
/usr/bin/php artisan migrate:fresh --seed
```

Windows:

```bat
php artisan migrate:fresh --seed
```

Output yang benar:

```text
INFO  Dropping all tables ......... DONE
INFO  Preparing database ......... DONE
... 41 migrasi ... DONE
INFO  Seeding database.
Database seeding completed successfully.
```

Hasil yang dicek:

```bash
/usr/bin/php artisan migrate:status | tail -4
/usr/bin/php artisan db:show --counts
```

Windows (tidak ada `tail`, saring dengan `findstr`):

```bat
php artisan migrate:status | findstr Ran
php artisan db:show --counts
```

Peringatan: `migrate:fresh` mengosongkan schema `public`. Aman hanya karena `public` masih kosong. Kalau sudah ada data asli, pakai `php artisan migrate` saja.

### Langkah 4 — Naikkan batas upload PHP

Bawaan Fedora hanya 2 MB, sedangkan materi belajar menerima sampai 500 MB.

Linux:

```bash
sudo tee /etc/php.d/99-dubesia.ini >/dev/null <<'EOF'
upload_max_filesize = 512M
post_max_size = 512M
memory_limit = 512M
max_execution_time = 300
EOF
/usr/bin/php -i | grep -E "^(upload_max_filesize|post_max_size|memory_limit)"
```

Windows: ubah nilai yang sama langsung di `php.ini`, lalu restart Apache.

Output yang benar: `512M` muncul tiga kali.

### Langkah 5 — Jalankan aplikasi

Port 8000 di mesin ini dipakai nginx project lain (floweb). Pakai 8001.

```bash
sed -i 's|^APP_URL=.*|APP_URL=http://localhost:8001|' .env
/usr/bin/php artisan config:clear
/usr/bin/php artisan serve --host=127.0.0.1 --port=8001
```

Windows: ubah `APP_URL` manual di `.env`, lalu:

```bat
php artisan config:clear
php artisan serve --host=127.0.0.1 --port=8001
```

Buka http://localhost:8001, login `admin@dubesia.id` / `password`.

Output yang benar:

```text
INFO  Server running on [http://127.0.0.1:8001].
```

### Langkah 6 — Jalankan test

Linux:

```bash
/usr/bin/php artisan test --compact
```

Windows:

```bat
php artisan test --compact
```

Output yang benar:

```text
Tests:    143 passed (763 assertions)
```

Test memakai SQLite `:memory:` dari `phpunit.xml`, jadi tidak menyentuh Supabase.

## 4. Error yang muncul dan perbaikannya

| Error | Penyebab | Perbaikan |
| --- | --- | --- |
| `could not find driver` | PHP yang dipakai tidak punya `pdo_pgsql` | Pakai `/usr/bin/php`, bukan `php` |
| `pdo_pgsql` tidak ada di `php -m` | Ekstensi belum dipasang | Langkah 1 |
| `Failed to listen on 127.0.0.1:8000 (Address already in use)` | Port dipakai nginx project floweb | Pakai port 8001 dan ubah `APP_URL` |
| Login lalu redirect ke port salah | `APP_URL` masih 8000 | Samakan `APP_URL` dengan port server |
| `419 Page Expired` | Cookie sesi lama dari MariaDB | Hapus cookie `localhost`, login ulang |
| `password authentication failed` | Username kurang akhiran project ref | `DB_USERNAME=postgres.<project-ref>` |
| `tenant/user ... not found` | Host pooler salah (`aws-0` vs `aws-1`) | Ganti host, ulangi |

## 5. Pengecekan yang lolos

| Pengecekan | Hasil |
| --- | --- |
| `/usr/bin/php -m` | `pdo_pgsql` ada |
| `db:show` | PostgreSQL 17.11, session pooler, port 5432 |
| `migrate:status` | 41 migrasi `Ran`, tidak ada `Pending` |
| Isi tabel | 122 users, 100 students, 10 classes, 40 soal_tes, 5 materials |
| `curl /` dan `/login` | 200 |
| `curl /admin/data-pengguna` tanpa login | 302 ke login, guard jalan |
| Dashboard admin di browser | Tampil, angka terisi dari Postgres |
| `artisan test` | 143 passed, 763 assertions, 4.48 detik |

## 6. Lain kali, lakukan ini

- Cek binary PHP lebih dulu: `which php` dan `php -m`. Salah binary adalah sumber masalah paling mahal di setup ini.
- Cek port sebelum serve: `ss -ltnp | grep :8001` di Linux, `netstat -ano | findstr :8001` di Windows.
- Jangan `migrate:fresh` kalau database sudah berisi data asli. Pakai `migrate`, atau dump dan restore.
- Simpan password database di password manager. `.env` tidak punya salinan cadangan, dan password MariaDB lama sudah hilang dari disk.
- Ingat tiga mesin database punya tugas berbeda: Supabase untuk data aplikasi, SQLite `:memory:` untuk test, MariaDB hanya arsip.
- Docker belum siap. `Dockerfile` belum memasang `pdo_pgsql` dan `libpq-dev`, sementara `compose.yaml` masih memaksa `DB_CONNECTION=sqlite`.
- File `dubesia_db` (SQLite, 10 tabel) masih ter-commit di root repo. Hapus dari Git kalau tidak dipakai.
