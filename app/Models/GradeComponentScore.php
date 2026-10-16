<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeComponentScore extends Model
{
    protected $fillable = [
        'student_grade_id',
        'grade_component_id',
        'score',
        'feedback',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
        ];
    }

    public function studentGrade(): BelongsTo
    {
        return $this->belongsTo(
            StudentGrade::class,
            'student_grade_id'
        );
    }

    public function gradeComponent(): BelongsTo
    {
        return $this->belongsTo(
            GradeComponent::class,
            'grade_component_id'
        );
    }
}