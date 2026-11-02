<?php

namespace Database\Seeders;

use App\Enums\AttendanceStatus;
use App\Enums\ClassLevel;
use App\Models\Attendance;
use App\Models\CourseClass;
use App\Models\Instructor;
use App\Models\Program;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $semester = Semester::updateOrCreate(
            ['name' => 'Ganjil 2026/2027'],
            ['start_date' => '2026-08-03', 'end_date' => '2027-01-30', 'is_active' => true],
        );

        $programs = $this->seedPrograms();
        $instructors = $this->seedInstructors();
        $this->linkTutorInstructor($instructors);

        $rooms = $this->seedRooms();
        $classes = $this->seedClasses();

        $this->seedSchedules($semester, $programs, $instructors, $rooms, $classes);
    }

    private function seedPrograms(): Collection
    {
        return collect([
            ['DSP', 'Diplomatic Speech', 'english'],
            ['PRT', 'Protocol & Etiquette', 'english'],
            ['EXE', 'Executive English', 'english'],
            ['GBN', 'Global Business English', 'english'],
            ['IELTS', 'IELTS Academic', 'exam'],
            ['TOEFL', 'TOEFL ITP', 'exam'],
            ['HSK', 'Mandarin HSK', 'mandarin'],
        ])->mapWithKeys(fn (array $program): array => [
            $program[0] => Program::updateOrCreate(['code' => $program[0]], [
                'name' => $program[1],
                'category' => $program[2],
                'is_active' => true,
            ]),
        ]);
    }

    private function seedInstructors(): Collection
    {
        return collect([
            'Dr. Kevin Kusuma',
            'Siti Aisyah',
            'Ahmad Rizky',
            'Meilani Chen',
            'Farhan Ardiansyah',
            'Budi Santoso',
            'Rina Wijaya',
            'Michael Tan',
            'Dewi Lestari',
        ])->mapWithKeys(fn (string $name): array => [
            $name => Instructor::updateOrCreate(['name' => $name], ['is_active' => true]),
        ]);
    }

    private function linkTutorInstructor(Collection $instructors): void
    {
        $tutorUser = User::where('email', 'tutor@dubesia.id')->first();
        if (! $tutorUser) {
            return;
        }

        $instructors['Dr. Kevin Kusuma']?->update([
            'user_id' => $tutorUser->id,
            'email' => $tutorUser->email,
        ]);
    }

    private function seedRooms(): Collection
    {
        // Delapan nomor ruang; 3 dan 8 adalah ruang daring, sama seperti hasil migration normalisasi.
        $definitions = [
            '1' => ['physical', null, 'Gedung Utama, Lantai 1', 30],
            '2' => ['physical', null, 'Gedung Utama, Lantai 2', 30],
            '3' => ['online', 'Zoom', null, 24],
            '4' => ['physical', null, 'Gedung Utama, Lantai 4', 20],
            '5' => ['physical', null, 'Gedung Utama, Lantai 5', 24],
            '6' => ['physical', null, 'Gedung Utama, Lantai 6', 20],
            '7' => ['physical', null, 'Gedung Utama, Lantai 7', 16],
            '8' => ['online', 'Zoom', null, 20],
        ];

        $rooms = collect();
        foreach ($definitions as $name => [$type, $platform, $location, $capacity]) {
            $rooms->put($name, Room::updateOrCreate(['name' => $name], [
                'type' => $type,
                'platform' => $platform,
                'location' => $location,
                'capacity' => $capacity,
                'is_active' => true,
            ]));
        }

        // Bersihkan nama-nama dummy lama sambil mempertahankan relasi jadwalnya.
        $legacyAliases = [
            '1' => ['Diplomatic Hall A', 'Ruang Merdeka 1', 'Ruang 1'],
            '2' => ['Ruang Garuda 3', 'Ruang 2'],
            '3' => ['Zoom Room 02', 'Zoom Room 03', 'Ruang 3', 'Zoom'],
            '4' => ['Audiovisual Lab 2', 'Ruang 4'],
            '5' => ['Bahasa Timur B', 'Ruang 5'],
            '6' => ['Diplomatic Hall B', 'Ruang 6'],
            '7' => ['Digital Lab 1', 'Ruang 7'],
            '8' => ['Zoom Room 01', 'Ruang 8', 'Google Meet'],
        ];

        foreach ($legacyAliases as $number => $aliases) {
            $target = $rooms->get($number);

            foreach ($aliases as $alias) {
                $legacy = Room::where('name', $alias)->first();

                if (! $legacy) {
                    continue;
                }

                $legacy->schedules()->update(['room_id' => $target->id]);
                $legacy->delete();
            }
        }

        return $rooms;
    }

    /** Sepuluh kelas contoh dengan anggota yang dikelola dari menu Kelola Kelas. */
    private function seedClasses(): Collection
    {
        $levels = [
            ['Beginner', ClassLevel::Beginner, 'Beginner'],
            ['Beginner', ClassLevel::Beginner, 'Beginner'],
            ['Intermediate low', ClassLevel::IntermediateLow, 'Low Intermediate'],
            ['Intermediate low', ClassLevel::IntermediateLow, 'Low Intermediate'],
            ['Intermediate', ClassLevel::Intermediate, 'Middle Intermediate'],
            ['Intermediate', ClassLevel::Intermediate, 'Middle Intermediate'],
            ['Intermediate Up', ClassLevel::IntermediateUp, 'Upper Intermediate'],
            ['Intermediate Up', ClassLevel::IntermediateUp, 'Upper Intermediate'],
            ['Advanced', ClassLevel::Advanced, 'Upper Intermediate'],
            ['Advanced', ClassLevel::Advanced, 'Upper Intermediate'],
        ];
        $tutors = User::where('role', User::ROLE_TUTOR)->orderBy('id')->get();

        return collect($levels)->values()->map(function (array $entry, int $classIndex) use ($tutors): CourseClass {
            [$label, $level, $userLevel] = $entry;
            $class = CourseClass::updateOrCreate(['name' => sprintf('Kelas %s %d', $label, $classIndex + 1)], [
                'level' => $level->value,
                'description' => 'Kelas contoh '.$label.' untuk data demo.',
                'is_active' => true,
            ]);

            if ($tutors->isNotEmpty()) {
                $class->tutors()->syncWithoutDetaching([$tutors[$classIndex % $tutors->count()]->id]);
            }

            $studentUserIds = [];
            for ($studentIndex = 1; $studentIndex <= 10; $studentIndex++) {
                $studentNumber = ($classIndex * 10) + $studentIndex;
                $email = sprintf('demo.murid.%03d@dubesia.id', $studentNumber);
                $user = User::updateOrCreate(['email' => $email], [
                    'name' => sprintf('Murid %s %d-%02d', $label, $classIndex + 1, $studentIndex),
                    'password' => 'password',
                    'role' => User::ROLE_STUDENT,
                    'class_level' => $userLevel,
                    'is_active' => true,
                    'status_akun' => 'aktif',
                    'email_verified_at' => now(),
                ]);

                Student::updateOrCreate(
                    ['user_id' => $user->id],
                    ['name' => $user->name, 'email' => $user->email, 'status' => Student::STATUS_ACTIVE],
                );
                $studentUserIds[] = $user->id;
            }

            // Seeder dapat dijalankan berulang; kelas demo akan tetap berisi tepat 10 akun.
            $class->students()->sync($studentUserIds);

            return $class;
        });
    }

    private function seedSchedules(
        Semester $semester,
        Collection $programs,
        Collection $instructors,
        Collection $rooms,
        Collection $classes,
    ): void {
        $rows = [
            [1, '08:30', '10:00', 'DSP', 'Diplomatic Speech & Rhetoric', 'Diplomatic Speech Batch #4', 'Dr. Kevin Kusuma', '1', 18],
            [1, '14:00', '15:30', 'PRT', 'Protocol & Diplomatic Etiquette', 'Protocol Batch #2', 'Farhan Ardiansyah', '2', 14],
            [2, '13:00', '14:30', 'EXE', 'Executive English Fluency', 'Executive Batch #3', 'Siti Aisyah', '3', 15],
            [3, '15:30', '17:00', 'IELTS', 'IELTS Academic Masterclass', 'IELTS Batch #7', 'Ahmad Rizky', '8', 12],
            [4, '09:00', '11:00', 'HSK', 'Mandarin HSK Comprehensive', 'HSK Batch #2', 'Meilani Chen', '5', 10],
            [5, '14:00', '16:00', 'GBN', 'Global Business Negotiation', 'Business Batch #5', 'Dr. Kevin Kusuma', '6', 16],
            [6, '08:30', '11:30', 'TOEFL', 'Weekend Intensive TOEFL ITP', 'TOEFL Weekend Batch #1', 'Siti Aisyah', '7', 20],
        ];

        foreach ($rows as $i => [$day, $start, $end, $program, $title, $class, $instructor, $room, $count]) {
            $courseClass = $classes->values()->get($i);
            $schedule = Schedule::where('semester_id', $semester->id)->where('class_id', $courseClass->id)->first()
                ?? Schedule::where('semester_id', $semester->id)->where('class_name', $class)->first()
                ?? new Schedule;
            $schedule->fill([
                'semester_id' => $semester->id,
                'program_id' => $programs[$program]->id,
                'class_id' => $courseClass->id,
                'instructor_id' => $instructors[$instructor]->id,
                'room_id' => $rooms[$room]->id,
                'title' => $title,
                'class_name' => $courseClass->name,
                'day_of_week' => $day,
                'start_time' => $start,
                'end_time' => $end,
            ])->save();
            $studentUserIds = $courseClass->students()->pluck('users.id')->all();
            $studentIds = Student::whereIn('user_id', $studentUserIds)->pluck('id')->all();
            $schedule->students()->sync($studentIds);

            if ($day !== now()->dayOfWeekIso) {
                continue;
            }

            $now = now();
            $attendances = $schedule->students()->pluck('students.id')->values()->map(
                fn ($studentId, $n) => [
                    'schedule_id' => $schedule->id,
                    'student_id' => $studentId,
                    'date' => $now->toDateString(),
                    'status' => ($n % 10 === 9 ? AttendanceStatus::Absent : AttendanceStatus::Present)->value,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            )->all();

            if ($attendances !== []) {
                Attendance::upsert(
                    $attendances,
                    ['schedule_id', 'student_id', 'date'],
                    ['status', 'updated_at'],
                );
            }
        }

    }
}
