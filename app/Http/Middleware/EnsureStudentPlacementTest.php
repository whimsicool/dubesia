<?php

namespace App\Http\Middleware;

use App\Models\HasilTes;
use App\Models\Pendaftaran;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudentPlacementTest
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user || $user->role !== 'student') {
            return $next($request);
        }

        $isTestRoute = $request->routeIs('tes-level.*', 'student.placement-result');
        $isResultRoute = $request->routeIs('tes-level.result', 'tes-level.onboarding-result', 'student.placement-result');
        $completedResult = HasilTes::where('id_murid', $user->id)
            ->where('status_hasil', 'completed')
            ->latest('completed_at')
            ->first();
        $isApprovedNewStudent = $user->pendaftaran?->status === Pendaftaran::STATUS_TERVERIFIKASI;

        if ($completedResult) {
            if ($isTestRoute && ! $isResultRoute) {
                return redirect()->route('student.placement-result');
            }

            return $next($request);
        }

        if ($isTestRoute && ! $isApprovedNewStudent) {
            abort(403, 'Tes penempatan hanya tersedia bagi murid baru yang telah disetujui admin.');
        }

        if ($isApprovedNewStudent && ! $isTestRoute) {
            $activeTest = HasilTes::where('id_murid', $user->id)
                ->where('status_hasil', 'in_progress')
                ->exists();

            return redirect()->route($activeTest ? 'tes-level.take' : 'tes-level.index');
        }

        return $next($request);
    }
}
