<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TutorSeeder extends Seeder
{
    /**
     * Sepuluh akun tutor. Akun lama dicocokkan lewat email atau nama agar seeder
     * aman dijalankan berulang tanpa membuat duplikat.
     */
    public function run(): void
    {
        // name, email, no_hp
        $tutors = [
            ['Kevin Kusuma, M.A.', 'tutor@dubesia.id', '+62 812-9000-0001'],
            ['Siti Aisyah, S.Pd.', 'siti.aisyah@dubesia.id', '+62 812-9000-0002'],
            ['Ahmad Rizky, M.Hum.', 'ahmad.rizky@dubesia.id', '+62 812-9000-0003'],
            ['Meilani Chen, B.A.', 'meilani.chen@dubesia.id', '+62 812-9000-0004'],
            ['Farhan Ardiansyah, S.S.', 'farhan.ardiansyah@dubesia.id', '+62 812-9000-0005'],
            ['Budi Santoso, M.Ed.', 'budi.santoso@dubesia.id', '+62 812-9000-0006'],
            ['Rina Wijaya, S.Pd.', 'rina.wijaya@dubesia.id', '+62 812-9000-0007'],
            ['Michael Tan, M.A.', 'michael.tan@dubesia.id', '+62 812-9000-0008'],
            ['Dewi Lestari, S.S.', 'dewi.lestari@dubesia.id', '+62 812-9000-0009'],
            ['Nadia Safira Putri, S.Pd.', 'nadia.safira@dubesia.id', '+62 812-9000-0010'],
        ];

        $password = Hash::make('password');

        foreach ($tutors as [$name, $email, $phone]) {
            $tutor = User::where('email', $email)->first()
                ?? User::where('role', User::ROLE_TUTOR)->where('name', $name)->first()
                ?? new User;

            $tutor->fill([
                'name' => $name,
                'email' => $email,
                'password' => $password,
                'role' => User::ROLE_TUTOR,
                'no_hp' => $phone,
                'status_akun' => 'aktif',
                'is_active' => true,
                'email_verified_at' => now(),
            ])->save();
        }
    }
}
