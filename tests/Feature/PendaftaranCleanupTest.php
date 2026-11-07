<?php

namespace Tests\Feature;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PendaftaranCleanupTest extends TestCase
{
    use RefreshDatabase;

    public function test_pendaftaran_lama_tanpa_bukti_dihapus(): void
    {
        $lama = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'is_active' => false,
        ]);
        $pendaftaranLama = Pendaftaran::factory()->for($lama)->menungguPembayaran()->create();
        $pendaftaranLama->forceFill(['created_at' => now()->subDays(40)])->save();

        $baru = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'is_active' => false,
        ]);
        Pendaftaran::factory()->for($baru)->menungguPembayaran()->create();

        $this->artisan('pendaftaran:bersihkan-terbengkalai')->assertExitCode(0);

        $this->assertDatabaseMissing('users', ['id' => $lama->id]);
        $this->assertDatabaseMissing('pendaftarans', ['user_id' => $lama->id]);
        $this->assertDatabaseHas('users', ['id' => $baru->id]);
    }

    public function test_pendaftaran_yang_sudah_mengunggah_bukti_tidak_dihapus(): void
    {
        $user = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'is_active' => false,
        ]);
        $pendaftaran = Pendaftaran::factory()->for($user)->create([
            'status' => Pendaftaran::STATUS_MENUNGGU,
            'bukti_pembayaran' => 'bukti-pembayaran/contoh.pdf',
        ]);
        $pendaftaran->forceFill(['created_at' => now()->subDays(40)])->save();

        $this->artisan('pendaftaran:bersihkan-terbengkalai')->assertExitCode(0);

        $this->assertDatabaseHas('users', ['id' => $user->id]);
        $this->assertDatabaseHas('pendaftarans', ['user_id' => $user->id]);
    }
}
