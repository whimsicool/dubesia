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
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Throwable;

class RegistrasiController extends Controller
{
    public function edit(Request $request)
    {
        $pendaftaran = $request->user()->pendaftaran;
        abort_unless($pendaftaran && $pendaftaran->status === Pendaftaran::STATUS_DITOLAK, 403);

        return Inertia::render('Registrasi/Create', [
            'editMode' => true,
            'programs' => collect(Pendaftaran::PROGRAMS)
                ->map(fn ($label, $value) => [
                    'value' => $value,
                    'label' => $label,
                    'deskripsi' => Pendaftaran::PROGRAM_DESKRIPSI[$value] ?? '',
                ])
                ->values(),
            'biaya' => Pendaftaran::BIAYA,
            'rekening' => [
                ['bank' => 'Bank Mandiri', 'nomor' => '137-00-1982736-4', 'atas_nama' => 'Yayasan Duta Bahasa Edukasi'],
                ['bank' => 'Bank Central Asia (BCA)', 'nomor' => '542-098-1120', 'atas_nama' => 'Yayasan Duta Bahasa Edukasi'],
            ],
            'pendaftaran' => [
                'nama_lengkap' => $pendaftaran->nama_lengkap,
                'tanggal_lahir' => $pendaftaran->tanggal_lahir->format('Y-m-d'),
                'email' => $pendaftaran->email,
                'no_whatsapp' => preg_replace('/^62/', '', $pendaftaran->no_whatsapp),
                'alamat' => $pendaftaran->alamat,
                'username' => $request->user()->username,
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

        try {
            DB::transaction(function () use ($data, $newPath, $user, $pendaftaran) {
                $user->update([
                    'name' => $data['nama_lengkap'],
                    'email' => $data['email'],
                    'username' => $data['username'],
                    'no_hp' => '+62'.$data['no_whatsapp'],
                ]);

                $pendaftaran->update([
                    'nama_lengkap' => $data['nama_lengkap'],
                    'tanggal_lahir' => $data['tanggal_lahir'],
                    'email' => $data['email'],
                    'no_whatsapp' => '62'.$data['no_whatsapp'],
                    'alamat' => $data['alamat'],
                    'program' => $data['program'],
                    'pesan_motivasi' => $data['pesan_motivasi'] ?? null,
                    'bukti_pembayaran' => $newPath ?? $pendaftaran->bukti_pembayaran,
                    'status' => Pendaftaran::STATUS_MENUNGGU,
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

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')
            ->with('status', 'Perbaikan berhasil dikirim. Pendaftaran Anda kembali menunggu verifikasi admin.');
    }

    public function create()
    {
        return Inertia::render('Registrasi/Create', [
            'programs' => collect(Pendaftaran::PROGRAMS)
                ->map(fn ($label, $value) => [
                    'value'     => $value,
                    'label'     => $label,
                    'deskripsi' => Pendaftaran::PROGRAM_DESKRIPSI[$value] ?? '',
                ])
                ->values(),
            'biaya'    => Pendaftaran::BIAYA,
            'rekening' => [
                ['bank' => 'Bank Mandiri',            'nomor' => '137-00-1982736-4', 'atas_nama' => 'Yayasan Duta Bahasa Edukasi'],
                ['bank' => 'Bank Central Asia (BCA)', 'nomor' => '542-098-1120',     'atas_nama' => 'Yayasan Duta Bahasa Edukasi'],
            ],
            'sukses'   => session('sukses'),
        ]);
    }

    public function store(StoreRegistrasiRequest $request)
    {
        $data = $request->validated();
        $path = $request->file('bukti_pembayaran')->store('bukti-pembayaran', 'public');
        $oldPath = null;

        try {
            $isResubmission = DB::transaction(function () use ($data, $path, &$oldPath) {
                $rejectedUser = User::query()
                    ->where('email', $data['email'])
                    ->whereHas('pendaftaran', fn ($query) => $query->where('status', Pendaftaran::STATUS_DITOLAK))
                    ->with('pendaftaran')
                    ->first();

                if ($rejectedUser) {
                    $pendaftaran = $rejectedUser->pendaftaran;
                    $oldPath = $pendaftaran->bukti_pembayaran;

                    $rejectedUser->update([
                        'name' => $data['nama_lengkap'],
                        'email' => $data['email'],
                        'username' => $data['username'],
                        'password' => Hash::make($data['password']),
                        'no_hp' => '+62'.$data['no_whatsapp'],
                        'is_active' => false,
                    ]);

                    $pendaftaran->update([
                        'nama_lengkap' => $data['nama_lengkap'],
                        'tanggal_lahir' => $data['tanggal_lahir'],
                        'email' => $data['email'],
                        'no_whatsapp' => '62'.$data['no_whatsapp'],
                        'alamat' => $data['alamat'],
                        'program' => $data['program'],
                        'pesan_motivasi' => $data['pesan_motivasi'] ?? null,
                        'bukti_pembayaran' => $path,
                        'biaya' => Pendaftaran::BIAYA,
                        'status' => Pendaftaran::STATUS_MENUNGGU,
                        'catatan_verifikasi' => null,
                        'verified_by' => null,
                        'verified_at' => null,
                        'resubmitted_at' => now(),
                    ]);

                    return true;
                }
                $user = User::create([
                    'name'      => $data['nama_lengkap'],
                    'username'  => $data['username'],
                    'email'     => $data['email'],
                    'password'  => Hash::make($data['password']),
                    'no_hp'     => '+62'.$data['no_whatsapp'],
                    'role'      => 'student',
                    'is_active' => false, // aktif setelah diverifikasi Admin
                ]);

                Pendaftaran::create([
                    'user_id'          => $user->id,
                    'nama_lengkap'     => $data['nama_lengkap'],
                    'tanggal_lahir'    => $data['tanggal_lahir'],
                    'email'            => $data['email'],
                    'no_whatsapp'      => '62'.$data['no_whatsapp'],
                    'alamat'           => $data['alamat'],
                    'program'          => $data['program'],
                    'pesan_motivasi'   => $data['pesan_motivasi'] ?? null,
                    'bukti_pembayaran' => $path,
                    'biaya'            => Pendaftaran::BIAYA,
                    'status'           => Pendaftaran::STATUS_MENUNGGU,
                ]);

                return false;
            });
        } catch (Throwable $e) {
            Storage::disk('public')->delete($path);
            report($e);

            return back()->withInput()->withErrors([
                'umum' => 'Pendaftaran gagal disimpan, silakan coba lagi.',
            ]);
        }

        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        return redirect('/registrasi')
            ->with('sukses', $isResubmission
                ? 'Pendaftaran ulang berhasil dikirim dan menunggu verifikasi Admin.'
                : 'Bukti pembayaran berhasil dikirim, menunggu verifikasi Admin.');
    }
}
