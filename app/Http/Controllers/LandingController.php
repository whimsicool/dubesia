<?php

namespace App\Http\Controllers;

use App\Models\Pendaftaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Halaman publik pertama yang dilihat calon murid sebelum masuk atau mendaftar.
 *
 * Pengguna yang sudah login langsung diarahkan ke dashboard agar tidak melewati
 * alur portal.
 */
class LandingController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if ($request->user()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Landing/Index', [
            'programs' => collect(Pendaftaran::PROGRAMS)
                ->map(fn (string $label, string $value): array => [
                    'value' => $value,
                    'label' => $label,
                    'deskripsi' => Pendaftaran::PROGRAM_DESKRIPSI[$value] ?? '',
                    'biaya' => Pendaftaran::biayaUntuk($value),
                ])
                ->values(),
        ]);
    }
}
