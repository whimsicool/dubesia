<?php

namespace Database\Seeders;

use App\Models\ClassGroup;
use App\Models\Instructor;
use App\Models\Schedule;
use Illuminate\Database\Seeder;

/** Membuat kelas dari jadwal contoh (ScheduleSeeder harus dijalankan lebih dulu). */
class ClassGroupSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            'Diplomatic Speech Batch #4' => ['C1', 'Retorika bilateral, pidato delegasi, dan argumentasi persuasif tingkat lanjut.'],
            'Protocol Batch #2' => ['B2', 'Tata cara protokol dan etiket diplomatik untuk acara resmi.'],
            'Executive Batch #3' => ['C1', 'Kefasihan berbahasa Inggris untuk eksekutif dan rapat internasional.'],
            'IELTS Batch #7' => ['B2', 'Persiapan IELTS Academic: reading, listening, writing, speaking.'],
            'HSK Batch #2' => ['A2', 'Mandarin HSK tingkat dasar-menengah.'],
            'Business Batch #5' => ['B2', 'Negosiasi dan komunikasi bisnis global.'],
            'TOEFL Weekend Batch #1' => ['B1', 'Program intensif TOEFL ITP akhir pekan.'],
        ];

        foreach (Schedule::with('students:id')->whereNotNull('class_name')->get() as $schedule) {
            [$level, $desc] = $levels[$schedule->class_name] ?? ['B1', null];

            $class = ClassGroup::updateOrCreate(
                ['name' => $schedule->class_name],
                ['level' => $level, 'description' => $desc, 'tutor_id' => $schedule->instructor_id, 'capacity' => 25, 'is_active' => true],
            );

            // Anggota kelas = murid yang terdaftar pada jadwal kelas tersebut.
            $class->students()->syncWithoutDetaching($schedule->students->pluck('id')->all());
            $schedule->update(['class_group_id' => $class->id]);
        }

        // Contoh kelas tanpa anggota/jadwal (bisa dihapus) dan satu kelas nonaktif.
        $tutor = Instructor::orderBy('id')->first();

        ClassGroup::updateOrCreate(
            ['name' => 'Beginner Conversation Batch #1'],
            ['level' => 'A1', 'description' => 'Percakapan dasar untuk pemula.', 'tutor_id' => $tutor?->id, 'capacity' => 15, 'is_active' => true],
        );
        ClassGroup::updateOrCreate(
            ['name' => 'Diplomatic Speech Batch #3 (Selesai)'],
            ['level' => 'C1', 'description' => 'Batch sebelumnya, sudah selesai.', 'tutor_id' => $tutor?->id, 'capacity' => 20, 'is_active' => false],
        );
    }
}
