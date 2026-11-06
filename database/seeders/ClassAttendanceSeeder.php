<?php

namespace Database\Seeders;

use App\Models\ClassAttendance;
use App\Models\CourseClass;
use Illuminate\Database\Seeder;

class ClassAttendanceSeeder extends Seeder
{
    /** Presensi kelas lima hari terakhir untuk sepuluh kelas demo. */
    public function run(): void
    {
        $classes = CourseClass::with(['students', 'tutors'])->orderBy('id')->limit(10)->get();

        $catatan = [
            'Hadir' => null,
            'Izin' => 'Mengikuti kegiatan sekolah.',
            'Sakit' => 'Surat keterangan dokter terlampir.',
            'Alpa' => 'Tanpa keterangan.',
        ];

        foreach ($classes as $class) {
            $tutor = $class->tutors->first();

            if ($class->students->isEmpty() || ! $tutor) {
                continue;
            }

            foreach (range(1, 5) as $dateOffset) {
                $tanggal = now()->subDays($dateOffset)->toDateString();

                foreach ($class->students->values() as $studentIndex => $student) {
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
}
