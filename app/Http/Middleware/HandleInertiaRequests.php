<?php

namespace App\Http\Middleware;

use App\Models\Pendaftaran;
use App\Models\HasilTes;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            'auth' => [
                'user' => $request->user(),
            ],

            'studentPlacementRequired' => fn () => $request->user()?->role === 'student'
                && $request->user()->pendaftaran?->status === Pendaftaran::STATUS_TERVERIFIKASI
                && ! HasilTes::where('id_murid', $request->user()->id)->where('status_hasil', 'completed')->exists(),

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],

            'pendingRegistrations' => fn () => $request->user()?->isAdmin()
                ? Pendaftaran::where('status', Pendaftaran::STATUS_MENUNGGU)->count()
                : 0,
        ];
    }
}
