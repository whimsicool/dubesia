<?php

namespace App\Http\Resources;

use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Schedule */
class ScheduleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'class_id' => $this->class_id,
            'class_name' => $this->class_name,
            'day_of_week' => (int) $this->day_of_week,
            'scheduled_date' => $this->scheduled_date?->toDateString(),
            'start_time' => substr($this->start_time, 0, 5),
            'end_time' => substr($this->end_time, 0, 5),
            'notes' => $this->notes,
            'program' => $this->program ? [
                'id' => $this->program->id,
                'name' => $this->program->name,
                'category' => $this->program->category->value,
            ] : null,
            'instructor' => [
                'id' => $this->instructor->id,
                'user_id' => $this->instructor->user_id,
                'name' => $this->instructor->name,
                'initials' => $this->instructor->initials,
            ],
            'room' => [
                'id' => $this->room->id,
                'name' => $this->room->name,
                'type' => $this->room->type->value,
                'platform' => $this->room->platform,
                'capacity' => $this->room->capacity,
            ],
            'participants' => $this->students->count(),
            'student_ids' => $this->students->pluck('id')->values(),
            // Id akun murid untuk memilih ulang peserta di formulir.
            'student_user_ids' => $this->students->pluck('user_id')->filter()->values(),
        ];
    }
}
