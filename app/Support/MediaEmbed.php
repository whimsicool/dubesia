<?php

namespace App\Support;

/**
 * Mengubah tautan biasa (YouTube, Vimeo, Google Drive/Slides/Docs) menjadi URL embed untuk <iframe>.
 * Hanya host yang dikenal yang di-embed; selain itu null (ditampilkan sebagai tautan keluar).
 */
class MediaEmbed
{
    public static function from(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $parts = parse_url($url);
        $host = strtolower(preg_replace('/^(www\.|m\.)/', '', $parts['host'] ?? ''));
        $path = $parts['path'] ?? '';
        parse_str($parts['query'] ?? '', $query);

        // YouTube
        if ($host === 'youtu.be') {
            $id = trim($path, '/');

            return self::youtube($id);
        }
        if (in_array($host, ['youtube.com', 'youtube-nocookie.com'], true)) {
            if (! empty($query['v'])) {
                return self::youtube($query['v']);
            }
            if (preg_match('#^/(embed|shorts|live)/([\w-]{6,20})#', $path, $m)) {
                return self::youtube($m[2]);
            }

            return null;
        }

        // Vimeo
        if ($host === 'vimeo.com' && preg_match('#^/(\d+)#', $path, $m)) {
            return 'https://player.vimeo.com/video/'.$m[1];
        }

        // Google Drive (file) / Slides / Docs
        if ($host === 'drive.google.com' && preg_match('#^/file/d/([\w-]+)#', $path, $m)) {
            return 'https://drive.google.com/file/d/'.$m[1].'/preview';
        }
        if ($host === 'docs.google.com' && preg_match('#^/presentation/d/([\w-]+)#', $path, $m)) {
            return 'https://docs.google.com/presentation/d/'.$m[1].'/embed';
        }
        if ($host === 'docs.google.com' && preg_match('#^/(document|spreadsheets)/d/([\w-]+)#', $path, $m)) {
            return 'https://docs.google.com/'.$m[1].'/d/'.$m[2].'/preview';
        }

        return null;
    }

    private static function youtube(string $id): ?string
    {
        return preg_match('/^[\w-]{6,20}$/', $id) ? 'https://www.youtube-nocookie.com/embed/'.$id : null;
    }
}
