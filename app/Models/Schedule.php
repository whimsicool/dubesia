<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    protected $fillable = [
        'semester_id', 'program_id', 'class_id', 'instructor_id', 'room_id',
        'title', 'class_name', 'day_of_week', 'scheduled_date', 'start_time', 'end_time', 'notes',
    ];

    protected function casts(): array
    {
        return ['day_of_week' => 'integer', 'scheduled_date' => 'date:Y-m-d'];
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class)->withTimestamps();
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Jadwal yang jamnya beririsan dengan [$start, $end). Format jam wajib "H:i:s".
     * Jadwal beruntun (selesai 10:00, mulai 10:00) TIDAK dianggap bentrok.
     */
    public function scopeOverlapping(Builder $query, string $start, string $end): Builder
    {
        return $query->where('start_time', '<', $end)->where('end_time', '>', $start);
    }
}
