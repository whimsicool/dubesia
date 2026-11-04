<?php

namespace App\Console\Commands;

use App\Mail\PengingatPembayaranMail;
use App\Models\Pendaftaran;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Throwable;

class KirimPengingatPembayaran extends Command
{
    protected $signature = 'pembayaran:pengingat';

    protected $description = 'Kirim email pengingat kepada calon murid yang belum melanjutkan pembayaran.';

    public function handle(): int
    {
        $intervalDays = max(1, (int) config('dubesia.payment_reminder.interval_days', 1));
        $batas = now()->subDays($intervalDays);

        $pendaftarans = Pendaftaran::query()
            ->where('status', Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN)
            ->where(fn ($query) => $query
                ->whereNull('last_reminder_sent_at')
                ->orWhere('last_reminder_sent_at', '<=', $batas))
            ->get();

        $terkirim = 0;

        foreach ($pendaftarans as $pendaftaran) {
            try {
                Mail::to($pendaftaran->email)->send(new PengingatPembayaranMail($pendaftaran));
                $pendaftaran->forceFill(['last_reminder_sent_at' => now()])->save();
                $terkirim++;
            } catch (Throwable $e) {
                report($e);
                $this->warn("Pengingat untuk pendaftaran #{$pendaftaran->id} gagal dikirim.");
            }
        }

        $this->info("Pengingat pembayaran terkirim: {$terkirim}.");

        return self::SUCCESS;
    }
}
