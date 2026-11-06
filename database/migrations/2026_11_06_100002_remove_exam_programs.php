<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * DUBES tidak membuka kelas persiapan IELTS maupun TOEFL. Hapus kedua program
     * tersebut beserta rujukan jadwalnya, lalu rapikan kategori program yang tersisa.
     */
    public function up(): void
    {
        if (! Schema::hasTable('programs')) {
            return;
        }

        $examIds = DB::table('programs')
            ->where('category', 'exam')
            ->orWhereIn('code', ['IEL', 'TOF'])
            ->orWhere('name', 'like', '%IELTS%')
            ->orWhere('name', 'like', '%TOEFL%')
            ->pluck('id');

        if ($examIds->isNotEmpty()) {
            if (Schema::hasTable('schedules')) {
                DB::table('schedules')->whereIn('program_id', $examIds)->update(['program_id' => null]);
            }

            DB::table('programs')->whereIn('id', $examIds)->delete();
        }

        DB::table('programs')->where('category', 'exam')->update(['category' => 'english']);

        if (Schema::hasTable('pendaftarans')) {
            DB::table('pendaftarans')
                ->where('program', 'toefl_ielts')
                ->update(['program' => 'reguler', 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        // Program IELTS dan TOEFL tidak dikembalikan.
    }
};
