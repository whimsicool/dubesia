<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBuktiPembayaranRequest;
use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        if ($pendaftaran->status === Pendaftaran::STATUS_MENUNGGU) {
            return redirect()->route('pembayaran.terkirim');
        }

        return Inertia::render('Registrasi/Pembayaran', [
            'pendaftaran' => [
                'nama_lengkap' => $pendaftaran->nama_lengkap,
                'email' => $pendaftaran->email,
                'program' => Pendaftaran::labelProgram($pendaftaran->program),
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

        abort_unless($pendaftaran && $pendaftaran->status === Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN, 403);

        if ($pendaftaran->hasBuktiPembayaran()) {
            return back()->withErrors([
                'bukti_pembayaran' => 'Hapus bukti pembayaran lama sebelum mengunggah berkas baru.',
            ]);
        }

        $path = $request->file('bukti_pembayaran')->store('bukti-pembayaran', 'public');

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

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('pembayaran.terkirim');
    }

    public function destroyBukti(Request $request): RedirectResponse
    {
        $pendaftaran = $request->user()->pendaftaran;

        abort_unless($pendaftaran && $pendaftaran->status === Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN, 403);

        $path = $pendaftaran->bukti_pembayaran;

        if ($path) {
            Storage::disk('public')->delete($path);
        }

        $pendaftaran->update([
            'bukti_pembayaran' => null,
            'status' => Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN,
        ]);

        return redirect()->route('pembayaran.show')
            ->with('sukses', 'Bukti pembayaran dihapus. Silakan unggah berkas baru.');
    }
}
