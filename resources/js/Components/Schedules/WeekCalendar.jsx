import { CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, Trash2 } from 'lucide-react';
import RoomIcon from './RoomIcon';
import { CATEGORY_STYLES, formatDate, formatWeekRange } from './constants';

function SessionCard({ schedule, date, onEdit, onDelete, onAttendance, attendanceLabel, readOnly }) {
    const style = CATEGORY_STYLES[schedule.program?.category] ?? CATEGORY_STYLES.english;

    const content = (
        <>
                <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-bold ${style.chip}`}>
                    {schedule.start_time} - {schedule.end_time}
                </span>
                <p className="mt-2 text-[15px] font-bold leading-snug text-slate-900">{schedule.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <RoomIcon type={schedule.room.type} />
                    <span className="truncate">{schedule.room.name}</span>
                </p>

                {schedule.student_names?.length > 0 && <p className="mt-2 truncate text-[11px] text-slate-500" title={schedule.student_names.join(', ')}>Murid: {schedule.student_names.slice(0, 2).join(', ')}{schedule.student_names.length > 2 ? ` +${schedule.student_names.length - 2}` : ''}</p>}
                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <span className="flex min-w-0 items-center gap-1.5 font-semibold text-slate-800">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">
                            {schedule.instructor.initials}
                        </span>
                        <span className="truncate">{schedule.instructor.name}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-slate-600">{schedule.participants} Mhs</span>
                </div>
        </>
    );

    if (readOnly) {
        return <div className={`rounded-xl border border-l-4 border-slate-200 ${style.border} bg-white p-3 shadow-sm`}>{content}{onAttendance && <button type="button" onClick={() => onAttendance(schedule, date)} className="mt-2 inline-flex items-center gap-1 rounded-md px-1 text-[10px] font-semibold text-slate-500 hover:text-emerald-700"><ClipboardCheck className="h-3.5 w-3.5" /> {attendanceLabel}</button>}</div>;
    }
    return (
        <div className="group relative">
            <button
                type="button"
                onClick={() => onEdit(schedule)}
                className={`w-full rounded-xl border border-l-4 border-slate-200 ${style.border} bg-white p-3 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900`}
            >
                {content}
            </button>
            <button
                type="button"
                onClick={() => onAttendance(schedule, date)}
                className="mt-1 inline-flex items-center gap-1 rounded-md px-1 text-[10px] font-semibold text-slate-500 hover:text-emerald-700"
                aria-label={`${attendanceLabel} ${schedule.title}`}
            >
                <ClipboardCheck className="h-3.5 w-3.5" /> {attendanceLabel}
            </button>
            <button
                type="button"
                onClick={() => onDelete(schedule)}
                className="absolute right-2 top-2 hidden rounded-md bg-white/90 p-1 text-slate-400 shadow-sm hover:text-red-700 group-hover:block focus:block"
                aria-label={`Hapus jadwal ${schedule.title}`}
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export default function WeekCalendar({ week, schedules, dayFilter, onNavigate, onEdit, onDelete, onAttendance, attendanceLabel = 'Isi presensi', readOnly = false }) {
    const days = dayFilter ? week.days.filter((d) => d.day === Number(dayFilter)) : week.days;

    return (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            {/* Navigasi minggu */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 p-4 print:hidden">
                <div className="flex items-center rounded-lg border border-slate-200">
                    <button
                        type="button"
                        onClick={() => onNavigate(week.prev)}
                        className="p-2 text-slate-500 hover:bg-slate-50"
                        aria-label="Minggu sebelumnya"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <label className="relative flex h-9 min-w-[132px] items-center justify-center gap-2 border-x border-slate-200 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                        <CalendarDays className="h-4 w-4 text-red-700" />
                        <span>{formatDate(week.start, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <input
                            type="date"
                            value={week.start}
                            onChange={(event) => event.target.value && onNavigate(event.target.value)}
                            className="absolute inset-0 cursor-pointer opacity-0"
                            aria-label="Pilih tanggal pekan jadwal"
                        />
                    </label>
                    <button
                        type="button"
                        onClick={() => onNavigate(week.next)}
                        className="p-2 text-slate-500 hover:bg-slate-50"
                        aria-label="Minggu berikutnya"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <h2 className="text-base font-bold text-slate-900 sm:text-lg">{formatWeekRange(week.start, week.end)}</h2>

            </div>

            {/* Grid hari */}
            <div className="overflow-x-auto">
                <div className="grid min-w-[960px] divide-x divide-slate-100 border-t border-slate-100" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
                    {days.map((d) => {
                        const isToday = d.date === week.today;
                        const items = schedules.filter((s) => s.scheduled_date ? s.scheduled_date === d.date : s.day_of_week === d.day);

                        return (
                            <div key={d.day} className="min-h-[360px]">
                                <div className={`border-b border-slate-100 py-3 text-center ${isToday ? 'bg-red-50' : 'bg-slate-50'}`}>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-red-700' : 'text-slate-800'}`}>
                                        {d.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500">{formatDate(d.date, { day: 'numeric', month: 'short' })}</p>
                                </div>

                                <div className="space-y-3 p-2.5">
                                    {!d.in_semester ? (
                                        <p className="rounded-lg border border-dashed border-slate-200 px-2 py-6 text-center text-xs text-slate-400">
                                            Di luar periode jadwal
                                        </p>
                                    ) : items.length === 0 ? (
                                        <p className="rounded-lg border border-dashed border-slate-200 px-2 py-6 text-center text-xs text-slate-400">
                                            Tidak ada sesi
                                        </p>
                                    ) : (
                                        items.map((s) => <SessionCard key={s.id} schedule={s} date={d.date} onEdit={onEdit} onDelete={onDelete} onAttendance={onAttendance} attendanceLabel={attendanceLabel} readOnly={readOnly} />)
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
