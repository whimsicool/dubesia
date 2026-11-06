<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * DUBES hanya membuka kelas bahasa Inggris. Hapus program berbahasa Mandarin
     * beserta rujukan jadwal dan pendaftaran yang memakainya.
     */
    public function up(): void
    {
        if (! Schema::hasTable('programs')) {
            return;
        }

        $mandarinIds = DB::table('programs')
            ->where('category', 'mandarin')
            ->orWhere('code', 'HSK')
            ->pluck('id');

        if ($mandarinIds->isNotEmpty()) {
            if (Schema::hasTable('schedules')) {
                DB::table('schedules')->whereIn('program_id', $mandarinIds)->update(['program_id' => null]);
            }

            DB::table('programs')->whereIn('id', $mandarinIds)->delete();
        }

        if (Schema::hasTable('pendaftarans')) {
            DB::table('pendaftarans')
                ->where('program', 'mandarin_hsk')
                ->update(['program' => 'reguler', 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        // Program Mandarin tidak dikembalikan.
    }
};
