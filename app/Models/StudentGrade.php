<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentGrade extends Model
{
    protected $fillable = [
        'student_id',
        'class_id',
        'subject',
        'score',
        'grade',
        'feedback',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function courseClass(): BelongsTo
    {
        return $this->belongsTo(CourseClass::class, 'class_id');
    }

    public function componentScores(): HasMany
    {
        return $this->hasMany(
            GradeComponentScore::class,
            'student_grade_id'
        );
    }
}