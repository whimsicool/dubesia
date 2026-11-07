<?php

namespace App\Http\Controllers;

use App\Mail\LanjutkanPendaftaranMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Mengirim tautan lanjutan ke email calon murid yang pendaftarannya belum
 * selesai. Respons selalu netral agar status akun tidak terbaca dari formulir.
 */
class KirimTautanPendaftaranController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = mb_strtolower(trim($validated['email']));
        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();
        $pendaftaran = $user?->pendaftaran;

        if ($user && $pendaftaran && $user->bisaMelanjutkanPendaftaran()) {
            try {
                Mail::to($user->email)->send(new LanjutkanPendaftaranMail($pendaftaran));
            } catch (Throwable $e) {
                report($e);
            }
        }

        return back()->with(
            'success',
            'Jika email terdaftar dan pendaftarannya belum selesai, tautan lanjutan sudah dikirim. Periksa kotak masuk dan folder spam.',
        );
    }
}
