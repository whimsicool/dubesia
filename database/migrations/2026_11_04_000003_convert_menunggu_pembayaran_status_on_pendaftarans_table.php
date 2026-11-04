<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Alur pembayaran terpisah dibatalkan. Pendaftaran yang masih berstatus
     * "menunggu_pembayaran" dikembalikan ke antrean verifikasi admin.
     */
    public function up(): void
    {
        DB::table('pendaftarans')
            ->where('status', 'menunggu_pembayaran')
            ->update(['status' => 'menunggu_verifikasi']);
    }

    public function down(): void
    {
        // Status asal tidak dapat dibedakan lagi setelah konversi.
    }
};
