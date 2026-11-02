<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('rooms')) {
            return;
        }

        // Hilangkan nilai enum lama tanpa memutus relasi jadwal yang memakai ruangan.
        DB::table('rooms')->where('type', 'lab')->update([
            'type' => 'physical',
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        // Data ruangan lama tidak dikembalikan menjadi tipe lab.
    }
};
