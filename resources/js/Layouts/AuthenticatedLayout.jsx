import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const navIcon = {
    dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
    grades: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" /></svg>,
    feedback: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-9.5a7.5 7.5 0 1 1 17 0Z" /><path d="M8 10h8M8 14h5" /></svg>,
};

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isTutor = user.role === 'tutor';
    const isAdmin = user.role === 'admin';
    const navigation = isTutor
        ? [
              {
                  label: 'Dashboard Guru',
                  href: route('tutor.dashboard'),
                  active: route().current('tutor.dashboard'),
                  icon: navIcon.dashboard,
              },
          ]
        : isAdmin
          ? [
                {
                    label: 'Kritik & Saran Murid',
                    href: route('admin.feedback.index'),
                    active: route().current('admin.feedback.*'),
                    icon: navIcon.feedback,
                },

                {
                    label: 'Calon Murid',
                    href: route('admin.calon-murid.index'),
                    active: route().current('admin.calon-murid.*'),
                    icon: navIcon.dashboard,
                },
            ]
        : [
              {
                  label: 'Dashboard',
                  href: route('student.dashboard'),
                  active: route().current('student.dashboard'),
                  icon: navIcon.dashboard,
              },
              {
                  label: 'Lihat Nilai',
                  href: route('student.grades.index'),
                  active: route().current('student.grades.*'),
                  icon: navIcon.grades,
              },
              {
                  label: 'Tes Level',
                  href: route('tes-level.index'),
                  active: route().current('tes-level.*'),
                  icon: navIcon.grades,
              },
              {
                  label: 'Kritik & Saran',
                  href: route('student.feedback.create'),
                  active: route().current('student.feedback.*'),
                  icon: navIcon.feedback,
              },
          ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Tutup menu"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-slate-950/40 md:hidden"
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform md:translate-x-0 print:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-xl font-bold text-white">D</div>
                    <div className="min-w-0 flex-1">
                        <p className="text-lg font-extrabold leading-tight tracking-tight text-slate-950">DUBESIA</p>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            {isAdmin ? 'Portal Admin' : isTutor ? 'Portal Guru' : 'Portal Murid'}
                        </p>
                    </div>
                    <span className="rounded bg-red-100 px-2 py-1 text-[10px] font-bold text-red-900">v2.4</span>
                </div>

                <div className="px-4 pt-5">
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-slate-900">
                        <span className="text-red-600" aria-hidden="true">♢</span>
                        Mode: {isAdmin ? 'Admin' : isTutor ? 'Guru / Pendidik' : 'Siswa'}
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6">
                    <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        {isAdmin ? 'Menu Admin' : isTutor ? 'Utama' : 'Menu Murid'}
                    </p>
                    <div className="mt-3 flex flex-col gap-1.5">
                        {navigation.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${item.active ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'}`}
                            >
                                <span className="h-5 w-5 shrink-0">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {isTutor && (
                        <>
                            <p className="mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Penilaian &amp; Evaluasi</p>
                            <div className="mt-3 flex flex-col gap-1.5">
                                <Link
                                    href={route('tutor.classes.index')}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${route().current('tutor.classes.*') ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}
                                >
                                    <span className="h-5 w-5">{navIcon.grades}</span>
                                    Kelola Nilai
                                </Link>
                            </div>
                        </>
                    )}
                </nav>

                <div className="border-t border-slate-100 p-4">
                    <div className="rounded-xl bg-red-50 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">Diplomatic Speech</p>
                        <p className="text-xs text-slate-600">Standard Curriculum</p>
                    </div>
                </div>
            </aside>

            <div className="min-h-screen md:pl-72">
                <div className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8 print:hidden">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Buka menu"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <span className="hidden rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-slate-700 sm:inline-flex">Sem. Ganjil 2024/2025</span>
                    </div>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <button type="button" className="inline-flex max-w-56 items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 sm:max-w-sm">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{user.name?.slice(0, 1)?.toUpperCase()}</span>
                                <span className="truncate">{user.name}</span>
                                <svg className="h-4 w-4 shrink-0 text-slate-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content align="right">
                            <Dropdown.Link href={route('profile.edit')}>Profil</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">Keluar</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>

                {header && (
                    <header className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8 print:hidden">
                        <div className="mx-auto max-w-[1600px]">{header}</div>
                    </header>
                )}

                <main>{children}</main>
            </div>
        </div>
    );
}
