<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $accounts = [
            [
                'name' => 'Admin Dubesia',
                'email' => 'admin@dubesia.id',
                'role' => 'admin',
                'class_level' => null,
            ],
            [
                'name' => 'Tutor Dubesia',
                'email' => 'tutor@dubesia.id',
                'role' => 'tutor',
                'class_level' => null,
            ],
            [
                'name' => 'Student Beginner',
                'email' => 'student@dubesia.id',
                'role' => 'student',
                'class_level' => 'Beginner',
            ],
            [
                'name' => 'Student Intermediate',
                'email' => 'student-intermediate@dubesia.id',
                'role' => 'student',
                'class_level' => 'Intermediate',
            ],
            [
                'name' => 'Student Advance',
                'email' => 'student-advance@dubesia.id',
                'role' => 'student',
                'class_level' => 'Advance',
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
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->call(ScheduleSeeder::class);
        $this->call(MaterialSeeder::class);
        $this->call(SoalTesSeeder::class);
        $this->call(UserPenggunaSeeder::class);
    }
}
