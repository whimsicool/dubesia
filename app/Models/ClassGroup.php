<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** "Kelas" (kelompok belajar) — memiliki tutor, level, dan daftar murid anggota. */
class ClassGroup extends Model
{
    protected $fillable = ['name', 'level', 'description', 'tutor_id', 'capacity', 'is_active'];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class, 'tutor_id');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'class_group_student')->withTimestamps();
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function isFull(): bool
    {
        return $this->capacity !== null && $this->students()->count() >= $this->capacity;
    }
}
