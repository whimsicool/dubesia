<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\HasilTes;
use App\Models\Pendaftaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();
        $status = $user->pendaftaran?->status;

        if ($status === Pendaftaran::STATUS_DITOLAK) {
            return redirect()->route('registrasi.edit');
        }

        if ($status === Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN) {
            return redirect()->route('pembayaran.show');
        }

        if ($user->role === 'student'
            && $status === Pendaftaran::STATUS_TERVERIFIKASI
            && ! HasilTes::where('id_murid', $user->id)->where('status_hasil', 'completed')->exists()) {
            return redirect()->route('tes-level.index');
        }

        $redirect = match ($user->role) {
            'admin' => route('admin.dashboard', absolute: false),
            'tutor' => route('tutor.dashboard', absolute: false),
            default => route('dashboard', absolute: false),
        };

        return redirect()->intended($redirect);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
