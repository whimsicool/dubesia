<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['nisn']);
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('nisn');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('nip');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nip', 50)->nullable();
        });

        Schema::table('students', function (Blueprint $table) {
            $table->string('nisn', 20)->nullable()->unique();
        });
    }
};
