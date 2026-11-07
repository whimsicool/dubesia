<?php

namespace Tests\Feature;

use App\Mail\LanjutkanPendaftaranMail;
use App\Mail\PendaftaranDitolakMail;
use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class LanjutkanPendaftaranTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: User, 1: Pendaftaran}
     */
    private function calonMurid(string $status = Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN): array
    {
        $user = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'is_active' => false,
        ]);

        $pendaftaran = Pendaftaran::factory()->for($user)->create([
            'email' => $user->email,
            'status' => $status,
            'bukti_pembayaran' => $status === Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN
                ? null
                : 'bukti-pembayaran/contoh.pdf',
        ]);

        return [$user, $pendaftaran];
    }

    private function signedUrl(User $user): string
    {
        return URL::temporarySignedRoute(
            'pendaftaran.lanjutkan',
            now()->addDay(),
            ['user' => $user->id],
        );
    }

    public function test_tautan_lanjutan_membuka_halaman_pembayaran_untuk_calon_murid(): void
    {
        [$user] = $this->calonMurid();

        $this->get($this->signedUrl($user))
            ->assertRedirect(route('pembayaran.show'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_tautan_lanjutan_membuka_form_perbaikan_untuk_pendaftaran_ditolak(): void
    {
        [$user] = $this->calonMurid(Pendaftaran::STATUS_DITOLAK);

        $this->get($this->signedUrl($user))
            ->assertRedirect(route('registrasi.edit'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_tautan_tanpa_tanda_tangan_ditolak(): void
    {
        [$user] = $this->calonMurid();

        $this->get(route('pendaftaran.lanjutkan', $user))->assertForbidden();

        $this->assertGuest();
    }

    public function test_tautan_kedaluwarsa_ditolak(): void
    {
        [$user] = $this->calonMurid();

        $url = URL::temporarySignedRoute(
            'pendaftaran.lanjutkan',
            now()->subMinute(),
            ['user' => $user->id],
        );

        $this->get($url)->assertForbidden();

        $this->assertGuest();
    }

    public function test_tautan_tidak_membuka_akun_terverifikasi(): void
    {
        [$user] = $this->calonMurid(Pendaftaran::STATUS_TERVERIFIKASI);

        $this->get($this->signedUrl($user))->assertRedirect(route('login'));

        $this->assertGuest();
    }

    public function test_tautan_tidak_membuka_akun_tutor(): void
    {
        $tutor = User::factory()->create(['role' => User::ROLE_TUTOR]);

        $this->get($this->signedUrl($tutor))->assertForbidden();

        $this->assertGuest();
    }

    public function test_pemilik_email_dapat_meminta_tautan_lanjutan(): void
    {
        Mail::fake();

        [$user] = $this->calonMurid();

        $this->post(route('registrasi.kirim-tautan'), ['email' => $user->email])
            ->assertRedirect()
            ->assertSessionHas('success');

        Mail::assertSent(LanjutkanPendaftaranMail::class, fn (LanjutkanPendaftaranMail $mail): bool => $mail->hasTo($user->email));
    }

    public function test_tautan_dari_email_benar_benar_membuka_akses(): void
    {
        Mail::fake();

        [$user] = $this->calonMurid();

        $this->post(route('registrasi.kirim-tautan'), ['email' => $user->email]);

        $url = null;
        Mail::assertSent(LanjutkanPendaftaranMail::class, function (LanjutkanPendaftaranMail $mail) use (&$url): bool {
            $url = $mail->lanjutkanUrl;

            return true;
        });

        $this->get($url)->assertRedirect(route('pembayaran.show'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_email_tidak_dikenal_tidak_mengirim_tautan(): void
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

        [$user] = $this->calonMurid(Pendaftaran::STATUS_TERVERIFIKASI);

        $this->post(route('registrasi.kirim-tautan'), ['email' => $user->email])
            ->assertRedirect();

        Mail::assertNothingSent();
    }

    public function test_email_penolakan_membawa_tautan_perbaikan(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        [$user, $pendaftaran] = $this->calonMurid(Pendaftaran::STATUS_MENUNGGU);

        $this->actingAs($admin)->post(route('admin.calon-murid.tolak', $pendaftaran), [
            'catatan_verifikasi' => 'Bukti pembayaran tidak terbaca.',
        ]);

        $url = null;
        Mail::assertSent(PendaftaranDitolakMail::class, function (PendaftaranDitolakMail $mail) use (&$url): bool {
            $url = $mail->lanjutkanUrl;

            return true;
        });

        $this->post(route('logout'));

        $this->get($url)->assertRedirect(route('registrasi.edit'));

        $this->assertAuthenticatedAs($user->fresh());
    }
}
