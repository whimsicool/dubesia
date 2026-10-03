<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JawabanTes extends Model
{
    protected $table = 'jawaban_tes';
    protected $primaryKey = 'id_jawaban';

    protected $fillable = [
        'id_murid',
        'kode_soal',
        'jawaban_murid',
        'status_tandai',
    ];

    protected $casts = [
        'status_tandai' => 'boolean',
    ];

    /**
     * Relasi: Jawaban dimiliki oleh seorang murid (User).
     */
    public function murid(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_murid', 'id');
    }

    /**
     * Relasi: Jawaban merujuk pada satu soal.
     */
    public function soal(): BelongsTo
    {
        return $this->belongsTo(SoalTes::class, 'kode_soal', 'kode_soal');
    }

    /**
     * Simpan/update jawaban murid (SaveJawaban).
     */
    public static function saveJawaban(int $idMurid, string $kodeSoal, string $jawaban): self
    {
        return self::updateOrCreate(
            ['id_murid' => $idMurid, 'kode_soal' => $kodeSoal],
            ['jawaban_murid' => strtoupper($jawaban)]
        );
    }

    /**
     * Simpan/update status tandai ragu-ragu (SaveStatusTandai).
     */
    public static function saveStatusTandai(int $idMurid, string $kodeSoal, bool $status): self
    {
        return self::updateOrCreate(
            ['id_murid' => $idMurid, 'kode_soal' => $kodeSoal],
            ['status_tandai' => $status]
        );
    }

    /**
     * Ambil semua jawaban tersimpan milik murid (GetSemuaJawabanTersimpan).
     */
    public static function getSemuaJawabanTersimpan(int $idMurid)
    {
        return self::where('id_murid', $idMurid)->get();
    }
}
