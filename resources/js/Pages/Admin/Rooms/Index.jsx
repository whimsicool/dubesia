import { useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Building2, CirclePlus, EyeOff, LayoutGrid, Pencil, Power, Search, Trash2, Video } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import FlashBanner from '@/Components/Common/FlashBanner';
import PageHeader from '@/Components/Admin/PageHeader';
import Pagination from '@/Components/Common/Pagination';
import StatCard from '@/Components/Admin/StatCard';
import RoomIcon from '@/Components/Schedules/RoomIcon';
import RoomFormModal from '@/Components/Rooms/RoomFormModal';
import DeleteRoomModal from '@/Components/Rooms/DeleteRoomModal';
import { visitFilters } from '@/Components/Admin/filters';

const TYPE_STYLES = {
    physical: 'bg-slate-100 text-slate-700',
    lab: 'bg-amber-50 text-amber-700',
    online: 'bg-red-50 text-red-700',
};

const selectClass = 'rounded-lg border-slate-200 text-sm text-slate-700 focus:border-slate-900 focus:ring-slate-900';

export default function Index({ rooms, filters, stats, options }) {
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters.q ?? '');
    const searchTimer = useRef(null);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const apply = (patch) =>
        visitFilters('admin.rooms.index', {
            q: search,
            type: filters.type,
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

    const toggleStatus = (room) => {
        router.patch(route('admin.rooms.status', room.id), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="Kelola Ruang" />

            <FlashBanner flash={flash?.success} />
            <FlashBanner flash={flash?.error} tone="error" />

            <PageHeader
                breadcrumbs={[
                    { label: 'Dashboard Admin', route: 'admin.dashboard' },
                    { label: 'Data Akademik' },
                    { label: 'Kelola Ruang' },
                ]}
                title="Pengelolaan Ruang & Platform"
                description="Kelola ruang kelas, laboratorium, dan platform online yang dipakai pada jadwal belajar — nama, jenis, lokasi, dan kapasitas."
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
                        Tambah Ruangan
                    </button>
                }
            />

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Ruangan" value={stats.total} caption="Seluruh ruang & platform" icon={LayoutGrid} />
                <StatCard label="Fisik & Lab Aktif" value={stats.physical_lab} caption="Ruang kelas + laboratorium" icon={Building2} />
                <StatCard label="Online Aktif" value={stats.online} caption="Saluran cloud / virtual" icon={Video} />
                <StatCard label="Nonaktif" value={stats.inactive} caption="Tidak muncul di jadwal" icon={EyeOff} />
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="relative min-w-[240px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        placeholder="Cari nama, lokasi, atau platform…"
                        className="w-full rounded-lg border-slate-200 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900"
                    />
                </div>

                <select
                    value={filters.type ?? ''}
                    onChange={(event) => apply({ type: event.target.value })}
                    className={selectClass}
                    aria-label="Filter jenis"
                >
                    <option value="">Semua Jenis</option>
                    {options.types.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
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
                            <th className="px-4 py-3">Ruangan</th>
                            <th className="px-4 py-3">Jenis</th>
                            <th className="px-4 py-3">Lokasi / Platform</th>
                            <th className="px-4 py-3">Kapasitas</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rooms.data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center">
                                    <p className="font-semibold text-slate-700">Belum ada ruangan yang cocok</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Ubah filter pencarian atau tambah ruangan baru.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            rooms.data.map((room) => (
                                <tr key={room.id} className="hover:bg-slate-50/60">
                                    <td className="px-4 py-3">
                                        <p className="flex items-center gap-2 font-semibold text-slate-900">
                                            <RoomIcon type={room.type} className="h-4 w-4 text-slate-400" />
                                            {room.name}
                                        </p>
                                        <p className="mt-1 text-[11px] text-slate-500">
                                            {room.schedules_count} jadwal
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                TYPE_STYLES[room.type] ?? 'bg-slate-100 text-slate-700'
                                            }`}
                                        >
                                            {room.type_label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {room.platform ?? room.location ?? <span className="text-slate-400">—</span>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                                        {room.capacity} <span className="text-slate-400">peserta</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                room.is_active
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {room.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditing(room);
                                                    setFormOpen(true);
                                                }}
                                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                aria-label={`Ubah ruangan ${room.name}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(room)}
                                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                aria-label={
                                                    room.is_active
                                                        ? `Nonaktifkan ruangan ${room.name}`
                                                        : `Aktifkan ruangan ${room.name}`
                                                }
                                            >
                                                <Power className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleting(room)}
                                                className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                                                aria-label={`Hapus ruangan ${room.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                <Pagination
                    paginator={rooms}
                    noun="ruangan"
                    onPage={(page) => visitFilters('admin.rooms.index', { ...filters, q: search, page })}
                />
            </div>

            <RoomFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                room={editing}
                types={options.types}
            />

            <DeleteRoomModal open={!!deleting} room={deleting} onClose={() => setDeleting(null)} />
        </AdminLayout>
    );
}
