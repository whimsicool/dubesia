<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pendaftaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VerifikasiPendaftaranController extends Controller
{
    public function index(): Response
    {
        $pendaftarans = Pendaftaran::query()
            ->latest()
            ->paginate(15)
            ->through(fn (Pendaftaran $pendaftaran) => [
                'id' => $pendaftaran->id,
                'nama_lengkap' => $pendaftaran->nama_lengkap,
                'email' => $pendaftaran->email,
                'no_whatsapp' => $pendaftaran->no_whatsapp,
                'program' => Pendaftaran::PROGRAMS[$pendaftaran->program] ?? $pendaftaran->program,
                'biaya' => 'Rp '.number_format($pendaftaran->biaya, 0, ',', '.'),
                'status' => $pendaftaran->status,
                'catatan_verifikasi' => $pendaftaran->catatan_verifikasi,
                'bagian_perbaikan' => $pendaftaran->bagian_perbaikan ?? [],
                'bukti_pembayaran_url' => Storage::disk('public')->url($pendaftaran->bukti_pembayaran),
                'created_at' => $pendaftaran->created_at?->format('d M Y, H:i'),
            ]);

        return Inertia::render('Admin/Pendaftaran/Index', [
            'pendaftarans' => $pendaftarans,
        ]);
    }

    public function update(Request $request, Pendaftaran $pendaftaran): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:terverifikasi,ditolak'],
            'catatan_verifikasi' => [
                'nullable',
                'required_if:status,ditolak',
                'string',
                'max:5000',
            ],
            'bagian_perbaikan' => ['nullable', 'required_if:status,ditolak', 'array', 'min:1'],
            'bagian_perbaikan.*' => [
                'required',
                'in:nama_lengkap,tanggal_lahir,email,no_whatsapp,alamat,username,program,bukti_pembayaran,pesan_motivasi',
            ],
        ]);

        DB::transaction(function () use ($data, $pendaftaran, $request): void {
            $pendaftaran->update([
                'status' => $data['status'],
                'catatan_verifikasi' => $data['status'] === Pendaftaran::STATUS_DITOLAK
                    ? trim($data['catatan_verifikasi'])
                    : null,
                'bagian_perbaikan' => $data['status'] === Pendaftaran::STATUS_DITOLAK
                    ? $data['bagian_perbaikan']
                    : null,
                'verified_by' => $request->user()->id,
                'verified_at' => now(),
            ]);

            $pendaftaran->user()->update([
                'is_active' => $data['status'] === Pendaftaran::STATUS_TERVERIFIKASI,
            ]);
        });

        return back()->with('sukses', 'Status pendaftaran berhasil diperbarui.');
    }
}
