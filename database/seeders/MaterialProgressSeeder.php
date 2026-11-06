<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\MaterialProgress;
use App\Models\User;
use Illuminate\Database\Seeder;

class MaterialProgressSeeder extends Seeder
{
    /**
     * Seed progres belajar sepuluh murid demo pada lima materi terbit pertama.
     */
    public function run(): void
    {
        $murids = User::where('role', User::ROLE_STUDENT)
            ->where('is_active', true)
            ->orderBy('id')
            ->limit(10)
            ->get();

        $materials = Material::where('status', Material::STATUS_PUBLISHED)
            ->orderBy('id')
            ->limit(5)
            ->get();

        if ($murids->isEmpty() || $materials->isEmpty()) {
            return;
        }

        foreach ($murids as $muridIndex => $murid) {
            foreach ($materials as $materialIndex => $material) {
                $selesai = ($muridIndex + $materialIndex) % 3 !== 0;
                $dibuka = now()->subDays(10 - $muridIndex)->setTime(8, 0);

                MaterialProgress::updateOrCreate(
                    ['material_id' => $material->id, 'user_id' => $murid->id],
                    [
                        'status' => $selesai ? MaterialProgress::COMPLETED : MaterialProgress::OPENED,
                        'opened_at' => $dibuka,
                        'completed_at' => $selesai ? $dibuka->copy()->addMinutes(25) : null,
                    ],
                );
            }
        }
    }
}
