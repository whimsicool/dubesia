<?php

namespace Database\Seeders;

use App\Enums\MaterialType;
use App\Models\Material;
use App\Models\User;
use Illuminate\Database\Seeder;

class MaterialSeeder extends Seeder
{
    /** Sebelas materi: sepuluh terbit untuk pustaka murid dan satu draf. */
    public function run(): void
    {
        $tutors = User::where('role', User::ROLE_TUTOR)->orderBy('id')->get();

        if ($tutors->isEmpty()) {
            return;
        }

        $article = <<<'MD'
# Framework Komunikasi Diplomatik

Diplomasi modern bertumpu pada **bahasa yang presisi** dan sikap yang menghormati lawan bicara.

## Prinsip utama
- Pisahkan *orang* dari *masalah* yang sedang dibahas.
- Fokus pada kepentingan, bukan posisi.
- Siapkan opsi yang saling menguntungkan sebelum bernegosiasi.

## Latihan mandiri
1. Tulis pembuka pidato berdurasi tiga menit.
2. Ganti kata yang konfrontatif dengan diksi netral.
3. Rekam dan dengarkan kembali intonasi Anda.
MD;

        // type, title, description, topic, level, extras
        $materials = [
            [
                MaterialType::Article,
                'Menyusun Opening Statement dalam Sidang Bilateral',
                'Panduan menyusun pembuka pidato diplomatik, lengkap dengan contoh frasa dan latihan mandiri.',
                'Diplomatic Speech',
                'Advanced',
                ['body' => $article, 'is_featured' => true],
            ],
            [
                MaterialType::Video,
                'Workshop Intonasi: Jeda Retoris dan Tekanan Kata',
                'Rekaman kelas tentang ritme bicara, jeda retoris, dan cara menekankan kata kunci.',
                'Public Speaking',
                'Intermediate Up',
                ['external_url' => 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'duration_minutes' => 42],
            ],
            [
                MaterialType::Link,
                'United Nations Protocol and Liaison Service',
                'Rujukan resmi tata cara protokol dan etiket diplomatik internasional.',
                'Protocol',
                'Intermediate Up',
                ['external_url' => 'https://www.un.org/en/'],
            ],
            [
                MaterialType::Article,
                'Etiket Jamuan Resmi dan Urutan Sambutan',
                'Tata letak tempat duduk, urutan sambutan, dan bahasa yang tepat pada jamuan kenegaraan.',
                'Protocol',
                'Advanced',
                ['body' => "# Etiket Jamuan Resmi\n\nTamu kehormatan duduk di sisi kanan tuan rumah.\n\n- Sambutan dibuka oleh tuan rumah.\n- Toast disampaikan setelah hidangan pembuka.\n- Hindari topik politik praktis selama jamuan."],
            ],
            [
                MaterialType::Slide,
                'Struktur Presentasi Bisnis dalam Sepuluh Slide',
                'Kerangka presentasi penawaran: masalah, solusi, bukti, dan penutup yang berorientasi keputusan.',
                'Business English',
                'Intermediate',
                ['external_url' => 'https://docs.google.com/presentation/d/1example-slide-id/edit', 'page_count' => 10],
            ],
            [
                MaterialType::Video,
                'Latihan Listening: Wawancara Kerja Bahasa Inggris',
                'Percakapan wawancara kerja dengan pertanyaan umum dan pembahasan jawaban yang efektif.',
                'Interview Preparation',
                'Intermediate low',
                ['external_url' => 'https://www.youtube.com/watch?v=1UWpbtUupQQ', 'duration_minutes' => 28],
            ],
            [
                MaterialType::Article,
                'Menulis Surel Bisnis yang Ringkas',
                'Pola surel bisnis: subjek jelas, satu tujuan per paragraf, dan penutup dengan langkah lanjutan.',
                'Business Writing',
                'Intermediate Up',
                ['body' => "# Surel Bisnis yang Ringkas\n\n## Struktur\n1. Subjek: tujuan + tenggat.\n2. Paragraf pembuka: konteks satu kalimat.\n3. Isi: permintaan atau informasi utama.\n4. Penutup: langkah lanjutan yang jelas.\n\n> Hindari kalimat pembuka basi seperti \"We are writing to inform you that\"."],
            ],
            [
                MaterialType::Video,
                'Pronunciation: Connected Speech dan Word Stress',
                'Latihan menyambung kata dan menempatkan tekanan suku kata agar terdengar lebih alami.',
                'Pronunciation & Accent',
                'Intermediate low',
                ['external_url' => 'https://www.youtube.com/watch?v=6Y4cGqvPApo', 'duration_minutes' => 35],
            ],
            [
                MaterialType::Article,
                'Grammar: Tenses yang Sering Salah dalam Percakapan',
                'Ringkasan present perfect, past tense, dan future form beserta contoh kalimat sehari-hari.',
                'Grammar & Accuracy',
                'Beginner',
                ['body' => "# Tenses dalam Percakapan\n\n## Tiga kesalahan umum\n1. **Present perfect** untuk kejadian yang masih berlangsung.\n2. **Past tense** untuk kejadian selesai dengan waktu jelas.\n3. **Future** memakai *will* dan *going to* sesuai niat.\n\n## Latihan\nUbah lima kalimat harian ke bentuk yang tepat."],
            ],
            [
                MaterialType::Article,
                'Catatan Riset: Negosiasi Lintas Budaya',
                'Draf catatan riset tentang perbedaan gaya negosiasi di Asia Tenggara dan Eropa Barat.',
                'Business English',
                'Advanced',
                ['body' => '# Catatan Riset (draf)\n\nPerbedaan gaya negosiasi:\n\n- Konteks tinggi: pesan disampaikan secara tidak langsung.\n- Konteks rendah: kesepakatan ditulis eksplisit.\n\nCatatan ini belum selesai.', 'status' => Material::STATUS_DRAFT],
            ],
            [
                MaterialType::Article,
                'Latihan Percakapan: Membuka dan Menutup Diskusi',
                'Frasa untuk memulai diskusi kelompok, menyampaikan pendapat, dan merangkum hasil.',
                'Conversation & Fluency',
                'Beginner',
                ['body' => "# Membuka dan Menutup Diskusi\n\n## Membuka\n- Shall we start with the first point?\n- Let's hear from everyone before we decide.\n\n## Menutup\n- To sum up, we agreed on three steps.\n- Let's continue this next week."],
            ],
        ];

        foreach ($materials as $index => [$type, $title, $description, $topic, $level, $extra]) {
            Material::updateOrCreate(
                ['title' => $title],
                array_merge([
                    'user_id' => $tutors[$index % $tutors->count()]->id,
                    'type' => $type,
                    'description' => $description,
                    'topic' => $topic,
                    'level' => $level,
                    'status' => Material::STATUS_PUBLISHED,
                    'published_at' => now()->subDays(12 - $index),
                ], $extra),
            );
        }
    }
}
