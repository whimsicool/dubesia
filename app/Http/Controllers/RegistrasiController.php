<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRegistrasiRequest;
use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Throwable;

class RegistrasiController extends Controller
{
    public function create()
    {
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
        ]);
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
}
