<?php

namespace Database\Seeders\Concerns;

use App\Models\User;
use Illuminate\Support\Collection;

trait SelectsDemoStudents
{
    /**
     * Tiga akun murid demo selalu ikut, berapa pun id-nya. Sisa kuota diisi murid
     * lain berurutan, supaya data demo tetap ada pada akun yang dipakai presentasi.
     *
     * @return Collection<int, User>
     */
    protected function studentsForSeeding(int $limit = 10): Collection
    {
        $demoEmails = ['student@dubesia.id', 'student-intermediate@dubesia.id', 'student-advance@dubesia.id'];

        $demo = User::whereIn('email', $demoEmails)
            ->where('role', User::ROLE_STUDENT)
            ->orderBy('id')
            ->get();

        $others = User::where('role', User::ROLE_STUDENT)
            ->where('is_active', true)
            ->whereNotIn('id', $demo->pluck('id'))
            ->orderBy('id')
            ->limit(max(0, $limit - $demo->count()))
            ->get();

        return $demo->concat($others)->take($limit)->values();
    }
}
