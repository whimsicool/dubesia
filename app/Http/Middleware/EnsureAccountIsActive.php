<?php

namespace App\Http\Middleware;

use App\Models\Pendaftaran;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Akun calon murid belum aktif sampai admin memverifikasi pembayaran.
 * Sesi calon murid hanya boleh dipakai untuk menyelesaikan pembayaran,
 * memperbaiki pendaftaran yang ditolak, dan keluar. Profil baru terbuka
 * setelah akun aktif.
 */
class EnsureAccountIsActive
{
    /** @var array<int, string> */
    private const ALLOWED_ROUTES = [
        'landing',
        'login',
        'register',
        'logout',
        'panduan-pendaftaran',
        'bantuan-admisi',
        'pembayaran.*',
        'password.*',
        'registrasi.*',
        'verification.*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->is_active) {
            return $next($request);
        }

        if ($request->routeIs(...self::ALLOWED_ROUTES)) {
            return $next($request);
        }

        $status = $user->pendaftaran?->status;

        if ($status === Pendaftaran::STATUS_DITOLAK) {
            return redirect()->route('registrasi.edit');
        }

        if (in_array($status, [Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN, Pendaftaran::STATUS_MENUNGGU], true)) {
            return redirect()->route('pembayaran.show');
        }

        // Akun nonaktif tanpa alur pendaftaran yang sah tidak diberi sesi.
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')
            ->withErrors(['email' => 'Akun Anda tidak aktif. Hubungi admin DUBESIA.']);
    }
}
