<?php

namespace Database\Seeders;

use App\Models\JawabanTes;
use App\Models\SoalTes;
use Database\Seeders\Concerns\SelectsDemoStudents;
use Illuminate\Database\Seeder;

class JawabanTesSeeder extends Seeder
{
    use SelectsDemoStudents;

    /**
     * Seed jawaban tes untuk sepuluh murid demo pada sepuluh soal pertama.
     * Setiap murid menjawab tiga dari empat soal dengan benar.
     */
    public function run(): void
    {
        $murids = $this->studentsForSeeding();

        $soal = SoalTes::orderBy('id_soal')->limit(10)->get();

        if ($murids->isEmpty() || $soal->isEmpty()) {
            return;
        }

        $pilihan = ['A', 'B', 'C', 'D'];

        foreach ($murids as $muridIndex => $murid) {
            foreach ($soal as $soalIndex => $item) {
                $benar = ($muridIndex + $soalIndex) % 4 !== 3;

                $jawaban = $benar
                    ? $item->kunci_jawaban
                    : $pilihan[(array_search($item->kunci_jawaban, $pilihan, true) + 1) % 4];

                JawabanTes::updateOrCreate(
                    ['id_murid' => $murid->id, 'kode_soal' => $item->kode_soal],
                    [
                        'jawaban_murid' => $jawaban,
                        'status_tandai' => $soalIndex % 5 === 4,
                    ],
                );
            }
        }
    }
}
