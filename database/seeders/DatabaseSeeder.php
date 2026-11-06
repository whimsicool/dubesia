<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Urutan seeder mengikuti ketergantungan data: tutor, program, ruangan,
     * kelas, jadwal, lalu data pendukung.
     */
    public function run(): void
    {
        $this->seedAccounts();

        $this->call(TutorSeeder::class);
        $this->call(ProgramSeeder::class);
        $this->call(RoomSeeder::class);
        $this->call(CourseClassSeeder::class);
        $this->call(ScheduleSeeder::class);
        $this->call(MaterialSeeder::class);
        $this->call(SoalTesSeeder::class);
        $this->call(PendaftaranSeeder::class);
        $this->call(JawabanTesSeeder::class);
        $this->call(HasilTesSeeder::class);
        $this->call(GradeComponentSeeder::class);
        $this->call(StudentGradeSeeder::class);
        $this->call(GradeComponentScoreSeeder::class);
        $this->call(ClassAttendanceSeeder::class);
        $this->call(AttendanceSeeder::class);
        $this->call(MaterialProgressSeeder::class);
        $this->call(StudentFeedbackSeeder::class);
    }

    /** Akun admin dan tiga akun murid demo. Akun tutor dibuat oleh TutorSeeder. */
    private function seedAccounts(): void
    {
        $accounts = [
            [
                'name' => 'Rahmat Hidayat',
                'email' => 'admin@dubesia.id',
                'role' => User::ROLE_ADMIN,
                'class_level' => null,
            ],
            [
                'name' => 'Anindya Kartika Sari',
                'email' => 'student@dubesia.id',
                'role' => User::ROLE_STUDENT,
                'class_level' => 'Beginner',
            ],
            [
                'name' => 'Rangga Mahendra',
                'email' => 'student-intermediate@dubesia.id',
                'role' => User::ROLE_STUDENT,
                'class_level' => 'Middle Intermediate',
            ],
            [
                'name' => 'Salsabila Indah Permata',
                'email' => 'student-advance@dubesia.id',
                'role' => User::ROLE_STUDENT,
                'class_level' => 'Upper Intermediate',
            ],
        ];

        foreach ($accounts as $account) {
            User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => Hash::make('password'),
                    'role' => $account['role'],
                    'class_level' => $account['class_level'],
                    'status_akun' => 'aktif',
                    'is_active' => true,
                    'email_verified_at' => now(),
                ],
            );
        }
    }
}
