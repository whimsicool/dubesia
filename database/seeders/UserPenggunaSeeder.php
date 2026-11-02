<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserPenggunaSeeder extends Seeder
{
    /**
     * Seed data guru dan murid sampel untuk fitur Kelola Data Pengguna.
     */
    public function run(): void
    {
        $gurus = [
            [
                'name' => 'Dr. Kevin Kusuma, M.A.',
                'email' => 'kevin.kusuma@dubes.ac.id',
                'no_hp' => '+62 812-9876-5432',
            ],
            [
                'name' => 'Prof. Siti Rahmawati, Ph.D.',
                'email' => 'siti.rahmawati@dubes.ac.id',
                'no_hp' => '+62 811-3322-1100',
            ],
            [
                'name' => 'Nadia Safira Putri, S.Pd.',
                'email' => 'nadia.safira@dubes.ac.id',
                'no_hp' => '+62 813-5566-7788',
            ],
            [
                'name' => 'Rizky Aditya Pratama, M.Ed.',
                'email' => 'rizky.aditya@dubes.ac.id',
                'no_hp' => '+62 812-6677-8899',
            ],
            [
                'name' => 'Dewi Lestari, S.S.',
                'email' => 'dewi.lestari@dubes.ac.id',
                'no_hp' => '+62 821-4455-6677',
            ],
        ];

        foreach ($gurus as $guru) {
            User::updateOrCreate(
                ['email' => $guru['email']],
                [
                    'name' => $guru['name'],
                    'password' => Hash::make('password'),
                    'role' => 'tutor',
                    'no_hp' => $guru['no_hp'],
                    'status_akun' => 'aktif',
                    'email_verified_at' => now(),
                ]
            );
        }

        $murids = [
            [
                'name' => 'Ahmad Rizky Pratama',
                'email' => 'ahmad.rizky@student.dubes.ac.id',
                'no_hp' => '+62 821-4455-6677',
            ],
            [
                'name' => 'Aura Nasywa Kirana, S.Hub.Int.',
                'email' => 'aura.kirana@student.dubes.ac.id',
                'no_hp' => '+62 812-3456-7890',
            ],
            [
                'name' => 'Raihan Fauzan Wildan',
                'email' => 'raihan.fauzan@student.dubes.ac.id',
                'no_hp' => '+62 813-9081-2345',
            ],
            [
                'name' => 'Jessica Amanda',
                'email' => 'jessica.amanda@student.dubes.ac.id',
                'no_hp' => '+62 815-7788-9900',
            ],
            [
                'name' => 'Muhammad Farhan Hakim',
                'email' => 'farhan.hakim@student.dubes.ac.id',
                'no_hp' => '+62 822-3344-5566',
            ],
            [
                'name' => 'Putri Azzahra Dewi',
                'email' => 'putri.azzahra@student.dubes.ac.id',
                'no_hp' => '+62 813-2233-4455',
            ],
            [
                'name' => 'Dimas Arya Nugroho',
                'email' => 'dimas.arya@student.dubes.ac.id',
                'no_hp' => '+62 812-9988-7766',
            ],
            [
                'name' => 'Salsabila Indah Permata',
                'email' => 'salsabila.indah@student.dubes.ac.id',
                'no_hp' => '+62 821-5544-3322',
            ],
            [
                'name' => 'Raffi Ahmad Maulana',
                'email' => 'raffi.maulana@student.dubes.ac.id',
                'no_hp' => '+62 815-6677-8899',
            ],
            [
                'name' => 'Citra Maharani Putri',
                'email' => 'citra.maharani@student.dubes.ac.id',
                'no_hp' => '+62 813-1122-3344',
            ],
        ];

        foreach ($murids as $murid) {
            User::updateOrCreate(
                ['email' => $murid['email']],
                [
                    'name' => $murid['name'],
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'no_hp' => $murid['no_hp'],
                    'status_akun' => 'aktif',
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
