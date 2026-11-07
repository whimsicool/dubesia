<?php

namespace App\Http\Controllers;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Membuka kembali akses calon murid lewat tautan bertanda tangan dari email.
 * Dipakai saat calon murid kehilangan sesi sebelum membayar, atau saat
 * pendaftarannya ditolak dan harus diperbaiki.
 */
class LanjutkanPendaftaranController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        // Dibaca manual agar id yang tidak dikenal juga ditolak dengan 403,
        // bukan 404, sama seperti tanda tangan yang tidak valid.
        $user = User::query()->find((int) $request->route('user'));

        abort_unless(
            $user instanceof User && $user->bisaMelanjutkanPendaftaran(),
            403,
            'Tautan ini tidak berlaku untuk akun ini.',
        );

        Auth::login($user, true);
        $request->session()->regenerate();

        return $user->pendaftaran?->status === Pendaftaran::STATUS_DITOLAK
            ? redirect()->route('registrasi.edit')
            : redirect()->route('pembayaran.show');
    }
}
