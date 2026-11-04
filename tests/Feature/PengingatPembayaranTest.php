<?php

namespace Tests\Feature;

use App\Mail\PengingatPembayaranMail;
use App\Models\Pendaftaran;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PengingatPembayaranTest extends TestCase
{
    use RefreshDatabase;

    public function test_pengingat_hanya_dikirim_ke_calon_murid_yang_belum_membayar_dan_belum_diingatkan(): void
    {
        Mail::fake();

        $belumDibayar = Pendaftaran::factory()->create([
            'status' => Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN,
            'last_reminder_sent_at' => null,
        ]);

        $baruDiingatkan = Pendaftaran::factory()->create([
            'status' => Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN,
            'last_reminder_sent_at' => now()->subHours(2),
        ]);

        Pendaftaran::factory()->terverifikasi()->create();

        $this->artisan('pembayaran:pengingat')->assertSuccessful();

        Mail::assertSent(PengingatPembayaranMail::class, 1);
        Mail::assertSent(
            PengingatPembayaranMail::class,
            fn (PengingatPembayaranMail $mail): bool => $mail->pendaftaran->is($belumDibayar),
        );

        $this->assertNotNull($belumDibayar->fresh()->last_reminder_sent_at);
        $this->assertTrue($baruDiingatkan->fresh()->last_reminder_sent_at->lt(now()->subHour()));
    }
}
