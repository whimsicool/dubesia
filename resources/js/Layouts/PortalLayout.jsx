import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    CalendarDays,
    ChevronDown,
    ClipboardCheck,
    FileText,
    GraduationCap,
    LayoutGrid,
    ListChecks,
    MessageSquare,
    Menu,
    Search,
    ShieldCheck,
    Upload,
    X,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { initials } from '@/Components/Materials/constants';

/**
 * Layout untuk guru & murid (sidebar biru tua + topbar). Admin otomatis memakai AdminLayout.
 * Item dengan `route` yang belum terdaftar tampil nonaktif ("Segera hadir").
 */
const NAV = {
    student: [
        { heading: 'Utama', items: [{ label: 'Dashboard Siswa', icon: LayoutGrid, route: 'dashboard' }] },
        {
            heading: 'Akademik Saya',
            items: [
                { label: 'Jadwal Belajar', icon: CalendarDays, route: 'schedules.index', active: 'schedules.*' },
                { label: 'Presensi Kelas', icon: ClipboardCheck, route: 'student.attendances.index', active: 'student.attendances.*' },
            ],
        },
        {
            heading: 'Pembelajaran',
            items: [
                { label: 'Materi Belajar', icon: BookOpen, route: 'materials.index', active: 'materials.*' },
                { label: 'Tes Level Kelas / Placement', icon: ListChecks, route: 'student.placement.index', active: 'student.placement.*' },
            ],
        },
        { heading: 'Evaluasi', items: [{ label: 'Laporan Nilai / Rapor', icon: FileText, route: 'student.reports.index', active: 'student.reports.*' }] },
        { heading: 'Dukungan', items: [{ label: 'Kotak Aspirasi / Feedback', icon: MessageSquare, route: 'student.feedback.index', active: 'student.feedback.*' }] },
    ],
    tutor: [
        { heading: 'Utama', items: [{ label: 'Dashboard Tutor', icon: LayoutGrid, route: 'tutor.dashboard', active: 'tutor.dashboard' }] },
        {
            heading: 'Mengajar',
            items: [
                { label: 'Jadwal Mengajar', icon: CalendarDays, route: 'tutor.schedules.index', active: 'tutor.schedules.*' },
                { label: 'Presensi Kelas', icon: ClipboardCheck, route: 'tutor.attendance.index', active: 'tutor.attendance.*' },
                { label: 'Kelola Materi', icon: Upload, route: 'tutor.materials.index', active: 'tutor.materials.*' },
            ],
        },
        {
            heading: 'Materi',
            items: [
            ],
        },
    ],
};

const hasRoute = (name) => typeof route === 'function' && route().has(name);

function NavItem({ item }) {
    const Icon = item.icon;
    const enabled = item.route && hasRoute(item.route);
    const active = enabled && route().current(item.active ?? item.route);
    const base = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors';

    if (!enabled) {
        return (
            <span className={`${base} cursor-not-allowed text-slate-500`} title="Segera hadir">
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
            </span>
        );
    }

    return (
        <Link
            href={route(item.route)}
            className={`${base} ${active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
        >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{item.label}</span>
        </Link>
    );
}

function Sidebar({ role, open, onClose }) {
    const portalRole = role === 'tutor' ? 'tutor' : role;
    const groups = NAV[portalRole] ?? NAV.student;
    const badge = portalRole === 'tutor' ? 'TUTOR' : 'SISWA';

    return (
        <>
            {open && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden print:hidden" onClick={onClose} />}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-white transition-transform print:hidden lg:translate-x-0 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center gap-3 px-5 py-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-700">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold tracking-tight">DUBESIA</span>
                            <span className="rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold">{badge}</span>
                        </div>
                        <p className="truncate text-[11px] text-slate-400">{portalRole === 'tutor' ? 'Portal Tutor' : 'Portal Pembelajaran Murid'}</p>
                    </div>
                    <button type="button" onClick={onClose} className="ml-auto text-slate-400 lg:hidden" aria-label="Tutup menu">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-4">
                    <div className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5" /> Status: Aktif
                        </span>
                    </div>
                </div>

                <nav className="mt-4 flex-1 space-y-5 overflow-y-auto border-t border-white/10 px-4 py-5">
                    {groups.map((group) => (
                        <div key={group.heading}>
                            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{group.heading}</p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavItem key={item.label} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 text-xs text-slate-400">
                    <span>Status Akun</span>
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" /> Terverifikasi
                    </span>
                </div>
            </aside>
        </>
    );
}

function TopSearch() {
    const [value, setValue] = useState('');

    const submit = (e) => {
        e.preventDefault();
        router.get(route('materials.index'), value.trim() ? { q: value.trim() } : {});
    };

    return (
        <form onSubmit={submit} className="relative hidden min-w-0 max-w-xl flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Cari materi modul, tugas, ujian, atau topik..."
                className="w-full rounded-lg border-0 bg-slate-100 py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900"
            />
        </form>
    );
}

function UserMenu({ user }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const roleLabel = { tutor: 'Tutor', student: 'Murid' }[user.role] ?? user.role;

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-3 text-left">
                <div className="hidden sm:block">
                    <p className="text-sm font-bold leading-tight text-slate-900">{user.name}</p>
                    <p className="text-[11px] font-semibold text-red-700">{roleLabel}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white ring-2 ring-slate-200">
                    {initials(user.name)}
                </span>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
                    {hasRoute('profile.edit') && (
                        <Link href={route('profile.edit')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            Profil
                        </Link>
                    )}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                        Keluar
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function PortalLayout({ children }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = auth.user;

    if (user.role === 'admin') {
        return <AdminLayout>{children}</AdminLayout>;
    }

    if (user.role === 'tutor') {
        return <AdminLayout readOnly>{children}</AdminLayout>;
    }

    if (user.role === 'student') {
        return <AdminLayout readOnly>{children}</AdminLayout>;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Sidebar role={user.role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="min-w-0 lg:pl-64 print:pl-0">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-100 bg-white px-4 sm:px-6 print:hidden">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        aria-label="Buka menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <TopSearch />

                    <div className="ml-auto flex items-center gap-2 sm:gap-4">
                        <button type="button" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifikasi">
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
                        </button>
                        <span className="hidden h-8 w-px bg-slate-200 sm:block" />
                        <UserMenu user={user} />
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">{children}</main>
            </div>
        </div>
    );
}
