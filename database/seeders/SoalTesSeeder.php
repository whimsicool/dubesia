<?php

namespace Database\Seeders;

use App\Models\SoalTes;
use Illuminate\Database\Seeder;

class SoalTesSeeder extends Seeder
{
    /**
     * Seed bank soal tes level kelas bahasa Inggris (10 soal pilihan ganda).
     */
    public function run(): void
    {
        $soalList = [
            // === Grammar & Structure (Soal 1-10) ===
            [
                'kode_soal' => 'S001',
                'pertanyaan' => 'She ___ to the office every day by bus.',
                'pilihan_a' => 'go',
                'pilihan_b' => 'goes',
                'pilihan_c' => 'going',
                'pilihan_d' => 'gone',
                'kunci_jawaban' => 'B',
            ],
            [
                'kode_soal' => 'S002',
                'pertanyaan' => 'I have been living in Jakarta ___ five years.',
                'pilihan_a' => 'since',
                'pilihan_b' => 'for',
                'pilihan_c' => 'during',
                'pilihan_d' => 'while',
                'kunci_jawaban' => 'B',
            ],
            [
                'kode_soal' => 'S003',
                'pertanyaan' => 'If I ___ enough money, I would travel around the world.',
                'pilihan_a' => 'have',
                'pilihan_b' => 'has',
                'pilihan_c' => 'had',
                'pilihan_d' => 'having',
                'kunci_jawaban' => 'C',
            ],
            [
                'kode_soal' => 'S004',
                'pertanyaan' => 'The book ___ by the students last week.',
                'pilihan_a' => 'is read',
                'pilihan_b' => 'was read',
                'pilihan_c' => 'were read',
                'pilihan_d' => 'has read',
                'kunci_jawaban' => 'B',
            ],
            [
                'kode_soal' => 'S005',
                'pertanyaan' => 'Neither the teacher nor the students ___ aware of the schedule change.',
                'pilihan_a' => 'is',
                'pilihan_b' => 'was',
                'pilihan_c' => 'were',
                'pilihan_d' => 'has been',
                'kunci_jawaban' => 'C',
            ],
            [
                'kode_soal' => 'S006',
                'pertanyaan' => 'She asked me where I ___.',
                'pilihan_a' => 'live',
                'pilihan_b' => 'lived',
                'pilihan_c' => 'living',
                'pilihan_d' => 'am live',
                'kunci_jawaban' => 'B',
            ],
            [
                'kode_soal' => 'S007',
                'pertanyaan' => 'By the time we arrived, the movie ___.',
                'pilihan_a' => 'already started',
                'pilihan_b' => 'has already started',
                'pilihan_c' => 'had already started',
                'pilihan_d' => 'was already starting',
                'kunci_jawaban' => 'C',
            ],
            [
                'kode_soal' => 'S008',
                'pertanyaan' => 'The manager, along with his assistants, ___ attending the conference.',
                'pilihan_a' => 'is',
                'pilihan_b' => 'are',
                'pilihan_c' => 'were',
                'pilihan_d' => 'have been',
                'kunci_jawaban' => 'A',
            ],
            [
                'kode_soal' => 'S009',
                'pertanyaan' => 'I wish I ___ harder for the examination.',
                'pilihan_a' => 'study',
                'pilihan_b' => 'studied',
                'pilihan_c' => 'had studied',
                'pilihan_d' => 'would study',
                'kunci_jawaban' => 'C',
            ],
            [
                'kode_soal' => 'S010',
                'pertanyaan' => 'Not only ___ intelligent, but she is also very kind.',
                'pilihan_a' => 'she is',
                'pilihan_b' => 'is she',
                'pilihan_c' => 'she was',
                'pilihan_d' => 'was she',
                'kunci_jawaban' => 'B',
            ],

            // === Vocabulary & Word Choice (Soal 11-20) ===
        ];

        foreach ($soalList as $soal) {
            SoalTes::updateOrCreate(
                ['kode_soal' => $soal['kode_soal']],
                $soal
            );
        }
    }
}
