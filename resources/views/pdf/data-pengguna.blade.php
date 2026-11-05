<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Data Pengguna</title>

    <style>
        @page {
            margin: 25px 30px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #263247;
        }

        .filter {
            margin: 0 0 12px;
            color: #475569;
            font-size: 9px;
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
            padding: 7px 6px;
            text-align: left;
            vertical-align: top;
        }

        .data tr {
            page-break-inside: avoid;
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

    <p class="kop-title">DATA MURID DAN TUTOR</p>
    <p class="kop-meta">Portal Kursus DUBESIA</p>

    <p class="filter">
        Filter:
        peran {{ $filters['role'] ?? 'semua' }},
        status {{ $filters['status'] ?? 'semua' }}
        @if (filled($filters['search'] ?? null))
            , pencarian "{{ $filters['search'] }}"
        @endif
    </p>

    <table class="data">
        <thead>
            <tr>
                <th width="5%" class="center">No.</th>
                <th width="22%">Nama Lengkap</th>
                <th width="26%">Email</th>
                <th width="16%">Nomor HP</th>
                <th width="11%">Peran</th>
                <th width="12%">Status Akun</th>
                <th width="8%">Dibuat</th>
            </tr>
        </thead>

        <tbody>
            @forelse ($rows as $index => $row)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>{{ $row['name'] }}</td>
                    <td>{{ $row['email'] }}</td>
                    <td>{{ $row['no_hp'] ?? '-' }}</td>
                    <td>{{ $row['role'] }}</td>
                    <td>{{ $row['status_akun'] ?? '-' }}</td>
                    <td class="center">{{ $row['created_at']?->format('d/m/Y') ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="empty">Tidak ada data pengguna pada filter ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada {{ $generatedAt->format('d/m/Y H:i') }}
        | Dokumen dibuat secara otomatis oleh Dubesia
    </div>
</body>
</html>
