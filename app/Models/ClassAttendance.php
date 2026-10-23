<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['student_id', 'tutor_id', 'class_level', 'attendance_date', 'status', 'notes'])]
class ClassAttendance extends Model
{
    public const STATUSES = ['Hadir', 'Izin', 'Sakit', 'Alpa'];

    protected $table = 'class_attendances';

    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }
}
