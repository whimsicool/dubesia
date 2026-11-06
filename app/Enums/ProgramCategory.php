<?php

namespace App\Enums;

enum ProgramCategory: string
{
    case English = 'english';

    public function label(): string
    {
        return match ($this) {
            self::English => 'Diplomatic/English',
        };
    }
}
