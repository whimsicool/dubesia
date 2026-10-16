import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, CirclePlus, Download, FileSpreadsheet, Printer, TriangleAlert } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import FlashBanner from '@/Components/Schedules/FlashBanner';
import StatCards from '@/Components/Schedules/StatCards';
import ScheduleFilters from '@/Components/Schedules/ScheduleFilters';
import WeekCalendar from '@/Components/Schedules/WeekCalendar';
import ScheduleTable from '@/Components/Schedules/ScheduleTable';
import ScheduleFormModal from '@/Components/Schedules/ScheduleFormModal';
import ConflictModal from '@/Components/Schedules/ConflictModal';
import DeleteScheduleModal from '@/Components/Schedules/DeleteScheduleModal';
import { cleanParams, formatWeekRange } from '@/Components/Schedules/constants';

function ExportMenu({ exportUrl }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
                <Download className="h-4 w-4" />
                Ekspor Jadwal
                <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {open && (
                <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
                    <a href={exportUrl} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                        <FileSpreadsheet className="h-4 w-4 text-slate-400" /> Unduh CSV (Excel)
                    </a>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => window.print()}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                        <Printer className="h-4 w-4 text-slate-400" /> Cetak / Simpan PDF
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Index({ semester, week, filters, schedules, stats, conflicts, options }) {
    const { flash } = usePage().props;

    const [view, setView] = useState('calendar');
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [auditOpen, setAuditOpen] = useState(false);

    /** Kunjungi ulang halaman dengan filter / minggu baru, tanpa reload penuh. */
    const visit = (patch) => {
        const params = cleanParams({ week: week.start, ...filters, ...patch });
        router.get(route('admin.schedules.index'), params, { preserveState: true, preserveScroll: true, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (schedule) => {
        setAuditOpen(false);
        setEditing(schedule);
        setFormOpen(true);
    };

    const exportUrl = route('admin.schedules.export', cleanParams({ ...filters }));

    return (
        <AdminLayout semesterName={semester?.name}>
            <Head title="Kelola Jadwal Belajar" />

            <FlashBanner flash={flash?.success} />

            {/* Breadcrumb + judul */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <nav className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 print:hidden">
                        <Link href={route('dashboard')} className="hover:text-slate-900">
                            Dashboard Admin
                        </Link>
                        <span>›</span>
                        <span>Akademik & Jadwal</span>
                        <span>›</span>
                        <span className="text-red-700">Kelola Jadwal Belajar</span>
                    </nav>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Pengelolaan Jadwal Akademik</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Kelola penetapan hari, alokasi instruktur, ruang diplomatik/lab digital, serta pendaftaran kelompok murid aktif
                        untuk Semester {semester?.name ?? '—'}.
                    </p>
                    <p className="mt-1 hidden text-sm font-semibold text-slate-700 print:block">
                        Pekan {formatWeekRange(week.start, week.end)}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 print:hidden">
                    <button
                        type="button"
                        onClick={() => setAuditOpen(true)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                    >
                        <TriangleAlert className={`h-4 w-4 ${conflicts.length > 0 ? 'text-red-700' : 'text-slate-400'}`} />
                        Audit Bentrok ({conflicts.length})
                    </button>

                    <ExportMenu exportUrl={exportUrl} />

                    <button
                        type="button"
                        onClick={openCreate}
    
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Tambah Jadwal Baru
                    </button>
                </div>
            </div>

            {!semester ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                    <p className="font-semibold">Belum ada semester aktif.</p>
                    <p className="mt-1">Aktifkan satu semester (kolom is_active pada tabel semesters) agar jadwal dapat dikelola.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    <StatCards stats={stats} />

                    <ScheduleFilters
                        filters={filters}
                        options={options}
                        view={view}
                        onViewChange={setView}
                        onChange={(patch) => visit(patch)}
                    />

                    {view === 'calendar' ? (
                        <WeekCalendar
                            week={week}
                            schedules={schedules}
                            dayFilter={filters.day}
                            onNavigate={(date) => visit({ week: date })}
                            onEdit={openEdit}
                            onDelete={setDeleting}
                        />
                    ) : (
                        <ScheduleTable schedules={schedules} onEdit={openEdit} onDelete={setDeleting} />
                    )}
                </div>
            )}

            <ScheduleFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                schedule={editing}
                options={options}
                defaultDay={filters.day ? Number(filters.day) : 1}
            />
            <ConflictModal open={auditOpen} onClose={() => setAuditOpen(false)} conflicts={conflicts} onEdit={openEdit} />
            <DeleteScheduleModal schedule={deleting} onClose={() => setDeleting(null)} />
        </AdminLayout>
    );
}
