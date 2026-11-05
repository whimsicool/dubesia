import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowUpRight, CirclePlus, GraduationCap, LayoutDashboard, Pencil, Trash2 } from 'lucide-react';

const formatWeight = (value) => `${Number(value || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

export default function Index({ courseClass, components, totalWeight }) {
    const { flash } = usePage().props;
    const isWeightComplete = Math.abs(Number(totalWeight) - 100) < 0.01;

    const deleteComponent = (component) => {
        if (!window.confirm(`Hapus komponen nilai “${component.name}”? Nilai dan catatan murid pada komponen ini juga akan dihapus.`)) return;

        router.delete(
            route('tutor.classes.grade-components.destroy', {
                courseClass: courseClass.id,
                grade_component: component.id,
            }),
            {
                preserveScroll: true,
                onError: (errors) => {
                    window.alert(errors.component || 'Komponen nilai gagal dihapus. Silakan coba lagi.');
                },
            },
        );
    };

    return (
        <AdminLayout>
            <Head title={`Komponen Nilai - ${courseClass.name}`} />

            <main className="mx-auto max-w-7xl">
                <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Link href={route('tutor.dashboard')} className="inline-flex items-center gap-1 transition hover:text-red-700"><LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />Dashboard<ArrowUpRight className="h-3 w-3" aria-hidden="true" /></Link>
                    <span aria-hidden="true">›</span>
                    <Link href={route('tutor.classes.index')} className="inline-flex items-center gap-1 transition hover:text-red-700"><GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />Kelas Saya<ArrowUpRight className="h-3 w-3" aria-hidden="true" /></Link>
                    <span aria-hidden="true">›</span>
                    <Link
                        href={route('tutor.classes.students.index', { courseClass: courseClass.id })}
                        className="transition hover:text-red-700"
                    >Kelola Nilai</Link>
                    <span aria-hidden="true">›</span>
                    <span aria-current="page" className="text-red-700">Komponen Nilai</span>
                </nav>

                <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Komponen Nilai</h1>
                        <p className="mt-2 text-slate-600">Kelola komponen penilaian untuk kelas <span className="font-semibold text-slate-800">{courseClass.name}</span>.</p>
                    </div>
                    <Link
                        href={route('tutor.classes.grade-components.create', courseClass.id)}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
                    >
                        <CirclePlus size={18} aria-hidden="true" />
                        Tambah Komponen
                    </Link>
                </header>

                {flash?.success && (
                    <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {flash.success}
                    </div>
                )}

                <section className="mb-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Jumlah komponen</p>
                        <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{components.length}</p>
                        <p className="mt-1 text-xs text-slate-500">Komponen penilaian di kelas ini</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total bobot</p>
                                <p className={`mt-2 text-3xl font-extrabold tracking-tight ${isWeightComplete ? 'text-emerald-700' : 'text-amber-600'}`}>
                                    {formatWeight(totalWeight)}
                                </p>
                            </div>
                            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isWeightComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {isWeightComplete ? 'Sudah sesuai' : 'Target 100%'}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Jumlah bobot komponen harus tepat 100%.</p>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                        <h2 className="font-bold text-slate-900">Daftar komponen penilaian</h2>
                        <p className="mt-1 text-sm text-slate-500">Atur bobot dan nilai maksimum setiap komponen.</p>
                    </div>

                    {components.length === 0 ? (
                        <div className="px-6 py-14 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500" aria-hidden="true">∑</div>
                            <h3 className="mt-4 font-semibold text-slate-900">Belum ada komponen nilai</h3>
                            <p className="mt-1 text-sm text-slate-500">Tambahkan komponen agar tutor dapat mengisi nilai murid.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th scope="col" className="px-5 py-4 font-bold sm:px-6">Komponen</th>
                                        <th scope="col" className="px-5 py-4 font-bold">Bobot</th>
                                        <th scope="col" className="px-5 py-4 font-bold">Nilai maksimum</th>
                                        <th scope="col" className="px-5 py-4 font-bold">Kewajiban</th>
                                        <th scope="col" className="px-5 py-4 text-right font-bold sm:px-6">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {components.map((component, index) => (
                                        <tr key={component.id} className="transition-colors hover:bg-slate-50/70">
                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-800">{String(index + 1).padStart(2, '0')}</span>
                                                    <span className="font-semibold text-slate-900">{component.name}</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums text-slate-800">{formatWeight(component.weight)}</td>
                                            <td className="whitespace-nowrap px-5 py-4 tabular-nums text-slate-700">{Number(component.max_score).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="px-5 py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${component.is_required ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-600'}`}>
                                                    {component.is_required ? 'Wajib' : 'Opsional'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route('tutor.classes.grade-components.edit', {
                                                            courseClass: courseClass.id,
                                                            grade_component: component.id,
                                                        })}
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                                    ><Pencil size={14} aria-hidden="true" />Ubah</Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteComponent(component)}
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                                    ><Trash2 size={14} aria-hidden="true" />Hapus</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </AdminLayout>
    );
}
