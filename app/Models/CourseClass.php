<?php

namespace App\Models;

use App\Enums\ClassLevel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseClass extends Model
{
    protected $table = 'classes';

    protected $fillable = [
        'name',
        'level',
        'capacity',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'level' => ClassLevel::class,
            'capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class, 'class_id');
    }

    public function tutors(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'class_tutor',
            'class_id',
            'tutor_id'
        )->withTimestamps();
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'class_student',
            'class_id',
            'student_id'
        )->withTimestamps();
    }

    public function gradeComponents(): HasMany
    {
        return $this->hasMany(GradeComponent::class, 'class_id');
    }
}
