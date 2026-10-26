<?php

namespace App\Enums;

enum RoomType: string
{
    case Physical = 'physical';
    case Lab = 'lab';
    case Online = 'online';

    public function label(): string
    {
        return match ($this) {
            self::Physical => 'Ruang Kelas',
            self::Lab => 'Lab',
            self::Online => 'Online',
        };
    }

    /** @return array<int, array{value: string, label: string}> */
    public static function options(): array
    {
        return array_map(
            fn (self $type): array => ['value' => $type->value, 'label' => $type->label()],
            self::cases()
        );
    }
}
