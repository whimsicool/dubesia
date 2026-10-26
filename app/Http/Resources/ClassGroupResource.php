<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ClassGroup */
class ClassGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $levels = config('dubesia.class_levels');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'level' => $this->level,
            'level_label' => $levels[$this->level] ?? $this->level,
            'description' => $this->description,
            'capacity' => $this->capacity,
            'is_active' => $this->is_active,
            'tutor' => $this->tutor ? [
                'id' => $this->tutor->id,
                'name' => $this->tutor->name,
                'initials' => $this->tutor->initials,
            ] : null,
            // Tersedia bila query memakai withCount(['students', 'schedules'])
            'students_count' => $this->whenHas('students_count'),
            'schedules_count' => $this->whenHas('schedules_count'),
            'created_at' => $this->created_at?->toDateString(),
        ];
    }
}
