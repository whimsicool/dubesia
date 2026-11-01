
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Printer, Download } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import ScheduleFilters from '@/Components/Schedules/ScheduleFilters';
import WeekCalendar from '@/Components/Schedules/WeekCalendar';
import MonthCalendar from '@/Components/Schedules/MonthCalendar';
import ScheduleTable from '@/Components/Schedules/ScheduleTable';
import { cleanParams, formatWeekRange } from '@/Components/Schedules/constants';

export default function Index({ semester, week, filters, schedules, options, audience, routeName }) {
    const [view, setView] = useState('calendar');
    const isTutor = audience === 'tutor';
    const pdfUrl = route(
        isTutor ? 'tutor.schedules.pdf' : 'schedules.pdf',
        cleanParams({
            week: week.start,
            ...filters,
        })
    );

    const visit = (patch) => {
        const params = cleanParams({ week: week.start, ...filters, ...patch });
        router.get(route(routeName), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };


    return (
        <AdminLayout semesterName={semester?.name}>
            <Head title={isTutor ? 'Jadwal Tutor' : 'Jadwal Belajar'} />

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <nav className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 print:hidden">
                        <Link
                            href={route(isTutor ? 'tutor.dashboard' : 'dashboard')}
                            className="hover:text-slate-900"
                        >
                            Dashboard
                        </Link>
                        <span>›</span>
                        <span className="text-red-700">
                            {isTutor ? 'Jadwal Tutor' : 'Jadwal Belajar'}
                        </span>
                    </nav>

                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        {isTutor ? 'Jadwal Tutor' : 'Jadwal Belajar'}
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Jadwal kelas Anda untuk periode belajar aktif.
                    </p>

                    {week && (
                        <p className="mt-1 hidden text-sm font-semibold text-slate-700 print:block">
                            Pekan {formatWeekRange(week.start, week.end)}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 print:hidden" data-html2canvas-ignore="true">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                    >
                        <Printer className="h-4 w-4" />
                        Cetak Jadwal
                    </button>

                    <a
                        href={pdfUrl}
                        className="flex items-center gap-2 self-start rounded-xl bg-red-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                    >
                        <Download className="h-4 w-4" />
                        Unduh PDF
                    </a>
                </div>
            </div>

            <div id="schedule-pdf-content">
                {!semester ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                        <p className="font-semibold">Belum ada periode jadwal aktif.</p>
                        <p className="mt-1">
                            Hubungi admin untuk mengaktifkan periode jadwal.
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
                                onChange={visit}
                            />
                        </div>

                        {view === 'calendar' ? (
                            <WeekCalendar
                                week={week}
                                schedules={schedules}
                                dayFilter={filters.day}
                                onNavigate={(date) => visit({ week: date })}
                                readOnly
                            />
                        ) : view === 'month' ? (
                            <MonthCalendar
                                week={week}
                                semester={semester}
                                schedules={schedules}
                                dayFilter={filters.day}
                                onNavigate={(date) => visit({ week: date })}
                                readOnly
                            />
                        ) : (
                            <ScheduleTable schedules={schedules} readOnly />
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
