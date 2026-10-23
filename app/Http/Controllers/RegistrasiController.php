<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRegistrasiRequest;
use App\Http\Requests\UpdateRegistrasiRequest;
use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Throwable;

class RegistrasiController extends Controller
{
    public function create(Request $request)
    {
        $user = $request->user();
        $pendaftaran = $user?->pendaftaran;
        $isResubmission = $pendaftaran?->status === Pendaftaran::STATUS_DITOLAK;
        $bagianPerbaikan = $isResubmission ? ($pendaftaran->bagian_perbaikan ?? []) : [];

        if ($isResubmission && empty($bagianPerbaikan)) {
            $bagianPerbaikan = $this->inferCorrectionFields($pendaftaran->catatan_verifikasi);
        }

        return Inertia::render('Registrasi/Create', [
            'programs' => collect(Pendaftaran::PROGRAMS)
                ->map(fn ($label, $value) => [
                    'value' => $value,
                    'label' => $label,
                    'deskripsi' => Pendaftaran::PROGRAM_DESKRIPSI[$value] ?? '',
                    'biaya' => Pendaftaran::BIAYA_PER_PROGRAM[$value],
                ])
                ->values(),
            'rekening' => [
                ['bank' => 'Bank Mandiri',            'nomor' => '137-00-1982736-4', 'atas_nama' => 'Yayasan Duta Bahasa Edukasi'],
                ['bank' => 'Bank Central Asia (BCA)', 'nomor' => '542-098-1120',     'atas_nama' => 'Yayasan Duta Bahasa Edukasi'],
            ],
            'sukses' => session('sukses'),
            'isResubmission' => $isResubmission,
            'catatanVerifikasi' => $isResubmission ? $pendaftaran->catatan_verifikasi : null,
            'bagianPerbaikan' => $bagianPerbaikan,
            'initialData' => $isResubmission ? [
                'nama_lengkap' => $pendaftaran->nama_lengkap,
                'tanggal_lahir' => $pendaftaran->tanggal_lahir?->format('Y-m-d'),
                'email' => $user->email,
                'no_whatsapp' => preg_replace('/^(62|0)/', '', $pendaftaran->no_whatsapp),
                'alamat' => $pendaftaran->alamat,
                'username' => $user->username,
                'program' => $pendaftaran->program,
                'pesan_motivasi' => $pendaftaran->pesan_motivasi ?? '',
            ] : [],
        ]);
    }

    private function inferCorrectionFields(?string $note): array
    {
        $note = mb_strtolower($note ?? '');
        $keywordsByField = [
            'bukti_pembayaran' => ['bukti', 'transfer', 'pembayaran', 'struk', 'kwitansi'],
            'nama_lengkap' => ['nama'],
            'tanggal_lahir' => ['tanggal lahir', 'tgl lahir'],
            'email' => ['email', 'surel'],
            'no_whatsapp' => ['whatsapp', 'nomor hp', 'no hp', 'telepon', 'ponsel', 'handphone'],
            'alamat' => ['alamat'],
            'username' => ['username', 'nama pengguna'],
            'program' => ['program', 'kursus'],
            'pesan_motivasi' => ['motivasi'],
        ];

        return collect($keywordsByField)
            ->filter(fn (array $keywords) => collect($keywords)->contains(
                fn (string $keyword) => str_contains($note, $keyword),
            ))
            ->keys()
            ->values()
            ->all();
    }

    public function store(StoreRegistrasiRequest $request)
    {
        $data = $request->validated();
        $path = $request->file('bukti_pembayaran')->store('bukti-pembayaran', 'public');

        try {
            DB::transaction(function () use ($data, $path) {
                $user = User::create([
                    'name' => $data['nama_lengkap'],
                    'username' => $data['username'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                    'role' => 'student',
                    'is_active' => false, // aktif setelah diverifikasi Admin
                ]);

                Pendaftaran::create([
                    'user_id' => $user->id,
                    'nama_lengkap' => $data['nama_lengkap'],
                    'tanggal_lahir' => $data['tanggal_lahir'],
                    'email' => $data['email'],
                    'no_whatsapp' => '62'.$data['no_whatsapp'],
                    'alamat' => $data['alamat'],
                    'program' => $data['program'],
                    'pesan_motivasi' => $data['pesan_motivasi'] ?? null,
                    'bukti_pembayaran' => $path,
                    'biaya' => Pendaftaran::BIAYA_PER_PROGRAM[$data['program']],
                    'status' => Pendaftaran::STATUS_MENUNGGU,
                ]);
            });
        } catch (Throwable $e) {
            Storage::disk('public')->delete($path);
            report($e);

            return back()->withInput()->withErrors([
                'umum' => 'Pendaftaran gagal disimpan, silakan coba lagi.',
            ]);
        }

        return redirect('/registrasi')
            ->with('sukses', 'Pendaftaran berhasil dikirim. Masuk ke akun Anda untuk melihat status verifikasi.');
    }

    public function updateRejected(UpdateRegistrasiRequest $request)
    {
        $pendaftaran = $request->user()->pendaftaran;
        abort_unless($pendaftaran && $pendaftaran->status === Pendaftaran::STATUS_DITOLAK, 403);

        $data = $request->validated();
        $newPath = $request->file('bukti_pembayaran')?->store('bukti-pembayaran', 'public');
        $oldPath = $pendaftaran->bukti_pembayaran;

        try {
            DB::transaction(function () use ($data, $newPath, $pendaftaran, $request) {
                $userData = [
                    'name' => $data['nama_lengkap'],
                    'username' => $data['username'],
                    'email' => $data['email'],
                    'is_active' => false,
                ];

                if (! empty($data['password'])) {
                    $userData['password'] = Hash::make($data['password']);
                }

                $request->user()->update($userData);
                $pendaftaran->update([
                    'nama_lengkap' => $data['nama_lengkap'],
                    'tanggal_lahir' => $data['tanggal_lahir'],
                    'email' => $data['email'],
                    'no_whatsapp' => '62'.$data['no_whatsapp'],
                    'alamat' => $data['alamat'],
                    'program' => $data['program'],
                    'pesan_motivasi' => $data['pesan_motivasi'] ?? null,
                    'bukti_pembayaran' => $newPath ?? $pendaftaran->bukti_pembayaran,
                    'biaya' => Pendaftaran::BIAYA_PER_PROGRAM[$data['program']],
                    'status' => Pendaftaran::STATUS_MENUNGGU,
                    'catatan_verifikasi' => null,
                    'bagian_perbaikan' => null,
                    'verified_by' => null,
                    'verified_at' => null,
                ]);
            });
        } catch (Throwable $e) {
            if ($newPath) {
                Storage::disk('public')->delete($newPath);
            }
            report($e);

            return back()->withInput()->withErrors([
                'umum' => 'Perbaikan gagal disimpan. Data lama tetap tersimpan, silakan coba lagi.',
            ]);
        }

        if ($newPath && $oldPath !== $newPath) {
            Storage::disk('public')->delete($oldPath);
        }

        return redirect()->route('pendaftaran.status');
    }
}
