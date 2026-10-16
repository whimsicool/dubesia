<?php

namespace App\Models;

use App\Enums\MaterialType;
use App\Support\MediaEmbed;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Material extends Model
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';

    protected $fillable = [
        'user_id', 'type', 'title', 'description', 'body', 'topic', 'level', 'external_url',
        'file_path', 'file_name', 'file_mime', 'file_size',
        'duration_minutes', 'page_count', 'is_featured', 'status', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => MaterialType::class,
            'is_featured' => 'boolean',
            'file_size' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        // Hapus berkas fisik saat materi dihapus.
        static::deleting(fn (Material $material) => $material->deleteFile());
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function progresses(): HasMany
    {
        return $this->hasMany(MaterialProgress::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED;
    }

    public function hasFile(): bool
    {
        return filled($this->file_path);
    }

    public function isPdf(): bool
    {
        return $this->hasFile() && ($this->file_mime === 'application/pdf' || str_ends_with(strtolower((string) $this->file_name), '.pdf'));
    }

    public function disk(): \Illuminate\Contracts\Filesystem\Filesystem
    {
        return Storage::disk(config('dubesia.materials.disk'));
    }

    public function deleteFile(): void
    {
        if ($this->hasFile()) {
            $this->disk()->delete($this->file_path);
        }
    }

    /** URL embed untuk <iframe> (YouTube, Vimeo, Google Slides/Drive), atau null. */
    protected function embedUrl(): Attribute
    {
        return Attribute::get(fn () => MediaEmbed::from($this->external_url));
    }
}
