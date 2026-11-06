<?php

namespace Database\Seeders;

use App\Models\StudentFeedback;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentFeedbackSeeder extends Seeder
{
    /**
     * Seed sepuluh masukan dari murid demo.
     */
    public function run(): void
    {
        $murids = User::where('role', User::ROLE_STUDENT)
            ->where('is_active', true)
            ->orderBy('id')
            ->limit(10)
            ->get();

        $masukan = [
            ['Materi Kelas', 'Materi minggu ini mudah diikuti, contoh kalimatnya membantu.'],
            ['Jadwal Belajar', 'Mohon tambah sesi latihan berbicara di akhir pekan.'],
            ['Tutor', 'Penjelasan tutor tentang intonasi sangat jelas.'],
            ['Fasilitas', 'Ruang kelas daring sudah nyaman, audio jernih.'],
            ['Penilaian', 'Mohon beri umpan balik tertulis untuk tugas harian.'],
            ['Materi Kelas', 'Latihan mendengarkan perlu ditambah durasinya.'],
            ['Jadwal Belajar', 'Jam mulai pukul 08.30 sudah pas untuk saya.'],
            ['Tutor', 'Saran perbaikan pelafalan sangat membantu.'],
            ['Fasilitas', 'Materi video kadang lambat dimuat.'],
            ['Penilaian', 'Nilai komponen sudah transparan, terima kasih.'],
        ];

        foreach ($murids as $index => $murid) {
            [$subject, $message] = $masukan[$index];

            StudentFeedback::updateOrCreate(
                ['student_id' => $murid->id, 'subject' => $subject],
                ['message' => $message],
            );
        }
    }
}
