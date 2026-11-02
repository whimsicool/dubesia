<?php

namespace Database\Seeders;

use App\Models\CourseClass;
use App\Models\GradeComponent;
use Illuminate\Database\Seeder;

class GradeComponentSeeder extends Seeder
{
    /**
     * Seed empat komponen nilai untuk setiap kelas demo. Total bobot 100%.
     */
    public function run(): void
    {
        $components = [
            ['Tugas Harian', 20],
            ['Kuis', 15],
            ['Ujian Tengah Semester', 25],
            ['Ujian Akhir Semester', 40],
        ];

        foreach (CourseClass::orderBy('id')->limit(10)->get() as $class) {
            foreach ($components as [$name, $weight]) {
                GradeComponent::updateOrCreate(
                    ['class_id' => $class->id, 'name' => $name],
                    ['weight' => $weight, 'max_score' => 100, 'is_required' => true],
                );
            }
        }
    }
}
