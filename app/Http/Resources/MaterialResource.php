<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Number;

/** @mixin \App\Models\Material */
class MaterialResource extends JsonResource
{
    private bool $includeBody = false;

    /** Sertakan isi teks (body) — hanya untuk satu materi yang sedang dibuka / diedit. */
    public function withBody(): static
    {
        $this->includeBody = true;

        return $this;
    }

    public function toArray(Request $request): array
    {
        $progress = $this->resource->relationLoaded('progresses') ? $this->progresses->first() : null;

        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'title' => $this->title,
            'description' => $this->description,
            'topic' => $this->topic,
            'level' => $this->level,
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'is_new' => (bool) $this->published_at?->gt(now()->subDays(7)),
            'published_at' => $this->published_at?->toDateString(),
            'created_at' => $this->created_at?->toDateString(),

            'external_url' => $this->external_url,
            'embed_url' => $this->embed_url,
            'external_host' => $this->external_url ? preg_replace('/^www\./', '', (string) parse_url($this->external_url, PHP_URL_HOST)) : null,

            'file' => $this->hasFile() ? [
                'name' => $this->file_name,
                'size' => $this->file_size,
                'size_label' => Number::fileSize((int) $this->file_size, 1),
                'mime' => $this->file_mime,
                'is_pdf' => $this->isPdf(),
                'url' => route('materials.file', $this->id),
                'download_url' => route('materials.download', $this->id),
            ] : null,

            'duration_minutes' => $this->duration_minutes,
            'page_count' => $this->page_count,
            'uploader' => $this->whenLoaded('uploader', fn () => ['id' => $this->uploader?->id, 'name' => $this->uploader?->name]),

            // Progres belajar user yang sedang login: null | 'opened' | 'completed'
            'progress_status' => $progress?->status,

            // Statistik untuk halaman kelola (hanya bila withCount dipakai)
            'opened_count' => $this->whenHas('opened_count'),
            'completed_count' => $this->whenHas('completed_count'),

            'can_edit' => Gate::allows('update', $this->resource),

            'body' => $this->when($this->includeBody, $this->body),
        ];
    }
}
