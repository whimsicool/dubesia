<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kuitansi Pembayaran</title>

    <style>
        @page {
            margin: 30px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #263247;
        }

        .identity {
            width: 100%;
            margin: 10px 0 16px;
        }

        .identity td {
            padding: 5px 0;
            vertical-align: top;
        }

        .identity .label {
            width: 30%;
            color: #475569;
        }

        .identity .value {
            font-weight: bold;
        }

        .nominal {
            margin: 14px 0;
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            background: #f4f7fc;
            font-size: 13px;
            font-weight: bold;
        }

        .note {
            margin-top: 18px;
            color: #475569;
            font-size: 9px;
            line-height: 1.6;
        }

        .signature {
            margin-top: 32px;
            width: 100%;
        }

        .signature td {
            padding: 0;
        }

        .signature .right {
            width: 45%;
            text-align: center;
        }

        .signature .space {
            height: 52px;
        }

        .footer {
            margin-top: 24px;
            padding-top: 8px;
            border-top: 1px solid #d5dce5;
            text-align: right;
            color: #64748b;
            font-size: 8px;
        }
    </style>
</head>

<body>
    @include('pdf.partials.kop')

    <p class="kop-title">KUITANSI PEMBAYARAN</p>
    <p class="kop-meta">No: {{ str_pad((string) $pendaftaran->id, 6, '0', STR_PAD_LEFT) }}</p>

    <table class="identity">
        <tr>
            <td class="label">Sudah terima dari</td>
            <td class="value">: {{ $pendaftaran->nama_lengkap }}</td>
        </tr>
        <tr>
            <td class="label">Untuk pembayaran</td>
            <td class="value">: Kursus Bahasa Inggris — {{ $programLabel }}</td>
        </tr>
        <tr>
            <td class="label">Tanggal pembayaran</td>
            <td class="value">: {{ ($pendaftaran->verified_at ?? now())->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td class="label">Metode pembayaran</td>
            <td class="value">: Transfer bank</td>
        </tr>
        <tr>
            <td class="label">Keterangan</td>
            <td class="value">: Pembayaran telah diverifikasi oleh admin.</td>
        </tr>
    </table>

    <div class="nominal">Banyaknya uang: Rp {{ number_format((int) $pendaftaran->biaya, 0, ',', '.') }}</div>

    <p class="note">Simpan kuitansi ini sebagai referensi transaksi Anda.</p>

    <table class="signature">
        <tr>
            <td></td>
            <td class="right">
                Pekanbaru, {{ ($pendaftaran->verified_at ?? now())->format('d/m/Y') }}<br>
                DUBESIA<br>
                <div class="space"></div>
                Petugas penerima
            </td>
        </tr>
    </table>

    <div class="footer">
        Dokumen dibuat secara otomatis oleh Dubesia
    </div>
</body>
</html>
