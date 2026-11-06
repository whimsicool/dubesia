<?php

namespace Tests\Feature\Auth;

use App\Mail\PasswordBaruMail;
use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_lupa_kata_sandi_dapat_dibuka(): void
    {
        $this->get('/forgot-password')->assertStatus(200);
    }

    public function test_kata_sandi_baru_dikirim_ke_email_terdaftar(): void
    {
        Mail::fake();

        $user = User::factory()->create(['password' => 'password-lama']);

        $this->post('/forgot-password', ['email' => $user->email])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('status');

        Mail::assertSent(PasswordBaruMail::class, function (PasswordBaruMail $mail) use ($user): bool {
            return $mail->hasTo($user->email)
                && Hash::check($mail->password, $user->fresh()->password);
        });
    }

    public function test_email_tidak_terdaftar_ditolak_dengan_peringatan(): void
    {
        Mail::fake();

        $this->post('/forgot-password', ['email' => 'tidak.ada@dubesia.id'])
            ->assertSessionHasErrors('email');

        Mail::assertNothingSent();
    }

    public function test_email_belum_terverifikasi_ditolak(): void
    {
        Mail::fake();

        $user = User::factory()->unverified()->create();

        $this->post('/forgot-password', ['email' => $user->email])
            ->assertSessionHasErrors('email');

        Mail::assertNothingSent();
    }

    public function test_email_dengan_pendaftaran_belum_terverifikasi_ditolak(): void
    {
        Mail::fake();

        $user = User::factory()->create();
        Pendaftaran::factory()->for($user)->create(['status' => Pendaftaran::STATUS_MENUNGGU]);

        $this->post('/forgot-password', ['email' => $user->email])
            ->assertSessionHasErrors('email');

        Mail::assertNothingSent();
    }

    public function test_email_dengan_pendaftaran_terverifikasi_boleh_minta_kata_sandi(): void
    {
        Mail::fake();

        $user = User::factory()->create();
        Pendaftaran::factory()->for($user)->terverifikasi()->create();

        $this->post('/forgot-password', ['email' => $user->email])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('status');

        Mail::assertSent(PasswordBaruMail::class);
    }

    public function test_kata_sandi_baru_dapat_dipakai_untuk_masuk(): void
    {
        Mail::fake();

        $user = User::factory()->create(['password' => 'password-lama']);

        $this->post('/forgot-password', ['email' => $user->email]);

        $password = null;
        Mail::assertSent(PasswordBaruMail::class, function (PasswordBaruMail $mail) use (&$password): bool {
            $password = $mail->password;

            return true;
        });

        $this->post('/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_tautan_reset_kata_sandi_bawaan_sudah_tidak_tersedia(): void
    {
        $this->get('/reset-password/token-acak')->assertNotFound();
    }

    public function test_invalid_email_does_not_send_a_new_password(): void
    {
        Mail::fake();

        $this->post('/forgot-password', ['email' => 'invalid-email'])
            ->assertSessionHasErrors('email');

        Mail::assertNothingSent();
    }

    public function test_mail_failure_keeps_the_previous_password(): void
    {
        $user = User::factory()->create(['password' => 'previous-password']);
        Mail::shouldReceive('to')->once()->with($user->email)->andReturnSelf();
        Mail::shouldReceive('send')->once()->andThrow(new \RuntimeException('SMTP unavailable'));

        $this->post('/forgot-password', ['email' => $user->email])
            ->assertSessionHasErrors('email');

        $this->assertTrue(Hash::check('previous-password', $user->refresh()->password));
    }
}
