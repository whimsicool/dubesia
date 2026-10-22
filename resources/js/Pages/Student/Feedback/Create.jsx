import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ feedbackEntries, flash }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        message: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('student.feedback.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">Portal Murid</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Kritik &amp; Saran</h1>
                </div>
            }
        >
            <Head title="Kritik dan Saran" />

            <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link href={route('student.grades.index')} className="text-sm font-medium text-red-700 hover:text-red-900">
                            Kembali ke nilai saya
                        </Link>
                    </div>

                    <header className="mt-7">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700">Portal Murid</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Kritik dan Saran</h1>
                        <p className="mt-2 text-slate-600">Bagikan masukan agar pengalaman belajar di Dubesia semakin baik.</p>
                    </header>

                    {flash?.success && (
                        <div role="status" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div>
                            <label htmlFor="subject" className="block text-sm font-semibold text-slate-800">Topik <span className="font-normal text-slate-500">(opsional)</span></label>
                            <input
                                id="subject"
                                name="subject"
                                value={data.subject}
                                onChange={(event) => setData('subject', event.target.value)}
                                maxLength={150}
                                className="mt-2 block w-full rounded-xl border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                placeholder="Contoh: Tampilan halaman nilai"
                            />
                            {errors.subject && <p className="mt-2 text-sm text-red-600">{errors.subject}</p>}
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-semibold text-slate-800">Kritik atau saran</label>
                            <textarea
                                id="message"
                                name="message"
                                value={data.message}
                                onChange={(event) => setData('message', event.target.value)}
                                required
                                minLength={10}
                                maxLength={5000}
                                rows={6}
                                className="mt-2 block w-full rounded-xl border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                placeholder="Tuliskan masukan Anda (minimal 10 karakter)."
                            />
                            {errors.message && <p className="mt-2 text-sm text-red-600">{errors.message}</p>}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? 'Mengirimâ€¦' : 'Kirim masukan'}
                            </button>
                        </div>
                    </form>

                    <section className="mt-10">
                        <h2 className="text-xl font-bold text-slate-900">Masukan yang pernah dikirim</h2>
                        {feedbackEntries.length === 0 ? (
                            <p className="mt-3 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Belum ada masukan yang dikirim.</p>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {feedbackEntries.map((entry) => (
                                    <article key={entry.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <p className="text-xs text-slate-500">{new Date(entry.created_at).toLocaleString('id-ID')}</p>
                                        <h3 className="mt-2 font-semibold text-slate-900">{entry.subject || 'Tanpa topik'}</h3>
                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{entry.message}</p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
