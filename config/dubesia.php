<?php

return [
    /*
    | Jam operasional lembaga. Dipakai untuk menghitung persentase okupansi ruang.
    */
    'operating_hours' => [
        'start' => '07:00',
        'end' => '21:00',
    ],

    /*
    | Hari belajar yang ditampilkan di kalender (1 = Senin ... 6 = Sabtu).
    */
    'days' => [
        1 => 'Senin',
        2 => 'Selasa',
        3 => 'Rabu',
        4 => 'Kamis',
        5 => 'Jumat',
        6 => 'Sabtu',
    ],

    /*
    | Materi belajar (diunggah guru, tampil umum untuk semua murid).
    | Berkas disimpan di disk PRIVAT dan disajikan lewat route terotorisasi (bukan URL publik).
    | CATATAN: batas upload server juga ditentukan php.ini (upload_max_filesize, post_max_size)
    | dan web server (nginx: client_max_body_size) — samakan dengan max_upload_kb.
    */
    'materials' => [
        'disk' => 'local',
        'directory' => 'materials',
        'max_upload_kb' => 512000, // 500 MB — batas bawaan untuk semua jenis berkas
        // Batas khusus per jenis materi. Video dibatasi 50 MB untuk menghemat storage.
        'max_upload_kb_by_type' => [
            'video' => 51200, // 50 MB
        ],
        'levels' => ['Beginner', 'Intermediate low', 'Intermediate', 'Intermediate Up', 'Advanced'],
        'legacy_level_map' => [
            'A1' => 'Beginner',
            'A2' => 'Intermediate low',
            'B1' => 'Intermediate',
            'B2' => 'Intermediate Up',
            'C1' => 'Advanced',
            'C2' => 'Advanced',
        ],
        'mimes' => [
            'document' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'rtf', 'odt'],
            'slide' => ['pdf', 'ppt', 'pptx', 'odp'],
            'video' => ['mp4', 'webm', 'mov'],
            'audio' => ['mp3', 'wav', 'm4a', 'ogg'],
        ],
    ],
];
