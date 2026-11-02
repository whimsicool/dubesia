<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\User;
use Illuminate\Database\Seeder;

class MaterialSeeder extends Seeder
{
    public function run(): void
    {
        $tutor = User::updateOrCreate(
            ['email' => 'tutor@dubesia.test'],
            ['name' => 'Dr. Kevin Kusuma, M.A.', 'password' => 'password', 'role' => User::ROLE_TUTOR, 'email_verified_at' => now()],
        );

        User::updateOrCreate(
            ['email' => 'student@dubesia.test'],
            ['name' => 'Ahmad Rizky Pratama', 'password' => 'password', 'role' => User::ROLE_STUDENT, 'email_verified_at' => now()],
        );

        $article = <<<'MD'
# Framework Komunikasi Diplomatik

Diplomasi modern bertumpu pada **bahasa yang presisi** dan sikap yang menghormati lawan bicara.

## Prinsip utama
- Pisahkan *orang* dari *masalah* yang sedang dibahas.
- Fokus pada kepentingan (interests), bukan posisi (positions).
- Siapkan opsi yang saling menguntungkan sebelum bernegosiasi.

> "Without prejudice to our sovereign claim" — frasa pembuka yang umum dipakai untuk menjaga posisi hukum.

## Latihan mandiri
1. Tulis pidato pembuka (opening statement) 3 menit.
2. Ganti kata yang konfrontatif dengan diksi netral.
3. Rekam dan dengarkan kembali intonasi Anda.

Referensi tambahan: [UN Protocol](https://www.un.org/en/)
MD;

        $rows = [
            ['article', 'Framework Komunikasi & Argumentasi Diplomatik', 'Panduan sistematis merancang posisi tawar dalam negosiasi bilateral, lengkap dengan latihan mandiri.', 'Advanced', ['body' => $article, 'is_featured' => true]],
            ['video', 'Workshop: Tone of Voice & Rhetorical Pauses', 'Rekaman masterclass tentang intonasi persuasif, ritme vokal, dan jeda retoris dalam pidato.', 'Intermediate Up', ['external_url' => 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'duration_minutes' => 42]],
            ['link', 'United Nations — Protocol and Liaison Service', 'Sumber resmi tata cara protokol dan etiket diplomatik internasional.', 'Intermediate Up', ['external_url' => 'https://www.un.org/en/']],
            ['article', 'Etiket Jamuan Resmi (State Banquet)', 'Tata letak tempat duduk, urutan sambutan, dan bahasa yang tepat pada jamuan kenegaraan.', 'Advanced', ['body' => "# Etiket Jamuan Resmi\n\nTamu kehormatan duduk di sisi kanan tuan rumah.\n\n- Sambutan dimulai oleh tuan rumah.\n- Toast dilakukan setelah hidangan pembuka."]],
            ['article', 'Draft: Studi Kasus Krisis Komunikasi (belum terbit)', 'Masih dalam penyusunan.', 'Advanced', ['body' => 'Draft materi.', 'status' => 'draft']],
        ];

        foreach ($rows as [$type, $title, $desc, $level, $extra]) {
            Material::updateOrCreate(
                ['title' => $title],
                array_merge([
                    'user_id' => $tutor->id,
                    'type' => $type,
                    'description' => $desc,
                    'topic' => null,
                    'level' => $level,
                    'status' => 'published',
                    'published_at' => now()->subDays(rand(0, 12)),
                ], $extra),
            );
        }
    }
}
