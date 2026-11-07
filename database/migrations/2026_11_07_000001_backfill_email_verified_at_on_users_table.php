<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Kolom email_verified_at sebelumnya tidak pernah tersimpan karena tidak
     * termasuk atribut fillable. Isi akun lama yang memang sudah boleh login:
     * akun tanpa pendaftaran (admin/tutor/murid lama) dan murid terverifikasi.
     * Pendaftar yang belum diputuskan tetap null.
     */
    public function up(): void
    {
        DB::table('users')
            ->whereNull('email_verified_at')
            ->where(function ($query): void {
                $query->whereNull('status_akun')
                    ->orWhere('status_akun', '!=', 'nonaktif');
            })
            ->where(function ($query): void {
                $query->whereNotExists(function ($sub): void {
                    $sub->selectRaw('1')
                        ->from('pendaftarans')
                        ->whereColumn('pendaftarans.user_id', 'users.id');
                })->orWhereExists(function ($sub): void {
                    $sub->selectRaw('1')
                        ->from('pendaftarans')
                        ->whereColumn('pendaftarans.user_id', 'users.id')
                        ->where('status', 'terverifikasi');
                });
            })
            ->update(['email_verified_at' => now()]);
    }

    public function down(): void
    {
        // Data lama tidak dikembalikan ke null; kolom tetap dipakai.
    }
};
