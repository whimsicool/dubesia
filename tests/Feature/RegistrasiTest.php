<?php

namespace Tests\Feature;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrasiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'nama_lengkap' => 'Siti Aminah',
            'tanggal_lahir' => '2000-05-01',
            'email' => 'siti.aminah@gmail.com',
            'no_whatsapp' => '081234567890',
            'alamat' => 'Jl. Melati No. 1, Pekanbaru',
            'asal_institusi' => 'Universitas Riau',
            'program' => 'general_english',
            'jenis_kelas' => 'private',
            'setuju' => true,
        ], $overrides);
    }

    public function test_registrasi_membuat_akun_dan_mengarahkan_ke_halaman_pembayaran(): void
    {
        $this->post('/registrasi', $this->payload())
            ->assertRedirect(route('pembayaran.show'));

        $this->assertAuthenticated();

        $user = User::where('email', 'siti.aminah@gmail.com')->firstOrFail();

        $this->assertFalse($user->is_active);

        $pendaftaran = $user->pendaftaran;

        $this->assertSame(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN, $pendaftaran->status);
        $this->assertSame('general_english', $pendaftaran->program);
        $this->assertSame('private', $pendaftaran->jenis_kelas);
        $this->assertSame(Pendaftaran::biayaUntukJenisKelas('private'), $pendaftaran->biaya);
        $this->assertNull($pendaftaran->bukti_pembayaran);
    }

    public function test_program_tidak_mengubah_biaya(): void
    {
        $this->post('/registrasi', $this->payload([
            'email' => 'program.satu@gmail.com',
            'program' => 'general_english',
            'jenis_kelas' => 'regular',
        ]))->assertRedirect(route('pembayaran.show'));

        $this->post('/logout');

        $this->post('/registrasi', $this->payload([
            'email' => 'program.dua@gmail.com',
            'program' => 'toefl_preparation',
            'jenis_kelas' => 'regular',
        ]))->assertRedirect(route('pembayaran.show'));

        $biaya = Pendaftaran::query()
            ->whereIn('program', ['general_english', 'toefl_preparation'])
            ->pluck('biaya', 'program');

        $this->assertSame(Pendaftaran::biayaUntukJenisKelas('regular'), $biaya['general_english']);
        $this->assertSame($biaya['general_english'], $biaya['toefl_preparation']);
    }

    public function test_jenis_kelas_wajib_diisi(): void
    {
        $payload = $this->payload();
        unset($payload['jenis_kelas']);

        $this->post('/registrasi', $payload)
            ->assertSessionHasErrors('jenis_kelas');

        $this->assertDatabaseCount('pendaftarans', 0);
    }

    public function test_jenis_kelas_tidak_dikenal_ditolak(): void
    {
        $this->post('/registrasi', $this->payload(['jenis_kelas' => 'grup']))
            ->assertSessionHasErrors('jenis_kelas');

        $this->assertDatabaseCount('pendaftarans', 0);
    }

    public function test_email_non_gmail_diterima(): void
    {
        $this->post('/registrasi', $this->payload(['email' => 'siti.aminah@yahoo.com']))
            ->assertRedirect(route('pembayaran.show'));

        $this->assertDatabaseHas('users', ['email' => 'siti.aminah@yahoo.com']);
    }

    public function test_tanggal_lahir_dibatasi_sampai_2020(): void
    {
        $this->post('/registrasi', $this->payload(['tanggal_lahir' => '2021-01-01']))
            ->assertSessionHasErrors('tanggal_lahir');

        $this->assertDatabaseCount('pendaftarans', 0);
    }

    public function test_email_yang_sudah_terdaftar_tidak_dapat_mendaftar_lagi(): void
    {
        User::factory()->create(['email' => 'siti.aminah@gmail.com']);

        $this->post('/registrasi', $this->payload())
            ->assertSessionHasErrors('email');

        $this->assertDatabaseCount('pendaftarans', 0);
    }

    public function test_email_tutor_tidak_dapat_dipakai_untuk_mendaftar_murid(): void
    {
        User::factory()->create([
            'email' => 'siti.aminah@gmail.com',
            'role' => User::ROLE_TUTOR,
        ]);

        $this->post('/registrasi', $this->payload([
            'email' => 'Siti.Aminah@Gmail.com',
        ]))->assertSessionHasErrors('email');

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('pendaftarans', 0);
    }

    public function test_calon_murid_menunggu_verifikasi_belum_bisa_masuk(): void
    {
        $user = User::factory()->create([
            'password' => 'rahasia123',
            'is_active' => false,
        ]);

        Pendaftaran::factory()->for($user)->create(['email' => $user->email]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'rahasia123',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }
}
