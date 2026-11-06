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

    /**
     * Akun admin memakai akun yang sudah ada bila database sudah punya admin,
     * misalnya akun VPS. Email dan kata sandi akun itu tidak diubah. Bila belum
     * ada admin sama sekali, seeder membuat admin@dubesia.id.
     *
     * Akun tutor dibuat oleh TutorSeeder; akun murid demo oleh CourseClassSeeder.
     */
    private function seedAccounts(): void
    {
        $this->seedAdmin();

        $students = [
            [
                'name' => 'Anindya Kartika Sari',
                'email' => 'student@dubesia.id',
                'class_level' => 'Beginner',
            ],
            [
                'name' => 'Rangga Mahendra',
                'email' => 'student-intermediate@dubesia.id',
                'class_level' => 'Middle Intermediate',
            ],
            [
                'name' => 'Salsabila Indah Permata',
                'email' => 'student-advance@dubesia.id',
                'class_level' => 'Upper Intermediate',
            ],
        ];

        foreach ($students as $student) {
            User::updateOrCreate(
                ['email' => $student['email']],
                [
                    'name' => $student['name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_STUDENT,
                    'class_level' => $student['class_level'],
                    'status_akun' => 'aktif',
                    'is_active' => true,
                    'email_verified_at' => now(),
                ],
            );
        }
    }

    /** Profil admin hasil seeder dipakai pada akun admin yang sudah ada. */
    private function seedAdmin(): void
    {
        $admin = User::where('role', User::ROLE_ADMIN)->orderBy('id')->first();

        if ($admin) {
            $admin->fill([
                'name' => 'Rahmat Hidayat',
                'status_akun' => 'aktif',
                'is_active' => true,
            ]);

            if (! $admin->email_verified_at) {
                $admin->email_verified_at = now();
            }

            $admin->save();

            return;
        }

        User::updateOrCreate(['email' => 'admin@dubesia.id'], [
            'name' => 'Rahmat Hidayat',
            'password' => Hash::make('password'),
            'role' => User::ROLE_ADMIN,
            'class_level' => null,
            'status_akun' => 'aktif',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }
}
