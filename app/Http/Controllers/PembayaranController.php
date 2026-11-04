<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBuktiPembayaranRequest;
use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PembayaranController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $pendaftaran = $user->pendaftaran;

        if (! $pendaftaran || $user->role !== User::ROLE_STUDENT) {
            return redirect()->route('dashboard');
        }

        if ($pendaftaran->status === Pendaftaran::STATUS_TERVERIFIKASI) {
            return redirect()->route('dashboard');
        }

        if ($pendaftaran->status === Pendaftaran::STATUS_DITOLAK) {
            return redirect()->route('registrasi.edit');
        }

        return Inertia::render('Registrasi/Pembayaran', [
            'pendaftaran' => [
                'nama_lengkap' => $pendaftaran->nama_lengkap,
                'email' => $pendaftaran->email,
                'program' => Pendaftaran::labelProgram($pendaftaran->program),
                'program_value' => $pendaftaran->program,
                'program_deskripsi' => Pendaftaran::PROGRAM_DESKRIPSI[$pendaftaran->program] ?? '',
                'biaya' => $pendaftaran->biaya,
                'status' => $pendaftaran->status,
                'status_label' => Pendaftaran::STATUS_LABEL[$pendaftaran->status] ?? $pendaftaran->status,
                'has_bukti' => $pendaftaran->hasBuktiPembayaran(),
                'bukti_url' => $pendaftaran->bukti_url,
                'bukti_is_pdf' => $pendaftaran->bukti_is_pdf,
            ],
            'rekening' => Pendaftaran::REKENING,
            'flash' => [
                'sukses' => session('sukses'),
            ],
        ]);
    }

    public function store(StoreBuktiPembayaranRequest $request): RedirectResponse
    {
        $pendaftaran = $request->user()->pendaftaran;

        abort_unless(
            $pendaftaran && in_array($pendaftaran->status, [Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN, Pendaftaran::STATUS_MENUNGGU], true),
            403,
        );

        $path = $request->file('bukti_pembayaran')->store('bukti-pembayaran', 'public');
        $oldPath = $pendaftaran->bukti_pembayaran;

        try {
            DB::transaction(fn () => $pendaftaran->update([
                'bukti_pembayaran' => $path,
                'status' => Pendaftaran::STATUS_MENUNGGU,
            ]));
        } catch (Throwable $e) {
            Storage::disk('public')->delete($path);
            report($e);

            return back()->withErrors([
                'bukti_pembayaran' => 'Bukti pembayaran gagal diunggah. Silakan coba lagi.',
            ]);
        }

        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        return redirect()->route('pembayaran.show')
            ->with('sukses', 'Bukti pembayaran diterima. Mohon tunggu verifikasi admin.');
    }
}
