import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, ClipboardCheck, BookOpen, Award, ArrowRight } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard() {
    const { auth } = usePage().props;
    const cards = [
        {
            title: 'Jadwal Mengajar',
            description: 'Lihat jadwal kelas dan sesi mengajar Anda.',
            icon: CalendarDays,
            route: 'tutor.schedules.index',
        },
        {
            title: 'Kelola Presensi',
            description: 'Catat dan tinjau kehadiran murid.',
            icon: ClipboardCheck,
            route: 'tutor.attendances.index',
        },
        {
            title: 'Kelola Materi',
            description: 'Kelola materi pembelajaran kelas.',
            icon: BookOpen,
            route: 'tutor.materials.index',
        },
        {
            title: 'Kelola Nilai',
            description: 'Kelola dan tinjau nilai murid.',
            icon: Award,
            route: 'tutor.grades.index',
        },
    ];

    return (
        <AdminLayout readOnly>
            <Head title="Dashboard Tutor" />

            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Dashboard Tutor</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                    Selamat datang, {auth.user.name}
                </h1>
                <p className="mt-2 text-slate-600">Pilih menu untuk melihat jadwal, mengelola presensi, atau materi pembelajaran.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {cards.map(({ title, description, icon: Icon, route: routeName }) => {
                    const available = route().has(routeName);

                    return (
                        <section key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <span className="inline-flex rounded-xl bg-slate-100 p-3 text-slate-700">
                                <Icon className="h-6 w-6" />
                            </span>
                            <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
                            <p className="mt-1 text-sm text-slate-600">{description}</p>
                            {available ? (
                                <Link href={route(routeName)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-red-700">
                                    Buka menu <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <span className="mt-5 inline-block text-sm font-medium text-slate-400">Segera tersedia</span>
                            )}
                        </section>
                    );
                })}
            </div>
        </AdminLayout>
    );
}
