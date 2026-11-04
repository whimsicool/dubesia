<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>

    <style>
        @page {
            margin: 25px 30px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #263247;
        }

        .info {
            width: 100%;
            margin-bottom: 15px;
        }

        .info td {
            padding: 4px 0;
        }

        .day-section {
            margin-bottom: 14px;
            page-break-inside: avoid;
        }

        .day-title {
            background: #263247;
            color: white;
            padding: 7px 9px;
            font-size: 10px;
            font-weight: bold;
        }

        table.schedule-table {
            width: 100%;
            border-collapse: collapse;
        }

        .schedule-table th {
            background: #e9eef5;
            color: #263247;
            font-weight: bold;
        }

        .schedule-table th,
        .schedule-table td {
            border: 1px solid #d5dce5;
            padding: 7px 6px;
            text-align: left;
            vertical-align: top;
        }

        .schedule-table tr {
            page-break-inside: avoid;
        }

        .empty {
            text-align: center !important;
            color: #64748b;
            padding: 12px !important;
        }

        .footer {
            margin-top: 20px;
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

    <p class="kop-title">LAPORAN JADWAL BELAJAR</p>
    <p class="kop-meta">{{ $semester?->name ?? 'Tidak ada periode aktif' }}</p>

    <table class="info">
        <tr>
            <td width="15%">Nama</td>
            <td width="35%">: {{ $user->name }}</td>
            <td width="15%">Peran</td>
            <td width="35%">: {{ $audience }}</td>
        </tr>
        <tr>
            <td>Periode</td>
            <td colspan="3">
                : {{ $days[0]['formatted_date'] ?? '-' }}
                sampai {{ $days[5]['formatted_date'] ?? '-' }}
            </td>
        </tr>
    </table>

    @foreach ($days as $day)
    <div class="day-section">
        <div class="day-title">
            {{ $day['name'] }} — {{ $day['formatted_date'] }}
        </div>

        <table class="schedule-table">
            <thead>
                <tr>
                    <th width="12%">Waktu</th>
                    <th width="20%">Sesi / Kelas</th>
                    <th width="17%">Program</th>
                    <th width="17%">Tutor</th>
                    <th width="15%">Ruangan</th>
                    @if ($audience === 'Administrator')
                    <th width="10%">Peserta</th>
                    @endif
                </tr>
            </thead>

            <tbody>
                @forelse ($day['schedules'] as $schedule)
                <tr>
                    <td>
                        {{ $schedule['start_time'] }}
                        -
                        {{ $schedule['end_time'] }}
                    </td>

                    <td>
                        <strong>{{ $schedule['title'] }}</strong>
                        <br>
                        {{ $schedule['class_name'] }}
                    </td>

                    <td>
                        @if ($audience === 'Administrator')
                        {{ $schedule['program'] ?? '-' }}
                        @else
                        {{ $schedule['program']['name'] ?? '-' }}
                        @endif
                    </td>

                    <td>
                        @if ($audience === 'Administrator')
                        {{ $schedule['instructor'] ?? '-' }}
                        @else
                        {{ $schedule['instructor']['name'] ?? '-' }}
                        @endif
                    </td>

                    <td>
                        @if ($audience === 'Administrator')
                        {{ $schedule['room'] ?? '-' }}
                        @else
                        {{ $schedule['room']['name'] ?? '-' }}
                        @endif
                    </td>
                    @if ($audience === 'Administrator')
                    <td>{{ $schedule['participants'] ?? 0 }} murid</td>
                    @endif
                </tr>
                @empty
                <tr>
                    <td colspan="{{ $audience === 'Administrator' ? 6 : 5 }}" class="empty">
                        Tidak ada jadwal pada hari ini.
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    @endforeach

    <div class="footer">
        Dicetak pada {{ $generatedAt->format('d/m/Y H:i') }}
        | Dokumen dibuat secara otomatis oleh Dubesia
    </div>
</body>
</html>
