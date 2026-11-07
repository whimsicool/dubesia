<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Akun admin dan tutor dibuat sebelum email_verified_at benar-benar
     * tersimpan: kolomnya tidak ada di daftar fillable. Isi kolom untuk akun
     * staf lama agar mereka dapat meminta kata sandi baru. Akun murid tidak
     * disentuh karena pendaftar yang belum disetujui admin tetap ditolak.
     */
    public function up(): void
    {
        DB::table('users')
            ->whereIn('role', ['admin', 'tutor'])
            ->whereNull('email_verified_at')
            ->where(function ($query): void {
                $query->whereNull('status_akun')
                    ->orWhere('status_akun', '!=', 'nonaktif');
            })
            ->update(['email_verified_at' => now()]);
    }

    public function down(): void
    {
        // Timestamp akun lama tidak dikembalikan ke null; kolom tetap dipakai.
    }
};
