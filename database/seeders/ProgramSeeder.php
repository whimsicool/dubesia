<?php

namespace Database\Seeders;

use App\Enums\ProgramCategory;
use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    /** Sepuluh program kursus bahasa Inggris yang dibuka DUBES. */
    public function run(): void
    {
        // code, name
        $programs = [
            ['DSP', 'Diplomatic Speech & Rhetoric'],
            ['PRT', 'Protocol & Etiquette'],
            ['EXE', 'Executive English'],
            ['GBN', 'Global Business English'],
            ['CNV', 'Conversation & Fluency'],
            ['PSC', 'Public Speaking & Presentation'],
            ['BWR', 'Business Writing'],
            ['GRM', 'Grammar & Accuracy'],
            ['PRN', 'Pronunciation & Accent'],
            ['INP', 'Interview Preparation'],
        ];

        foreach ($programs as [$code, $name]) {
            Program::updateOrCreate(['code' => $code], [
                'name' => $name,
                'category' => ProgramCategory::English,
                'is_active' => true,
            ]);
        }
    }
}
