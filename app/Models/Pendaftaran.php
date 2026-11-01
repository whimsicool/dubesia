<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pendaftaran extends Model
{
    public const STATUS_MENUNGGU = 'menunggu_verifikasi';
    public const STATUS_TERVERIFIKASI = 'terverifikasi';
    public const STATUS_DITOLAK = 'ditolak';
    
    public const STATUS_LABEL = [
    self::STATUS_MENUNGGU      => 'Menunggu Verifikasi',
    self::STATUS_TERVERIFIKASI => 'Terverifikasi',
    self::STATUS_DITOLAK       => 'Ditolak',
];
    public const PROGRAMS = [
        'diplomatic_speech' => 'Diplomatic Speech & Rhetoric',
        'toefl_ielts'       => 'TOEFL & IELTS Mastery',
        'executive_english' => 'Executive English Fluency',
        'mandarin_hsk'      => 'Mandarin HSK Comprehensive',
    ];

    public const PROGRAM_DESKRIPSI = [
        'diplomatic_speech' => 'Mastery pidato bilateral & etiket global',
        'toefl_ielts'       => 'Target band 7.5+ & beasiswa dunia',
        'executive_english' => 'Percakapan profesional & negosiasi',
        'mandarin_hsk'      => 'Aksara Hanzi, HSK 1 - 5 & bisnis',
    ];

    public const BIAYA_DEFAULT = 250000;

    public const BIAYA_PER_PROGRAM = [
        'diplomatic_speech' => 300000,
        'toefl_ielts' => 400000,
        'executive_english' => 350000,
        'mandarin_hsk' => 450000,
    ];

    public static function biayaUntuk(string $program): int
    {
        return self::BIAYA_PER_PROGRAM[$program] ?? self::BIAYA_DEFAULT;
    }

    protected $fillable = [
        'user_id', 'nama_lengkap', 'tanggal_lahir', 'email', 'no_whatsapp',
        'alamat', 'asal_institusi', 'program', 'pesan_motivasi', 'bukti_pembayaran', 'biaya',
        'status', 'catatan_verifikasi', 'verified_by', 'verified_at', 'resubmitted_at',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'verified_at'   => 'datetime',
        'resubmitted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function verifikator(): BelongsTo
    {
    return $this->belongsTo(User::class, 'verified_by');
    }

    public function getBuktiUrlAttribute(): string
    {
    return \Illuminate\Support\Facades\Storage::disk('public')->url($this->bukti_pembayaran);
    }
    public function getBuktiIsPdfAttribute(): bool
    {
    return strtolower(pathinfo($this->bukti_pembayaran, PATHINFO_EXTENSION)) === 'pdf';
    }
}
