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

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $semester = Semester::updateOrCreate(
            ['name' => 'Ganjil 2026/2027'],
            ['start_date' => '2026-08-03', 'end_date' => '2027-01-30', 'is_active' => true],
        );

        // ---- Program ----------------------------------------------------
        $programs = collect([
            ['DSP', 'Diplomatic Speech', 'english'],
            ['PRT', 'Protocol & Etiquette', 'english'],
            ['EXE', 'Executive English', 'english'],
            ['GBN', 'Global Business English', 'english'],
            ['IELTS', 'IELTS Academic', 'exam'],
            ['TOEFL', 'TOEFL ITP', 'exam'],
            ['HSK', 'Mandarin HSK', 'mandarin'],
        ])->mapWithKeys(fn ($p) => [
            $p[0] => Program::updateOrCreate(['code' => $p[0]], ['name' => $p[1], 'category' => $p[2], 'is_active' => true]),
        ]);

        // ---- Instruktur -------------------------------------------------
        $instructors = collect([
            'Dr. Kevin Kusuma', 'Siti Aisyah', 'Ahmad Rizky', 'Meilani Chen', 'Farhan Ardiansyah',
            'Budi Santoso', 'Rina Wijaya', 'Michael Tan', 'Dewi Lestari',
        ])->mapWithKeys(fn ($name) => [
            $name => Instructor::updateOrCreate(['name' => $name], ['is_active' => true]),
        ]);

        // Hubungkan akun contoh tutor agar jadwal instruktur dapat dilihat dari halaman tutor.
        $tutorUser = User::where('email', 'tutor@dubesia.id')->first();
        if ($tutorUser) {
            $instructors['Dr. Kevin Kusuma']->update([
                'user_id' => $tutorUser->id,
                'email' => $tutorUser->email,
            ]);
        }

        // ---- Ruang (7 fisik + 3 online) ---------------------------------
        $rooms = collect([
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
        ])->mapWithKeys(fn ($r) => [
            $r[0] => Room::updateOrCreate(['name' => $r[0]], ['type' => $r[1], 'platform' => $r[2], 'capacity' => $r[3], 'is_active' => true]),
        ]);

        // ---- Murid: 48 aktif + 12 menunggu penempatan -------------------
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

        // Akun demo Student Dubesia dipasangkan dengan murid contoh yang terdaftar di jadwal.
        $studentUser = User::where('email', 'student@dubesia.id')->first();
        $demoStudentId = null;
        if ($studentUser) {
            Student::where('nisn', '20260001')->update([
                'user_id' => $studentUser->id,
                'name' => $studentUser->name,
                'email' => $studentUser->email,
            ]);
            $demoStudentId = Student::where('user_id', $studentUser->id)->value('id');
        }

        $activeIds = Student::where('status', Student::STATUS_ACTIVE)->orderBy('id')->pluck('id');

        // ---- Jadwal mingguan --------------------------------------------
        // [hari, mulai, selesai, program, judul sesi, kelas, instruktur, ruang, jumlah murid]
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

            // Ambil irisan murid secara melingkar agar tiap kelas punya peserta berbeda.
            $schedule->students()->sync($activeIds->concat($activeIds)->slice($i * 6, $count)->values()->all());

            // Contoh presensi untuk sesi yang jatuh pada hari ini.
            if ($day === now()->dayOfWeekIso) {
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

        if ($demoStudentId) {
            Schedule::where('semester_id', $semester->id)
                ->where('class_name', 'Diplomatic Speech Batch #4')
                ->first()?->students()->syncWithoutDetaching([$demoStudentId]);
        }
    }
}
