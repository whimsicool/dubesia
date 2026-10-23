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

#[Fillable(['name', 'email', 'password','role','username','role','is_active',])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */

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
}
