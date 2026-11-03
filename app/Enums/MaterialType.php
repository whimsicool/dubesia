<?php

namespace App\Enums;

enum MaterialType: string
{
    case Document = 'document';   // PDF, Word, Excel, dst.
    case Video = 'video';         // unggah file ATAU tautan YouTube / Vimeo / Drive
    case Audio = 'audio';
    case Slide = 'slide';         // PPT/PPTX/PDF ATAU tautan Google Slides
    case Article = 'article';     // tulisan langsung di editor (teks / markdown sederhana)
    case Link = 'link';           // tautan ke artikel / situs eksternal

    public function label(): string
    {
        return match ($this) {
            self::Document => 'Dokumen',
            self::Video => 'Video',
            self::Audio => 'Audio',
            self::Slide => 'Slide',
            self::Article => 'Artikel / Teks',
            self::Link => 'Tautan',
        };
    }

    /** Tipe yang boleh membawa berkas unggahan. */
    public function usesFile(): bool
    {
        return in_array($this, [self::Document, self::Video, self::Audio, self::Slide], true);
    }

    /** Ekstensi berkas yang diizinkan untuk tipe ini. */
    public function allowedExtensions(): array
    {
        return config('dubesia.materials.mimes.'.$this->value, []);
    }

    /** Batas ukuran berkas untuk tipe ini, dalam KB. */
    public function maxUploadKb(): int
    {
        return (int) (config('dubesia.materials.max_upload_kb_by_type.'.$this->value)
            ?? config('dubesia.materials.max_upload_kb'));
    }
}
