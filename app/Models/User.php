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

#[Fillable(['name', 'email', 'password', 'role', 'username', 'is_active', 'no_hp', 'nip', 'status_akun', 'class_level'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    public const CLASS_LEVELS = ['Beginner', 'Intermediate', 'Advance'];

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

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
     * Hasil tes milik user ini.
     */
    public function hasilTes(): HasMany
    {
        return $this->hasMany(HasilTes::class, 'id_murid', 'id');
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
