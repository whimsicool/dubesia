import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ courseClass }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        weight: '',
        max_score: '100',
        is_required: true,
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('tutor.classes.grade-components.store', { courseClass: courseClass.id }));
    };

    const fieldClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-50';

    return (
        <AdminLayout>
            <Head title={`Tambah Komponen Nilai - ${courseClass.name}`} />

            <main className="mx-auto max-w-7xl">
                <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Link href={route('tutor.dashboard')} className="transition hover:text-red-700">Dashboard</Link>
                    <span aria-hidden="true">›</span>
                    <Link href={route('tutor.classes.index')} className="transition hover:text-red-700">Kelas Saya</Link>
                    <span aria-hidden="true">›</span>
                    <Link
                        href={route('tutor.classes.grade-components.index', { courseClass: courseClass.id })}
                        className="transition hover:text-red-700"
                    >Komponen Nilai</Link>
                    <span aria-hidden="true">›</span>
                    <span aria-current="page" className="text-red-700">Tambah Komponen</span>
                </nav>

                <header className="mb-7">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Tambah Komponen Nilai</h1>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Komponen baru</span>
                    </div>
                    <p className="mt-2 text-slate-600">Buat komponen penilaian untuk <span className="font-semibold text-slate-800">{courseClass.name}</span>.</p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="h-1.5 bg-gradient-to-r from-red-700 via-red-600 to-rose-400" />
                        <div className="space-y-6 p-5 sm:p-7">
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-slate-800">Nama komponen</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    className={fieldClass}
                                    placeholder="Contoh: Speaking"
                                    maxLength={255}
                                    required
                                />
                                {errors.name && <p role="alert" className="mt-2 text-sm text-red-700">{errors.name}</p>}
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="weight" className="block text-sm font-semibold text-slate-800">Bobot (%)</label>
                                    <input
                                        id="weight"
                                        type="number"
                                        min="0.01"
                                        max="100"
                                        step="0.01"
                                        value={data.weight}
                                        onChange={(event) => setData('weight', event.target.value)}
                                        className={fieldClass}
                                        placeholder="Contoh: 10"
                                        required
                                    />
                                    <p className="mt-2 text-xs leading-relaxed text-slate-500">Total bobot semua komponen tidak boleh melebihi 100%.</p>
                                    {errors.weight && <p role="alert" className="mt-2 text-sm text-red-700">{errors.weight}</p>}
                                </div>
                                <div>
                                    <label htmlFor="max_score" className="block text-sm font-semibold text-slate-800">Nilai maksimum</label>
                                    <input
                                        id="max_score"
                                        type="number"
                                        min="1"
                                        max="1000"
                                        step="0.01"
                                        value={data.max_score}
                                        onChange={(event) => setData('max_score', event.target.value)}
                                        className={fieldClass}
                                        required
                                    />
                                    {errors.max_score && <p role="alert" className="mt-2 text-sm text-red-700">{errors.max_score}</p>}
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-red-200 hover:bg-red-50/40">
                                <input
                                    type="checkbox"
                                    checked={data.is_required}
                                    onChange={(event) => setData('is_required', event.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-700 focus:ring-red-500"
                                />
                                <span>
                                    <span className="block text-sm font-semibold text-slate-800">Komponen wajib diisi</span>
                                    <span className="mt-1 block text-xs text-slate-500">Nilai akhir menunggu komponen ini terisi jika ditandai wajib.</span>
                                </span>
                            </label>
                            {errors.is_required && <p role="alert" className="-mt-4 text-sm text-red-700">{errors.is_required}</p>}

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                <Link
                                    href={route('tutor.classes.grade-components.index', { courseClass: courseClass.id })}
                                    className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >Batal</Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >{processing ? 'Menyimpan...' : 'Simpan Komponen'}</button>
                            </div>
                        </div>
                    </form>

                    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl font-bold text-emerald-700" aria-hidden="true">∑</div>
                        <h2 className="mt-4 font-bold text-slate-900">Ringkasan komponen</h2>
                        <p className="mt-1 break-words text-sm text-slate-600">{data.name || 'Nama komponen'}</p>
                        <dl className="mt-5 space-y-4 border-t border-slate-100 pt-4 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-slate-500">Bobot</dt>
                                <dd className="font-semibold text-slate-900">{data.weight || '0'}%</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-slate-500">Nilai maksimum</dt>
                                <dd className="font-semibold text-slate-900">{data.max_score || '0'}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-slate-500">Status</dt>
                                <dd className={`rounded-full px-2.5 py-1 text-xs font-semibold ${data.is_required ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-600'}`}>
                                    {data.is_required ? 'Wajib' : 'Opsional'}
                                </dd>
                            </div>
                        </dl>
                    </aside>
                </div>
            </main>
        </AdminLayout>
    );
}
