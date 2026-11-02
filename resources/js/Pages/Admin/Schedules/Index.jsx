
import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    CirclePlus,
    Download,
    FileSpreadsheet,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import FlashBanner from '@/Components/Common/FlashBanner';
import ScheduleFilters from '@/Components/Schedules/ScheduleFilters';
import WeekCalendar from '@/Components/Schedules/WeekCalendar';
import MonthCalendar from '@/Components/Schedules/MonthCalendar';
import ScheduleTable from '@/Components/Schedules/ScheduleTable';
import ScheduleFormModal from '@/Components/Schedules/ScheduleFormModal';
import DeleteScheduleModal from '@/Components/Schedules/DeleteScheduleModal';
import { cleanParams, formatWeekRange } from '@/Components/Schedules/constants';

function ExportMenu({ exportUrl, pdfUrl }) {
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
                    <a
                        href={exportUrl}
                        download="jadwal-belajar.csv"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-slate-400" />
                        Unduh CSV (Excel)
                    </a>

                    <a
                        href={pdfUrl}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                        <Download className="h-4 w-4 text-red-700" />
                        Unduh PDF
                    </a>
                </div>
            )}
        </div>
    );
}

export default function Index({ semester, week, filters, schedules, options }) {
    const { flash } = usePage().props;

    const [view, setView] = useState('calendar');
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [defaultDate, setDefaultDate] = useState(week.start);

    const visit = (patch) => {
        const params = cleanParams({ week: week.start, ...filters, ...patch });
        router.get(route('admin.schedules.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const openCreate = (date = week.start) => {
        setEditing(null);
        const selectedDate =
            date < semester?.start_date
                ? semester.start_date
                : date > semester?.end_date
                    ? semester.end_date
                    : date;

        setDefaultDate(selectedDate);
        setFormOpen(true);
    };

    const openEdit = (schedule) => {
        setEditing(schedule);
        setFormOpen(true);
    };

    const exportUrl = route(
        'admin.schedules.export',
        cleanParams({ ...filters })
    );

    const pdfUrl = route(
        'admin.schedules.pdf',
        cleanParams({
            week: week.start,
            ...filters,
        })
    );

    return (
        <AdminLayout>
            <Head title="Kelola Jadwal Belajar" />

            <FlashBanner flash={flash?.success} />

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <nav className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 print:hidden">
                        <Link
                            href={route('admin.dashboard')}
                            className="hover:text-slate-900"
                        >
                            Dashboard Admin
                        </Link>
                        <span>›</span>
                        <span className="text-red-700">Kelola Jadwal Belajar</span>
                    </nav>

                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        Pengelolaan Jadwal Akademik
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Kelola penetapan hari, alokasi instruktur, ruang diplomatik/lab digital, serta pendaftaran kelompok murid aktif.
                    </p>

                    <p className="mt-1 hidden text-sm font-semibold text-slate-700 print:block">
                        Pekan {formatWeekRange(week.start, week.end)}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 print:hidden">
                    <ExportMenu
                        exportUrl={exportUrl}
                        pdfUrl={pdfUrl}
                    />

                    <button
                        type="button"
                        onClick={() => openCreate()}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <CirclePlus className="h-4 w-4" />
                        Tambah Jadwal Baru
                    </button>
                </div>
            </div>

            <div id="admin-schedule-pdf-content">
                {!semester ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                        <p className="font-semibold">Belum ada periode jadwal aktif.</p>
                        <p className="mt-1">
                            Aktifkan periode jadwal agar jadwal dapat dikelola.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div data-html2canvas-ignore="true">
                            <ScheduleFilters
                                filters={filters}
                                options={options}
                                view={view}
                                onViewChange={setView}
                                onChange={(patch) => visit(patch)}
                            />
                        </div>

                        {view === 'calendar' ? (
                            <WeekCalendar
                                week={week}
                                schedules={schedules}
                                dayFilter={filters.day}
                                onNavigate={(date) => visit({ week: date })}
                                onEdit={openEdit}
                                onDelete={setDeleting}
                            />
                        ) : view === 'month' ? (
                            <MonthCalendar
                                week={week}
                                semester={semester}
                                schedules={schedules}
                                dayFilter={filters.day}
                                onNavigate={(date) => visit({ week: date })}
                                onAdd={openCreate}
                                onEdit={openEdit}
                            />
                        ) : (
                            <ScheduleTable
                                schedules={schedules}
                                onEdit={openEdit}
                                onDelete={setDeleting}
                            />
                        )}
                    </div>
                )}
            </div>

            <ScheduleFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                schedule={editing}
                options={options}
                defaultDate={defaultDate}
                semester={semester}
            />

            <DeleteScheduleModal
                schedule={deleting}
                onClose={() => setDeleting(null)}
            />
        </AdminLayout>
    );
}
