<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('classes', 'capacity')) {
            return;
        }

        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn('capacity');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('classes', 'capacity')) {
            return;
        }

        Schema::table('classes', function (Blueprint $table) {
            $table->unsignedSmallInteger('capacity')->nullable()->after('level');
        });
    }
};
