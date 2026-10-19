import { Head, Link, usePoll } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Status({ pendaftaran, loginUrl }) {
    usePoll(10000);

    const ditolak = pendaftaran.status === 'ditolak';
    const terverifikasi = pendaftaran.status === 'terverifikasi';

    useEffect(() => {
        if (!terverifikasi || !loginUrl) return;

        const timeout = window.setTimeout(() => window.location.assign(loginUrl), 3000);
        return () => window.clearTimeout(timeout);
    }, [terverifikasi, loginUrl]);

    return (
        <>
            <Head title="Status Pendaftaran | DUBESIA" />

            <div className="min-h-screen bg-[#f5f7fa] px-0 py-0 sm:px-4 sm:py-6">
                <div className="mx-auto max-w-5xl overflow-hidden border-x border-slate-200 bg-white shadow-sm sm:rounded-2xl sm:border">
                    <div className="h-1 bg-gradient-to-r from-dubesia-red via-dubesia-gold to-dubesia-navy" />

                    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-dubesia-navy font-serif text-2xl font-bold text-white">
                                D
                            </span>
                            <span>
                                <span className="block text-sm font-extrabold tracking-[0.14em] text-dubesia-navy">
                                    DUBESIA
                                </span>
                                <span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-500">
                                    Portal Pembelajaran
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="hidden text-xs text-slate-500 sm:inline">
                                Halo, calon siswa
                            </span>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-dubesia-navy hover:border-dubesia-gold hover:bg-dubesia-gold-soft"
                            >
                                Keluar
                            </Link>
                        </div>
                    </header>

                    <main className="bg-[#f4f6f9] px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
                        <div className="mx-auto max-w-4xl">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-dubesia-navy">
                                Pendaftaran siswa baru
                            </p>
                            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-dubesia-navy sm:text-5xl">
                                Status pendaftaran
                            </h1>
                            <p className="mt-4 text-sm leading-6 text-slate-500">
                                Pantau proses pemeriksaan data dan bukti pembayaranmu di sini.
                            </p>

                            <section
                                aria-live="polite"
                                className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                            >
                                <div className="flex items-start gap-4">
                                    <span
                                        aria-hidden="true"
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl font-bold ${
                                            ditolak
                                                ? 'bg-dubesia-red-soft text-dubesia-red'
                                                : terverifikasi
                                                  ? 'bg-emerald-100 text-emerald-700'
                                                  : 'bg-[#edf3fb] text-dubesia-navy'
                                        }`}
                                    >
                                        {ditolak ? '!' : terverifikasi ? '✓' : '◷'}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-lg font-bold text-dubesia-navy sm:text-xl">
                                            {ditolak
                                                ? 'Pendaftaran ditolak'
                                                : terverifikasi
                                                  ? 'Pendaftaran disetujui'
                                                  : 'Pendaftaran sedang diperiksa'}
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {ditolak
                                                ? 'Periksa catatan admin di bawah untuk mengetahui alasan penolakan.'
                                                : terverifikasi
                                                  ? 'Pendaftaranmu sudah disetujui. Silakan masuk kembali menggunakan akunmu.'
                                                  : 'Admin sedang memeriksa data pendaftaran dan bukti pembayaran. Halaman ini akan diperbarui otomatis.'}
                                        </p>

                                        <span
                                            className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                                                ditolak
                                                    ? 'bg-dubesia-red-soft text-dubesia-red'
                                                    : terverifikasi
                                                      ? 'bg-emerald-100 text-emerald-700'
                                                      : 'bg-dubesia-gold-soft text-dubesia-gold-dark'
                                            }`}
                                        >
                                            <span className="h-2 w-2 rounded-full bg-current" />
                                            {ditolak
                                                ? 'Ditolak'
                                                : terverifikasi
                                                  ? 'Disetujui'
                                                  : 'Menunggu verifikasi'}
                                        </span>

                                        {ditolak && (
                                            <div className="mt-5 rounded-lg border-l-4 border-dubesia-red bg-dubesia-red-soft p-4">
                                                <p className="text-xs font-bold uppercase tracking-wider text-dubesia-red">
                                                    Catatan admin
                                                </p>
                                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                                                    {pendaftaran.catatan_verifikasi ||
                                                        'Silakan hubungi admin untuk informasi lebih lanjut.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 flex items-start">
                                    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dubesia-navy text-sm font-bold text-white">
                                            ✓
                                        </span>
                                        <span className="text-[11px] font-semibold leading-4 text-dubesia-navy">
                                            Pendaftaran
                                            <br />
                                            terkirim
                                        </span>
                                    </div>
                                    <span className="mt-4 h-px flex-1 bg-slate-200" />
                                    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                                        <span
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                                terverifikasi
                                                    ? 'bg-emerald-600 text-white'
                                                    : ditolak
                                                      ? 'bg-dubesia-red text-white'
                                                      : 'border-2 border-dubesia-gold bg-white text-dubesia-gold-dark'
                                            }`}
                                        >
                                            {terverifikasi ? '✓' : '2'}
                                        </span>
                                        <span className="text-[11px] font-semibold leading-4 text-dubesia-navy">
                                            Verifikasi
                                            <br />
                                            admin
                                        </span>
                                    </div>
                                    <span className="mt-4 h-px flex-1 bg-slate-200" />
                                    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                                        <span
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                                terverifikasi
                                                    ? 'bg-emerald-600 text-white'
                                                    : ditolak
                                                      ? 'bg-dubesia-red text-white'
                                                    : 'border border-slate-200 bg-white text-slate-500'
                                            }`}
                                        >
                                            {terverifikasi ? '✓' : ditolak ? '!' : '3'}
                                        </span>
                                        <span
                                            className={`text-[11px] font-semibold leading-4 ${
                                                terverifikasi
                                                    ? 'text-emerald-700'
                                                    : ditolak
                                                      ? 'text-dubesia-red'
                                                      : 'text-slate-600'
                                            }`}
                                        >
                                            {terverifikasi ? 'Disetujui' : ditolak ? 'Ditolak' : 'Selesai'}
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-6 text-center text-xs leading-5 text-slate-500">
                                    {ditolak
                                        ? 'Hubungi admin setelah memperbaiki data atau bukti pembayaran.'
                                        : terverifikasi
                                          ? 'Kamu akan diarahkan ke halaman login dalam beberapa detik.'
                                          : `Program ${pendaftaran.program} · dikirim ${pendaftaran.created_at}`}
                                </p>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
