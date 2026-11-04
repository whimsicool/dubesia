<?php

namespace App\Http\Middleware;

use App\Models\Pendaftaran;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Akun calon murid hanya aktif setelah admin memverifikasi pembayaran.
 * Sampai saat itu, sesi hanya boleh dipakai untuk menyelesaikan pembayaran
 * dan mengubah profil.
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
        'profile.*',
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

        return redirect()->route(
            $user->pendaftaran?->status === Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN
                ? 'pembayaran.show'
                : 'profile.edit',
        );
    }
}
