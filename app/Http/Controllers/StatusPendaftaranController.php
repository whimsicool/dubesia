<?php

namespace App\Http\Controllers;

use App\Models\Pendaftaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StatusPendaftaranController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $pendaftaran = $request->user()->pendaftaran;

        abort_unless($pendaftaran, 404);

        if ($pendaftaran->status === Pendaftaran::STATUS_TERVERIFIKASI) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return Inertia::render('Registrasi/Status', [
                'pendaftaran' => [
                    'status' => $pendaftaran->status,
                    'catatan_verifikasi' => $pendaftaran->catatan_verifikasi,
                    'bagian_perbaikan' => $pendaftaran->bagian_perbaikan ?? [],
                    'program' => Pendaftaran::PROGRAMS[$pendaftaran->program] ?? $pendaftaran->program,
                    'created_at' => $pendaftaran->created_at?->format('d M Y, H:i'),
                ],
                'loginUrl' => route('login'),
            ]);
        }

        return Inertia::render('Registrasi/Status', [
            'userName' => $request->user()->name,
            'pendaftaran' => [
                'status' => $pendaftaran->status,
                'catatan_verifikasi' => $pendaftaran->catatan_verifikasi,
                'bagian_perbaikan' => $pendaftaran->bagian_perbaikan ?? [],
                'program' => Pendaftaran::PROGRAMS[$pendaftaran->program] ?? $pendaftaran->program,
                'created_at' => $pendaftaran->created_at?->format('d M Y, H:i'),
            ],
        ]);
    }
}
