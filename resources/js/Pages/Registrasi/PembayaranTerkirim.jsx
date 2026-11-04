import { Link } from '@inertiajs/react';
import AdmisiShell from '@/Components/Registrasi/AdmisiShell';

export default function PembayaranTerkirim() {
  return (
    <AdmisiShell title="Pembayaran Terkirim">
      <section className="mx-auto mt-8 max-w-xl rounded-2xl border border-slate-100 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl font-bold text-emerald-600">
          ✓
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Bukti pembayaran berhasil terkirim</h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Cek notifikasi email Anda. Admin akan memverifikasi pembayaran, lalu
          kata sandi sementara dikirim ke email yang Anda daftarkan.
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Formulir pembayaran sudah final dan tidak dapat diubah lagi.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Masuk ke DUBESIA
          </Link>

          <Link
            href={route('landing')}
            className="inline-flex rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Kembali ke beranda
          </Link>
        </div>
      </section>
    </AdmisiShell>
  );
}
