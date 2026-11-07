<?php

namespace App\Http\Controllers;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Membuka kembali akses calon murid lewat tautan bertanda tangan di email.
 * Dipakai saat calon murid kehilangan sesi sebelum membayar, atau saat
 * pendaftarannya ditolak dan harus diperbaiki.
 */
class LanjutkanPendaftaranController extends Controller
{
    public function __invoke(Request $request, User $user): RedirectResponse
    {
        $pendaftaran = $user->pendaftaran;

        abort_unless($pendaftaran, 403, 'Tautan ini tidak berlaku untuk akun ini.');

        if ($pendaftaran->status === Pendaftaran::STATUS_TERVERIFIKASI) {
            return redirect()->route('login')
                ->with('status', 'Akun Anda sudah aktif. Silakan masuk dengan kata sandi Anda.');
        }

        if ($pendaftaran->status === Pendaftaran::STATUS_MENUNGGU) {
            return redirect()->route('pembayaran.terkirim');
        }

        abort_unless(
            $user->bisaMelanjutkanPendaftaran(),
            403,
            'Tautan ini tidak berlaku untuk status pendaftaran Anda.',
        );

        Auth::login($user, true);
        $request->session()->regenerate();

        return $pendaftaran->status === Pendaftaran::STATUS_DITOLAK
            ? redirect()->route('registrasi.edit')
            : redirect()->route('pembayaran.show');
    }
}
