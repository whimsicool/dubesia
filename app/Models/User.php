<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'username', 'is_active', 'no_hp', 'status_akun', 'class_level', 'photo_path'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /**
     * Level kelas yang sama dengan keluaran HasilTes::tentukanLevelKelas.
     * Dipakai sebagai pilihan filter presensi tutor.
     */
    public const CLASS_LEVELS = ['Beginner', 'Low Intermediate', 'Middle Intermediate', 'Upper Intermediate'];

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Nilai bawaan yang sama dengan default kolom database. Tanpa ini, model
     * yang baru dibuat tanpa atribut is_active terbaca tidak aktif di memori.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
    ];

    protected $appends = ['avatar_url'];

    public function classAttendancesAsStudent(): HasMany
    {
        return $this->hasMany(ClassAttendance::class, 'student_id');
    }

    public function classAttendancesAsTutor(): HasMany
    {
        return $this->hasMany(ClassAttendance::class, 'tutor_id');
    }

    public const ROLE_ADMIN = 'admin';

    public const ROLE_TUTOR = 'tutor';

    public const ROLE_STUDENT = 'student';

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Grades belonging to this student.
     */
    public function grades(): HasMany
    {
        return $this->hasMany(StudentGrade::class, 'student_id');
    }

    /**
     * Feedback submitted by this student.
     */
    public function feedbackEntries(): HasMany
    {
        return $this->hasMany(StudentFeedback::class, 'student_id');
    }

    /**
     * Classes taught by this tutor.
     */
    public function teachingClasses(): BelongsToMany
    {
        return $this->belongsToMany(
            CourseClass::class,
            'class_tutor',
            'tutor_id',
            'class_id'
        )->withTimestamps();
    }

    /**
     * Registration a student submitted before verification.
     */
    public function pendaftaran(): HasOne
    {
        return $this->hasOne(Pendaftaran::class);
    }

    /** Use the registration WhatsApp value for older student accounts without no_hp. */
    public function getNoHpAttribute($value): ?string
    {
        if (filled($value)) {
            return $value;
        }

        $whatsapp = $this->pendaftaran?->no_whatsapp;

        return filled($whatsapp) ? '+'.$whatsapp : null;
    }

    /**
     * Classes in which this student is enrolled.
     */
    public function enrolledClasses(): BelongsToMany
    {
        return $this->belongsToMany(
            CourseClass::class,
            'class_student',
            'student_id',
            'class_id'
        )->withTimestamps();
    }

    public function isTutor(): bool
    {
        return $this->role === self::ROLE_TUTOR;
    }

    public function isStudent(): bool
    {
        return $this->role === self::ROLE_STUDENT;
    }

    /** Tutor dapat mengunggah / mengelola materi. */
    public function canManageMaterials(): bool
    {
        return $this->isTutor();
    }

    /**
     * Calon murid yang pendaftarannya belum disetujui admin. Selama statusnya
     * belum terverifikasi, akun ini hanya boleh memakai alur registrasi dan
     * pembayaran. Akun tanpa baris pendaftaran (admin, tutor, murid lama) tidak
     * termasuk.
     */
    public function pendaftaranBelumTerverifikasi(): bool
    {
        $status = $this->pendaftaran?->status;

        return $status !== null && $status !== Pendaftaran::STATUS_TERVERIFIKASI;
    }

    /**
     * Calon murid yang masih boleh membuka halaman pembayaran atau formulir
     * perbaikan lewat tautan bertanda tangan dari email.
     */
    public function bisaMelanjutkanPendaftaran(): bool
    {
        return $this->isStudent()
            && $this->status_akun !== 'nonaktif'
            && in_array($this->pendaftaran?->status, [
                Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN,
                Pendaftaran::STATUS_DITOLAK,
            ], true);
    }

    /**
     * Akun yang boleh meminta kata sandi baru lewat formulir lupa kata sandi.
     * Pendaftar yang belum disetujui admin memakai tautan lanjutan, bukan kata
     * sandi. Kolom email_verified_at tidak dipakai karena aplikasi ini tidak
     * mengirim email verifikasi.
     */
    public function bolehMintaKataSandiBaru(): bool
    {
        return $this->is_active
            && $this->status_akun !== 'nonaktif'
            && ! $this->pendaftaranBelumTerverifikasi();
    }

    /**
     * Hasil tes milik user ini.
     */
    public function hasilTes(): HasMany
    {
        return $this->hasMany(HasilTes::class, 'id_murid', 'id');
    }

    /**
     * URL foto profil. Null berarti tampilkan inisial nama.
     * Memakai path relatif agar tetap benar di host dan port mana pun.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return filled($this->photo_path)
            ? '/storage/'.ltrim($this->photo_path, '/')
            : null;
    }

    /**
     * Inisial nama untuk avatar. Gelar (Dr., Prof., Ir.) diabaikan: "Dr. Kevin Kusuma, M.A." => "KK".
     */
    public function getInitialsAttribute(): string
    {
        $name = preg_replace('/^(dr|prof|ir|drs)\.?\s+/i', '', trim($this->name));
        $words = preg_split('/\s+/', $name, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return collect($words)
            ->take(2)
            ->map(fn (string $word): string => mb_strtoupper(mb_substr($word, 0, 1)))
            ->implode('');
    }

    /**
     * Kata sandi default akun tutor baru: dbs.{nama}.{tahun}.
     */
    public static function generateDefaultPassword(string $name): string
    {
        $cleanName = strtolower(preg_replace('/[^a-zA-Z]/', '', explode(' ', trim($name))[0]));

        return 'dbs.'.$cleanName.'.'.date('Y');
    }
}
