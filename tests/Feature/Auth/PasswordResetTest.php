<?php

namespace Tests\Feature\Auth;

use App\Mail\PasswordBaruMail;
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

    public function test_email_tidak_terdaftar_tetap_mendapat_pesan_netral(): void
    {
        Mail::fake();

        $this->post('/forgot-password', ['email' => 'tidak.ada@dubesia.id'])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('status');

        Mail::assertNothingSent();
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
}
