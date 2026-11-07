<?php

namespace Tests\Feature\Admin;

use App\Mail\KirimEmail;
use App\Mail\PasswordBaruMail;
use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class VerifikasiPendaftaranTest extends TestCase
{
    use RefreshDatabase;

    public function test_verifikasi_mengaktifkan_akun_dan_mengirim_kata_sandi_sementara(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $user = User::factory()->create([
            'password' => 'kataSandiLama',
            'is_active' => false,
        ]);
        $pendaftaran = Pendaftaran::factory()->for($user)->create([
            'email' => $user->email,
            'status' => Pendaftaran::STATUS_MENUNGGU,
            'bukti_pembayaran' => 'bukti-pembayaran/contoh.pdf',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.calon-murid.verifikasi', $pendaftaran))
            ->assertRedirect(route('admin.calon-murid.index'));

        $user->refresh();

        $this->assertTrue($user->is_active);
        $this->assertFalse(Hash::check('kataSandiLama', $user->password));
        $this->assertSame(Pendaftaran::STATUS_TERVERIFIKASI, $pendaftaran->fresh()->status);

        Mail::assertSent(KirimEmail::class, fn (KirimEmail $mail): bool => $mail->pendaftaran->is($pendaftaran)
            && Hash::check($mail->temporaryPassword, $user->password));
    }

    public function test_akun_hasil_verifikasi_bisa_meminta_kata_sandi_baru(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $user = User::factory()->create([
            'password' => 'kataSandiLama',
            'is_active' => false,
        ]);
        $pendaftaran = Pendaftaran::factory()->for($user)->create([
            'email' => $user->email,
            'status' => Pendaftaran::STATUS_MENUNGGU,
            'bukti_pembayaran' => 'bukti-pembayaran/contoh.pdf',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.calon-murid.verifikasi', $pendaftaran));

        $user->refresh();

        $this->assertNotNull($user->email_verified_at);

        $this->post(route('logout'));

        $this->post(route('password.email'), ['email' => $user->email])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('status');

        Mail::assertSent(PasswordBaruMail::class, fn (PasswordBaruMail $mail): bool => $mail->hasTo($user->email));
    }

    public function test_pendaftaran_tanpa_bukti_pembayaran_tidak_dapat_diverifikasi(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $pendaftaran = Pendaftaran::factory()->create([
            'status' => Pendaftaran::STATUS_MENUNGGU,
            'bukti_pembayaran' => null,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.calon-murid.verifikasi', $pendaftaran))
            ->assertSessionHas('error');

        $this->assertSame(Pendaftaran::STATUS_MENUNGGU, $pendaftaran->fresh()->status);
        Mail::assertNothingSent();
    }
}
