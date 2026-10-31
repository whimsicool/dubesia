<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pendaftarans', function (Blueprint $table) {
            $table->text('no_whatsapp')->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->text('no_hp')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('pendaftarans', function (Blueprint $table) {
            $table->string('no_whatsapp', 20)->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('no_hp', 20)->nullable()->change();
        });
    }
};
