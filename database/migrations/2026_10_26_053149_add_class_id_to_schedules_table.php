<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->foreignId('class_id')->nullable()->after('program_id')
                ->constrained('classes')->nullOnDelete();
        });

        // Jadwal lama hanya menyimpan nama kelas sebagai teks. Tautkan baris yang namanya sama persis.
        DB::table('schedules')
            ->select('id', 'class_name')
            ->whereNull('class_id')
            ->orderBy('id')
            ->get()
            ->each(function (object $schedule): void {
                $classId = DB::table('classes')->where('name', $schedule->class_name)->value('id');

                if ($classId !== null) {
                    DB::table('schedules')->where('id', $schedule->id)->update(['class_id' => $classId]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropConstrainedForeignId('class_id');
        });
    }
};
