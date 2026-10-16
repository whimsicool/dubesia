<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role'])]
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
        ];
    }
     public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isTutor(): bool
    {
        return $this->role === self::ROLE_TUTOR;
    }

    /** Alias kompatibilitas untuk akun dengan role lama `teacher`. */
    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role === self::ROLE_STUDENT;
    }

    /** Guru dan admin boleh mengunggah / mengelola materi. */
    public function canManageMaterials(): bool
    {
        return $this->isAdmin() || $this->isTutor() || $this->isTeacher();
    }
}
