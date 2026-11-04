<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Pembayaran Masuk</title>

    <style>
        @page {
            margin: 30px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #263247;
        }

        .periode {
            margin: 0 0 14px;
            color: #475569;
            font-size: 10px;
        }

        table.data {
            width: 100%;
            border-collapse: collapse;
        }

        .data th {
            background: #263247;
            color: #ffffff;
            font-weight: bold;
        }

        .data th,
        .data td {
            border: 1px solid #d5dce5;
            padding: 8px 7px;
            text-align: left;
            vertical-align: top;
        }

        .data tr {
            page-break-inside: avoid;
        }

        .data tfoot td {
            background: #eef3fd;
            font-weight: bold;
        }

        .right {
            text-align: right;
        }

        .center {
            text-align: center;
        }

        .empty {
            text-align: center;
            color: #64748b;
            padding: 14px;
        }

        .footer {
            margin-top: 18px;
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

    <p class="kop-title">REKAP PEMBAYARAN MASUK</p>
    <p class="kop-meta">Periode {{ $periodeLabel }}</p>

    <p class="periode">Jumlah murid terverifikasi: {{ count($rows) }} orang</p>

    <table class="data">
        <thead>
            <tr>
                <th width="6%" class="center">No.</th>
                <th width="30%">Nama Murid</th>
                <th width="24%">Program</th>
                <th width="18%" class="center">Tanggal Verifikasi</th>
                <th width="22%" class="right">Jumlah</th>
            </tr>
        </thead>

        <tbody>
            @forelse ($rows as $index => $row)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>{{ $row['nama_lengkap'] }}</td>
                    <td>{{ $row['program'] }}</td>
                    <td class="center">{{ $row['tanggal'] }}</td>
                    <td class="right">Rp {{ number_format($row['biaya'], 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="empty">Belum ada pembayaran pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>

        <tfoot>
            <tr>
                <td colspan="4" class="right">Total {{ $periodeLabel }}</td>
                <td class="right">Rp {{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        Dicetak pada {{ $generatedAt->format('d/m/Y H:i') }}
        | Dokumen dibuat secara otomatis oleh Dubesia
    </div>
</body>
</html>
