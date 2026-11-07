<?php

namespace Tests\Feature;

use App\Mail\LanjutkanPendaftaranMail;
use App\Mail\PendaftaranDitolakMail;
use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class LanjutkanPendaftaranTest extends TestCase
{
    use RefreshDatabase;

    private function calonMurid(string $status): User
    {
        $user = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'is_active' => false,
        ]);

        Pendaftaran::factory()->for($user)->create([
            'email' => $user->email,
            'status' => $status,
            'bukti_pembayaran' => $status === Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN
                ? null
                : 'bukti-pembayaran/contoh.pdf',
        ]);

        return $user;
    }

    private function signedUrl(User $user, ?Carbon $expiresAt = null): string
    {
        return URL::temporarySignedRoute(
            'pendaftaran.lanjutkan',
            $expiresAt ?? now()->addDays(7),
            ['user' => $user->id],
        );
    }

    public function test_tautan_sah_membuka_pembayaran_untuk_pendaftaran_menunggu_pembayaran(): void
    {
        $user = $this->calonMurid(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN);

        $this->get($this->signedUrl($user))
            ->assertRedirect(route('pembayaran.show'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_tautan_sah_membuka_form_perbaikan_untuk_pendaftaran_ditolak(): void
    {
        $user = $this->calonMurid(Pendaftaran::STATUS_DITOLAK);

        $this->get($this->signedUrl($user))
            ->assertRedirect(route('registrasi.edit'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_tautan_tanpa_tanda_tangan_ditolak_tanpa_membuat_sesi(): void
    {
        $user = $this->calonMurid(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN);

        $this->get(route('pendaftaran.lanjutkan', $user))->assertForbidden();

        $this->assertGuest();
    }

    public function test_tautan_dengan_tanda_tangan_yang_diubah_ditolak_tanpa_membuat_sesi(): void
    {
        $user = $this->calonMurid(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN);

        $url = preg_replace('/signature=[^&]+/', 'signature=palsu', $this->signedUrl($user));

        $this->get($url)->assertForbidden();

        $this->assertGuest();
    }

    public function test_tautan_kedaluwarsa_ditolak_tanpa_membuat_sesi(): void
    {
        $user = $this->calonMurid(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN);

        $this->get($this->signedUrl($user, now()->subMinute()))->assertForbidden();

        $this->assertGuest();
    }

    public function test_tautan_akun_terverifikasi_ditolak_tanpa_membuat_sesi(): void
    {
        $user = $this->calonMurid(Pendaftaran::STATUS_TERVERIFIKASI);

        $this->get($this->signedUrl($user))->assertForbidden();

        $this->assertGuest();
    }

    public function test_tautan_akun_tanpa_pendaftaran_ditolak(): void
    {
        $tutor = User::factory()->create(['role' => User::ROLE_TUTOR]);

        $this->get($this->signedUrl($tutor))->assertForbidden();

        $this->assertGuest();
    }

    public function test_tautan_untuk_id_yang_tidak_dikenal_ditolak(): void
    {
        $url = URL::temporarySignedRoute(
            'pendaftaran.lanjutkan',
            now()->addDay(),
            ['user' => 999999],
        );

        $this->get($url)->assertForbidden();

        $this->assertGuest();
    }

    public function test_pemilik_email_menerima_tautan_yang_membuka_pembayaran(): void
    {
        Mail::fake();

        $user = $this->calonMurid(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN);

        $this->post(route('registrasi.kirim-tautan'), ['email' => $user->email])
            ->assertRedirect()
            ->assertSessionHas('success');

        $url = null;
        Mail::assertSent(LanjutkanPendaftaranMail::class, function (LanjutkanPendaftaranMail $mail) use ($user, &$url): bool {
            $url = $mail->lanjutkanUrl;

            return $mail->hasTo($user->email);
        });

        $this->get($url)->assertRedirect(route('pembayaran.show'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_email_tidak_dikenal_tidak_mengirim_tautan_dan_respons_tetap_netral(): void
    {
        Mail::fake();

        $this->post(route('registrasi.kirim-tautan'), ['email' => 'tidak.ada@dubesia.id'])
            ->assertRedirect()
            ->assertSessionHas('success');

        Mail::assertNothingSent();
    }

    public function test_akun_terverifikasi_tidak_dikirimi_tautan_lanjutan(): void
    {
        Mail::fake();

        $user = $this->calonMurid(Pendaftaran::STATUS_TERVERIFIKASI);

        $this->post(route('registrasi.kirim-tautan'), ['email' => $user->email])
            ->assertRedirect()
            ->assertSessionHas('success');

        Mail::assertNothingSent();
    }

    public function test_email_penolakan_membawa_tautan_perbaikan(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $user = $this->calonMurid(Pendaftaran::STATUS_MENUNGGU);

        $this->actingAs($admin)
            ->post(route('admin.calon-murid.tolak', $user->pendaftaran), [
                'catatan_verifikasi' => 'Bukti pembayaran tidak terbaca.',
            ]);

        $url = null;
        Mail::assertSent(PendaftaranDitolakMail::class, function (PendaftaranDitolakMail $mail) use (&$url): bool {
            $url = $mail->lanjutkanUrl;

            return true;
        });

        $this->post(route('logout'));

        $this->get($url)->assertRedirect(route('registrasi.edit'));

        $this->assertAuthenticatedAs($user);
    }
}
