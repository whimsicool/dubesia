<?php

namespace Database\Seeders;

use App\Models\CourseClass;
use App\Models\StudentGrade;
use Illuminate\Database\Seeder;

class StudentGradeSeeder extends Seeder
{
    /**
     * Seed satu baris nilai untuk setiap murid pada sepuluh kelas demo.
     * Nilai akhir dihitung GradeComponentScoreSeeder dari komponen nilai kelas.
     */
    public function run(): void
    {
        $classes = CourseClass::with('students')->orderBy('id')->limit(10)->get();

        foreach ($classes as $class) {
            foreach ($class->students as $student) {
                StudentGrade::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'class_id' => $class->id,
                        'subject' => $class->name,
                    ],
                    ['feedback' => 'Nilai dihitung dari komponen nilai kelas.'],
                );
            }
        }
    }
}
