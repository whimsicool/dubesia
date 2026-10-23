import { Head, Link, usePoll } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Status({ pendaftaran, loginUrl, userName }) {
    usePoll(10000);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

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

            <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f7fa] px-0 py-0">
                <div className="flex min-h-screen w-full flex-col overflow-hidden border-b border-slate-200 bg-white shadow-sm">
                    <div className="h-1 bg-gradient-to-r from-dubesia-red via-dubesia-gold to-dubesia-navy" />

                    <header className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:gap-4 sm:px-8 sm:py-4">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            <img
                                src="/images/dubesia-logo.png"
                                alt="Logo DUBESIA"
                                className="h-10 w-10 shrink-0 rounded-full object-contain sm:h-11 sm:w-11"
                            />
                            <span className="min-w-0">
                                <span className="block text-xs font-extrabold tracking-[0.14em] text-dubesia-navy sm:text-sm">
                                    DUBESIA
                                </span>
                                <span className="mt-1 block text-[9px] uppercase tracking-wide text-slate-500 sm:text-[10px]">
                                    Portal Pembelajaran
                                </span>
                            </span>
                        </div>
                        <div className="relative">
                            <button
                                type="button"
                                aria-expanded={userMenuOpen}
                                onClick={() => setUserMenuOpen((open) => !open)}
                                className="inline-flex max-w-[min(55vw,15rem)] items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-dubesia-navy hover:bg-slate-50 sm:gap-2.5 sm:px-3 sm:text-sm"
                            >
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
                                >
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                                </svg>
                                <span className="truncate">{userName || 'Akun saya'}</span>
                                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                                    <path fillRule="evenodd" d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                </svg>
                            </button>
                            {userMenuOpen && (
                                <div className="absolute right-0 top-full z-20 mt-2 min-w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="block w-full px-4 py-2.5 text-left text-sm font-medium text-dubesia-navy hover:bg-slate-50"
                                    >
                                        Logout
                                    </Link>
                                </div>
                            )}
                        </div>
                    </header>

                    <main className="flex-1 bg-[#f4f6f9] px-4 py-8 sm:px-8 sm:py-12 lg:px-12 xl:px-16">
                        <div className="w-full">
                            <div className="relative mb-7 overflow-hidden rounded-2xl border border-[#263b5d] bg-dubesia-navy px-5 py-6 shadow-sm sm:mb-9 sm:px-8 sm:py-8">
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-y-0 right-0 w-1.5 bg-gradient-to-b from-dubesia-red via-dubesia-gold to-white sm:w-2"
                                />
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                                    <span className="h-2 w-2 rounded-full bg-dubesia-gold-light" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-dubesia-gold-light sm:text-xs">
                                        Pendaftaran murid baru
                                    </p>
                                </div>
                                <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                                    Status pendaftaran
                                </h1>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100 sm:text-base sm:leading-7">
                                    Pantau proses verifikasi data dan bukti pembayaran pendaftaranmu di sini.
                                </p>
                            </div>

                            <section
                                aria-live="polite"
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7"
                            >
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <span
                                        aria-hidden="true"
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl font-bold sm:h-12 sm:w-12 sm:text-2xl ${
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
                                        <h2 className="text-base font-bold leading-6 text-dubesia-navy sm:text-xl">
                                            {ditolak
                                                ? 'Pendaftaran ditolak'
                                                : terverifikasi
                                                  ? 'Pendaftaran disetujui'
                                                  : 'Pendaftaran sedang ditinjau'}
                                        </h2>
                                        <p className="mt-2 text-sm leading-5 text-slate-500 sm:leading-6">
                                            {ditolak
                                                ? 'Periksa catatan admin dan perbaiki bagian yang ditandai pada formulir.'
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
                                            <div className="mt-5">
                                                <div className="rounded-lg border-l-4 border-dubesia-red bg-dubesia-red-soft p-4">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-dubesia-red">
                                                        Catatan dari admin
                                                    </p>
                                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                                                        {pendaftaran.catatan_verifikasi ||
                                                            'Admin belum menambahkan catatan. Hubungi admin untuk mengetahui bagian yang perlu diperbaiki.'}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={route('registrasi.create')}
                                                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-dubesia-red px-5 py-3 text-sm font-bold text-white transition hover:bg-dubesia-navy"
                                                >
                                                    Perbaiki Pendaftaran
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-7 flex items-start sm:mt-8">
                                    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-dubesia-navy text-base font-bold text-white sm:h-12 sm:w-12 sm:text-lg">
                                            ✓
                                        </span>
                                        <span className="text-center text-xs font-semibold leading-5 text-dubesia-navy sm:text-sm">
                                            Pendaftaran
                                            <br />
                                            terkirim
                                        </span>
                                    </div>
                                    <span className="mt-5 h-px flex-1 bg-slate-200 sm:mt-6" />
                                    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                                        <span
                                            className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold sm:h-12 sm:w-12 sm:text-lg ${
                                                terverifikasi
                                                    ? 'bg-emerald-600 text-white'
                                                    : ditolak
                                                      ? 'bg-dubesia-red text-white'
                                                      : 'border-2 border-dubesia-gold bg-white text-dubesia-gold-dark'
                                            }`}
                                        >
                                            {terverifikasi ? '✓' : '2'}
                                        </span>
                                        <span className="text-center text-xs font-semibold leading-5 text-dubesia-navy sm:text-sm">
                                            Verifikasi
                                            <br />
                                            admin
                                        </span>
                                    </div>
                                    <span className="mt-5 h-px flex-1 bg-slate-200 sm:mt-6" />
                                    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                                        <span
                                            className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold sm:h-12 sm:w-12 sm:text-lg ${
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
                                            className={`text-center text-xs font-semibold leading-5 sm:text-sm ${
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

                                <p className="mt-6 break-words text-center text-[11px] leading-5 text-slate-500 sm:text-xs">
                                    {ditolak
                                        ? 'Data pendaftaranmu akan tetap tersimpan saat diperbaiki.'
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
