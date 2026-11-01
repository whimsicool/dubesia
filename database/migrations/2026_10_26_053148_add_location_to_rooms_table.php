<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('rooms', 'location')) {
            Schema::table('rooms', function (Blueprint $table) {
                // Ruang fisik/lab: gedung, lantai, atau alamat. Ruang online memakai kolom platform.
                $table->string('location')->nullable()->after('platform');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('rooms', 'location')) {
            Schema::table('rooms', function (Blueprint $table) {
                $table->dropColumn('location');
            });
        }
    }
};