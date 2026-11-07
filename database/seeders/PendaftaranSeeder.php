<?php

namespace Database\Seeders;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PendaftaranSeeder extends Seeder
{
    /**
     * Seed enam belas pendaftaran murid baru beserta akun pemiliknya:
     * sepuluh terverifikasi (muncul di Pembayaran Masuk), empat menunggu
     * verifikasi, dan dua ditolak.
     */
    public function run(): void
    {
        $verifikator = User::where('role', User::ROLE_ADMIN)->orderBy('id')->first();
        $password = Hash::make('password');

        $rows = [
            ['Nadia Prameswari', 'nadia.prameswari@dubesia.id', '0812-1000-0001', 'reguler', 'Jakarta Selatan', 'SMA Negeri 8 Jakarta', Pendaftaran::STATUS_TERVERIFIKASI, 'Ingin lancar public speaking untuk debat internasional.'],
            ['Bagas Wicaksono', 'bagas.wicaksono@dubesia.id', '0812-1000-0002', 'private', 'Bandung', 'Universitas Padjadjaran', Pendaftaran::STATUS_MENUNGGU, 'Butuh kelas privat karena jadwal kuliah padat.'],
            ['Salsabila Rahma', 'salsabila.rahma@dubesia.id', '0812-1000-0003', 'employee', 'Surabaya', 'PT Pelayaran Nusantara', Pendaftaran::STATUS_TERVERIFIKASI, 'Persiapan presentasi klien asing.'],
            ['Yoga Pratama', 'yoga.pratama@dubesia.id', '0812-1000-0004', 'reguler', 'Yogyakarta', 'SMA Negeri 3 Yogyakarta', Pendaftaran::STATUS_MENUNGGU, 'Ingin lancar berbicara saat presentasi kerja.'],
            ['Clara Wijayanti', 'clara.wijayanti@dubesia.id', '0812-1000-0005', 'private', 'Semarang', 'Universitas Diponegoro', Pendaftaran::STATUS_DITOLAK, 'Menyiapkan wawancara beasiswa.'],
            ['Rizky Hidayat', 'rizky.hidayat@dubesia.id', '0812-1000-0006', 'employee', 'Medan', 'Bank Sumut', Pendaftaran::STATUS_TERVERIFIKASI, 'Perlu kemampuan korespondensi bisnis.'],
            ['Anindya Kirana', 'anindya.kirana@dubesia.id', '0812-1000-0007', 'reguler', 'Denpasar', 'SMA Negeri 1 Denpasar', Pendaftaran::STATUS_MENUNGGU, 'Tertarik kelas diplomatik.'],
            ['Fadhil Ramadhan', 'fadhil.ramadhan@dubesia.id', '0812-1000-0008', 'reguler', 'Makassar', 'Universitas Hasanuddin', Pendaftaran::STATUS_TERVERIFIKASI, 'Ingin memperbaiki pelafalan dan intonasi.'],
            ['Gita Larasati', 'gita.larasati@dubesia.id', '0812-1000-0009', 'private', 'Malang', 'Universitas Brawijaya', Pendaftaran::STATUS_MENUNGGU, 'Persiapan wawancara beasiswa di luar negeri.'],
            ['Hendra Gunawan', 'hendra.gunawan@dubesia.id', '0812-1000-0010', 'employee', 'Balikpapan', 'PT Energi Kaltim', Pendaftaran::STATUS_DITOLAK, 'Ingin kelas malam untuk karyawan.'],
            ['Alya Kusumawardani', 'alya.kusumawardani@dubesia.id', '0812-1000-0011', 'reguler', 'Bandung', 'Universitas Parahyangan', Pendaftaran::STATUS_TERVERIFIKASI, 'Ingin percaya diri saat presentasi di kampus.'],
            ['Bima Saputra', 'bima.saputra@dubesia.id', '0812-1000-0012', 'private', 'Jakarta Pusat', 'Kementerian Luar Negeri', Pendaftaran::STATUS_TERVERIFIKASI, 'Persiapan penempatan staf protokol.'],
            ['Cindy Halim', 'cindy.halim@dubesia.id', '0812-1000-0013', 'employee', 'Batam', 'PT Batamindo', Pendaftaran::STATUS_TERVERIFIKASI, 'Butuh bahasa Inggris untuk rapat dengan klien Singapura.'],
            ['Dedi Kurniawan', 'dedi.kurniawan@dubesia.id', '0812-1000-0014', 'reguler', 'Pekanbaru', 'Universitas Riau', Pendaftaran::STATUS_TERVERIFIKASI, 'Ingin lancar berbicara untuk lomba debat.'],
            ['Elena Marpaung', 'elena.marpaung@dubesia.id', '0812-1000-0015', 'private', 'Medan', 'Universitas Sumatera Utara', Pendaftaran::STATUS_TERVERIFIKASI, 'Menyiapkan wawancara kerja di perusahaan multinasional.'],
            ['Farid Maulana', 'farid.maulana@dubesia.id', '0812-1000-0016', 'employee', 'Balikpapan', 'PT Pertamina Hulu', Pendaftaran::STATUS_TERVERIFIKASI, 'Perlu kemampuan menulis laporan bahasa Inggris.'],
        ];

        $verifiedIndex = 0;

        foreach ($rows as $index => [$nama, $email, $whatsapp, $program, $kota, $institusi, $status, $motivasi]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $nama,
                    'password' => $password,
                    'role' => User::ROLE_STUDENT,
                    'no_hp' => $whatsapp,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ],
            );

            $diproses = $status !== Pendaftaran::STATUS_MENUNGGU;
            $verifiedAt = match ($status) {
                Pendaftaran::STATUS_TERVERIFIKASI => now()->subDays($verifiedIndex++ % 5 + 1),
                Pendaftaran::STATUS_DITOLAK => now()->subDays(2),
                default => null,
            };

            Pendaftaran::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nama_lengkap' => $nama,
                    'tanggal_lahir' => now()->subYears(18 + $index)->startOfYear()->toDateString(),
                    'email' => $email,
                    'no_whatsapp' => $whatsapp,
                    'alamat' => 'Jl. Contoh Raya No. '.($index + 1).', '.$kota,
                    'asal_institusi' => $institusi,
                    'program' => $program,
                    'pesan_motivasi' => $motivasi,
                    'bukti_pembayaran' => 'pendaftaran/bukti-demo-'.($index + 1).'.pdf',
                    'biaya' => Pendaftaran::biayaUntuk($program),
                    'status' => $status,
                    'catatan_verifikasi' => $status === Pendaftaran::STATUS_DITOLAK ? 'Bukti pembayaran tidak terbaca.' : null,
                    'verified_by' => $diproses ? $verifikator?->id : null,
                    'verified_at' => $verifiedAt,
                ],
            );
        }
    }
}
