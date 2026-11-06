<?php

namespace Database\Seeders;

use App\Enums\ClassLevel;
use App\Models\CourseClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CourseClassSeeder extends Seeder
{
    /**
     * Sepuluh kelas dengan nama sesuai level, dan sepuluh murid per kelas.
     * Nama murid memakai nama orang sungguhan, bukan label level.
     */
    public function run(): void
    {
        $classes = [
            [
                'level' => ClassLevel::Beginner,
                'description' => 'Dasar percakapan sehari-hari: perkenalan, salam, dan kalimat sederhana.',
                'students' => [
                    'Alya Rahmawati', 'Bima Prasetyo', 'Citra Maharani', 'Dimas Arya Nugroho',
                    'Elvira Putri Handayani', 'Fajar Ramadhan', 'Ghina Salsabila', 'Haris Maulana',
                    'Intan Permata Sari', 'Joko Susilo',
                ],
            ],
            [
                'level' => ClassLevel::Beginner,
                'description' => 'Latihan tata bahasa dasar dan kosakata untuk situasi harian.',
                'students' => [
                    'Kasih Anindya Putri', 'Lukman Hakim', 'Maya Anggraini', 'Naufal Rizky Pratama',
                    'Oki Setiawan', 'Putri Azzahra Dewi', 'Qori Amalia', 'Rangga Saputra',
                    'Sinta Wulandari', 'Taufik Hidayat',
                ],
            ],
            [
                'level' => ClassLevel::IntermediateLow,
                'description' => 'Percakapan bertema pekerjaan, arah, dan transaksi sehari-hari.',
                'students' => [
                    'Umar Faruq', 'Vina Oktaviani', 'Wahyu Saputra', 'Yuni Astuti',
                    'Zaki Firmansyah', 'Aditya Nugraha', 'Bella Kartika', 'Candra Wijaya',
                    'Dinda Ayu Lestari', 'Eko Prasetyo',
                ],
            ],
            [
                'level' => ClassLevel::IntermediateLow,
                'description' => 'Persiapan wawancara kerja dalam bahasa Inggris.',
                'students' => [
                    'Fikri Maulana', 'Gita Puspita', 'Hendra Wijaya', 'Indah Cahyani',
                    'Jihan Aulia', 'Kurniawan Adi', 'Lestari Ningsih', 'Miko Pratama',
                    'Nisa Fauziah', 'Oscar Tanjung',
                ],
            ],
            [
                'level' => ClassLevel::Intermediate,
                'description' => 'Presentasi singkat, diskusi kelompok, dan tanya jawab.',
                'students' => [
                    'Prita Amelia', 'Rian Hidayat', 'Sari Dewi Anggraini', 'Tio Saputra',
                    'Ulfa Rahmadani', 'Vito Pratama', 'Wulan Sari', 'Yoga Saputra',
                    'Zahra Nabila', 'Arif Setiawan',
                ],
            ],
            [
                'level' => ClassLevel::Intermediate,
                'description' => 'Menulis surel bisnis, laporan ringkas, dan notulen rapat.',
                'students' => [
                    'Bayu Nugroho', 'Celine Wijaya', 'Dani Ramdhan', 'Erika Puspa',
                    'Fauzan Akbar', 'Galuh Pramesti', 'Hana Yuliana', 'Irfan Maulana',
                    'Jasmine Aulia', 'Kevin Sanjaya',
                ],
            ],
            [
                'level' => ClassLevel::IntermediateUp,
                'description' => 'Bahasa Inggris rapat dan korespondensi bisnis.',
                'students' => [
                    'Laila Nuraini', 'Miftah Fadillah', 'Nadia Ayu Safitri', 'Oktavia Rahmawati',
                    'Pandu Wicaksono', 'Qonita Shafira', 'Rendra Kusuma', 'Sinta Bella',
                    'Tria Handayani', 'Ujang Suryana',
                ],
            ],
            [
                'level' => ClassLevel::IntermediateUp,
                'description' => 'Negosiasi bisnis dan presentasi penawaran kepada mitra asing.',
                'students' => [
                    'Vania Larasati', 'Wira Adhitama', 'Yasmine Putri', 'Zulfa Hanifah',
                    'Angga Saputra', 'Bella Anjani', 'Cinta Ramadhani', 'Daffa Alfarizi',
                    'Eka Putri Sari', 'Farel Mahendra',
                ],
            ],
            [
                'level' => ClassLevel::Advanced,
                'description' => 'Pidato diplomatik: argumentasi, diksi resmi, dan simulasi sidang bilateral.',
                'students' => [
                    'Gilang Ramadhan', 'Hesti Wulandari', 'Ilham Saputra', 'Juwita Sari',
                    'Krisna Bayu', 'Lina Marlina', 'Mabrur Hidayat', 'Nabila Zahra',
                    'Oki Pratama', 'Prasetyo Aji',
                ],
            ],
            [
                'level' => ClassLevel::Advanced,
                'description' => 'Protokol, etiket jamuan resmi, dan komunikasi lintas budaya.',
                'students' => [
                    'Rafi Kurniawan', 'Rizka Amalia', 'Satria Wijaya', 'Tiara Anjani',
                    'Umar Said', 'Vira Lestari', 'Wawan Setiawan', 'Yulia Sari',
                    'Zidan Alfarizi', 'Anisa Rahmadani',
                ],
            ],
        ];

        // Akun demo tetap aktif di portal dan ikut terdaftar pada kelas yang sesuai levelnya.
        $demoStudents = [
            4 => ['Anindya Kartika Sari', 'student@dubesia.id'],
            2 => ['Rangga Mahendra', 'student-intermediate@dubesia.id'],
            3 => ['Salsabila Indah Permata', 'student-advance@dubesia.id'],
        ];

        $tutors = User::where('role', User::ROLE_TUTOR)->orderBy('id')->get();
        $password = Hash::make('password');

        foreach ($classes as $index => $definition) {
            $courseClass = CourseClass::updateOrCreate(
                ['name' => sprintf('Kelas %s %d', $definition['level']->value, $index + 1)],
                [
                    'level' => $definition['level']->value,
                    'description' => $definition['description'],
                    'is_active' => true,
                ],
            );

            if ($tutors->isNotEmpty()) {
                $courseClass->tutors()->sync([$tutors[$index % $tutors->count()]->id]);
            }

            $studentUserIds = [];
            $names = $definition['students'];

            if (isset($demoStudents[$index])) {
                $names[count($names) - 1] = $demoStudents[$index][0];
            }

            foreach ($names as $studentIndex => $name) {
                $email = isset($demoStudents[$index]) && $studentIndex === count($names) - 1
                    ? $demoStudents[$index][1]
                    : Str::slug($name, '.').'@student.dubes.ac.id';

                $user = User::updateOrCreate(['email' => $email], [
                    'name' => $name,
                    'password' => $password,
                    'role' => User::ROLE_STUDENT,
                    'class_level' => $this->classLevelFor($definition['level']),
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

            $courseClass->students()->sync($studentUserIds);
        }
    }

    /** Level akun murid memakai label yang sama dengan halaman data pengguna. */
    private function classLevelFor(ClassLevel $level): string
    {
        return match ($level) {
            ClassLevel::Beginner => 'Beginner',
            ClassLevel::IntermediateLow => 'Low Intermediate',
            ClassLevel::Intermediate => 'Middle Intermediate',
            ClassLevel::Advanced, ClassLevel::IntermediateUp => 'Upper Intermediate',
        };
    }
}
