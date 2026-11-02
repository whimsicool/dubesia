<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ganti kode CEFR lama dengan lima level yang dipakai pada form dan materi.
     * Kolom diperlebar karena level baru lebih panjang daripada kode A1–C2.
     */
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table): void {
            $table->string('level', 32)->nullable()->change();
        });

        $mapping = [
            'A1' => 'Beginner',
            'A2' => 'Intermediate low',
            'B1' => 'Intermediate',
            'B2' => 'Intermediate Up',
            'C1' => 'Advanced',
            'C2' => 'Advanced',
        ];

        foreach ($mapping as $oldLevel => $newLevel) {
            DB::table('classes')->where('level', $oldLevel)->update(['level' => $newLevel]);
        }
    }

    public function down(): void
    {
        $mapping = [
            'Beginner' => 'A1',
            'Intermediate low' => 'A2',
            'Intermediate' => 'B1',
            'Intermediate Up' => 'B2',
            'Advanced' => 'C1',
        ];

        foreach ($mapping as $newLevel => $oldLevel) {
            DB::table('classes')->where('level', $newLevel)->update(['level' => $oldLevel]);
        }

        Schema::table('classes', function (Blueprint $table): void {
            $table->string('level', 5)->nullable()->change();
        });
    }
};
