import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, ExternalLink, Grid2X2, List, Pencil, Plus, Search, Star, Trash2, TriangleAlert, Upload, UserRound, Users } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Admin/Modal';
import Pagination from '@/Components/Common/Pagination';
import FlashBanner from '@/Components/Common/FlashBanner';
import { TYPE_META, formatDate, metaLine } from '@/Components/Materials/constants';
import { cleanParams } from '@/Components/Schedules/constants';

function MaterialActions({ material, routePrefix, onTogglePublish, onDelete }) {
    return (
        <div className="flex items-center justify-end gap-0.5">
            <Link
                href={route(`${routePrefix}.preview`, material.id)}
                className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label={`Pratinjau ${material.title}`}
                title="Pratinjau materi"
            >
                <ExternalLink className="h-4 w-4" />
            </Link>
            {material.can_edit && (
                <>
                    <button
                        type="button"
                        onClick={() => onTogglePublish(material)}
                        className={`rounded-lg p-2 transition-colors ${material.status === 'published' ? 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700' : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'}`}
                        aria-label={material.status === 'published' ? `${material.title} sudah tersedia untuk murid. Klik untuk menariknya menjadi draft.` : `${material.title} masih draft. Klik untuk menerbitkannya kepada murid.`}
                        title={material.status === 'published' ? 'Sudah terbit untuk murid — klik untuk tarik ke draft' : 'Masih draft — klik untuk terbitkan kepada murid'}
                    >
                        {material.status === 'published' ? <CheckCircle2 className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                    </button>
                    <Link
                        href={route(`${routePrefix}.edit`, material.id)}
                        className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        aria-label={`Ubah ${material.title}`}
                        title="Edit materi"
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => onDelete(material)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Hapus ${material.title}`}
                        title="Hapus materi"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </>
            )}
        </div>
    );
}

export default function Index({ materials, filters, types, routePrefix = 'tutor.materials' }) {
    const { flash } = usePage().props;
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [search, setSearch] = useState(filters.q ?? '');

    const visit = (patch) =>
        router.get(route(`${routePrefix}.index`), cleanParams({ ...filters, page: undefined, ...patch }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });

    const togglePublish = (m) => router.patch(route(`${routePrefix}.publish`, m.id), {}, { preserveScroll: true });

    const confirmDelete = () => {
        setProcessing(true);
        router.delete(route(`${routePrefix}.destroy`, deleting.id), {
            preserveScroll: true,
            onSuccess: () => setDeleting(null),
            onFinish: () => setProcessing(false),
        });
    };

    const select = 'rounded-lg border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-800 focus:border-slate-900 focus:ring-slate-900';

    return (
        <AdminLayout>
            <Head title="Kelola Materi" />

            <FlashBanner flash={flash?.success} />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Kelola Materi Belajar</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Unggah dokumen, video, slide, artikel, atau tautan. Materi yang diterbitkan langsung tampil untuk <strong>semua murid</strong> —
                        tidak terikat kelas atau jadwal.
                    </p>
                </div>
                <Link
                    href={route(`${routePrefix}.create`)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                    <Plus className="h-4 w-4" /> Tambah Materi
                </Link>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
                <form
                    className="relative flex-1"
                    onSubmit={(e) => {
                        e.preventDefault();
                        visit({ q: search.trim() || undefined });
                    }}
                >
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari judul, deskripsi, atau topik… (Enter)"
                        className="w-full rounded-lg border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-slate-900 focus:ring-slate-900"
                    />
                </form>
                <select aria-label="Jenis" value={filters.type ?? ''} onChange={(e) => visit({ type: e.target.value || undefined })} className={select}>
                    <option value="">Semua Jenis</option>
                    {types.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>
                <select aria-label="Status" value={filters.status ?? ''} onChange={(e) => visit({ status: e.target.value || undefined })} className={select}>
                    <option value="">Semua Status</option>
                    <option value="published">Terbit</option>
                    <option value="draft">Draft</option>
                </select>
                <select aria-label="Kepemilikan" value={filters.scope} onChange={(e) => visit({ scope: e.target.value })} className={select}>
                    <option value="all">Semua Tutor</option>
                    <option value="mine">Milik Saya</option>
                </select>
                <div className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 p-1" aria-label="Tampilan materi">
                    {[
                        { value: 'list', label: 'Daftar', icon: List },
                        { value: 'grid', label: 'Kartu', icon: Grid2X2 },
                    ].map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => visit({ view: value })}
                            aria-pressed={(filters.view ?? 'list') === value}
                            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold transition-colors ${(filters.view ?? 'list') === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            <Icon className="h-4 w-4" /> {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`mt-5 ${filters.view === 'grid' ? '' : 'overflow-x-auto'} rounded-2xl border border-slate-100 bg-white shadow-sm`}>
                {materials.data.length === 0 ? (
                    <p className="p-12 text-center text-sm text-slate-500">Belum ada materi. Klik “Tambah Materi” untuk mengunggah yang pertama.</p>
                ) : filters.view === 'grid' ? (
                    <div className="grid gap-5 p-4 sm:grid-cols-2 xl:grid-cols-3">
                        {materials.data.map((m) => {
                            const meta = TYPE_META[m.type] ?? TYPE_META.document;
                            const Icon = meta.icon;

                            return (
                                <article key={m.id} className={`flex min-h-[340px] flex-col rounded-2xl border border-x-slate-200 border-b-slate-200 border-t-4 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${meta.bar}`}>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.chip}`}>{m.topic || meta.label}</span>
                                        {m.level && <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{m.level}</span>}
                                        <span className={`ml-auto rounded px-2 py-1 text-[10px] font-bold ${m.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {m.status === 'published' ? 'Terbit' : 'Draft'}
                                        </span>
                                    </div>
                                    <h2 className="mt-4 flex items-start gap-2 text-lg font-bold leading-snug text-slate-900">
                                        {m.title}
                                        {m.is_featured && <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-400" aria-label="Rekomendasi" />}
                                    </h2>
                                    <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-relaxed text-slate-600">
                                        {m.description || 'Belum ada deskripsi untuk materi ini.'}
                                    </p>
                                    <ul className="mt-4 space-y-2 text-xs text-slate-600">
                                        <li className="flex items-center gap-2"><Icon className={`h-4 w-4 ${meta.text}`} /> {metaLine(m)}</li>
                                        <li className="flex items-center gap-2"><UserRound className="h-4 w-4 text-slate-400" /> {m.uploader?.name ?? '—'}</li>
                                        <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-400" /> Diunggah: {formatDate(m.created_at)}</li>
                                    </ul>
                                    <div className="mt-auto pt-5">
                                        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                                            <Users className="h-4 w-4 text-slate-400" />
                                            <span>{m.opened_count ?? 0} membuka · {m.completed_count ?? 0} selesai</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                                            <span className="text-[11px] text-slate-400">Aksi materi</span>
                                            <MaterialActions material={m} routePrefix={routePrefix} onTogglePublish={togglePublish} onDelete={setDeleting} />
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Materi</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Murid</th>
                                <th className="px-4 py-3">Pengunggah</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {materials.data.map((m) => {
                                const meta = TYPE_META[m.type] ?? TYPE_META.document;
                                const Icon = meta.icon;

                                return (
                                    <tr key={m.id} className="hover:bg-slate-50/60">
                                        <td className="px-4 py-3">
                                            <div className="flex items-start gap-3">
                                                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.chip}`}>
                                                    <Icon className="h-5 w-5" />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="flex items-center gap-2 font-semibold text-slate-900">
                                                        {m.title}
                                                        {m.is_featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="Rekomendasi" />}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {metaLine(m)}
                                                        {m.topic ? ` • ${m.topic}` : ''}
                                                        {m.level ? ` • ${m.level}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    m.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {m.status === 'published' ? 'Terbit' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                            {m.opened_count ?? 0} membuka • {m.completed_count ?? 0} selesai
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                            {m.uploader?.name ?? '—'}
                                            <span className="block text-xs text-slate-400">{formatDate(m.created_at)}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            <MaterialActions material={m} routePrefix={routePrefix} onTogglePublish={togglePublish} onDelete={setDeleting} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-5">
                <Pagination paginator={materials} onPage={(page) => visit({ page })} noun="materi" />
            </div>

            <Modal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                size="md"
                title="Hapus materi?"
                footer={
                    <>
                        <button type="button" onClick={() => setDeleting(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            disabled={processing}
                            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                        >
                            {processing ? 'Menghapus…' : 'Ya, hapus materi'}
                        </button>
                    </>
                }
            >
                {deleting && (
                    <div className="space-y-3 text-sm text-slate-600">
                        <p>
                            Anda akan menghapus <strong className="text-slate-900">{deleting.title}</strong>.
                        </p>
                        <div className="flex gap-3 rounded-xl bg-red-50 p-3 text-red-800">
                            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                            <p>Berkas yang diunggah dan progres belajar semua murid pada materi ini ikut terhapus. Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
