<?php

namespace App\Console\Commands;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('pendaftaran:bersihkan-terbengkalai {--days=30}')]
#[Description('Hapus akun calon murid yang tidak menyelesaikan pembayaran')]
class BersihkanPendaftaranTerbengkalai extends Command
{
    /**
     * Akun yang tidak pernah mengunggah bukti dibiarkan selama masa tenggang,
     * lalu dihapus agar alamat emailnya bisa dipakai lagi.
     */
    public function handle(): int
    {
        $batas = now()->subDays(max(1, (int) $this->option('days')));
        $dihapus = 0;

        User::query()
            ->where('role', User::ROLE_STUDENT)
            ->whereHas('pendaftaran', function ($query) use ($batas): void {
                $query->where('status', Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN)
                    ->whereNull('bukti_pembayaran')
                    ->where('created_at', '<', $batas);
            })
            ->chunkById(100, function ($users) use (&$dihapus): void {
                foreach ($users as $user) {
                    $user->delete();
                    $dihapus++;
                }
            });

        $this->info("{$dihapus} pendaftaran terbengkalai dihapus.");

        return self::SUCCESS;
    }
}
