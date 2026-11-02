import { useEffect, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { BookOpen, Film, FileText, Filter, LayoutGrid, List, Newspaper, Search } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import MaterialCard from '@/Components/Materials/MaterialCard';
import MaterialViewer from '@/Components/Materials/MaterialViewer';
import Pagination from '@/Components/Common/Pagination';
import { STATUS_OPTIONS } from '@/Components/Materials/constants';
import { cleanParams } from '@/Components/Schedules/constants';

function Tile({ icon: Icon, value, label }) {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-slate-200">
                <Icon className="h-5 w-5" />
            </span>
            <div>
                <p className="text-2xl font-extrabold leading-none">{value}</p>
                <p className="mt-1 text-[11px] text-slate-400">{label}</p>
            </div>
        </div>
    );
}

export default function Index({ materials, active, filters, stats, types }) {
    const { auth } = usePage().props;

    const [search, setSearch] = useState(filters.q ?? '');
    const [layout, setLayout] = useState(filters.view === 'list' ? 'list' : 'grid');
    const [busy, setBusy] = useState(false);
    const viewerRef = useRef(null);

    const visit = (patch, options = {}) =>
        router.get(route('materials.index'), cleanParams({ ...filters, view: undefined, page: undefined, ...patch }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            ...options,
        });

    // Pencarian dengan debounce 400 ms.
    useEffect(() => {
        const term = search.trim();
        if (term === (filters.q ?? '')) return undefined;

        const timer = setTimeout(() => visit({ q: term || undefined }), 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // Gulir ke viewer saat materi dibuka.
    useEffect(() => {
        if (active) viewerRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }, [active?.id]);

    const openMaterial = (m) => visit({ material: m.id }, { only: ['active', 'materials', 'filters', 'stats'] });
    const closeViewer = () => visit({ material: undefined }, { only: ['active', 'filters'] });

    const toggleComplete = () => {
        router.post(
            route('materials.progress', active.id),
            { action: active.progress_status === 'completed' ? 'uncomplete' : 'complete' },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['active', 'materials', 'stats'],
                onStart: () => setBusy(true),
                onFinish: () => setBusy(false),
            },
        );
    };

    const goToPage = (page) => router.get(route('materials.index'), cleanParams({ ...filters, view: undefined, page }), { preserveState: true, preserveScroll: false });

    const select = 'rounded-lg border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-800 focus:border-slate-900 focus:ring-slate-900';
    const hasFilter = filters.q || filters.type || filters.status;

    return (
        <AdminLayout>
            <Head title="Materi Belajar" />

            <nav className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span>Portal {auth.user.role === 'student' ? 'Siswa' : 'Pengajar'}</span>
                <span>›</span>
                <span>Pembelajaran</span>
                <span>›</span>
                <span className="text-red-700">Materi Belajar</span>
            </nav>

            {/* Hero */}
            <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-red-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">Pustaka Umum</span>
                            <span className="flex items-center gap-1.5 text-[11px] text-emerald-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Terbuka untuk semua murid
                            </span>
                        </div>
                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Pustaka Materi Belajar</h1>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                            Kumpulan dokumen, video, slide, dan artikel dari para pengajar Dubes Communications. Semua materi terbuka untuk seluruh
                            murid dan tidak terikat pada kelas atau jadwal tertentu.
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Tile icon={BookOpen} value={stats.total} label="Total Materi" />
                    <Tile icon={FileText} value={stats.documents} label="Dokumen & Slide" />
                    <Tile icon={Film} value={stats.media} label="Video & Audio" />
                    <Tile icon={Newspaper} value={stats.new_this_week} label="Materi Baru Pekan Ini" />
                </div>
            </section>

            {/* Toolbar */}
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari judul atau deskripsi materi..."
                        className="w-full rounded-lg border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-slate-900 focus:ring-slate-900"
                    />
                </div>

                <select aria-label="Format berkas" value={filters.type ?? ''} onChange={(e) => visit({ type: e.target.value || undefined })} className={select}>
                    <option value="">Semua Format Berkas</option>
                    {types.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select aria-label="Status belajar" value={filters.status ?? ''} onChange={(e) => visit({ status: e.target.value || undefined })} className={select}>
                        <option value="">Semua Status</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>

                <select aria-label="Urutkan" value={filters.sort} onChange={(e) => visit({ sort: e.target.value })} className={select}>
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                    <option value="title">Judul A–Z</option>
                </select>

                <div className="flex rounded-lg bg-slate-100 p-1" role="group" aria-label="Tampilan">
                    {[
                        { key: 'grid', icon: LayoutGrid, label: 'Grid' },
                        { key: 'list', icon: List, label: 'Daftar' },
                    ].map(({ key, icon: Icon, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setLayout(key)}
                            aria-pressed={layout === key}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${layout === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                        >
                            <Icon className="h-4 w-4" /> {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Viewer */}
            {active && (
                <div ref={viewerRef} className="mt-5 scroll-mt-20">
                    <MaterialViewer material={active} onClose={closeViewer} onToggleComplete={toggleComplete} busy={busy} />
                </div>
            )}

            {/* Daftar */}
            <section className="mt-8">
                <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900">Daftar Modul & Berkas Pembelajaran</h2>
                        <p className="text-sm text-slate-500">Materi resmi yang telah diterbitkan dan diverifikasi oleh dewan pengajar.</p>
                    </div>
                    {hasFilter && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                router.get(route('materials.index'), {}, { preserveScroll: true });
                            }}
                            className="text-sm font-semibold text-red-700 hover:underline"
                        >
                            Reset filter
                        </button>
                    )}
                </div>

                {materials.data.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
                        {hasFilter ? 'Tidak ada materi yang cocok dengan filter Anda.' : 'Belum ada materi yang diterbitkan.'}
                    </div>
                ) : (
                    <div className={layout === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
                        {materials.data.map((m) => (
                            <MaterialCard key={m.id} material={m} layout={layout} active={active?.id === m.id} onOpen={openMaterial} />
                        ))}
                    </div>
                )}

                <div className="mt-6">
                    <Pagination paginator={materials} onPage={goToPage} noun="materi" />
                </div>
            </section>
        </AdminLayout>
    );
}
