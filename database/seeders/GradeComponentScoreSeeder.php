<?php

namespace Database\Seeders;

use App\Models\GradeComponent;
use App\Models\GradeComponentScore;
use App\Models\StudentGrade;
use Illuminate\Database\Seeder;

class GradeComponentScoreSeeder extends Seeder
{
    /**
     * Seed nilai setiap komponen untuk semua baris student_grades, lalu hitung
     * nilai akhir dan huruf mutu. Jalankan setelah GradeComponentSeeder dan
     * StudentGradeSeeder.
     */
    public function run(): void
    {
        $grades = StudentGrade::whereNotNull('class_id')->orderBy('id')->get();

        foreach ($grades as $grade) {
            $components = GradeComponent::where('class_id', $grade->class_id)
                ->orderBy('id')
                ->get();

            if ($components->isEmpty()) {
                continue;
            }

            $tertimbang = 0.0;

            foreach ($components as $component) {
                // Nilai deterministik 60-100 agar seeder bisa dijalankan berulang.
                $score = 60 + (crc32($grade->id.'-'.$component->id) % 41);

                GradeComponentScore::updateOrCreate(
                    ['student_grade_id' => $grade->id, 'grade_component_id' => $component->id],
                    ['score' => $score],
                );

                $tertimbang += $score * ((float) $component->weight / 100);
            }

            $nilaiAkhir = round($tertimbang, 2);

            $grade->update([
                'score' => $nilaiAkhir,
                'grade' => $this->hurufMutu($nilaiAkhir),
            ]);
        }
    }

    private function hurufMutu(float $nilai): string
    {
        return match (true) {
            $nilai >= 85 => 'A',
            $nilai >= 75 => 'B',
            $nilai >= 65 => 'C',
            $nilai >= 55 => 'D',
            default => 'E',
        };
    }
}
