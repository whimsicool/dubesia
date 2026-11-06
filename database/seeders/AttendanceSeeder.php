<?php

namespace Database\Seeders;

use App\Enums\AttendanceStatus;
use App\Models\Attendance;
use App\Models\Schedule;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    /**
     * Seed presensi pertemuan untuk empat minggu terakhir setiap jadwal demo.
     */
    public function run(): void
    {
        $schedules = Schedule::with('students')->orderBy('id')->get();

        if ($schedules->isEmpty()) {
            return;
        }

        $sekarang = now();

        foreach ($schedules as $schedule) {
            foreach (range(0, 3) as $mingguLalu) {
                $tanggal = $sekarang->copy()
                    ->startOfWeek()
                    ->addDays($schedule->day_of_week - 1)
                    ->subWeeks($mingguLalu);

                // Pertemuan minggu berjalan yang belum terjadi tidak diisi presensi.
                if ($tanggal->gt($sekarang)) {
                    continue;
                }

                $tanggal = $tanggal->toDateString();

                $baris = $schedule->students->values()->map(
                    fn ($student, int $index): array => [
                        'schedule_id' => $schedule->id,
                        'student_id' => $student->id,
                        'date' => $tanggal,
                        'status' => match (($index + $mingguLalu) % 8) {
                            5 => AttendanceStatus::Permit->value,
                            6 => AttendanceStatus::Sick->value,
                            7 => AttendanceStatus::Absent->value,
                            default => AttendanceStatus::Present->value,
                        },
                        'created_at' => $sekarang,
                        'updated_at' => $sekarang,
                    ],
                )->all();

                if ($baris === []) {
                    continue;
                }

                Attendance::upsert(
                    $baris,
                    ['schedule_id', 'student_id', 'date'],
                    ['status', 'updated_at'],
                );
            }
        }
    }
}
