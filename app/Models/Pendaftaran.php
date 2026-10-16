<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Pendaftaran extends Model
{
    public const STATUS_MENUNGGU = 'menunggu_verifikasi';

    public const STATUS_TERVERIFIKASI = 'terverifikasi';
    public const STATUS_DITOLAK = 'ditolak';

    public const STATUS_LABEL = [
        self::STATUS_MENUNGGU => 'Menunggu Verifikasi',
        self::STATUS_TERVERIFIKASI => 'Terverifikasi',
        self::STATUS_DITOLAK => 'Ditolak',
    ];

    public const PROGRAMS = [
        'reguler' => 'Reguler',
        'private' => 'Private',
        'pekerja' => 'Pekerja',
    ];

    public const PROGRAM_DESKRIPSI = [
        'reguler' => 'Program kursus reguler',
        'private' => 'Program kursus privat',
        'pekerja' => 'Program kursus untuk pekerja',
    ];

    public const BIAYA_PER_PROGRAM = [
        'reguler' => 1_500_000,
        'private' => 1_600_000,
        'pekerja' => 1_700_000,
    ];

    protected $fillable = [
        'user_id', 'nama_lengkap', 'tanggal_lahir', 'email', 'no_whatsapp',
        'alamat', 'program', 'pesan_motivasi', 'bukti_pembayaran', 'biaya',
        'status', 'catatan_verifikasi', 'verified_by', 'verified_at',
        'bagian_perbaikan',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'verified_at' => 'datetime',
        'bagian_perbaikan' => 'array',
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
        return Storage::disk('public')->url($this->bukti_pembayaran);
    }

    public function getBuktiIsPdfAttribute(): bool
    {
        return strtolower(pathinfo($this->bukti_pembayaran, PATHINFO_EXTENSION)) === 'pdf';
    }
}
