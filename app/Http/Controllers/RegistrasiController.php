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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
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
                    'password' => Hash::make(Str::random(64)),
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
                    'program' => $data['program'],
                    'jenis_kelas' => $data['jenis_kelas'],
                    'pesan_motivasi' => $data['pesan_motivasi'] ?? null,
                    'biaya' => Pendaftaran::biayaUntukJenisKelas($data['jenis_kelas']),
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

        // Sesi diingat agar calon murid bisa meninggalkan halaman pembayaran
        // (misalnya ke m-banking) lalu kembali tanpa kehilangan akses.
        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->route('pembayaran.show');
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
                'program' => $pendaftaran->program,
                'jenis_kelas' => $pendaftaran->jenis_kelas,
                'pesan_motivasi' => $pendaftaran->pesan_motivasi,
                'catatan_verifikasi' => $pendaftaran->catatan_verifikasi,
            ],
        ]);
    }

    public function update(UpdateRegistrasiRequest $request): RedirectResponse
    {
        $user = $request->user();
        $pendaftaran = $user->pendaftaran;
        abort_unless($pendaftaran && $pendaftaran->status === Pendaftaran::STATUS_DITOLAK, 403);

        $data = $request->validated();

        try {
            DB::transaction(function () use ($data, $user, $pendaftaran) {
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
                    'program' => $data['program'],
                    'jenis_kelas' => $data['jenis_kelas'],
                    'pesan_motivasi' => $data['pesan_motivasi'] ?? null,
                    'biaya' => Pendaftaran::biayaUntukJenisKelas($data['jenis_kelas']),
                    'status' => Pendaftaran::STATUS_MENUNGGU_PEMBAYARAN,
                    'catatan_verifikasi' => null,
                    'verified_by' => null,
                    'verified_at' => null,
                    'resubmitted_at' => now(),
                ]);
            });
        } catch (Throwable $e) {
            report($e);

            return back()->withInput()->withErrors([
                'umum' => 'Perbaikan pendaftaran gagal disimpan. Silakan coba lagi.',
            ]);
        }

        return redirect()->route('pembayaran.show')
            ->with('sukses', 'Perbaikan berhasil dikirim. Lanjutkan pembayaran untuk verifikasi ulang.');
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
                ])
                ->values(),
            'jenisKelas' => collect(Pendaftaran::JENIS_KELAS)
                ->map(fn ($label, $value) => [
                    'value' => $value,
                    'label' => $label,
                    'deskripsi' => Pendaftaran::JENIS_KELAS_DESKRIPSI[$value] ?? '',
                    'biaya' => Pendaftaran::biayaUntukJenisKelas($value),
                ])
                ->values(),
            'biaya' => Pendaftaran::BIAYA_DEFAULT,
        ];
    }
}
