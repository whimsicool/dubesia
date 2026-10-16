<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function teachingClasses(): BelongsToMany
    {
        return $this->belongsToMany(
            CourseClass::class,
            'class_tutor',
            'tutor_id',
            'class_id'
        );
    }

    public function enrolledClasses(): BelongsToMany
    {
        return $this->belongsToMany(
            CourseClass::class,
            'class_student',
            'student_id',
            'class_id'
        );
    }

    public function grades(): HasMany
    {
        return $this->hasMany(StudentGrade::class, 'student_id');
    }

}
