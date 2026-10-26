import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Award, BookOpen, CalendarDays, ClipboardCheck, LayoutGrid, ListChecks, MessageSquare, UserCheck, Users } from 'lucide-react';

const cards = {
    admin: [
        { label: 'Verifikasi Pendaftaran', description: 'Periksa calon murid yang menunggu verifikasi.', href: 'admin.calon-murid.index', icon: UserCheck, badge: 'pendingRegistrations' },
        { label: 'Data Murid & Guru', description: 'Kelola akun murid dan guru.', href: 'admin.data-pengguna.index', icon: Users },
        { label: 'Jadwal Belajar', description: 'Atur jadwal kelas dan cek bentrok.', href: 'admin.schedules.index', icon: CalendarDays },
        { label: 'Kotak Aspirasi', description: 'Baca kritik dan saran murid.', href: 'admin.feedback.index', icon: MessageSquare },
    ],
    tutor: [
        { label: 'Kelas Saya', description: 'Buka kelas yang Anda ajar.', href: 'tutor.dashboard', icon: LayoutGrid },
        { label: 'Jadwal Mengajar', description: 'Lihat jadwal sesi mengajar.', href: 'tutor.schedules.index', icon: CalendarDays },
        { label: 'Presensi Kelas', description: 'Isi kehadiran murid.', href: 'tutor.attendance.index', icon: ClipboardCheck },
        { label: 'Materi Belajar', description: 'Kelola materi untuk murid.', href: 'tutor.materials.index', icon: BookOpen },
    ],
    student: [
        { label: 'Jadwal Belajar', description: 'Lihat jadwal kelas Anda.', href: 'schedules.index', icon: CalendarDays },
        { label: 'Materi Belajar', description: 'Buka pustaka materi.', href: 'materials.index', icon: BookOpen },
        { label: 'Nilai Saya', description: 'Lihat nilai dan rapor.', href: 'student.grades.index', icon: Award },
        { label: 'Tes Level', description: 'Kerjakan tes level kelas.', href: 'tes-level.index', icon: ListChecks },
    ],
};

const TITLE = { admin: 'Dashboard Admin', tutor: 'Dashboard Tutor', student: 'Dashboard Murid' };

export default function Dashboard({ auth }) {
    const { pendingRegistrations = 0 } = usePage().props;
    const user = auth?.user;

    return (
        <AdminLayout title={TITLE[user?.role] ?? 'Dashboard'}>
            <Head title="Dashboard" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {(cards[user?.role] ?? []).map(({ label, description, href, icon: Icon, badge }) => (
                    <Link
                        key={label}
                        href={route(href)}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
                    >
                        <div className="flex items-start justify-between">
                            <span className="rounded-xl bg-slate-100 p-2.5 text-slate-700 group-hover:bg-slate-900 group-hover:text-white">
                                <Icon className="h-5 w-5" />
                            </span>
                            {badge && pendingRegistrations > 0 && (
                                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">{pendingRegistrations}</span>
                            )}
                        </div>
                        <p className="mt-4 text-sm font-bold text-slate-900">{label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                    </Link>
                ))}
            </div>
        </AdminLayout>
    );
}
