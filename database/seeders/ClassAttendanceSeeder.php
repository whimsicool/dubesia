<?php

namespace Database\Seeders;

use App\Models\ClassAttendance;
use App\Models\CourseClass;
use Illuminate\Database\Seeder;

class ClassAttendanceSeeder extends Seeder
{
    /**
     * Seed presensi kelas untuk sepuluh murid kelas demo pertama
     * pada lima hari terakhir.
     */
    public function run(): void
    {
        $class = CourseClass::with(['students', 'tutors'])->orderBy('id')->first();

        if (! $class || $class->students->isEmpty() || $class->tutors->isEmpty()) {
            return;
        }

        $tutor = $class->tutors->first();
        $catatan = [
            'Hadir' => null,
            'Izin' => 'Mengikuti kegiatan sekolah.',
            'Sakit' => 'Surat keterangan dokter terlampir.',
            'Alpa' => 'Tanpa keterangan.',
        ];

        foreach (range(1, 5) as $dateOffset) {
            $tanggal = now()->subDays($dateOffset)->toDateString();

            foreach ($class->students as $studentIndex => $student) {
                $status = ClassAttendance::STATUSES[($dateOffset + $studentIndex) % count(ClassAttendance::STATUSES)];

                ClassAttendance::updateOrCreate(
                    ['student_id' => $student->id, 'attendance_date' => $tanggal],
                    [
                        'tutor_id' => $tutor->id,
                        'class_level' => $class->level->value,
                        'status' => $status,
                        'notes' => $catatan[$status],
                    ],
                );
            }
        }
    }
}
