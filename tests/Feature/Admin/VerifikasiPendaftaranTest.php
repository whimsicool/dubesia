<?php

namespace Tests\Feature\Admin;

use App\Mail\KirimEmail;
use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class VerifikasiPendaftaranTest extends TestCase
{
    use RefreshDatabase;

    public function test_verifikasi_mengaktifkan_akun_tanpa_mengubah_kata_sandi_dan_mengirim_email(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $user = User::factory()->create([
            'password' => 'kataSandiSaya',
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
        $this->assertTrue(Hash::check('kataSandiSaya', $user->password));
        $this->assertSame(Pendaftaran::STATUS_TERVERIFIKASI, $pendaftaran->fresh()->status);

        Mail::assertSent(KirimEmail::class, fn (KirimEmail $mail): bool => $mail->pendaftaran->is($pendaftaran));
    }
}
