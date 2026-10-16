<?php

namespace Database\Seeders;

use App\Enums\AttendanceStatus;
use App\Models\Attendance;
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
        $demoStudentId = $this->seedStudents();
        $activeIds = Student::where('status', Student::STATUS_ACTIVE)->orderBy('id')->pluck('id');

        $this->seedSchedules($semester, $programs, $instructors, $rooms, $activeIds, $demoStudentId);
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
        return collect([
            ['Diplomatic Hall A', 'physical', null, 30],
            ['Diplomatic Hall B', 'physical', null, 30],
            ['Audiovisual Lab 2', 'lab', null, 20],
            ['Digital Lab 1', 'lab', null, 24],
            ['Ruang Garuda 3', 'physical', null, 20],
            ['Bahasa Timur B', 'physical', null, 16],
            ['Ruang Merdeka 1', 'physical', null, 20],
            ['Zoom Room 01', 'online', 'Zoom', 100],
            ['Zoom Room 02', 'online', 'Zoom', 100],
            ['Zoom Room 03', 'online', 'Zoom', 100],
        ])->mapWithKeys(fn (array $room): array => [
            $room[0] => Room::updateOrCreate(['name' => $room[0]], [
                'type' => $room[1],
                'platform' => $room[2],
                'capacity' => $room[3],
                'is_active' => true,
            ]),
        ]);
    }

    private function seedStudents(): ?int
    {
        $firstNames = ['Aditya', 'Bella', 'Citra', 'Dimas', 'Eka', 'Fajar', 'Gita', 'Hana', 'Indra', 'Jasmine', 'Kirana', 'Lukman', 'Maya', 'Nadia', 'Oscar'];
        $lastNames = ['Pratama', 'Putri', 'Wibowo', 'Saputra'];

        $names = [];
        foreach ($lastNames as $last) {
            foreach ($firstNames as $first) {
                $names[] = "$first $last";
            }
        }

        foreach ($names as $i => $name) {
            Student::updateOrCreate(
                ['nisn' => '2026'.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT)],
                ['name' => $name, 'status' => $i < 48 ? Student::STATUS_ACTIVE : Student::STATUS_PENDING],
            );
        }

        $studentUser = User::where('email', 'student@dubesia.id')->first();
        if (! $studentUser) {
            return null;
        }

        Student::where('nisn', '20260001')->update([
            'user_id' => $studentUser->id,
            'name' => $studentUser->name,
            'email' => $studentUser->email,
        ]);

        return Student::where('user_id', $studentUser->id)->value('id');
    }

    private function seedSchedules(
        Semester $semester,
        Collection $programs,
        Collection $instructors,
        Collection $rooms,
        mixed $activeIds,
        ?int $demoStudentId,
    ): void {
        $rows = [
            [1, '08:30', '10:00', 'DSP', 'Diplomatic Speech & Rhetoric', 'Diplomatic Speech Batch #4', 'Dr. Kevin Kusuma', 'Diplomatic Hall A', 18],
            [1, '14:00', '15:30', 'PRT', 'Protocol & Diplomatic Etiquette', 'Protocol Batch #2', 'Farhan Ardiansyah', 'Ruang Garuda 3', 14],
            [2, '13:00', '14:30', 'EXE', 'Executive English Fluency', 'Executive Batch #3', 'Siti Aisyah', 'Zoom Room 02', 15],
            [3, '15:30', '17:00', 'IELTS', 'IELTS Academic Masterclass', 'IELTS Batch #7', 'Ahmad Rizky', 'Audiovisual Lab 2', 12],
            [4, '09:00', '11:00', 'HSK', 'Mandarin HSK Comprehensive', 'HSK Batch #2', 'Meilani Chen', 'Bahasa Timur B', 10],
            [5, '14:00', '16:00', 'GBN', 'Global Business Negotiation', 'Business Batch #5', 'Dr. Kevin Kusuma', 'Diplomatic Hall B', 16],
            [6, '08:30', '11:30', 'TOEFL', 'Weekend Intensive TOEFL ITP', 'TOEFL Weekend Batch #1', 'Siti Aisyah', 'Digital Lab 1', 20],
        ];

        foreach ($rows as $i => [$day, $start, $end, $program, $title, $class, $instructor, $room, $count]) {
            $schedule = Schedule::updateOrCreate(
                ['semester_id' => $semester->id, 'class_name' => $class],
                [
                    'program_id' => $programs[$program]->id,
                    'instructor_id' => $instructors[$instructor]->id,
                    'room_id' => $rooms[$room]->id,
                    'title' => $title,
                    'day_of_week' => $day,
                    'start_time' => $start,
                    'end_time' => $end,
                ],
            );

            $schedule->students()->sync($activeIds->concat($activeIds)->slice($i * 6, $count)->values()->all());

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

        if ($demoStudentId) {
            Schedule::where('semester_id', $semester->id)
                ->where('class_name', 'Diplomatic Speech Batch #4')
                ->first()?->students()->syncWithoutDetaching([$demoStudentId]);
        }
    }
}
