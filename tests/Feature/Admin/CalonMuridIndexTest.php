<?php

namespace Tests\Feature\Admin;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CalonMuridIndexTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function pendaftaran(string $status, string $createdAt): Pendaftaran
    {
        $user = User::factory()->create(['role' => User::ROLE_STUDENT]);

        $pendaftaran = Pendaftaran::create([
            'user_id' => $user->id,
            'nama_lengkap' => $user->name,
            'tanggal_lahir' => '2000-01-01',
            'email' => $user->email,
            'no_whatsapp' => '81234567890',
            'alamat' => 'Jl. Taman Karya 1',
            'program' => 'reguler',
            'bukti_pembayaran' => 'bukti/'.$user->id.'.png',
            'biaya' => 1000000,
            'status' => $status,
        ]);

        $pendaftaran->forceFill([
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ])->save();

        return $pendaftaran;
    }

    public function test_pendaftaran_menunggu_pembayaran_tidak_tampil_di_portal_admin(): void
    {
        $this->pendaftaran(Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN, now()->toDateTimeString());

        $this->actingAs($this->admin())
            ->get(route('admin.calon-murid.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/CalonMurid/Index')
                ->has('pendaftarans.data', 0)
                ->missing('statuses.'.Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN));
    }

    public function test_pendaftaran_belum_diverifikasi_tampil_di_urutan_atas(): void
    {
        // Pendaftaran terverifikasi lebih baru, jadi tanpa pengurutan status ia akan tampil dulu.
        $this->pendaftaran(Pendaftaran::STATUS_MENUNGGU, now()->subDays(5)->toDateTimeString());
        $this->pendaftaran(Pendaftaran::STATUS_TERVERIFIKASI, now()->subDay()->toDateTimeString());

        $this->actingAs($this->admin())
            ->get(route('admin.calon-murid.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/CalonMurid/Index')
                ->where('pendaftarans.data.0.status', Pendaftaran::STATUS_MENUNGGU)
                ->where('pendaftarans.data.1.status', Pendaftaran::STATUS_TERVERIFIKASI));
    }
}
