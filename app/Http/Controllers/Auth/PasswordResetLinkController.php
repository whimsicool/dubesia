<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\PasswordBaruMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Buat kata sandi baru dan kirim ke email pengguna.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = mb_strtolower(trim($validated['email']));
        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();

        if ($user) {
            $password = Str::password(10, symbols: false);

            try {
                DB::transaction(function () use ($user, $password): void {
                    // Cast "hashed" pada model menyandikan kata sandi ini.
                    $user->update(['password' => $password]);

                    Mail::to($user->email)->send(new PasswordBaruMail($user, $password));
                });
            } catch (Throwable $e) {
                report($e);

                return back()->withInput()->withErrors([
                    'email' => 'Kata sandi baru gagal dikirim. Periksa koneksi lalu coba lagi.',
                ]);
            }
        }

        // Pesan yang sama untuk email terdaftar maupun tidak, agar email akun
        // tidak dapat ditebak dari halaman ini.
        return back()->with('status', 'Jika email terdaftar, kata sandi baru sudah dikirim. Periksa kotak masuk dan folder spam.');
    }
}
