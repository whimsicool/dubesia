import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

const formatScore = (score) =>
    score === null || score === undefined || score === ''
        ? 'Belum tersedia'
        : Number(score).toLocaleString('id-ID', { maximumFractionDigits: 2 });

export default function Index({ grades }) {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <div className="print:hidden">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">Portal Murid</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Nilai Saya</h1>
                </div>
            }
        >
            <Head title="Nilai Saya" />

            <main className="min-h-[calc(100vh-9rem)] bg-slate-100 px-4 py-7 sm:px-6 lg:px-8 print:min-h-0 print:bg-white print:px-0 print:py-0">
                <div className="mx-auto max-w-5xl print:max-w-none">
                    <div className="mb-6 hidden border-b border-slate-300 pb-5 print:block">
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Dubesia • Laporan Nilai</p>
                        <h1 className="mt-2 text-2xl font-bold text-slate-950">Nilai Saya</h1>
                        <p className="mt-1 text-sm text-slate-600">Nama: {auth.user.name}</p>
                        <p className="text-sm text-slate-600">Dicetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    </div>

                    <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-red-800 p-6 text-white shadow-sm print:hidden sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-red-100">Ringkasan akademik</p>
                            <h2 className="mt-1 text-xl font-bold">Pantau perkembangan belajar Anda</h2>
                            <p className="mt-1 text-sm text-red-100">Nilai yang ditampilkan hanya milik akun Anda.</p>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-red-900 transition hover:bg-red-50"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
                                    <path d="M7 14h10v7H7z" />
                                </svg>
                                Unduh Nilai PDF
                            </button>
                            <p className="mt-2 text-xs text-red-100">Pilih “Simpan sebagai PDF” pada dialog cetak.</p>
                        </div>
                    </div>

                    {grades.length === 0 ? (
                                <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm print:border-0 print:shadow-none">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-800">
                                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                    <path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" />
                                </svg>
                            </div>
                            <h3 className="mt-4 font-semibold text-slate-900">Nilai belum tersedia</h3>
                            <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">Nilai akan muncul di sini setelah guru menginput dan menyimpannya.</p>
                        </section>
                    ) : (
                        <div className="space-y-4">
                            {grades.map((grade) => (
                                <article key={grade.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:break-inside-avoid print:shadow-none">
                                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide text-red-700">{grade.course_class?.name || 'Nilai'}</p>
                                            <h3 className="mt-1 text-lg font-bold text-slate-950">{grade.subject}</h3>
                                            <p className="mt-1 text-xs text-slate-500">Diperbarui {new Date(grade.updated_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-xl bg-red-50 px-4 py-2 text-center">
                                                <p className="text-[10px] font-bold uppercase tracking-wide text-red-700">Nilai Akhir</p>
                                                <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-red-950">{formatScore(grade.score)}</p>
                                            </div>
                                            <div className="rounded-xl bg-slate-100 px-4 py-2 text-center">
                                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Predikat</p>
                                                <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{grade.grade || '—'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {grade.component_scores?.length > 0 && (
                                        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:px-6">
                                            {grade.component_scores.map((score) => (
                                                <div key={score.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <p className="text-sm font-semibold text-slate-700">{score.grade_component?.name || 'Komponen nilai'}</p>
                                                        <p className="shrink-0 text-sm font-bold tabular-nums text-slate-950">{formatScore(score.score)}</p>
                                                    </div>
                                                    {score.feedback && <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-600">{score.feedback}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {grade.feedback && (
                                        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Catatan guru</p>
                                            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{grade.feedback}</p>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
