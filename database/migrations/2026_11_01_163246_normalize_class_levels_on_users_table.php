<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Level lama dari seeder tidak sama dengan level hasil tes
     * (HasilTes::tentukanLevelKelas). Tanpa pemetaan ini, murid lama tidak
     * muncul lagi di filter presensi tutor.
     *
     * @var array<string, string>
     */
    private const LEGACY_LEVELS = [
        'Intermediate' => 'Middle Intermediate',
        'Advance' => 'Upper Intermediate',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach (self::LEGACY_LEVELS as $legacy => $current) {
            DB::table('users')->where('class_level', $legacy)->update(['class_level' => $current]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Data level tidak dikembalikan: nilainya tidak bisa dibedakan lagi
        // dari level yang memang ditetapkan oleh hasil tes.
    }
};
