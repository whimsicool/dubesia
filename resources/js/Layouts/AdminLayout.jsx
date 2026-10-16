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
    Menu,
    MessageSquare,
    Printer,
    Search,
    Star,
    UserCheck,
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
        items: [{ label: 'Dashboard Ringkasan', icon: LayoutGrid, route: 'dashboard' }],
    },
    {
        heading: 'Pengguna & Verifikasi',
        items: [
            { label: 'Data Murid & Guru', icon: Users, route: 'admin.users.index', active: 'admin.users.*' },
            {
                label: 'Verifikasi Pendaftaran',
                icon: UserCheck,
                route: 'admin.registrations.index',
                active: 'admin.registrations.*',
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
        items: [
            { label: 'Materi Belajar', icon: BookOpen, route: 'manage.materials.index', active: 'manage.materials.*' },
            { label: 'Tes Level Kelas', icon: ListChecks, route: 'admin.placement-tests.index', active: 'admin.placement-tests.*' },
        ],
    },
    {
        heading: 'Penilaian & Rapor',
        items: [
            { label: 'Pengelolaan Nilai', icon: Star, route: 'admin.grades.index', active: 'admin.grades.*' },
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
            className={`${base} ${active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
        >
            {content}
        </Link>
    );
}

function Sidebar({ open, onClose, pendingRegistrations, readOnly, user }) {
    const scheduleRoute = user?.role === 'tutor' ? 'tutor.schedules.index' : 'schedules.index';
    const isTutor = user?.role === 'tutor';
    const groups = readOnly
        ? [
              { heading: 'Utama', items: [{ label: 'Dashboard', icon: LayoutGrid, route: 'dashboard' }] },
              { heading: 'Akademik & Jadwal', items: [{ label: 'Jadwal Belajar', icon: CalendarDays, route: scheduleRoute }] },
              ...(isTutor
                  ? [{ heading: 'Pembelajaran', items: [{ label: 'Kelola Materi', icon: BookOpen, route: 'tutor.materials.index', active: 'tutor.materials.*' }] }]
                  : []),
          ]
        : NAV;
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
                            <span className="rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold">V2.4</span>
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
                    {groups.map((group) => (
                        <div key={group.heading}>
                            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                {group.heading}
                            </p>
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

function GlobalSearch({ routeName = 'admin.schedules.index', readOnly = false }) {
    const { filters } = usePage().props;
    const [value, setValue] = useState(filters?.q ?? '');

    useEffect(() => setValue(filters?.q ?? ''), [filters?.q]);

    const submit = (e) => {
        e.preventDefault();
        router.get(route(routeName), value.trim() ? { q: value.trim() } : {}, {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="relative hidden min-w-0 max-w-xl flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={readOnly ? 'Cari jadwal, kelas, program, atau ruang...' : 'Cari jadwal, NISN, nama murid, pengajar, atau ruang...'}
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

export default function AdminLayout({ semesterName, readOnly = false, children }) {
    const { auth, pendingRegistrations = 0 } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const scheduleRoute = auth.user.role === 'tutor' ? 'tutor.schedules.index' : 'schedules.index';

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

                    {semesterName && (
                        <span className="flex min-w-0 shrink items-center gap-2 truncate rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                            <CalendarDays className="h-4 w-4 text-red-700" />
                            Sem. {semesterName}
                        </span>
                    )}

                    <GlobalSearch routeName={readOnly ? scheduleRoute : 'admin.schedules.index'} readOnly={readOnly} />

                    <div className="ml-auto flex items-center gap-2 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:block"
                            aria-label="Cetak halaman"
                        >
                            <Printer className="h-5 w-5" />
                        </button>
                        <button type="button" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifikasi">
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
                        </button>
                        <span className="hidden h-8 w-px bg-slate-200 sm:block" />
                        <UserMenu user={auth.user} />
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6">{children}</main>
            </div>
        </div>
    );
}
