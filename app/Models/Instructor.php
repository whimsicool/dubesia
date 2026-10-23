<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Instructor extends Model
{
    protected $fillable = ['user_id', 'name', 'email', 'phone', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    /** Inisial 2 huruf, gelar (Dr., Prof., Ir.) diabaikan: "Dr. Kevin Kusuma" => "KK". */
    protected function initials(): Attribute
    {
        return Attribute::get(function () {
            $name = preg_replace('/^(dr|prof|ir|drs)\.?\s+/i', '', trim($this->name));
            $parts = preg_split('/\s+/', $name, -1, PREG_SPLIT_NO_EMPTY) ?: [];

            return mb_strtoupper(
                collect($parts)->take(2)->map(fn ($p) => mb_substr($p, 0, 1))->implode('')
            );
        });
    }
}
