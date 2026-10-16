<?php

namespace App\Http\Middleware;

use App\Models\Student;
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
            'flash' => [
            'success' => fn () => $request->session()->get('success'),
        ],

        // Badge merah di sidebar "Verifikasi Pendaftaran"
        'pendingRegistrations' => fn () => $request->user()?->isAdmin()
            ? Student::where('status', Student::STATUS_PENDING)->count()
            : 0,
        ];
    }
}
