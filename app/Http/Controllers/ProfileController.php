<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfilePhotoRequest;
use App\Models\Pendaftaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Menampilkan profil berisi data diri yang hanya bisa dibaca dan form ubah kata sandi.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $pendaftaran = $user->pendaftaran;

        return Inertia::render('Profile/Edit', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'no_hp' => $user->no_hp,
                'nip' => $user->nip,
                'role' => $user->role,
                'class_level' => $user->class_level,
                'avatar_url' => $user->avatar_url,
                'can_upload_photo' => ! $user->isAdmin(),
            ],
            'pendaftaran' => $user->isStudent() && $pendaftaran ? [
                'nama_lengkap' => $pendaftaran->nama_lengkap,
                'tanggal_lahir' => $pendaftaran->tanggal_lahir?->toDateString(),
                'no_whatsapp' => $pendaftaran->no_whatsapp,
                'alamat' => $pendaftaran->alamat,
                'asal_institusi' => $pendaftaran->asal_institusi,
                'program' => Pendaftaran::PROGRAMS[$pendaftaran->program] ?? $pendaftaran->program,
                'biaya' => $pendaftaran->biaya,
                'status' => $pendaftaran->status,
                'status_label' => Pendaftaran::STATUS_LABEL[$pendaftaran->status] ?? $pendaftaran->status,
                'catatan_verifikasi' => $pendaftaran->catatan_verifikasi,
            ] : null,
        ]);
    }

    /**
     * Mengganti foto profil murid atau tutor.
     */
    public function updatePhoto(UpdateProfilePhotoRequest $request): RedirectResponse
    {
        $user = $request->user();
        $oldPath = $user->photo_path;
        $path = $request->file('photo')->store('profile-photos', 'public');

        $user->update(['photo_path' => $path]);

        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        return redirect()->route('profile.edit')->with('success', [
            'title' => 'Foto profil diperbarui',
            'message' => 'Foto baru tampil di menu profil dan daftar pengguna.',
        ]);
    }
}
