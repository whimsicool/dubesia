<?php

namespace App\Enums;

/** Level kelas yang digunakan dalam pengelolaan kelas. */
enum ClassLevel: string
{
    case Beginner = 'Beginner';
    case IntermediateLow = 'Intermediate low';
    case Intermediate = 'Intermediate';
    case IntermediateUp = 'Intermediate Up';
    case Advanced = 'Advanced';

    public function label(): string
    {
        return $this->value;
    }

    /** @return array<int, array{value: string, label: string}> */
    public static function options(): array
    {
        return array_map(
            fn (self $level): array => ['value' => $level->value, 'label' => $level->label()],
            self::cases()
        );
    }
}
