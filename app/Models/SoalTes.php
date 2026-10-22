<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SoalTes extends Model
{
    protected $table = 'soal_tes';
    protected $primaryKey = 'id_soal';

    protected $fillable = [
        'kode_soal',
        'pertanyaan',
        'pilihan_a',
        'pilihan_b',
        'pilihan_c',
        'pilihan_d',
        'kunci_jawaban',
    ];

    protected $hidden = [
        'kunci_jawaban',
    ];

    /**
     * Relasi: Satu soal memiliki banyak jawaban dari murid-murid.
     */
    public function jawabanTes(): HasMany
    {
        return $this->hasMany(JawabanTes::class, 'kode_soal', 'kode_soal');
    }
}
