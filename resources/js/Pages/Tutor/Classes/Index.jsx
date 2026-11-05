import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, GraduationCap, LayoutDashboard } from 'lucide-react';

export default function Index({ classes }) {
    return (
        <AdminLayout>
            <Head title="Kelas Saya" />

            <main className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Link href={route('tutor.dashboard')} className="inline-flex items-center gap-1.5 transition hover:text-red-700"><LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />Dashboard<ArrowUpRight className="h-3 w-3" aria-hidden="true" /></Link>
                        <span aria-hidden="true">›</span>
                        <span aria-current="page" className="text-red-700">Kelas Saya</span>
                    </nav>
                    <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-950">Kelas Saya</h1>
                    {classes.length === 0 ? (
                        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="font-semibold text-slate-900">Belum ada kelas yang ditugaskan</h2>
                            <p className="mt-2 text-sm text-slate-600">Kelas yang diberikan kepada Anda akan muncul di sini.</p>
                        </section>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {classes.map((courseClass, index) => (
                                <Link
                                    key={courseClass.id}
                                    href={route('tutor.classes.students.index', courseClass.id)}
                                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg"
                                >
                                    <span className="sr-only">Buka kelas: </span>
                                    <div className="h-2 bg-gradient-to-r from-red-700 via-red-600 to-red-400" />
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-900">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-950">
                                                {courseClass.students_count} murid
                                            </span>
                                        </div>
                                        <h2 className="mt-5 text-xl font-bold text-slate-950 group-hover:text-red-800">
                                            {courseClass.name}
                                        </h2>
                                        <p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">
                                            {courseClass.description || 'Buka daftar murid dan kelola nilai kelas ini.'}
                                        </p>
                                        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-red-800">
                                            <GraduationCap className="h-4 w-4" aria-hidden="true" />
                                            Kelola Nilai
                                            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </AdminLayout>
    );
}
