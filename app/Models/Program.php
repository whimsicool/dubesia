<?php

namespace App\Models;

use App\Enums\ProgramCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    protected $fillable = ['code', 'name', 'category', 'is_active'];

    protected function casts(): array
    {
        return [
            'category' => ProgramCategory::class,
            'is_active' => 'boolean',
        ];
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}
