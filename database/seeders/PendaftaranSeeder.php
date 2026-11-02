<?php

namespace Database\Seeders;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Database\Seeder;

class PendaftaranSeeder extends Seeder
{
    /**
     * Seed sepuluh pendaftaran murid baru beserta akun pemiliknya.
     */
    public function run(): void
    {
        $verifikator = User::where('role', User::ROLE_ADMIN)->orderBy('id')->first();

        $rows = [
            ['Nadia Prameswari', 'nadia.prameswari@dubesia.id', '0812-1000-0001', 'reguler', 'Jakarta Selatan', 'SMA Negeri 8 Jakarta', Pendaftaran::STATUS_TERVERIFIKASI, 'Ingin lancar public speaking untuk debat internasional.'],
            ['Bagas Wicaksono', 'bagas.wicaksono@dubesia.id', '0812-1000-0002', 'private', 'Bandung', 'Universitas Padjadjaran', Pendaftaran::STATUS_MENUNGGU, 'Butuh kelas privat karena jadwal kuliah padat.'],
            ['Salsabila Rahma', 'salsabila.rahma@dubesia.id', '0812-1000-0003', 'employee', 'Surabaya', 'PT Pelayaran Nusantara', Pendaftaran::STATUS_TERVERIFIKASI, 'Persiapan presentasi klien asing.'],
            ['Yoga Pratama', 'yoga.pratama@dubesia.id', '0812-1000-0004', 'reguler', 'Yogyakarta', 'SMA Negeri 3 Yogyakarta', Pendaftaran::STATUS_MENUNGGU, 'Ingin mengikuti tes TOEFL ITP.'],
            ['Clara Wijayanti', 'clara.wijayanti@dubesia.id', '0812-1000-0005', 'private', 'Semarang', 'Universitas Diponegoro', Pendaftaran::STATUS_DITOLAK, 'Menyiapkan wawancara beasiswa.'],
            ['Rizky Hidayat', 'rizky.hidayat@dubesia.id', '0812-1000-0006', 'employee', 'Medan', 'Bank Sumut', Pendaftaran::STATUS_TERVERIFIKASI, 'Perlu kemampuan korespondensi bisnis.'],
            ['Anindya Kirana', 'anindya.kirana@dubesia.id', '0812-1000-0007', 'reguler', 'Denpasar', 'SMA Negeri 1 Denpasar', Pendaftaran::STATUS_MENUNGGU, 'Tertarik kelas diplomatik.'],
            ['Fadhil Ramadhan', 'fadhil.ramadhan@dubesia.id', '0812-1000-0008', 'reguler', 'Makassar', 'Universitas Hasanuddin', Pendaftaran::STATUS_TERVERIFIKASI, 'Ingin memperbaiki pelafalan dan intonasi.'],
            ['Gita Larasati', 'gita.larasati@dubesia.id', '0812-1000-0009', 'private', 'Malang', 'Universitas Brawijaya', Pendaftaran::STATUS_MENUNGGU, 'Persiapan tes IELTS Academic.'],
            ['Hendra Gunawan', 'hendra.gunawan@dubesia.id', '0812-1000-0010', 'employee', 'Balikpapan', 'PT Energi Kaltim', Pendaftaran::STATUS_DITOLAK, 'Ingin kelas malam untuk karyawan.'],
        ];

        foreach ($rows as $index => [$nama, $email, $whatsapp, $program, $kota, $institusi, $status, $motivasi]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $nama,
                    'password' => 'password',
                    'role' => User::ROLE_STUDENT,
                    'no_hp' => $whatsapp,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ],
            );

            $terverifikasi = $status !== Pendaftaran::STATUS_MENUNGGU;

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
                    'verified_by' => $terverifikasi ? $verifikator?->id : null,
                    'verified_at' => $terverifikasi ? now()->subDays(5) : null,
                ],
            );
        }
    }
}
