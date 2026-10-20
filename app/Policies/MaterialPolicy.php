<?php

namespace App\Policies;

use App\Models\Material;
use App\Models\User;

class MaterialPolicy
{
    /** Hanya tutor yang boleh membuat materi. */
    public function create(User $user): bool
    {
        return $user->canManageMaterials();
    }

    /** Murid melihat materi terbit; tutor dapat mengelola semua materi. */
    public function view(User $user, Material $material): bool
    {
        return ($user->isStudent() && $material->isPublished()) || $this->update($user, $material);
    }

    /** Pengelolaan materi tersedia untuk semua akun tutor. */
    public function update(User $user, Material $material): bool
    {
        return $user->isTutor();
    }

    public function delete(User $user, Material $material): bool
    {
        return $this->update($user, $material);
    }
}
