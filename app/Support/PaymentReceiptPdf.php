<?php

namespace App\Support;

use App\Models\Pendaftaran;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentReceiptPdf
{
    public function generate(Pendaftaran $pendaftaran): string
    {
        return Pdf::loadView('pdf.kuitansi', [
            'pendaftaran' => $pendaftaran,
            'programLabel' => Pendaftaran::labelProgram($pendaftaran->program),
            'jenisKelasLabel' => Pendaftaran::labelJenisKelas($pendaftaran->jenis_kelas),
        ])
            ->setPaper('a4', 'portrait')
            ->output();
    }
}
