<?php

namespace App\Policies;

use App\Models\Material;
use App\Models\User;

class MaterialPolicy
{
    /** Guru & admin boleh membuat materi. */
    public function create(User $user): bool
    {
        return $user->canManageMaterials();
    }

    /** Murid hanya melihat materi terbit; pemilik / admin boleh melihat draft (pratinjau). */
    public function view(User $user, Material $material): bool
    {
        return $material->isPublished() || $this->update($user, $material);
    }

    /** Guru hanya boleh mengubah materi miliknya sendiri; admin boleh semuanya. */
    public function update(User $user, Material $material): bool
    {
        return $user->isAdmin() || ($user->canManageMaterials() && $material->user_id === $user->id);
    }

    public function delete(User $user, Material $material): bool
    {
        return $this->update($user, $material);
    }
}
