import { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, CirclePlus, Pencil, Power, PowerOff, Search, Trash2, UserPlus, Users } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import FlashBanner from '@/Components/Schedules/FlashBanner';
import Pagination from '@/Components/Common/Pagination';
import ClassFormModal from '@/Components/Classes/ClassFormModal';
import ManageStudentsModal from '@/Components/Classes/ManageStudentsModal';
import ClassActionModal from '@/Components/Classes/ClassActionModal';
import { levelStyle } from '@/Components/Classes/constants';
import { cleanParams } from '@/Components/Schedules/constants';

function StatCard({ label, value, icon: Icon, footer }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon className="h-[18px] w-[18px]" />
                </span>
            </div>
            <p className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{footer}</p>
        </div>
    );
}

export default function Index({ classes, filters, stats, options }) {
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters.q ?? '');
    const [form, setForm] = useState({ open: false, classId: null }); // tambah / ubah
    const [studentsFor, setStudentsFor] = useState(null);              // kelola murid
    const [action, setAction] = useState(null);                        // { classGroup, action }

    const visit = (patch, extra = {}) =>
        router.get(route('admin.classes.index'), cleanParams({ ...filters, page: undefined, ...patch }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            ...extra,
        });

    // Pencarian dengan debounce.
    useEffect(() => {
        const term = search.trim();
        if (term === (filters.q ?? '')) return undefined;

        const timer = setTimeout(() => visit({ q: term || undefined }), 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const select = 'rounded-lg border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-800 focus:border-slate-900 focus:ring-slate-900';

    return (
        <AdminLayout>
            <Head title="Kelola Kelas" />

            <FlashBanner flash={flash?.success} />

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <nav className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <Link href={route('dashboard')} className="hover:text-slate-900">
                            Dashboard Admin
                        </Link>
                        <span>›</span>
                        <span>Data Akademik</span>
                        <span>›</span>
                        <span className="text-red-700">Kelola Kelas</span>
                    </nav>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Pengelolaan Kelas</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Kelola data kelas — nama, level, deskripsi, dan tutor — serta atur murid yang tergabung di setiap kelas.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setForm({ open: true, classId: null })}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                    <CirclePlus className="h-4 w-4" />
                    Tambah Kelas
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <StatCard label="Total kelas" value={stats.total} icon={Users} footer="Seluruh kelas terdaftar" />
                <StatCard label="Kelas aktif" value={stats.active} icon={Power} footer="Dapat dijadwalkan" />
                <StatCard label="Kelas nonaktif" value={stats.inactive} icon={PowerOff} footer="Arsip / batch selesai" />
                <StatCard label="Murid tergabung" value={stats.members} icon={UserPlus} footer="Di kelas aktif (unik)" />
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama kelas, deskripsi, atau tutor…"
                        className="w-full rounded-lg border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-slate-900 focus:ring-slate-900"
                    />
                </div>
                <select aria-label="Level" value={filters.level ?? ''} onChange={(e) => visit({ level: e.target.value || undefined })} className={select}>
                    <option value="">Semua Level</option>
                    {options.levels.map((l) => (
                        <option key={l.value} value={l.value}>
                            {l.label}
                        </option>
                    ))}
                </select>
                <select aria-label="Tutor" value={filters.tutor_id ?? ''} onChange={(e) => visit({ tutor_id: e.target.value || undefined })} className={select}>
                    <option value="">Semua Tutor</option>
                    {options.tutors.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>
                <select aria-label="Status" value={filters.status ?? ''} onChange={(e) => visit({ status: e.target.value || undefined })} className={select}>
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                </select>
                <select aria-label="Urutkan" value={filters.sort} onChange={(e) => visit({ sort: e.target.value })} className={select}>
                    <option value="newest">Terbaru</option>
                    <option value="name">Nama A–Z</option>
                </select>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
                {classes.data.length === 0 ? (
                    <p className="p-12 text-center text-sm text-slate-500">
                        {filters.q || filters.level || filters.status || filters.tutor_id ? 'Tidak ada kelas yang cocok dengan filter.' : 'Belum ada kelas. Klik “Tambah Kelas” untuk membuat yang pertama.'}
                    </p>
                ) : (
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Kelas</th>
                                <th className="px-4 py-3">Level</th>
                                <th className="px-4 py-3">Tutor</th>
                                <th className="px-4 py-3">Murid</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {classes.data.map((c) => {
                                const pct = c.capacity ? Math.min(100, Math.round((c.students_count / c.capacity) * 100)) : null;

                                return (
                                    <tr key={c.id} className="hover:bg-slate-50/60">
                                        <td className="max-w-xs px-4 py-3">
                                            <p className="font-semibold text-slate-900">{c.name}</p>
                                            {c.description && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{c.description}</p>}
                                            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                                                <CalendarDays className="h-3 w-3" /> {c.schedules_count} jadwal
                                            </p>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${levelStyle(c.level)}`}>{c.level}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {c.tutor ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">{c.tutor.initials}</span>
                                                    {c.tutor.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <p className="font-semibold text-slate-800">
                                                {c.students_count}
                                                {c.capacity ? <span className="font-normal text-slate-400"> / {c.capacity}</span> : ''}
                                            </p>
                                            {pct !== null && (
                                                <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-slate-100">
                                                    <div className={`h-full ${pct >= 100 ? 'bg-red-700' : 'bg-slate-900'}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {c.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            <button type="button" onClick={() => setStudentsFor(c)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label={`Kelola murid ${c.name}`} title="Kelola murid">
                                                <Users className="h-4 w-4" />
                                            </button>
                                            <button type="button" onClick={() => setForm({ open: true, classId: c.id })} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label={`Ubah ${c.name}`} title="Ubah">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAction({ classGroup: c, action: c.is_active ? 'deactivate' : 'activate' })}
                                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                aria-label={`${c.is_active ? 'Nonaktifkan' : 'Aktifkan'} ${c.name}`}
                                                title={c.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            >
                                                {c.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                            </button>
                                            <button type="button" onClick={() => setAction({ classGroup: c, action: 'delete' })} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label={`Hapus ${c.name}`} title="Hapus">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-5">
                <Pagination paginator={classes} onPage={(page) => visit({ page })} noun="kelas" />
            </div>

            <ClassFormModal open={form.open} classId={form.classId} options={options} onClose={() => setForm({ open: false, classId: null })} />

            <ManageStudentsModal
                classGroup={studentsFor}
                onClose={(changed) => {
                    setStudentsFor(null);
                    // Segarkan daftar & statistik agar jumlah murid terbaru tampil (sequence 7.3).
                    if (changed) router.reload({ only: ['classes', 'stats'] });
                }}
            />

            <ClassActionModal target={action} onClose={() => setAction(null)} />
        </AdminLayout>
    );
}
