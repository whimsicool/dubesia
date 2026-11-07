<?php

namespace Tests\Feature;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CekEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_baru_dinyatakan_tersedia(): void
    {
        $this->getJson(route('email.cek', ['email' => 'baru@dubesia.id']))
            ->assertOk()
            ->assertJson(['tersedia' => true]);
    }

    public function test_email_yang_sudah_terdaftar_dinyatakan_terpakai(): void
    {
        $user = User::factory()->create(['email' => 'dipakai@dubesia.id']);

        $this->getJson(route('email.cek', ['email' => 'Dipakai@Dubesia.id']))
            ->assertOk()
            ->assertJson(['tersedia' => false]);

        $this->assertDatabaseCount('users', 1);
        $this->assertSame($user->id, User::first()->id);
    }

    public function test_email_pendaftaran_yang_belum_selesai_bisa_dilanjutkan(): void
    {
        $user = User::factory()->create([
            'email' => 'lanjut@dubesia.id',
            'is_active' => false,
        ]);
        Pendaftaran::factory()->for($user)->menungguPembayaran()->create(['email' => $user->email]);

        $this->getJson(route('email.cek', ['email' => $user->email]))
            ->assertOk()
            ->assertJson(['tersedia' => false, 'bisa_lanjut' => true]);
    }

    public function test_email_akun_terverifikasi_tidak_bisa_dilanjutkan(): void
    {
        $user = User::factory()->create(['email' => 'selesai@dubesia.id']);
        Pendaftaran::factory()->for($user)->terverifikasi()->create(['email' => $user->email]);

        $this->getJson(route('email.cek', ['email' => $user->email]))
            ->assertOk()
            ->assertJson(['tersedia' => false, 'bisa_lanjut' => false]);
    }

    public function test_pemilik_akun_boleh_mengecualikan_emailnya_sendiri(): void
    {
        $user = User::factory()->create(['email' => 'sendiri@dubesia.id']);

        $this->actingAs($user)
            ->getJson(route('email.cek', ['email' => $user->email, 'abaikan' => $user->id]))
            ->assertOk()
            ->assertJson(['tersedia' => true]);
    }

    public function test_pengguna_lain_tidak_boleh_mengecualikan_akun_orang_lain(): void
    {
        $pemilik = User::factory()->create(['email' => 'milik.orang@dubesia.id']);
        $lain = User::factory()->create();

        $this->actingAs($lain)
            ->getJson(route('email.cek', ['email' => $pemilik->email, 'abaikan' => $pemilik->id]))
            ->assertOk()
            ->assertJson(['tersedia' => false]);
    }
}
