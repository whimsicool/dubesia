<?php

namespace App\Enums;

/** Level kelas memakai skala CEFR, mengikuti badge level pada desain portal. */
enum ClassLevel: string
{
    case A1 = 'A1';
    case A2 = 'A2';
    case B1 = 'B1';
    case B2 = 'B2';
    case C1 = 'C1';
    case C2 = 'C2';

    public function label(): string
    {
        return match ($this) {
            self::A1 => 'Pemula',
            self::A2 => 'Dasar',
            self::B1 => 'Menengah',
            self::B2 => 'Menengah Atas',
            self::C1 => 'Mahir',
            self::C2 => 'Sangat Mahir',
        };
    }

    /** @return array<int, array{value: string, label: string}> */
    public static function options(): array
    {
        return array_map(
            fn (self $level): array => ['value' => $level->value, 'label' => $level->value.' — '.$level->label()],
            self::cases()
        );
    }
}
