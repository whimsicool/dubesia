import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const bidangPerbaikan = [
    ['nama_lengkap', 'Nama lengkap'],
    ['tanggal_lahir', 'Tanggal lahir'],
    ['email', 'Email'],
    ['no_whatsapp', 'Nomor WhatsApp'],
    ['alamat', 'Alamat'],
    ['username', 'Username'],
    ['program', 'Program kursus'],
    ['bukti_pembayaran', 'Bukti pembayaran'],
    ['pesan_motivasi', 'Pesan / motivasi'],
];

function PendaftaranCard({ pendaftaran }) {
    const [catatan, setCatatan] = useState(pendaftaran.catatan_verifikasi ?? '');
    const [bagianDipilih, setBagianDipilih] = useState(pendaftaran.bagian_perbaikan ?? []);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    function perbaruiStatus(status) {
        if (status === 'ditolak' && !catatan.trim()) {
            setError('Tuliskan alasan penolakan terlebih dahulu.');
            return;
        }
        if (status === 'ditolak' && bagianDipilih.length === 0) {
            setError('Pilih setidaknya satu bagian yang perlu diperbaiki.');
            return;
        }

        setError('');
        router.patch(
            route('admin.pendaftaran.verifikasi', pendaftaran.id),
            {
                status,
                catatan_verifikasi: status === 'ditolak' ? catatan.trim() : '',
                bagian_perbaikan: status === 'ditolak' ? bagianDipilih : null,
            },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onError: (errors) =>
                    setError(
                        errors.catatan_verifikasi ??
                            errors.bagian_perbaikan ??
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
                    <fieldset>
                        <legend className="block text-sm font-semibold text-slate-700">
                            Bagian yang perlu diperbaiki
                        </legend>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {bidangPerbaikan.map(([value, label]) => (
                                <label key={value} className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={bagianDipilih.includes(value)}
                                        onChange={(event) => setBagianDipilih((current) => (
                                            event.target.checked
                                                ? [...current, value]
                                                : current.filter((item) => item !== value)
                                        ))}
                                        className="h-4 w-4 accent-dubesia-red"
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                    <label
                        htmlFor={`catatan-${pendaftaran.id}`}
                        className="block text-sm font-semibold text-slate-700"
                    >
                        Alasan penolakan
                    </label>
                    <textarea
                        id={`catatan-${pendaftaran.id}`}
                        value={catatan}
                        onChange={(event) => setCatatan(event.target.value)}
                        rows={3}
                        maxLength={5000}
                        placeholder="Contoh: Bukti transfer tidak terbaca. Silakan unggah bukti pembayaran yang lebih jelas."
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
                            Periksa data dan bukti pembayaran. Jika menolak, pilih bagian yang salah dan tulis catatan untuk murid.
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
