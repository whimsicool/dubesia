<?php

namespace Tests\Feature;

use App\Models\HasilTes;
use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AksesPortalCalonMuridTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<int, string>
     */
    private function blockedPaths(): array
    {
        return [
            '/dashboard',
            '/profile',
            '/student/grades',
            '/student/feedback',
            '/student/hasil-tes-level',
            '/tutor/classes',
            '/tutor/schedules',
            '/tutor/presensi',
            '/admin/data-pengguna',
            '/admin/pembayaran',
            '/admin/calon-murid',
            '/materials',
            '/schedules',
            '/tes-level',
        ];
    }

    private function calonMurid(string $status, bool $isActive = true): User
    {
        $user = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'is_active' => $isActive,
        ]);

        Pendaftaran::factory()->for($user)->create([
            'email' => $user->email,
            'status' => $status,
            'bukti_pembayaran' => $status === Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN
                ? null
                : 'bukti-pembayaran/contoh.pdf',
        ]);

        return $user;
    }

    public function test_pendaftaran_belum_terverifikasi_tidak_dapat_membuka_halaman_portal(): void
    {
        foreach ([Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN, Pendaftaran::STATUS_DITOLAK] as $status) {
            foreach ([true, false] as $isActive) {
                $user = $this->calonMurid($status, $isActive);
                $tujuan = $status === Pendaftaran::STATUS_DITOLAK
                    ? route('registrasi.edit')
                    : route('pembayaran.show');

                foreach ($this->blockedPaths() as $path) {
                    $this->actingAs($user)
                        ->get($path)
                        ->assertRedirect($tujuan);
                }
            }
        }
    }

    public function test_permintaan_tulis_ke_halaman_portal_ditolak(): void
    {
        $user = $this->calonMurid(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN);

        $this->actingAs($user)->post('/profile/photo')->assertForbidden();
        $this->actingAs($user)->post('/tes-level/start')->assertForbidden();
    }

    public function test_permintaan_json_ke_halaman_portal_ditolak(): void
    {
        $user = $this->calonMurid(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN);

        $this->actingAs($user)->getJson('/dashboard')->assertForbidden();
    }

    public function test_alur_pembayaran_tetap_berjalan_untuk_akun_terbatas(): void
    {
        Storage::fake('public');

        $user = $this->calonMurid(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN, isActive: true);

        $this->actingAs($user)
            ->get(route('pembayaran.show'))
            ->assertOk();

        $this->actingAs($user)
            ->post(route('pembayaran.store'), [
                'bukti_pembayaran' => UploadedFile::fake()->image('bukti-transfer.png'),
            ])
            ->assertRedirect(route('pembayaran.terkirim'));

        $this->assertGuest();
    }

    public function test_bukti_pembayaran_dapat_dihapus_untuk_akun_terbatas(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('bukti-pembayaran/contoh.pdf', 'contoh');

        $user = $this->calonMurid(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN, isActive: true);
        $user->pendaftaran->update(['bukti_pembayaran' => 'bukti-pembayaran/contoh.pdf']);

        $this->actingAs($user)
            ->delete(route('pembayaran.bukti.destroy'))
            ->assertRedirect(route('pembayaran.show'));

        $this->assertNull($user->pendaftaran->fresh()->bukti_pembayaran);
    }

    public function test_form_perbaikan_tetap_berjalan_untuk_akun_ditolak(): void
    {
        $user = $this->calonMurid(Pendaftaran::STATUS_DITOLAK, isActive: true);

        $this->actingAs($user)
            ->get(route('registrasi.edit'))
            ->assertOk();

        $this->actingAs($user)
            ->put(route('registrasi.update'), [
                'nama_lengkap' => 'Nama Diperbaiki',
                'tanggal_lahir' => '2000-05-01',
                'email' => $user->email,
                'no_whatsapp' => '081234567890',
                'alamat' => 'Jl. Melati No. 1, Pekanbaru',
                'asal_institusi' => 'Universitas Riau',
                'program' => 'general_english',
                'jenis_kelas' => 'regular',
                'setuju' => true,
            ])
            ->assertRedirect(route('pembayaran.show'));

        $this->assertSame(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN, $user->pendaftaran->fresh()->status);
    }

    public function test_logout_tetap_berjalan_untuk_akun_terbatas(): void
    {
        $user = $this->calonMurid(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN);

        $this->actingAs($user)->post(route('logout'))->assertRedirect('/');

        $this->assertGuest();
    }

    public function test_admin_tutor_dan_murid_terverifikasi_tidak_terpengaruh(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $tutor = User::factory()->create(['role' => User::ROLE_TUTOR]);
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        Pendaftaran::factory()->for($student)->terverifikasi()->create(['email' => $student->email]);
        HasilTes::create([
            'id_murid' => $student->id,
            'tanggal_tes' => now()->toDateString(),
            'nama_murid' => $student->name,
            'status_hasil' => 'completed',
            'completed_at' => now(),
        ]);

        $this->actingAs($admin)->get(route('admin.data-pengguna.index'))->assertOk();
        $this->actingAs($tutor)->get(route('tutor.classes.index'))->assertOk();
        $this->actingAs($student)->get(route('profile.edit'))->assertOk();
        $this->actingAs($student)->get(route('dashboard'))->assertOk();
    }
}
