import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ feedbackEntries }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">Portal Admin</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Kritik &amp; Saran Murid</h1>
                </div>
            }
        >
            <Head title="Kritik dan Saran Murid" />

            <main className="min-h-[calc(100vh-9rem)] bg-slate-100 px-4 py-7 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <section className="mb-6 flex flex-col gap-5 rounded-2xl bg-red-800 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-red-100">Masukan dari murid</p>
                            <h2 className="mt-1 text-xl font-bold">Dengarkan dan tinjau setiap masukan</h2>
                            <p className="mt-1 text-sm text-red-100">Semua kritik dan saran yang masuk ditampilkan di halaman ini.</p>
                        </div>
                        <div className="w-fit rounded-xl bg-white/10 px-5 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-100">Total masukan</p>
                            <p className="mt-1 text-2xl font-extrabold tabular-nums">{feedbackEntries.total}</p>
                        </div>
                    </section>

                    {feedbackEntries.data.length === 0 ? (
                        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-800">
                                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                    <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-9.5a7.5 7.5 0 1 1 17 0Z" />
                                    <path d="M8 10h8M8 14h5" />
                                </svg>
                            </div>
                            <h2 className="mt-4 font-semibold text-slate-900">Belum ada masukan</h2>
                            <p className="mt-1 text-sm text-slate-500">Masukan murid akan muncul di sini setelah dikirim.</p>
                        </section>
                    ) : (
                        <section className="space-y-4">
                            {feedbackEntries.data.map((entry) => (
                                <article key={entry.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide text-red-700">Masukan murid</p>
                                            <h2 className="mt-1 text-lg font-bold text-slate-950">{entry.subject || 'Tanpa topik'}</h2>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {entry.student?.name ?? 'Murid dihapus'}
                                                {entry.student?.email ? ` · ${entry.student.email}` : ''}
                                            </p>
                                        </div>
                                        <time dateTime={entry.created_at} className="shrink-0 text-sm text-slate-500">
                                            {new Date(entry.created_at).toLocaleString('id-ID')}
                                        </time>
                                    </div>
                                    <p className="whitespace-pre-line px-5 py-5 text-sm leading-6 text-slate-700 sm:px-6">{entry.message}</p>
                                </article>
                            ))}
                        </section>
                    )}

                    {feedbackEntries.links.length > 3 && (
                        <nav aria-label="Navigasi halaman kritik dan saran" className="mt-6 flex flex-wrap gap-2">
                            {feedbackEntries.links.map((link, index) => (
                                <Link
                                    key={`${index}-${link.label}`}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-lg border px-3 py-2 text-sm ${
                                        link.active
                                            ? 'border-red-800 bg-red-800 text-white'
                                            : 'border-slate-300 bg-white text-slate-700 hover:bg-red-50 hover:text-red-900'
                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                />
                            ))}
                        </nav>
                    )}
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
