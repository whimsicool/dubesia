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
        'max_upload_kb' => 512000, // 500 MB
        'levels' => ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        'mimes' => [
            'document' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'rtf', 'odt'],
            'slide' => ['pdf', 'ppt', 'pptx', 'odp'],
            'video' => ['mp4', 'webm', 'mov'],
            'audio' => ['mp3', 'wav', 'm4a', 'ogg'],
        ],
    ],
];
