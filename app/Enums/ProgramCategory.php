<?php

namespace App\Enums;

enum ProgramCategory: string
{
    case English = 'english';
    case Exam = 'exam';
    case Mandarin = 'mandarin';

    public function label(): string
    {
        return match ($this) {
            self::English => 'Diplomatic/English',
            self::Exam => 'IELTS / Exam',
            self::Mandarin => 'Mandarin / Asian',
        };
    }
}
