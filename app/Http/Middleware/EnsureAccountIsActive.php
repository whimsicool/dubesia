<?php

namespace App\Http\Middleware;

use App\Models\Pendaftaran;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Calon murid hanya boleh memakai sesi untuk menyelesaikan pendaftaran dan
 * pembayaran sampai admin memverifikasinya. Batasannya diambil dari status
 * pendaftaran, bukan is_active, karena baris hasil seeder punya is_active true.
 */
class EnsureAccountIsActive
{
    /**
     * Route yang tetap terbuka untuk calon murid yang belum terverifikasi.
     *
     * @var array<int, string>
     */
    private const ALLOWED_ROUTES = [
        'landing',
        'login',
        'logout',
        'email.cek',
        'panduan-pendaftaran',
        'bantuan-admisi',
        'pembayaran.*',
        'password.*',
        'registrasi.*',
        'verification.*',
        'pendaftaran.lanjutkan',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Akun yang dinonaktifkan admin langsung kehilangan sesinya.
        if ($user->status_akun === 'nonaktif') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Akun Anda nonaktif. Hubungi admin DUBESIA.',
            ]);
        }

        if (! $user->pendaftaranBelumTerverifikasi()) {
            return $next($request);
        }

        if ($request->routeIs(...self::ALLOWED_ROUTES)) {
            return $next($request);
        }

        // Permintaan tulis dan permintaan JSON tidak dialihkan: keduanya
        // ditolak langsung supaya tidak ada halaman portal yang terbuka.
        abort_if(! $request->isMethodSafe() || $request->expectsJson(), 403);

        return redirect()->route(
            $user->pendaftaran?->status === Pendaftaran::STATUS_DITOLAK
                ? 'registrasi.edit'
                : 'pembayaran.show',
        );
    }
}
