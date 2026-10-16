import { Head, Link } from '@inertiajs/react';

export default function Index({ feedbackEntries }) {
    return (
        <>
            <Head title="Kritik dan Saran Student" />

            <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link href={route('admin.dashboard')} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
                            Kembali ke dashboard
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                        >
                            Keluar
                        </Link>
                    </div>

                    <header className="mt-7">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Portal admin</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Kritik dan Saran Student</h1>
                        <p className="mt-2 text-slate-600">Tinjau masukan yang dikirim oleh student.</p>
                    </header>

                    {feedbackEntries.data.length === 0 ? (
                        <section className="mt-7 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                            <h2 className="font-semibold text-slate-900">Belum ada masukan</h2>
                            <p className="mt-1 text-sm text-slate-500">Masukan student akan muncul di halaman ini.</p>
                        </section>
                    ) : (
                        <section className="mt-7 space-y-4">
                            {feedbackEntries.data.map((entry) => (
                                <article key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">{entry.subject || 'Tanpa topik'}</h2>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {entry.student?.name ?? 'Student dihapus'}
                                                {entry.student?.email ? ` · ${entry.student.email}` : ''}
                                            </p>
                                        </div>
                                        <time dateTime={entry.created_at} className="text-sm text-slate-500">
                                            {new Date(entry.created_at).toLocaleString('id-ID')}
                                        </time>
                                    </div>
                                    <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">{entry.message}</p>
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
                                            ? 'border-indigo-600 bg-indigo-600 text-white'
                                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                />
                            ))}
                        </nav>
                    )}
                </div>
            </main>
        </>
    );
}
