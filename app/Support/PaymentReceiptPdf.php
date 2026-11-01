<?php

namespace App\Support;

use App\Models\Pendaftaran;

class PaymentReceiptPdf
{
    public function generate(Pendaftaran $pendaftaran): string
    {
        $commands = [
            '0.7 w',
            '45 45 505 752 re S',
            '0 0 0 rg',
        ];

        $this->text($commands, 66, 770, 'DUBES COMMUNICATIONS', 18, true);
        $this->text($commands, 66, 749, 'LEMBAGA PENDIDIKAN DAN PELATIHAN BAHASA ASING', 9, false);
        $this->text($commands, 66, 734, 'PEKANBARU - RIAU', 9, false);
        $this->text($commands, 66, 719, 'Telp. +62 8xxxxxxxxxx', 9, true);
        $commands[] = '45 700 m 550 700 l S';

        $commands[] = '0.75 0.05 0.05 rg';
        $this->text($commands, 185, 668, 'KUITANSI PEMBAYARAN', 17, true);
        $commands[] = '0 0 0 rg';

        $this->text($commands, 385, 640, 'No: '.str_pad((string) $pendaftaran->id, 6, '0', STR_PAD_LEFT), 10, false);
        $this->row($commands, 600, 'Sudah terima dari', $pendaftaran->nama_lengkap);
        $this->row($commands, 560, 'Banyaknya uang', 'Rp '.number_format((int) $pendaftaran->biaya, 0, ',', '.'));
        $this->row($commands, 520, 'Untuk pembayaran', 'Kursus Bahasa Inggris - '.(Pendaftaran::PROGRAMS[$pendaftaran->program] ?? $pendaftaran->program));
        $this->row($commands, 480, 'Tanggal pembayaran', ($pendaftaran->verified_at ?? now())->format('d/m/Y'));
        $this->row($commands, 440, 'Metode pembayaran', 'Transfer');
        $this->row($commands, 400, 'Keterangan', 'Pembayaran telah diverifikasi oleh admin.');

        $commands[] = '66 365 m 530 365 l S';
        $this->text($commands, 66, 338, 'Catatan:', 9, true);
        $this->text($commands, 66, 322, 'Simpan kuitansi ini sebagai referensi transaksi Anda.', 9, false);
        $this->text($commands, 66, 306, 'Untuk pertanyaan, hubungi tim kami di +62 8xxxxxxxxxx.', 9, false);

        $this->text($commands, 365, 265, 'Pekanbaru, '.($pendaftaran->verified_at ?? now())->format('d/m/Y'), 9, false);
        $this->text($commands, 365, 230, 'DUBES COMMUNICATIONS', 9, true);
        $commands[] = '365 178 m 520 178 l S';
        $this->text($commands, 365, 162, 'Petugas penerima', 8, false);

        return $this->assemble(implode("\n", $commands));
    }

    private function row(array &$commands, int $y, string $label, string $value): void
    {
        $this->text($commands, 66, $y, $label.' :', 10, false);
        $this->text($commands, 235, $y, $value, 10, true);
        $commands[] = sprintf('235 %d m 530 %d l S', $y - 7, $y - 7);
    }

    private function text(array &$commands, int $x, int $y, string $value, int $size, bool $bold): void
    {
        $value = function_exists('iconv')
            ? (iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', $value) ?: $value)
            : preg_replace('/[^\x20-\x7E]/', '?', $value);
        $value = str_replace(['\\', '(', ')', "\r", "\n"], ['\\\\', '\\(', '\\)', ' ', ' '], $value);
        $font = $bold ? 'F2' : 'F1';

        $commands[] = sprintf('BT /%s %d Tf %d %d Td (%s) Tj ET', $font, $size, $x, $y, $value);
    }

    private function assemble(string $stream): string
    {
        $objects = [
            1 => '<< /Type /Catalog /Pages 2 0 R >>',
            2 => '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            3 => '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
            4 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
            5 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
            6 => "<< /Length ".strlen($stream)." >>\nstream\n{$stream}\nendstream",
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $number => $object) {
            $offsets[$number] = strlen($pdf);
            $pdf .= "{$number} 0 obj\n{$object}\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        for ($number = 1; $number <= count($objects); $number++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$number]);
        }

        return $pdf."trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF";
    }
}
