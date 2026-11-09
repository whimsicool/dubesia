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
        'general_english' => 'General English',
        'academic_english' => 'Academic English',
        'public_speaking' => 'Public Speaking',
        'esp' => 'ESP (English for Specific Purpose)',
        'toefl_preparation' => 'TOEFL Preparation',
    ];

    /** Labels retained for registrations submitted before the package change. */
    public const PROGRAMS_LAMA = [
        'reguler' => 'Reguler',
        'private' => 'Private',
        'employee' => 'Employee',
        'diplomatic_speech' => 'Diplomatic Speech & Rhetoric',
        'executive_english' => 'Executive English Fluency',
    ];

    public const PROGRAM_DESKRIPSI = [
        'general_english' => '30x pertemuan. Program menyeluruh untuk menguatkan kemampuan berbicara, menulis, membaca, dan mendengarkan.',
        'academic_english' => '20x pertemuan. Fokus pada kemampuan bahasa Inggris untuk kebutuhan akademik dan studi lanjut.',
        'public_speaking' => '20x pertemuan. Latihan berbicara di depan publik dengan teknik penyampaian dan kepercayaan diri.',
        'esp' => '20x pertemuan. Bahasa Inggris yang disesuaikan dengan kebutuhan bidang kerja atau profesi Anda.',
        'toefl_preparation' => '20x pertemuan. Persiapan tes TOEFL dengan latihan soal dan strategi mengerjakan setiap bagian.',
    ];

    public const JENIS_KELAS = [
        'regular' => 'Regular',
        'private' => 'Private',
        'intensive' => 'Intensive',
        'home_visit' => 'Home Visit',
    ];

    public const JENIS_KELAS_DESKRIPSI = [
        'regular' => 'Maksimal 15 orang. Kelas berkelompok dengan jadwal belajar tetap.',
        'private' => 'Satu murid bersama satu tutor. Pembelajaran privat dengan pendampingan yang lebih personal.',
        'intensive' => 'Maksimal 5 orang. Kelas intensif dengan pertemuan lebih sering dan latihan berbicara yang lebih banyak.',
        'home_visit' => 'Tutor datang ke rumah Anda. Belajar dengan jadwal dan lokasi yang lebih fleksibel.',
    ];

    public const BIAYA_DEFAULT = 1800000;

    public const BIAYA_PER_JENIS_KELAS = [
        'regular' => 1800000,
        'private' => 5000000,
        'intensive' => 10000000,
        'home_visit' => 7000000,
    ];

    public const REKENING = [
        ['bank' => 'Bank Mandiri', 'nomor' => '137-00-1982736-4', 'atas_nama' => 'Yayasan Duta Bahasa Edukasi'],
        ['bank' => 'Bank Central Asia (BCA)', 'nomor' => '542-098-1120', 'atas_nama' => 'Yayasan Duta Bahasa Edukasi'],
    ];

    protected $fillable = [
        'user_id', 'nama_lengkap', 'tanggal_lahir', 'email', 'no_whatsapp',
        'alamat', 'asal_institusi', 'program', 'jenis_kelas', 'pesan_motivasi',
        'bukti_pembayaran', 'biaya', 'status', 'catatan_verifikasi', 'verified_by',
        'verified_at', 'resubmitted_at',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'verified_at' => 'datetime',
        'resubmitted_at' => 'datetime',
    ];

    public static function biayaUntukJenisKelas(?string $jenisKelas): int
    {
        return self::BIAYA_PER_JENIS_KELAS[$jenisKelas] ?? self::BIAYA_DEFAULT;
    }

    public static function labelProgram(?string $program): string
    {
        return self::PROGRAMS[$program] ?? self::PROGRAMS_LAMA[$program] ?? ($program ?: '-');
    }

    public static function labelJenisKelas(?string $jenisKelas): string
    {
        return self::JENIS_KELAS[$jenisKelas] ?? '-';
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
