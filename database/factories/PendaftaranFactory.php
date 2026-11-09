<?php

namespace Database\Factories;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pendaftaran>
 */
class PendaftaranFactory extends Factory
{
    protected $model = Pendaftaran::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => User::ROLE_STUDENT]),
            'nama_lengkap' => fake()->name(),
            'tanggal_lahir' => '2000-01-01',
            'email' => fake()->unique()->safeEmail(),
            'no_whatsapp' => '81234567890',
            'alamat' => 'Jl. Taman Karya, Pekanbaru',
            'asal_institusi' => 'Universitas Riau',
            'program' => 'general_english',
            'jenis_kelas' => 'regular',
            'biaya' => Pendaftaran::biayaUntukJenisKelas('regular'),
            'status' => Pendaftaran::STATUS_MENUNGGU,
            'bukti_pembayaran' => 'bukti-pembayaran/contoh.pdf',
        ];
    }

    public function menungguPembayaran(): static
    {
        return $this->state(fn (): array => [
            'status' => Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN,
            'bukti_pembayaran' => null,
        ]);
    }

    public function terverifikasi(): static
    {
        return $this->state(fn (): array => [
            'status' => Pendaftaran::STATUS_TERVERIFIKASI,
            'verified_at' => now(),
        ]);
    }
}
