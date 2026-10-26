import { useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { CalendarDays, CirclePlus, EyeOff, Pencil, Power, Search, Trash2, UserPlus, Users } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import FlashBanner from '@/Components/Common/FlashBanner';
import PageHeader from '@/Components/Admin/PageHeader';
import Pagination from '@/Components/Common/Pagination';
import StatCard from '@/Components/Admin/StatCard';
import ClassFormModal from '@/Components/Classes/ClassFormModal';
import ClassStudentsModal from '@/Components/Classes/ClassStudentsModal';
import DeleteClassModal from '@/Components/Classes/DeleteClassModal';
import { visitFilters } from '@/Components/Admin/filters';

const LEVEL_STYLES = {
    A1: 'bg-emerald-100 text-emerald-800',
    A2: 'bg-emerald-50 text-emerald-700',
    B1: 'bg-amber-100 text-amber-800',
    B2: 'bg-amber-50 text-amber-700',
    C1: 'bg-red-700 text-white',
    C2: 'bg-slate-900 text-white',
};

const selectClass = 'rounded-lg border-slate-200 text-sm text-slate-700 focus:border-slate-900 focus:ring-slate-900';

export default function Index({ classes, filters, stats, options }) {
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters.q ?? '');
    const searchTimer = useRef(null);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [rosterFor, setRosterFor] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const apply = (patch) =>
        visitFilters('admin.classes.index', {
            q: search,
            level: filters.level,
            tutor_id: filters.tutor_id,
            status: filters.status,
            sort: filters.sort,
            ...patch,
        });

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearch(value);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => apply({ q: value }), 400);
    };

    const toggleStatus = (courseClass) => {
        router.patch(route('admin.classes.status', courseClass.id), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="Kelola Kelas" />

            <FlashBanner flash={flash?.success} />
            <FlashBanner flash={flash?.error} tone="error" />

            <PageHeader
                breadcrumbs={[
                    { label: 'Dashboard Admin', route: 'admin.dashboard' },
                    { label: 'Data Akademik' },
                    { label: 'Kelola Kelas' },
                ]}
                title="Pengelolaan Kelas"
                description="Kelola data kelas — nama, level, deskripsi, dan tutor — serta atur murid yang tergabung di setiap kelas."
                actions={
                    <button
                        type="button"
                        onClick={() => {
                            setEditing(null);
                            setFormOpen(true);
                        }}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Tambah Kelas
                    </button>
                }
            />

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Kelas" value={stats.total} caption="Seluruh kelas terdaftar" icon={Users} />
                <StatCard label="Kelas Aktif" value={stats.active} caption="Dapat dijadwalkan" icon={Power} />
                <StatCard label="Kelas Nonaktif" value={stats.inactive} caption="Arsip / batch selesai" icon={EyeOff} />
                <StatCard
                    label="Murid Tergabung"
                    value={stats.students}
                    caption="Di kelas aktif (unik)"
                    icon={UserPlus}
                />
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="relative min-w-[240px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        placeholder="Cari nama kelas, deskripsi, atau tutor…"
                        className="w-full rounded-lg border-slate-200 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900"
                    />
                </div>

                <select
                    value={filters.level ?? ''}
                    onChange={(event) => apply({ level: event.target.value })}
                    className={selectClass}
                    aria-label="Filter level"
                >
                    <option value="">Semua Level</option>
                    {options.levels.map((level) => (
                        <option key={level.value} value={level.value}>
                            {level.value} — {level.label}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.tutor_id ?? ''}
                    onChange={(event) => apply({ tutor_id: event.target.value })}
                    className={selectClass}
                    aria-label="Filter tutor"
                >
                    <option value="">Semua Tutor</option>
                    {options.tutors.map((tutor) => (
                        <option key={tutor.id} value={tutor.id}>
                            {tutor.name}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.status ?? ''}
                    onChange={(event) => apply({ status: event.target.value })}
                    className={selectClass}
                    aria-label="Filter status"
                >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                </select>

                <select
                    value={filters.sort ?? 'newest'}
                    onChange={(event) => apply({ sort: event.target.value })}
                    className={selectClass}
                    aria-label="Urutkan"
                >
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                    <option value="name">Nama A–Z</option>
                </select>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
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
                        {classes.data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center">
                                    <p className="font-semibold text-slate-700">Belum ada kelas yang cocok</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Ubah filter pencarian atau tambah kelas baru.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            classes.data.map((courseClass) => {
                                const filled = courseClass.capacity
                                    ? Math.min(100, Math.round((courseClass.students_count / courseClass.capacity) * 100))
                                    : 0;

                                return (
                                    <tr key={courseClass.id} className="hover:bg-slate-50/60">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-900">{courseClass.name}</p>
                                            {courseClass.description && (
                                                <p className="line-clamp-1 max-w-sm text-xs text-slate-500">
                                                    {courseClass.description}
                                                </p>
                                            )}
                                            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {courseClass.schedules_count} jadwal
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {courseClass.level ? (
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                                                        LEVEL_STYLES[courseClass.level] ?? 'bg-slate-100 text-slate-700'
                                                    }`}
                                                    title={courseClass.level_label}
                                                >
                                                    {courseClass.level}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {courseClass.tutor ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                                                        {courseClass.tutor.initials}
                                                    </span>
                                                    <span className="text-slate-800">{courseClass.tutor.name}</span>
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">Belum ditugaskan</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-slate-900">
                                                <span className="font-semibold">{courseClass.students_count}</span>
                                                {courseClass.capacity && (
                                                    <span className="text-slate-400"> / {courseClass.capacity}</span>
                                                )}
                                            </p>
                                            {courseClass.capacity && (
                                                <span className="mt-1.5 block h-1 w-24 rounded-full bg-slate-100">
                                                    <span
                                                        className="block h-1 rounded-full bg-slate-900"
                                                        style={{ width: `${filled}%` }}
                                                    />
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    courseClass.is_active
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {courseClass.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setRosterFor(courseClass)}
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                    aria-label={`Atur murid ${courseClass.name}`}
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditing(courseClass);
                                                        setFormOpen(true);
                                                    }}
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                    aria-label={`Ubah kelas ${courseClass.name}`}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStatus(courseClass)}
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                    aria-label={
                                                        courseClass.is_active
                                                            ? `Nonaktifkan kelas ${courseClass.name}`
                                                            : `Aktifkan kelas ${courseClass.name}`
                                                    }
                                                >
                                                    <Power className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleting(courseClass)}
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                                                    aria-label={`Hapus kelas ${courseClass.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                <Pagination
                    paginator={classes}
                    noun="kelas"
                    onPage={(page) => visitFilters('admin.classes.index', { ...filters, q: search, page })}
                />
            </div>

            <ClassFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                courseClass={editing}
                levels={options.levels}
                tutors={options.tutors}
            />

            <ClassStudentsModal
                open={!!rosterFor}
                onClose={() => setRosterFor(null)}
                courseClass={rosterFor}
                students={options.students}
            />

            <DeleteClassModal open={!!deleting} courseClass={deleting} onClose={() => setDeleting(null)} />
        </AdminLayout>
    );
}
