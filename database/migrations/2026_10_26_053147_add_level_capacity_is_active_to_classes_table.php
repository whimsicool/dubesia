<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->string('level', 5)->nullable()->after('name');      // Kode CEFR: A1–C2
            $table->unsignedSmallInteger('capacity')->nullable()->after('level'); // Kosong = tanpa batas
            $table->boolean('is_active')->default(true)->after('description');

            $table->unique('name');
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropUnique(['name']);
            $table->dropColumn(['level', 'capacity', 'is_active']);
        });
    }
};
