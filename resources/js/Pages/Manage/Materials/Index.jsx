import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, EyeOff, ExternalLink, Pencil, Plus, Search, Star, Trash2, TriangleAlert } from 'lucide-react';
import PortalLayout from '@/Layouts/PortalLayout';
import Modal from '@/Components/Admin/Modal';
import Pagination from '@/Components/Common/Pagination';
import FlashBanner from '@/Components/Schedules/FlashBanner';
import { TYPE_META, formatDate, metaLine } from '@/Components/Materials/constants';
import { cleanParams } from '@/Components/Schedules/constants';

function StatBox({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
        </div>
    );
}

export default function Index({ materials, filters, stats, types, routePrefix = 'manage.materials' }) {
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
        <PortalLayout>
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

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatBox label="Total materi" value={stats.total} />
                <StatBox label="Terbit" value={stats.published} />
                <StatBox label="Draft" value={stats.draft} />
                <StatBox label="Materi saya" value={stats.mine} />
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
                    <option value="all">Semua Guru</option>
                    <option value="mine">Milik Saya</option>
                </select>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
                {materials.data.length === 0 ? (
                    <p className="p-12 text-center text-sm text-slate-500">Belum ada materi. Klik “Tambah Materi” untuk mengunggah yang pertama.</p>
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
                                            <Link
                                                href={route('materials.index', { material: m.id })}
                                                className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                aria-label={`Pratinjau ${m.title}`}
                                                title="Pratinjau (tampilan murid)"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                            {m.can_edit && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePublish(m)}
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                        aria-label={m.status === 'published' ? `Tarik ${m.title} ke draft` : `Terbitkan ${m.title}`}
                                                        title={m.status === 'published' ? 'Tarik ke draft' : 'Terbitkan'}
                                                    >
                                                        {m.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                    <Link
                                                        href={route(`${routePrefix}.edit`, m.id)}
                                                        className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                        aria-label={`Ubah ${m.title}`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleting(m)}
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                                                        aria-label={`Hapus ${m.title}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
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
        </PortalLayout>
    );
}
