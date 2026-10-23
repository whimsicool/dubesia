import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    CalendarDays,
    ChevronDown,
    ClipboardCheck,
    FileText,
    LayoutGrid,
    ListChecks,
    Menu,
    MessageSquare,
    Printer,
    UserCheck,
    UserRound,
    Users,
    X,
} from 'lucide-react';

/**
 * Menu sidebar. `route` = nama route Laravel; jika belum ada (modul belum dibuat),
 * item tampil nonaktif sampai route-nya didaftarkan.
 */
const NAV = [
    {
        heading: 'Utama',
        items: [{ label: 'Dashboard', icon: LayoutGrid, route: 'admin.dashboard', active: 'admin.dashboard' }],
    },
    {
        heading: 'Pengguna & Verifikasi',
        items: [
            { label: 'Data Murid & Guru', icon: Users, route: 'admin.data-pengguna.index', active: 'admin.data-pengguna.*' },
            {
                label: 'Verifikasi Pendaftaran',
                icon: UserCheck,
                route: 'admin.calon-murid.index',
                active: 'admin.calon-murid.*',
                badge: 'pendingRegistrations',
            },
        ],
    },
    {
        heading: 'Akademik & Jadwal',
        items: [
            { label: 'Jadwal Belajar', icon: CalendarDays, route: 'admin.schedules.index', active: 'admin.schedules.*' },
            { label: 'Presensi Kelas', icon: ClipboardCheck, route: 'admin.attendances.index', active: 'admin.attendances.*' },
        ],
    },
    {
        heading: 'Pembelajaran & Ujian',
        items: [{ label: 'Tes Level Kelas', icon: ListChecks, route: 'admin.placement-tests.index', active: 'admin.placement-tests.*' }],
    },
    {
        heading: 'Penilaian & Rapor',
        items: [
            { label: 'Laporan & Rapor', icon: FileText, route: 'admin.reports.index', active: 'admin.reports.*' },
        ],
    },
    {
        heading: 'Layanan Aspirasi',
        items: [
            { label: 'Kotak Aspirasi Murid', icon: MessageSquare, route: 'admin.feedback.index', active: 'admin.feedback.*', dot: true },
        ],
    },
];

const hasRoute = (name) => typeof route === 'function' && route().has(name);

function NavItem({ item, badgeCount }) {
    const Icon = item.icon;
    const enabled = item.route && hasRoute(item.route);
    const active = enabled && route().current(item.active ?? item.route);

    const base = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors';
    const content = (
        <>
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && badgeCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">
                    {badgeCount}
                </span>
            )}
            {item.dot && <span className="h-2 w-2 rounded-full bg-red-500" />}
        </>
    );

    if (!enabled) {
        return (
            <span className={`${base} cursor-not-allowed text-slate-500`} title="Segera hadir">
                {content}
            </span>
        );
    }

    return (
        <Link
            href={route(item.route)}
            className={`${base} border-l-4 ${active ? 'border-red-500 bg-white text-slate-950 shadow-sm' : 'border-transparent text-slate-200 hover:bg-white/10 hover:text-white'}`}
        >
            {content}
        </Link>
    );
}

function Sidebar({ open, onClose, pendingRegistrations, readOnly, user }) {
    const scheduleRoute = user?.role === 'tutor' ? 'tutor.schedules.index' : 'schedules.index';
    const studentGroups = [
        {
            heading: 'Menu Murid',
            items: [
                { label: 'Dashboard', icon: LayoutGrid, route: 'dashboard', active: 'dashboard' },
                { label: 'Profil', icon: UserRound, route: 'profile.edit', active: 'profile.*' },
                { label: 'Jadwal', icon: CalendarDays, route: 'schedules.index', active: 'schedules.*' },
                { label: 'Materi', icon: BookOpen, route: 'materials.index', active: 'materials.*' },
                { label: 'Nilai', icon: Award, route: 'student.grades.index', active: 'student.grades.*' },
                { label: 'Isi Kritik & Saran', icon: MessageSquare, route: 'student.feedback.create', active: 'student.feedback.*' },
            ],
        },
    ];
    const tutorGroups = [
        {
            heading: 'Utama',
            items: [{ label: 'Dashboard', icon: LayoutGrid, route: 'tutor.dashboard', active: 'tutor.dashboard' }],
        },
        {
            heading: 'Kegiatan Mengajar',
            items: [
                { label: 'Jadwal Mengajar', icon: CalendarDays, route: scheduleRoute, active: 'tutor.schedules.*' },
                { label: 'Kelola Presensi', icon: ClipboardCheck, route: 'tutor.attendances.index', active: 'tutor.attendances.*' },
                { label: 'Kelola Materi', icon: BookOpen, route: 'tutor.materials.index', active: 'tutor.materials.*' },
                { label: 'Kelola Nilai', icon: Award, route: 'tutor.grades.index', active: 'tutor.grades.*' },
            ],
        },
    ];
    const groups = !readOnly ? NAV : user?.role === 'student' ? studentGroups : tutorGroups;
    return (
        <>
            {open && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden print:hidden" onClick={onClose} />}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0a1530] text-white transition-transform print:hidden lg:translate-x-0 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center gap-3 px-5 py-5">
                    <img
                        src="/images/dubesia-logo.png"
                        alt="Logo Dubesia"
                        className="h-10 w-10 shrink-0 rounded-full bg-white object-contain"
                    />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold tracking-tight text-white">DUBESIA</span>
                        </div>
                        <p className="truncate text-[11px] text-slate-400">Duta Bahasa Edukasi Semesta</p>
                    </div>
                    <button type="button" onClick={onClose} className="ml-auto text-slate-400 lg:hidden" aria-label="Tutup menu">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-4">
                    <div className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200">
                        Mode: {readOnly ? (user?.role === 'tutor' ? 'Tutor' : 'Murid') : 'Admin Utama'}
                    </div>
                </div>

                <nav className="mt-4 flex-1 space-y-5 overflow-y-auto border-t border-white/10 px-4 py-5">
                    {groups.filter((group) => group.items.length > 0).map((group) => (
                        <div key={group.heading}>
                            {group.heading === 'Layanan Aspirasi' && (
                                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    {group.heading}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavItem key={item.label} item={item} badgeCount={pendingRegistrations} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 text-xs text-slate-400">
                    <span>Server Status</span>
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" /> Online
                    </span>
                </div>
            </aside>
        </>
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

    const initials = user.name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();

    const roleLabel = { admin: 'Dubes Administrator', tutor: 'Tutor', student: 'Murid' }[user.role] ?? user.role;

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-3 text-left">
                <div className="hidden sm:block">
                    <p className="text-sm font-bold leading-tight text-slate-900">{user.name}</p>
                    <p className="text-[11px] font-semibold text-red-700">{roleLabel}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white ring-2 ring-slate-200">
                    {initials}
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

export default function AdminLayout({ readOnly = false, children }) {
    const { auth, pendingRegistrations = 0 } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                pendingRegistrations={pendingRegistrations}
                readOnly={readOnly}
                user={auth.user}
            />

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

                    <div className="ml-auto flex items-center gap-2 sm:gap-4">
                        {!readOnly && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:block"
                                    aria-label="Cetak halaman"
                                >
                                    <Printer className="h-5 w-5" />
                                </button>
                                <span className="hidden h-8 w-px bg-slate-200 sm:block" />
                            </>
                        )}
                        <UserMenu user={auth.user} />
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6">{children}</main>
            </div>
        </div>
    );
}
