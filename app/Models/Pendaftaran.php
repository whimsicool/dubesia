<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pendaftaran extends Model
{
    public const STATUS_MENUNGGU = 'menunggu_verifikasi';
    public const STATUS_TERVERIFIKASI = 'terverifikasi';

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

    public const BIAYA = 250000;

    protected $fillable = [
        'user_id', 'nama_lengkap', 'tanggal_lahir', 'email', 'no_whatsapp',
        'alamat', 'program', 'pesan_motivasi', 'bukti_pembayaran', 'biaya',
        'status', 'catatan_verifikasi', 'verified_by', 'verified_at',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'verified_at'   => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}