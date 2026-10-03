<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HasilTes extends Model
{
    protected $table = 'hasil_tes';
    protected $primaryKey = 'id_hasil';

    protected $fillable = [
        'id_murid',
        'tanggal_tes',
        'nama_murid',
        'jumlah_benar',
        'jumlah_salah',
        'nilai_tes',
        'level_kelas',
        'status_hasil',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'tanggal_tes' => 'date',
        'nilai_tes' => 'double',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Relasi: Hasil tes dimiliki oleh seorang murid (User).
     */
    public function murid(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_murid', 'id');
    }

    /**
     * Hitung nilai tes berdasarkan jumlah benar dan total soal.
     * HitungNilaiTes() : double
     */
    public static function hitungNilaiTes(int $jumlahBenar, int $totalSoal): float
    {
        if ($totalSoal === 0) {
            return 0;
        }

        return round(($jumlahBenar / $totalSoal) * 100, 2);
    }

    /**
     * Tentukan level kelas berdasarkan nilai tes.
     * tentukanLevelKelas() : string
     *
     * Aturan:
     * < 80          = Beginner
     * 80 – 85       = Low Intermediate
     * 86 – 89       = Middle Intermediate
     * 90 – 100      = Upper Intermediate
     */
    public static function tentukanLevelKelas(float $nilaiTes): string
    {
        if ($nilaiTes < 80) {
            return 'Beginner';
        } elseif ($nilaiTes <= 85) {
            return 'Low Intermediate';
        } elseif ($nilaiTes <= 89) {
            return 'Middle Intermediate';
        } else {
            return 'Upper Intermediate';
        }
    }

    /**
     * Simpan hasil tes lengkap (SaveHasilTes).
     */
    public static function saveHasilTes(int $idMurid, string $namaMurid, int $jumlahBenar, int $jumlahSalah, int $totalSoal, $startedAt): self
    {
        $nilaiTes = self::hitungNilaiTes($jumlahBenar, $totalSoal);
        $levelKelas = self::tentukanLevelKelas($nilaiTes);

        return self::create([
            'id_murid' => $idMurid,
            'tanggal_tes' => now()->toDateString(),
            'nama_murid' => $namaMurid,
            'jumlah_benar' => $jumlahBenar,
            'jumlah_salah' => $jumlahSalah,
            'nilai_tes' => $nilaiTes,
            'level_kelas' => $levelKelas,
            'status_hasil' => 'completed',
            'started_at' => $startedAt,
            'completed_at' => now(),
        ]);
    }
}
