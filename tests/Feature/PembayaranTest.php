<?php

namespace Tests\Feature;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PembayaranTest extends TestCase
{
    use RefreshDatabase;

    private function calonMurid(): array
    {
        $user = User::factory()->create(['is_active' => false]);
        $pendaftaran = Pendaftaran::factory()->for($user)->menungguPembayaran()->create([
            'email' => $user->email,
            'program' => 'employee',
            'biaya' => Pendaftaran::BIAYA_PER_PROGRAM['employee'],
        ]);

        return [$user, $pendaftaran];
    }

    public function test_halaman_pembayaran_menampilkan_tagihan_sesuai_program(): void
    {
        [$user] = $this->calonMurid();

        $this->actingAs($user)
            ->get(route('pembayaran.show'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Registrasi/Pembayaran')
                ->where('pendaftaran.biaya', Pendaftaran::BIAYA_PER_PROGRAM['employee'])
                ->where('pendaftaran.status', Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN)
                ->where('pendaftaran.has_bukti', false));
    }

    public function test_unggah_bukti_pembayaran_mengubah_status_menjadi_menunggu_verifikasi(): void
    {
        Storage::fake('public');

        [$user, $pendaftaran] = $this->calonMurid();

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

    public function test_bukti_kedua_tidak_dapat_diunggah_sebelum_bukti_pertama_dihapus(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('bukti-pembayaran/pertama.pdf', 'contoh');

        $user = User::factory()->create(['is_active' => false]);
        $pendaftaran = Pendaftaran::factory()->for($user)->create([
            'email' => $user->email,
            'status' => Pendaftaran::STATUS_MENUNGGU,
            'bukti_pembayaran' => 'bukti-pembayaran/pertama.pdf',
        ]);

        $this->actingAs($user)
            ->post(route('pembayaran.store'), [
                'bukti_pembayaran' => UploadedFile::fake()->image('kedua.png'),
            ])
            ->assertSessionHasErrors('bukti_pembayaran');

        $this->assertSame('bukti-pembayaran/pertama.pdf', $pendaftaran->fresh()->bukti_pembayaran);
        Storage::disk('public')->assertExists('bukti-pembayaran/pertama.pdf');
    }

    public function test_bukti_pembayaran_dapat_dihapus_lalu_diunggah_ulang(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('bukti-pembayaran/pertama.pdf', 'contoh');

        $user = User::factory()->create(['is_active' => false]);
        $pendaftaran = Pendaftaran::factory()->for($user)->create([
            'email' => $user->email,
            'status' => Pendaftaran::STATUS_MENUNGGU,
            'bukti_pembayaran' => 'bukti-pembayaran/pertama.pdf',
        ]);

        $this->actingAs($user)
            ->delete(route('pembayaran.bukti.destroy'))
            ->assertRedirect(route('pembayaran.show'));

        $pendaftaran->refresh();

        $this->assertNull($pendaftaran->bukti_pembayaran);
        $this->assertSame(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN, $pendaftaran->status);
        Storage::disk('public')->assertMissing('bukti-pembayaran/pertama.pdf');

        $this->actingAs($user)
            ->post(route('pembayaran.store'), [
                'bukti_pembayaran' => UploadedFile::fake()->image('kedua.png'),
            ])
            ->assertRedirect(route('pembayaran.show'));

        $pendaftaran->refresh();

        $this->assertSame(Pendaftaran::STATUS_MENUNGGU, $pendaftaran->status);
        $this->assertNotNull($pendaftaran->bukti_pembayaran);
        Storage::disk('public')->assertExists($pendaftaran->bukti_pembayaran);
    }

    public function test_bukti_tidak_dapat_dihapus_setelah_pendaftaran_terverifikasi(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('bukti-pembayaran/pertama.pdf', 'contoh');

        $user = User::factory()->create(['is_active' => true]);
        $pendaftaran = Pendaftaran::factory()->for($user)->terverifikasi()->create([
            'email' => $user->email,
            'bukti_pembayaran' => 'bukti-pembayaran/pertama.pdf',
        ]);

        $this->actingAs($user)
            ->delete(route('pembayaran.bukti.destroy'))
            ->assertForbidden();

        $this->assertSame('bukti-pembayaran/pertama.pdf', $pendaftaran->fresh()->bukti_pembayaran);
    }

    public function test_calon_murid_belum_aktif_diarahkan_dari_dashboard_ke_halaman_pembayaran(): void
    {
        [$user] = $this->calonMurid();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect(route('pembayaran.show'));
    }

    public function test_calon_murid_menunggu_verifikasi_diarahkan_dari_dashboard_ke_profil(): void
    {
        $user = User::factory()->create(['is_active' => false]);
        Pendaftaran::factory()->for($user)->create([
            'email' => $user->email,
            'status' => Pendaftaran::STATUS_MENUNGGU,
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect(route('profile.edit'));
    }
}
