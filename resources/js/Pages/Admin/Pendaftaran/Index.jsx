import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

function PendaftaranCard({ pendaftaran }) {
    const [catatan, setCatatan] = useState(pendaftaran.catatan_verifikasi ?? '');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    function perbaruiStatus(status) {
        if (status === 'ditolak' && !catatan.trim()) {
            setError('Isi catatan alasan penolakan terlebih dahulu.');
            return;
        }

        setError('');
        router.patch(
            route('admin.pendaftaran.verifikasi', pendaftaran.id),
            {
                status,
                catatan_verifikasi: status === 'ditolak' ? catatan.trim() : '',
            },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onError: (errors) =>
                    setError(
                        errors.catatan_verifikasi ??
                            errors.status ??
                            'Status pendaftaran gagal diperbarui.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    }

    const sudahDisetujui = pendaftaran.status === 'terverifikasi';

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-dubesia-navy">
                        {pendaftaran.nama_lengkap}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {pendaftaran.email} · {pendaftaran.no_whatsapp}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                        {pendaftaran.program} · {pendaftaran.biaya}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Dikirim {pendaftaran.created_at}
                    </p>
                </div>
                <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        sudahDisetujui
                            ? 'bg-dubesia-navy-soft text-dubesia-navy'
                            : pendaftaran.status === 'ditolak'
                              ? 'bg-dubesia-red-soft text-dubesia-red'
                              : 'bg-dubesia-gold-soft text-dubesia-gold-dark'
                    }`}
                >
                    {sudahDisetujui
                        ? 'Terverifikasi'
                        : pendaftaran.status === 'ditolak'
                          ? 'Ditolak'
                          : 'Menunggu verifikasi'}
                </span>
            </div>

            <a
                href={pendaftaran.bukti_pembayaran_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-dubesia-navy px-3 py-2 text-sm font-semibold text-dubesia-navy hover:bg-dubesia-navy-soft"
            >
                Lihat bukti pembayaran
            </a>

            {pendaftaran.catatan_verifikasi && (
                <p className="mt-4 rounded-lg bg-dubesia-red-soft p-3 text-sm text-slate-700">
                    <strong className="text-dubesia-red">Catatan sebelumnya:</strong>{' '}
                    {pendaftaran.catatan_verifikasi}
                </p>
            )}

            {!sudahDisetujui && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                    <label
                        htmlFor={`catatan-${pendaftaran.id}`}
                        className="block text-sm font-semibold text-slate-700"
                    >
                        Catatan penolakan
                    </label>
                    <textarea
                        id={`catatan-${pendaftaran.id}`}
                        value={catatan}
                        onChange={(event) => setCatatan(event.target.value)}
                        rows={3}
                        maxLength={5000}
                        placeholder="Wajib diisi jika pendaftaran ditolak"
                        className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-dubesia-red focus:outline-none focus:ring-2 focus:ring-dubesia-red/10"
                    />
                    {error && (
                        <p role="alert" className="mt-2 text-sm text-dubesia-red">
                            {error}
                        </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-3">
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => perbaruiStatus('terverifikasi')}
                            className="min-h-10 rounded-lg bg-dubesia-navy px-4 py-2 text-sm font-semibold text-white hover:bg-dubesia-red disabled:opacity-60"
                        >
                            Setujui pendaftaran
                        </button>
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => perbaruiStatus('ditolak')}
                            className="min-h-10 rounded-lg border border-dubesia-red px-4 py-2 text-sm font-semibold text-dubesia-red hover:bg-dubesia-red-soft disabled:opacity-60"
                        >
                            Tolak pendaftaran
                        </button>
                    </div>
                </div>
            )}
        </article>
    );
}

export default function Index({ pendaftarans }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-dubesia-navy">
                    Verifikasi Pendaftaran
                </h2>
            }
        >
            <Head title="Verifikasi Pendaftaran" />

            <main className="py-10">
                <div className="mx-auto max-w-5xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <div>
                        <h1 className="text-2xl font-bold text-dubesia-navy">
                            Pendaftaran siswa
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Periksa bukti pembayaran, lalu setujui atau tulis alasan penolakan.
                        </p>
                    </div>

                    {pendaftarans.data.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                            Belum ada pendaftaran yang masuk.
                        </div>
                    ) : (
                        pendaftarans.data.map((pendaftaran) => (
                            <PendaftaranCard
                                key={pendaftaran.id}
                                pendaftaran={pendaftaran}
                            />
                        ))
                    )}

                    {pendaftarans.links.length > 3 && (
                        <nav
                            aria-label="Navigasi halaman pendaftaran"
                            className="flex flex-wrap gap-2"
                        >
                            {pendaftarans.links.map((page, index) => (
                                page.url ? (
                                    <Link
                                        key={`${page.label}-${index}`}
                                        href={page.url}
                                        preserveScroll
                                        className={`rounded-lg border px-3 py-2 text-sm ${
                                            page.active
                                                ? 'border-dubesia-navy bg-dubesia-navy text-white'
                                                : 'border-slate-200 bg-white text-dubesia-navy hover:bg-dubesia-navy-soft'
                                        }`}
                                    >
                                        {index === 0
                                            ? 'Sebelumnya'
                                            : index === pendaftarans.links.length - 1
                                              ? 'Berikutnya'
                                              : page.label}
                                    </Link>
                                ) : null
                            ))}
                        </nav>
                    )}
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
