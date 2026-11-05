<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Nilai Dubesia</title>

    <style>
        @page {
            margin: 30px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #263247;
        }

        .student-info {
            margin-bottom: 20px;
            width: 100%;
        }

        .student-info td {
            padding: 5px 3px;
        }

        h3 {
            font-size: 12px;
            margin-bottom: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #263247;
            color: white;
            font-weight: bold;
        }

        th, td {
            border: 1px solid #d5dce5;
            padding: 9px 7px;
            text-align: left;
            vertical-align: top;
        }

        .center {
            text-align: center;
        }

        .component-section {
            margin-top: 25px;
        }

        .component-section h3 {
            margin-bottom: 10px;
        }

        .empty {
            text-align: center;
            color: #64748b;
            padding: 15px;
        }

        .footer {
            margin-top: 25px;
            padding-top: 10px;
            border-top: 1px solid #d5dce5;
            text-align: right;
            color: #64748b;
            font-size: 8px;
        }
    </style>
</head>

<body>
    @include('pdf.partials.kop')

    <p class="kop-title">LAPORAN HASIL BELAJAR MURID</p>
    <p class="kop-meta">Rekapitulasi Nilai</p>

    <table class="student-info">
        <tr>
            <td width="20%">Nama Murid</td>
            <td>: {{ $student->name }}</td>
        </tr>
        <tr>
            <td>Email</td>
            <td>: {{ $student->email }}</td>
        </tr>
        <tr>
            <td>Tanggal Cetak</td>
            <td>: {{ $generatedAt->format('d/m/Y H:i') }}</td>
        </tr>
    </table>

    <h3>Rekapitulasi Nilai</h3>

    <table>
        <thead>
            <tr>
                <th width="6%" class="center">No.</th>
                <th width="27%">Program</th>
                <th width="27%">Kelas</th>
                <th width="15%" class="center">Nilai</th>
                <th width="15%" class="center">Predikat</th>
                <th width="10%" class="center">Tanggal</th>
            </tr>
        </thead>

        <tbody>
            @forelse ($grades as $index => $grade)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>{{ $grade->subject ?? '-' }}</td>
                    <td>{{ $grade->courseClass?->name ?? '-' }}</td>
                    <td class="center">{{ $grade->score ?? '-' }}</td>
                    <td class="center">{{ $grade->grade ?? '-' }}</td>
                    <td class="center">
                        {{ $grade->updated_at?->format('d/m/Y') ?? '-' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="empty">
                        Belum terdapat data nilai.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    @if ($grades->isNotEmpty())
        <div class="component-section">
            <h3>Rincian Komponen Penilaian</h3>

            @foreach ($grades as $grade)
                <p>
                    <strong>{{ $grade->subject ?? 'Program' }}</strong>
                    — {{ $grade->courseClass?->name ?? '-' }}
                </p>

                <table>
                    <thead>
                        <tr>
                            <th width="35%">Komponen</th>
                            <th width="20%" class="center">Nilai</th>
                            <th width="20%" class="center">Bobot</th>
                            <th width="25%">Umpan Balik</th>
                        </tr>
                    </thead>

                    <tbody>
                        @forelse ($grade->componentScores as $component)
                            <tr>
                                <td>{{ $component->gradeComponent?->name ?? '-' }}</td>
                                <td class="center">{{ $component->score ?? '-' }}</td>
                                <td class="center">
                                    {{ $component->gradeComponent?->weight ?? '-' }}
                                </td>
                                <td>{{ $component->feedback ?? '-' }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="empty">
                                    Tidak ada rincian komponen penilaian.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            @endforeach
        </div>
    @endif

    <div class="footer">
        Dokumen dibuat secara otomatis oleh Dubesia
    </div>
</body>
</html>
