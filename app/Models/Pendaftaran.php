<?php

namespace App\Models;

use Database\Factories\PendaftaranFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class Pendaftaran extends Model
{
    /** @use HasFactory<PendaftaranFactory> */
    use HasFactory;

    /** Calon murid sudah membuat akun tetapi belum mengunggah bukti pembayaran. */
    public const STATUS_MENUNGGU_PEMBAYARAN = 'menunggu_pembayaran';

    public const STATUS_MENUNGGU = 'menunggu_verifikasi';

    public const STATUS_TERVERIFIKASI = 'terverifikasi';

    public const STATUS_DITOLAK = 'ditolak';

    public const STATUS_LABEL = [
        self::STATUS_MENUNGGU_PEMBAYARAN => 'Menunggu Pembayaran',
        self::STATUS_MENUNGGU => 'Menunggu Verifikasi',
        self::STATUS_TERVERIFIKASI => 'Terverifikasi',
        self::STATUS_DITOLAK => 'Ditolak',
    ];

    /** Status yang tampil di portal admin. Pembayaran dikelola tanpa status terpisah. */
    public const ADMIN_STATUS_LABEL = [
        self::STATUS_MENUNGGU => 'Menunggu Verifikasi',
        self::STATUS_TERVERIFIKASI => 'Terverifikasi',
        self::STATUS_DITOLAK => 'Ditolak',
    ];

    public const PROGRAMS = [
        'reguler' => 'Reguler',
        'private' => 'Private',
        'employee' => 'Employee',
    ];

    /** Labels retained for registrations submitted before the package change. */
    public const PROGRAMS_LAMA = [
        'diplomatic_speech' => 'Diplomatic Speech & Rhetoric',
        'executive_english' => 'Executive English Fluency',
    ];

    public const PROGRAM_DESKRIPSI = [
        'reguler' => 'Kelas reguler mengikuti jadwal belajar yang tersedia.',
        'private' => 'Pembelajaran privat dengan pendampingan yang lebih personal.',
        'employee' => 'Program untuk karyawan dengan jadwal yang lebih fleksibel.',
    ];

    public const BIAYA_DEFAULT = 1000000;

    public const BIAYA_PER_PROGRAM = [
        'reguler' => 1000000,
        'private' => 1500000,
        'employee' => 1700000,
    ];

    public const REKENING = [
        ['bank' => 'Bank Mandiri', 'nomor' => '137-00-1982736-4', 'atas_nama' => 'Yayasan Duta Bahasa Edukasi'],
        ['bank' => 'Bank Central Asia (BCA)', 'nomor' => '542-098-1120', 'atas_nama' => 'Yayasan Duta Bahasa Edukasi'],
    ];

    protected $fillable = [
        'user_id', 'nama_lengkap', 'tanggal_lahir', 'email', 'no_whatsapp',
        'alamat', 'asal_institusi', 'program', 'pesan_motivasi',
        'bukti_pembayaran', 'biaya', 'status', 'catatan_verifikasi', 'verified_by',
        'verified_at', 'resubmitted_at',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'verified_at' => 'datetime',
        'resubmitted_at' => 'datetime',
    ];

    public static function biayaUntuk(string $program): int
    {
        return self::BIAYA_PER_PROGRAM[$program] ?? self::BIAYA_DEFAULT;
    }

    public static function labelProgram(?string $program): string
    {
        return self::PROGRAMS[$program] ?? self::PROGRAMS_LAMA[$program] ?? ($program ?: '-');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifikator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function hasBuktiPembayaran(): bool
    {
        return filled($this->bukti_pembayaran);
    }

    /**
     * Tautan bertanda tangan untuk membuka kembali pembayaran atau formulir
     * perbaikan tanpa sesi dan tanpa kata sandi.
     */
    public function tautanLanjutan(int $masaBerlakuHari = 7): string
    {
        return URL::temporarySignedRoute(
            'pendaftaran.lanjutkan',
            now()->addDays($masaBerlakuHari),
            ['user' => $this->user_id],
        );
    }

    public function getBuktiUrlAttribute(): ?string
    {
        if (! $this->hasBuktiPembayaran()) {
            return null;
        }

        return Storage::disk('public')->url($this->bukti_pembayaran);
    }

    public function getBuktiIsPdfAttribute(): bool
    {
        if (! $this->hasBuktiPembayaran()) {
            return false;
        }

        return strtolower(pathinfo($this->bukti_pembayaran, PATHINFO_EXTENSION)) === 'pdf';
    }
}
