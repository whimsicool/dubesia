<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Room */
class RoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'location' => $this->location,
            'platform' => $this->platform,
            'capacity' => $this->capacity,
            'is_active' => $this->is_active,
            'schedules_count' => $this->whenHas('schedules_count'),
            'created_at' => $this->created_at?->toDateString(),
        ];
    }
}
