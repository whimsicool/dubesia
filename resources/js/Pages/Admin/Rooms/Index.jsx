import { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building2, CirclePlus, MapPin, Pencil, Power, PowerOff, Search, Trash2, Video, DoorOpen } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import FlashBanner from '@/Components/Schedules/FlashBanner';
import RoomIcon from '@/Components/Schedules/RoomIcon';
import Pagination from '@/Components/Common/Pagination';
import RoomFormModal from '@/Components/Rooms/RoomFormModal';
import RoomActionModal from '@/Components/Rooms/RoomActionModal';
import { typeStyle } from '@/Components/Rooms/constants';
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

export default function Index({ rooms, filters, stats, options }) {
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters.q ?? '');
    const [form, setForm] = useState({ open: false, roomId: null });
    const [action, setAction] = useState(null); // { room, action }

    const visit = (patch) =>
        router.get(route('admin.rooms.index'), cleanParams({ ...filters, page: undefined, ...patch }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
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
    const filtered = filters.q || filters.type || filters.status;

    return (
        <AdminLayout>
            <Head title="Kelola Ruang" />

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
                        <span className="text-red-700">Kelola Ruang</span>
                    </nav>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Pengelolaan Ruang & Platform</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">Kelola ruang kelas, laboratorium, dan platform online yang dipakai pada jadwal belajar — nama, jenis, lokasi, dan kapasitas.</p>
                </div>

                <button type="button" onClick={() => setForm({ open: true, roomId: null })} className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                    <CirclePlus className="h-4 w-4" />
                    Tambah Ruangan
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <StatCard label="Total ruangan" value={stats.total} icon={DoorOpen} footer="Seluruh ruang & platform" />
                <StatCard label="Fisik & lab aktif" value={stats.physical} icon={Building2} footer="Ruang kelas + laboratorium" />
                <StatCard label="Online aktif" value={stats.online} icon={Video} footer="Saluran cloud / virtual" />
                <StatCard label="Nonaktif" value={stats.inactive} icon={PowerOff} footer="Tidak muncul di jadwal" />
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama, lokasi, atau platform…"
                        className="w-full rounded-lg border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-slate-900 focus:ring-slate-900"
                    />
                </div>
                <select aria-label="Jenis" value={filters.type ?? ''} onChange={(e) => visit({ type: e.target.value || undefined })} className={select}>
                    <option value="">Semua Jenis</option>
                    {options.types.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
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
                    <option value="capacity">Kapasitas terbesar</option>
                </select>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
                {rooms.data.length === 0 ? (
                    <p className="p-12 text-center text-sm text-slate-500">{filtered ? 'Tidak ada ruangan yang cocok dengan filter.' : 'Belum ada ruangan. Klik “Tambah Ruangan” untuk membuat yang pertama.'}</p>
                ) : (
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
                            {rooms.data.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/60">
                                    <td className="px-4 py-3">
                                        <p className="flex items-center gap-2 font-semibold text-slate-900">
                                            <RoomIcon type={r.type} className="h-4 w-4 text-slate-400" />
                                            {r.name}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-slate-400">{r.schedules_count} jadwal</p>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeStyle(r.type)}`}>{r.type_label}</span>
                                    </td>
                                    <td className="max-w-xs px-4 py-3 text-slate-600">
                                        {r.type === 'online' && r.platform && <p className="font-medium text-slate-800">{r.platform}</p>}
                                        {r.location ? (
                                            <p className="flex items-start gap-1 break-words text-xs text-slate-500">
                                                <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {r.location}
                                            </p>
                                        ) : (
                                            r.type !== 'online' && <span className="text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">
                                        {r.capacity} <span className="font-normal text-slate-400">peserta</span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{r.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        <button type="button" onClick={() => setForm({ open: true, roomId: r.id })} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label={`Ubah ${r.name}`} title="Ubah">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAction({ room: r, action: r.is_active ? 'deactivate' : 'activate' })}
                                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                            aria-label={`${r.is_active ? 'Nonaktifkan' : 'Aktifkan'} ${r.name}`}
                                            title={r.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                        >
                                            {r.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                        </button>
                                        <button type="button" onClick={() => setAction({ room: r, action: 'delete' })} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label={`Hapus ${r.name}`} title="Hapus">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-5">
                <Pagination paginator={rooms} onPage={(page) => visit({ page })} noun="ruangan" />
            </div>

            <RoomFormModal open={form.open} roomId={form.roomId} options={options} onClose={() => setForm({ open: false, roomId: null })} />
            <RoomActionModal target={action} onClose={() => setAction(null)} />
        </AdminLayout>
    );
}
