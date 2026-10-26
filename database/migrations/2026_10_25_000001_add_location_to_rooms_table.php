<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            // Lokasi ruang (gedung/lantai/alamat). Untuk ruang online boleh kosong.
            $table->string('location', 150)->nullable()->after('type');
            $table->index('type');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropIndex(['is_active']);
            $table->dropColumn('location');
        });
    }
};
