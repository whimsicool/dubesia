<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Jadwal boleh dikaitkan ke sebuah kelas (opsional agar jadwal lama tetap valid).
        Schema::table('schedules', function (Blueprint $table) {
            $table->foreignId('class_group_id')->nullable()->after('room_id')
                ->constrained('class_groups')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropConstrainedForeignId('class_group_id');
        });
    }
};
