<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pendaftaran;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class PembayaranMasukController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $this->filters($request);
        $rows = $this->query($filters)->get();

        return Inertia::render('Admin/Pembayaran/Index', [
            'pembayaran' => $rows->map(fn (Pendaftaran $pendaftaran): array => $this->row($pendaftaran))->all(),
            'total' => (int) $rows->sum('biaya'),
            'filters' => $filters,
            'periode_label' => $this->periodeLabel($filters),
            'tahun_options' => $this->tahunOptions(),
        ]);
    }

    public function pdf(Request $request)
    {
        $filters = $this->filters($request);
        $rows = $this->query($filters)->get();

        return Pdf::loadView('pdf.pembayaran-masuk', [
            'rows' => $rows->map(fn (Pendaftaran $pendaftaran): array => $this->row($pendaftaran))->all(),
            'total' => (int) $rows->sum('biaya'),
            'periodeLabel' => $this->periodeLabel($filters),
            'generatedAt' => now(),
        ])
            ->setPaper('a4', 'portrait')
            ->download('Rekap-Pembayaran-Masuk-'.$this->fileSuffix($filters).'.pdf');
    }

    /**
     * @return array{periode: string, bulan: int, tahun: int}
     */
    private function filters(Request $request): array
    {
        $periode = $request->query('periode') === 'tahunan' ? 'tahunan' : 'bulanan';
        $bulan = (int) $request->query('bulan', now()->month);
        $tahun = (int) $request->query('tahun', now()->year);

        return [
            'periode' => $periode,
            'bulan' => $bulan >= 1 && $bulan <= 12 ? $bulan : (int) now()->month,
            'tahun' => $tahun > 0 ? $tahun : (int) now()->year,
        ];
    }

    /**
     * @param  array{periode: string, bulan: int, tahun: int}  $filters
     */
    private function query(array $filters): Builder
    {
        return Pendaftaran::query()
            ->where('status', Pendaftaran::STATUS_TERVERIFIKASI)
            ->whereNotNull('verified_at')
            ->whereYear('verified_at', $filters['tahun'])
            ->when($filters['periode'] === 'bulanan', fn (Builder $query) => $query->whereMonth('verified_at', $filters['bulan']))
            ->with('user:id,name,email')
            ->orderBy('verified_at');
    }

    /**
     * @return array<string, mixed>
     */
    private function row(Pendaftaran $pendaftaran): array
    {
        return [
            'id' => $pendaftaran->id,
            'nama_lengkap' => $pendaftaran->nama_lengkap,
            'email' => $pendaftaran->email,
            'program' => Pendaftaran::labelProgram($pendaftaran->program),
            'biaya' => (int) $pendaftaran->biaya,
            'tanggal' => $pendaftaran->verified_at?->format('d/m/Y') ?? '-',
        ];
    }

    /**
     * @param  array{periode: string, bulan: int, tahun: int}  $filters
     */
    private function periodeLabel(array $filters): string
    {
        if ($filters['periode'] === 'tahunan') {
            return 'Tahun '.$filters['tahun'];
        }

        return $this->bulanNama($filters['bulan']).' '.$filters['tahun'];
    }

    /**
     * @param  array{periode: string, bulan: int, tahun: int}  $filters
     */
    private function fileSuffix(array $filters): string
    {
        return $filters['periode'] === 'tahunan'
            ? (string) $filters['tahun']
            : sprintf('%02d-%d', $filters['bulan'], $filters['tahun']);
    }

    private function bulanNama(int $bulan): string
    {
        return [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ][$bulan] ?? '-';
    }

    /**
     * @return Collection<int, int>
     */
    private function tahunOptions(): Collection
    {
        return Pendaftaran::query()
            ->where('status', Pendaftaran::STATUS_TERVERIFIKASI)
            ->whereNotNull('verified_at')
            ->pluck('verified_at')
            ->map(fn ($verifiedAt): int => (int) $verifiedAt->year)
            ->push((int) now()->year)
            ->unique()
            ->sortDesc()
            ->values();
    }
}
