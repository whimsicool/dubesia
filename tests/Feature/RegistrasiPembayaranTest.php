<?php

namespace Tests\Feature;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RegistrasiPembayaranTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'nama_lengkap' => 'Siti Aminah',
            'tanggal_lahir' => '2000-05-01',
            'email' => 'siti.aminah@gmail.com',
            'no_whatsapp' => '081234567890',
            'alamat' => 'Jl. Melati No. 1, Pekanbaru',
            'asal_institusi' => 'Universitas Riau',
            'pendidikan_terakhir' => 'S1',
            'program' => 'private',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
            'setuju' => true,
        ], $overrides);
    }

    public function test_registrasi_membuat_akun_calon_murid_dan_mengarahkan_ke_pembayaran(): void
    {
        $this->post('/registrasi', $this->payload())
            ->assertRedirect(route('pembayaran.show'));

        $this->assertAuthenticated();

        $user = User::where('email', 'siti.aminah@gmail.com')->firstOrFail();

        $this->assertSame(User::ROLE_STUDENT, $user->role);
        $this->assertFalse($user->is_active);
        $this->assertTrue(Hash::check('rahasia123', $user->password));

        $this->assertDatabaseHas('pendaftarans', [
            'user_id' => $user->id,
            'status' => Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN,
            'biaya' => Pendaftaran::BIAYA_PER_PROGRAM['private'],
            'pendidikan_terakhir' => 'S1',
            'bukti_pembayaran' => null,
        ]);
    }

    public function test_calon_murid_belum_membayar_diarahkan_ke_halaman_pembayaran_saat_masuk(): void
    {
        $user = User::factory()->create([
            'password' => 'rahasia123',
            'is_active' => false,
        ]);

        Pendaftaran::factory()->for($user)->create(['email' => $user->email]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'rahasia123',
        ])->assertRedirect(route('pembayaran.show'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_halaman_pembayaran_menampilkan_tagihan_sesuai_program(): void
    {
        $user = User::factory()->create(['is_active' => false]);
        Pendaftaran::factory()->for($user)->create([
            'email' => $user->email,
            'program' => 'employee',
            'biaya' => Pendaftaran::BIAYA_PER_PROGRAM['employee'],
        ]);

        $this->actingAs($user)
            ->get(route('pembayaran.show'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Registrasi/Pembayaran')
                ->where('pendaftaran.biaya', Pendaftaran::BIAYA_PER_PROGRAM['employee'])
                ->where('pendaftaran.status', Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN)
                ->where('pendaftaran.has_bukti', false));
    }

    public function test_calon_murid_belum_aktif_diarahkan_dari_dashboard_ke_halaman_pembayaran(): void
    {
        $user = User::factory()->create(['is_active' => false]);
        Pendaftaran::factory()->for($user)->create([
            'email' => $user->email,
            'status' => Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN,
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect(route('pembayaran.show'));
    }

    public function test_calon_murid_menunggu_verifikasi_diarahkan_dari_dashboard_ke_halaman_pembayaran(): void
    {
        $user = User::factory()->create(['is_active' => false]);
        Pendaftaran::factory()->for($user)->create([
            'email' => $user->email,
            'status' => Pendaftaran::STATUS_MENUNGGU,
            'bukti_pembayaran' => 'bukti-pembayaran/contoh.pdf',
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect(route('pembayaran.show'));
    }

    public function test_calon_murid_belum_terverifikasi_tidak_dapat_membuka_halaman_profil(): void
    {
        foreach ([Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN, Pendaftaran::STATUS_MENUNGGU] as $status) {
            $user = User::factory()->create(['is_active' => false]);
            Pendaftaran::factory()->for($user)->create([
                'email' => $user->email,
                'status' => $status,
                'bukti_pembayaran' => 'bukti-pembayaran/contoh.pdf',
            ]);

            $this->actingAs($user)
                ->get('/profile')
                ->assertRedirect(route('pembayaran.show'));
        }
    }

    public function test_akun_nonaktif_tanpa_pendaftaran_keluar_dan_kembali_ke_login(): void
    {
        $user = User::factory()->create(['is_active' => false]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect(route('login'));

        $this->assertGuest();
    }

    public function test_unggah_bukti_pembayaran_mengubah_status_menjadi_menunggu_verifikasi(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['is_active' => false]);
        $pendaftaran = Pendaftaran::factory()->for($user)->create(['email' => $user->email]);

        $this->actingAs($user)
            ->post(route('pembayaran.store'), [
                'bukti_pembayaran' => UploadedFile::fake()->image('bukti-transfer.png'),
            ])
            ->assertRedirect(route('pembayaran.show'));

        $pendaftaran->refresh();

        $this->assertSame(Pendaftaran::STATUS_MENUNGGU, $pendaftaran->status);
        $this->assertNotNull($pendaftaran->bukti_pembayaran);
        Storage::disk('public')->assertExists($pendaftaran->bukti_pembayaran);
    }
}
