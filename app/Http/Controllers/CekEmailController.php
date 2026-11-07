<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Memeriksa ketersediaan email saat pengguna mengetik di formulir.
 * Email tidak boleh dipakai lebih dari satu akun, termasuk lintas peran.
 */
class CekEmailController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'abaikan' => ['nullable', 'integer'],
        ]);

        $email = mb_strtolower(trim($validated['email']));
        $ignoreId = isset($validated['abaikan']) ? (int) $validated['abaikan'] : null;
        $pengguna = $request->user();

        $query = User::query()->whereRaw('LOWER(email) = ?', [$email]);

        // Pemilik akun sendiri atau admin boleh mengecualikan satu akun saat memeriksa.
        if ($ignoreId && ($pengguna?->isAdmin() || $pengguna?->id === $ignoreId)) {
            $query->whereKeyNot($ignoreId);
        }

        $terpakai = $query->exists();

        return response()->json([
            'tersedia' => ! $terpakai,
            'pesan' => $terpakai ? 'Email sudah terdaftar. Gunakan email lain.' : 'Email tersedia.',
        ]);
    }
}
