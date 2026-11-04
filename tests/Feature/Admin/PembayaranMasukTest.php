<?php

namespace Tests\Feature\Admin;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PembayaranMasukTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    public function test_rekap_bulanan_menampilkan_total_pembayaran_pada_periode_itu(): void
    {
        Pendaftaran::factory()->terverifikasi()->create([
            'biaya' => 1000000,
            'verified_at' => now()->setDate(2026, 3, 10),
        ]);
        Pendaftaran::factory()->terverifikasi()->create([
            'biaya' => 1500000,
            'verified_at' => now()->setDate(2026, 3, 12),
        ]);
        Pendaftaran::factory()->terverifikasi()->create([
            'biaya' => 1700000,
            'verified_at' => now()->setDate(2026, 2, 12),
        ]);

        $this->actingAs($this->admin())
            ->get(route('admin.pembayaran.index', ['periode' => 'bulanan', 'bulan' => 3, 'tahun' => 2026]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Pembayaran/Index')
                ->has('pembayaran', 2)
                ->where('total', 2500000)
                ->where('periode_label', 'Maret 2026'));
    }

    public function test_rekap_tahunan_menjumlahkan_semua_bulan_pada_tahun_itu(): void
    {
        Pendaftaran::factory()->terverifikasi()->create([
            'biaya' => 1000000,
            'verified_at' => now()->setDate(2026, 3, 10),
        ]);
        Pendaftaran::factory()->terverifikasi()->create([
            'biaya' => 1700000,
            'verified_at' => now()->setDate(2026, 8, 12),
        ]);

        $this->actingAs($this->admin())
            ->get(route('admin.pembayaran.index', ['periode' => 'tahunan', 'tahun' => 2026]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('pembayaran', 2)
                ->where('total', 2700000)
                ->where('periode_label', 'Tahun 2026'));
    }

    public function test_rekap_pdf_mengikuti_filter_yang_aktif(): void
    {
        Pendaftaran::factory()->terverifikasi()->create([
            'biaya' => 1000000,
            'verified_at' => now()->setDate(2026, 3, 10),
        ]);

        $response = $this->actingAs($this->admin())
            ->get(route('admin.pembayaran.pdf', ['periode' => 'bulanan', 'bulan' => 3, 'tahun' => 2026]));

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('content-type'));
    }
}
