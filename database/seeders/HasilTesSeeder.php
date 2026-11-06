<?php

namespace Database\Seeders;

use App\Models\HasilTes;
use App\Models\JawabanTes;
use App\Models\SoalTes;
use Database\Seeders\Concerns\SelectsDemoStudents;
use Illuminate\Database\Seeder;

class HasilTesSeeder extends Seeder
{
    use SelectsDemoStudents;

    /**
     * Seed satu hasil tes untuk sepuluh murid demo, dihitung dari jawaban yang
     * sudah dibuat JawabanTesSeeder. Satu murid hanya punya satu hasil tes.
     */
    public function run(): void
    {
        $murids = $this->studentsForSeeding();

        foreach ($murids as $index => $murid) {
            $jawaban = JawabanTes::where('id_murid', $murid->id)->get();

            if ($jawaban->isEmpty()) {
                continue;
            }

            $kunci = SoalTes::whereIn('kode_soal', $jawaban->pluck('kode_soal'))
                ->pluck('kunci_jawaban', 'kode_soal');

            $jumlahBenar = $jawaban->filter(
                fn (JawabanTes $item): bool => $kunci[$item->kode_soal] === $item->jawaban_murid
            )->count();

            $totalSoal = $jawaban->count();
            $nilai = HasilTes::hitungNilaiTes($jumlahBenar, $totalSoal);
            $tanggalTes = now()->subDays($index + 1)->toDateString();

            HasilTes::updateOrCreate(
                ['id_murid' => $murid->id],
                [
                    'tanggal_tes' => $tanggalTes,
                    'nama_murid' => $murid->name,
                    'jumlah_benar' => $jumlahBenar,
                    'jumlah_salah' => $totalSoal - $jumlahBenar,
                    'nilai_tes' => $nilai,
                    'level_kelas' => HasilTes::tentukanLevelKelas($nilai),
                    'status_hasil' => 'completed',
                    'started_at' => now()->subDays($index + 1)->setTime(9, 0),
                    'completed_at' => now()->subDays($index + 1)->setTime(10, 15),
                ],
            );
        }
    }
}
