<?php

namespace App\Models;

use App\Enums\RoomType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = ['name', 'type', 'location', 'platform', 'capacity', 'is_active'];

    protected function casts(): array
    {
        return [
            'type' => RoomType::class,
            'capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function isOnline(): bool
    {
        return $this->type === RoomType::Online;
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}
