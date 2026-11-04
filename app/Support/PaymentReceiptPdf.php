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
        ])
            ->setPaper('a4', 'portrait')
            ->output();
    }
}
