<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TolakPendaftaranRequest;
use App\Mail\PendaftaranDitolakMail;
use App\Models\Pendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Throwable;

class CalonMuridController extends Controller
{
    // Sequence 1: tampilkan daftar calon murid beserta status pendaftaran
    public function index(Request $request)
    {
        $filters = [
            'q'      => $request->query('q', ''),
            'status' => $request->query('status', ''),
        ];

        $pendaftarans = Pendaftaran::query()
            ->when($filters['status'], fn ($q, $s) => $q->where('status', $s))
            ->when($filters['q'], function ($q, $term) {
                $q->where(fn ($w) => $w
                    ->where('nama_lengkap', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%"));
            })
            ->orderByRaw('COALESCE(resubmitted_at, created_at) DESC')
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($p) => [
                'id'             => $p->id,
                'nama_lengkap'   => $p->nama_lengkap,
                'email'          => $p->email,
                'program'        => Pendaftaran::PROGRAMS[$p->program] ?? $p->program,
                'tanggal_daftar' => $p->created_at->format('d M Y, H:i'),
                'status'         => $p->status,
                'status_label'   => Pendaftaran::STATUS_LABEL[$p->status] ?? $p->status,
                'perbaikan_baru' => $p->status === Pendaftaran::STATUS_MENUNGGU && $p->resubmitted_at !== null,
            ]);

        $ringkasan = Pendaftaran::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('Admin/CalonMurid/Index', [
            'pendaftarans' => $pendaftarans,
            'filters'      => $filters,
            'statuses'     => Pendaftaran::STATUS_LABEL,
            'ringkasan'    => $ringkasan,
            'flash'        => [
                'sukses'     => session('sukses'),
                'peringatan' => session('peringatan'),
            ],
        ]);
    }

    // Sequence 2: tampilkan detail pendaftaran dan bukti pembayaran
    public function show(Pendaftaran $pendaftaran)
    {
        $pendaftaran->load('verifikator:id,name', 'user:id,username');

        return Inertia::render('Admin/CalonMurid/Show', [
            'pendaftaran' => [
                'id'                 => $pendaftaran->id,
                'nama_lengkap'       => $pendaftaran->nama_lengkap,
                'tanggal_lahir'      => $pendaftaran->tanggal_lahir->format('d M Y'),
                'email'              => $pendaftaran->email,
                'no_whatsapp'        => '+'.$pendaftaran->no_whatsapp,
                'alamat'             => $pendaftaran->alamat,
                'username'           => $pendaftaran->user?->username,
                'program'            => Pendaftaran::PROGRAMS[$pendaftaran->program] ?? $pendaftaran->program,
                'pesan_motivasi'     => $pendaftaran->pesan_motivasi,
                'biaya'              => $pendaftaran->biaya,
                'tanggal_daftar'     => $pendaftaran->created_at->format('d M Y, H:i'),
                'status'             => $pendaftaran->status,
                'status_label'       => Pendaftaran::STATUS_LABEL[$pendaftaran->status] ?? $pendaftaran->status,
                'perbaikan_baru'     => $pendaftaran->status === Pendaftaran::STATUS_MENUNGGU && $pendaftaran->resubmitted_at !== null,
                'dikirim_ulang_pada' => $pendaftaran->resubmitted_at?->format('d M Y, H:i'),
                'bukti_url'          => $pendaftaran->bukti_url,
                'bukti_is_pdf'       => $pendaftaran->bukti_is_pdf,
                'catatan_verifikasi' => $pendaftaran->catatan_verifikasi,
                'diverifikasi_oleh'  => $pendaftaran->verifikator?->name,
                'diverifikasi_pada'  => $pendaftaran->verified_at?->format('d M Y, H:i'),
                'bisa_diproses'      => $pendaftaran->status === Pendaftaran::STATUS_MENUNGGU,
            ],
            'flash' => ['error' => session('error')],
        ]);
    }

    // Sequence 3: klik "Verifikasi" -> status Terverifikasi + akun murid aktif
    public function verifikasi(Request $request, Pendaftaran $pendaftaran)
    {
        $berhasil = DB::transaction(function () use ($request, $pendaftaran) {
            $p = Pendaftaran::whereKey($pendaftaran->id)->lockForUpdate()->first();

            if ($p->status !== Pendaftaran::STATUS_MENUNGGU) {
                return false;
            }

            $p->update([
                'status'             => Pendaftaran::STATUS_TERVERIFIKASI,
                'catatan_verifikasi' => null,
                'verified_by'        => $request->user()->id,
                'verified_at'        => now(),
            ]);
            $p->user->update(['is_active' => true]);

            return true;
        });

        if (! $berhasil) {
            return back()->with('error', 'Pendaftaran ini sudah diproses sebelumnya.');
        }

        return redirect()->route('admin.calon-murid.index')
            ->with('sukses', 'Verifikasi berhasil. Akun murid telah diaktifkan.');
    }

    // Alternate flow: klik "Tolak" -> simpan catatan, ubah status, kirim email
    public function tolak(TolakPendaftaranRequest $request, Pendaftaran $pendaftaran)
    {
        $berhasil = DB::transaction(function () use ($request, $pendaftaran) {
            $p = Pendaftaran::whereKey($pendaftaran->id)->lockForUpdate()->first();

            if ($p->status !== Pendaftaran::STATUS_MENUNGGU) {
                return false;
            }

            $p->update([
                'status'             => Pendaftaran::STATUS_DITOLAK,
                'catatan_verifikasi' => $request->validated('catatan_verifikasi'),
                'verified_by'        => $request->user()->id,
                'verified_at'        => now(),
            ]);

            return true;
        });

        if (! $berhasil) {
            return back()->with('error', 'Pendaftaran ini sudah diproses sebelumnya.');
        }

        $pendaftaran->refresh();

        try {
            Mail::to($pendaftaran->email)->send(new PendaftaranDitolakMail($pendaftaran));
        } catch (Throwable $e) {
            report($e);

            return redirect()->route('admin.calon-murid.index')
                ->with('peringatan', 'Catatan tersimpan, tetapi email gagal dikirim. Periksa konfigurasi email.');
        }

        return redirect()->route('admin.calon-murid.index')
            ->with('sukses', 'Penolakan berhasil. Catatan perbaikan telah dikirim ke email calon murid.');
    }

}
