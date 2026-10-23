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
            ],
            [
                'name' => 'Tutor Dubesia',
                'email' => 'tutor@dubesia.id',
                'role' => 'tutor',
            ],
            [
                'name' => 'Student Dubesia',
                'email' => 'student@dubesia.id',
                'role' => 'student',
            ],
        ];
        foreach ($accounts as $account) {
            User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => Hash::make('password'),
                    'role' => $account['role'],
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->call(ScheduleSeeder::class);
        $this->call(MaterialSeeder::class);
        $this->call(SoalTesSeeder::class);
    }
}
