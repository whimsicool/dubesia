<?php

namespace Tests\Feature\Admin;

use App\Mail\AkunTutorMail;
use App\Mail\PasswordBaruMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TutorAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_membuat_akun_tutor_dan_mengirim_kredensial_lewat_email(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $this->actingAs($admin)
            ->post(route('admin.data-pengguna.store'), [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@dubesia.id',
            ])
            ->assertRedirect(route('admin.data-pengguna.index'));

        $tutor = User::where('email', 'budi.santoso@dubesia.id')->firstOrFail();
        $password = User::generateDefaultPassword('Budi Santoso');

        $this->assertSame(User::ROLE_TUTOR, $tutor->role);
        $this->assertTrue($tutor->is_active);
        $this->assertTrue(Hash::check($password, $tutor->password));

        Mail::assertSent(AkunTutorMail::class, fn (AkunTutorMail $mail): bool => $mail->hasTo('budi.santoso@dubesia.id')
            && $mail->password === $password);
    }

    public function test_tutor_buatan_admin_bisa_meminta_kata_sandi_baru(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $this->actingAs($admin)
            ->post(route('admin.data-pengguna.store'), [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@dubesia.id',
            ])
            ->assertRedirect(route('admin.data-pengguna.index'));

        $tutor = User::where('email', 'budi.santoso@dubesia.id')->firstOrFail();

        $this->assertNotNull($tutor->email_verified_at);

        $this->post(route('logout'));

        $this->post(route('password.email'), ['email' => $tutor->email])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('status');

        Mail::assertSent(PasswordBaruMail::class, fn (PasswordBaruMail $mail): bool => $mail->hasTo($tutor->email));
    }
}
