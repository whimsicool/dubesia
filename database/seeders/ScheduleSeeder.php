<?php

namespace Database\Seeders;

use App\Enums\AttendanceStatus;
use App\Models\Attendance;
use App\Models\CourseClass;
use App\Models\Program;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    /** Sepuluh jadwal mingguan, satu untuk setiap kelas demo. */
    public function run(): void
    {
        // Seeder ini dipanggil DatabaseSeeder setelah data acuan siap. Saat dijalankan
        // sendiri pada database kosong, data acuan dibuat lebih dulu.
        if (CourseClass::count() === 0) {
            $this->call([
                ProgramSeeder::class,
                TutorSeeder::class,
                RoomSeeder::class,
                CourseClassSeeder::class,
            ]);
        }

        $semester = Semester::updateOrCreate(
            ['name' => 'Ganjil 2026/2027'],
            ['start_date' => '2026-08-03', 'end_date' => '2027-01-30', 'is_active' => true],
        );

        $programs = Program::pluck('id', 'code');
        $rooms = Room::pluck('id', 'name');
        $classes = CourseClass::with(['tutors:id', 'students:id'])->get()->keyBy('name');

        // day, start, end, class, room, program
        $rows = [
            [1, '08:30', '10:00', 'Kelas Beginner 1', 'Ruang 1', 'CNV'],
            [1, '13:00', '14:30', 'Kelas Beginner 2', 'Ruang 2', 'GRM'],
            [2, '09:00', '10:30', 'Kelas Intermediate low 3', 'Ruang 3', 'PRN'],
            [2, '15:30', '17:00', 'Kelas Intermediate low 4', 'Ruang 4', 'INP'],
            [3, '08:00', '09:30', 'Kelas Intermediate 5', 'Ruang 5', 'PSC'],
            [3, '13:00', '14:30', 'Kelas Intermediate 6', 'Ruang 6', 'BWR'],
            [4, '10:00', '11:30', 'Kelas Intermediate Up 7', 'Ruang 7', 'EXE'],
            [5, '13:00', '15:00', 'Kelas Intermediate Up 8', 'Ruang 8', 'GBN'],
            [5, '15:30', '17:30', 'Kelas Advanced 9', 'Ruang 9', 'DSP'],
            [6, '09:00', '11:00', 'Kelas Advanced 10', 'Ruang 10', 'PRT'],
        ];

        foreach ($rows as [$day, $start, $end, $className, $roomName, $programCode]) {
            $courseClass = $classes->get($className);
            $roomId = $rooms[$roomName] ?? null;
            $programId = $programs[$programCode] ?? null;
            $tutorId = $courseClass?->tutors->first()?->id;

            if (! $courseClass || ! $roomId || ! $programId || ! $tutorId) {
                continue;
            }

            $schedule = Schedule::updateOrCreate(
                [
                    'class_id' => $courseClass->id,
                    'day_of_week' => $day,
                    'start_time' => $start,
                ],
                [
                    'semester_id' => $semester->id,
                    'program_id' => $programId,
                    'tutor_id' => $tutorId,
                    'room_id' => $roomId,
                    'title' => $courseClass->name,
                    'class_name' => $courseClass->name,
                    'end_time' => $end,
                ],
            );

            $studentUserIds = $courseClass->students->pluck('id')->all();
            $studentIds = Student::whereIn('user_id', $studentUserIds)->pluck('id')->all();
            $schedule->students()->sync($studentIds);

            $this->seedTodayAttendance($schedule, $studentIds, $day);
        }
    }

    /**
     * Presensi hari ini untuk jadwal yang bertepatan, supaya dashboard tutor dan
     * murid langsung berisi data saat demo.
     *
     * @param  array<int, int>  $studentIds
     */
    private function seedTodayAttendance(Schedule $schedule, array $studentIds, int $day): void
    {
        if ($day !== now()->dayOfWeekIso || $studentIds === []) {
            return;
        }

        $now = now();
        $rows = collect($studentIds)->values()->map(
            fn (int $studentId, int $index): array => [
                'schedule_id' => $schedule->id,
                'student_id' => $studentId,
                'date' => $now->toDateString(),
                'status' => $index % 10 === 9 ? AttendanceStatus::Absent->value : AttendanceStatus::Present->value,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        )->all();

        Attendance::upsert($rows, ['schedule_id', 'student_id', 'date'], ['status', 'updated_at']);
    }
}
