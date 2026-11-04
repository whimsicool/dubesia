<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pendaftarans', function (Blueprint $table) {
            // Calon murid mendaftar sebelum membayar, jadi bukti pembayaran belum ada.
            $table->string('bukti_pembayaran')->nullable()->change();
            $table->string('pendidikan_terakhir')->nullable()->after('asal_institusi');
            $table->timestamp('last_reminder_sent_at')->nullable()->after('verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('pendaftarans', function (Blueprint $table) {
            $table->dropColumn(['pendidikan_terakhir', 'last_reminder_sent_at']);
        });
    }
};
