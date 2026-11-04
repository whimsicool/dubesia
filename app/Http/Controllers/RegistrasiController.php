<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRegistrasiRequest;
use App\Http\Requests\UpdateRegistrasiRequest;
use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class RegistrasiController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Registrasi/Create', [
            ...$this->formOptions(),
            'editMode' => false,
        ]);
    }

    public function store(StoreRegistrasiRequest $request): RedirectResponse
    {
        $data = $request->validated();

        try {
            $user = DB::transaction(function () use ($data): User {
                $user = User::create([
                    'name' => $data['nama_lengkap'],
                    'email' => $data['email'],
                    'password' => $data['password'],
                    'no_hp' => '+62'.$data['no_whatsapp'],
                    'role' => User::ROLE_STUDENT,
                    'is_active' => false, // aktif setelah Admin memverifikasi pembayaran
                ]);

                Pendaftaran::create([
                    'user_id' => $user->id,
                    'nama_lengkap' => $data['nama_lengkap'],
                    'tanggal_lahir' => $data['tanggal_lahir'],
                    'email' => $data['email'],
                    'no_whatsapp' => '62'.$data['no_whatsapp'],
                    'alamat' => $data['alamat'],
                    'asal_institusi' => $data['asal_institusi'],
                    'pendidikan_terakhir' => $data['pendidikan_terakhir'],
                    'program' => $data['program'],
                    'pesan_motivasi' => $data['pesan_motivasi'] ?? null,
                    'biaya' => Pendaftaran::biayaUntuk($data['program']),
                    'status' => Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN,
                ]);

                return $user;
            });
        } catch (Throwable $e) {
            report($e);

            return back()->withInput()->withErrors([
                'umum' => 'Pendaftaran gagal disimpan, silakan coba lagi.',
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('pembayaran.show')
            ->with('sukses', 'Akun Anda dibuat. Selesaikan pembayaran untuk mengaktifkan pendaftaran.');
    }

    public function edit(Request $request): Response
    {
        $pendaftaran = $request->user()->pendaftaran;
        abort_unless($pendaftaran && $pendaftaran->status === Pendaftaran::STATUS_DITOLAK, 403);

        return Inertia::render('Registrasi/Create', [
            ...$this->formOptions(),
            'editMode' => true,
            'pendaftaran' => [
                'nama_lengkap' => $pendaftaran->nama_lengkap,
                'tanggal_lahir' => $pendaftaran->tanggal_lahir->format('Y-m-d'),
                'email' => $pendaftaran->email,
                'no_whatsapp' => preg_replace('/^62/', '', $pendaftaran->no_whatsapp),
                'alamat' => $pendaftaran->alamat,
                'asal_institusi' => $pendaftaran->asal_institusi,
                'pendidikan_terakhir' => $pendaftaran->pendidikan_terakhir,
                'program' => $pendaftaran->program,
                'pesan_motivasi' => $pendaftaran->pesan_motivasi,
                'catatan_verifikasi' => $pendaftaran->catatan_verifikasi,
                'bukti_url' => $pendaftaran->bukti_url,
                'bukti_is_pdf' => $pendaftaran->bukti_is_pdf,
            ],
        ]);
    }

    public function update(UpdateRegistrasiRequest $request): RedirectResponse
    {
        $user = $request->user();
        $pendaftaran = $user->pendaftaran;
        abort_unless($pendaftaran && $pendaftaran->status === Pendaftaran::STATUS_DITOLAK, 403);

        $data = $request->validated();
        $newPath = $request->file('bukti_pembayaran')?->store('bukti-pembayaran', 'public');
        $oldPath = $pendaftaran->bukti_pembayaran;
        $hasBukti = filled($newPath) || $pendaftaran->hasBuktiPembayaran();

        try {
            DB::transaction(function () use ($data, $newPath, $hasBukti, $user, $pendaftaran) {
                $user->update([
                    'name' => $data['nama_lengkap'],
                    'email' => $data['email'],
                    'no_hp' => '+62'.$data['no_whatsapp'],
                ]);

                $pendaftaran->update([
                    'nama_lengkap' => $data['nama_lengkap'],
                    'tanggal_lahir' => $data['tanggal_lahir'],
                    'email' => $data['email'],
                    'no_whatsapp' => '62'.$data['no_whatsapp'],
                    'alamat' => $data['alamat'],
                    'asal_institusi' => $data['asal_institusi'],
                    'pendidikan_terakhir' => $data['pendidikan_terakhir'],
                    'program' => $data['program'],
                    'pesan_motivasi' => $data['pesan_motivasi'] ?? null,
                    'biaya' => Pendaftaran::biayaUntuk($data['program']),
                    'bukti_pembayaran' => $newPath ?? $pendaftaran->bukti_pembayaran,
                    'status' => $hasBukti ? Pendaftaran::STATUS_MENUNGGU : Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN,
                    'catatan_verifikasi' => null,
                    'verified_by' => null,
                    'verified_at' => null,
                    'resubmitted_at' => now(),
                ]);
            });
        } catch (Throwable $e) {
            if ($newPath) {
                Storage::disk('public')->delete($newPath);
            }

            report($e);

            return back()->withInput()->withErrors([
                'umum' => 'Perbaikan pendaftaran gagal disimpan. Silakan coba lagi.',
            ]);
        }

        if ($newPath && $oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        return redirect()->route('pembayaran.show')
            ->with('sukses', 'Perbaikan berhasil dikirim.');
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'programs' => collect(Pendaftaran::PROGRAMS)
                ->map(fn ($label, $value) => [
                    'value' => $value,
                    'label' => $label,
                    'deskripsi' => Pendaftaran::PROGRAM_DESKRIPSI[$value] ?? '',
                    'biaya' => Pendaftaran::biayaUntuk($value),
                ])
                ->values(),
            'pendidikanOptions' => Pendaftaran::PENDIDIKAN_TERAKHIR,
        ];
    }
}
