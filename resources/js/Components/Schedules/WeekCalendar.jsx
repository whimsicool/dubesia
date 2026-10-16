import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import RoomIcon from './RoomIcon';
import { CATEGORY_STYLES, formatDate, formatWeekRange } from './constants';

function SessionCard({ schedule, onEdit, onDelete, readOnly }) {
    const style = CATEGORY_STYLES[schedule.program.category] ?? CATEGORY_STYLES.english;

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
        return <div className={`rounded-xl border border-l-4 border-slate-200 ${style.border} bg-white p-3 shadow-sm`}>{content}</div>;
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
                onClick={() => onDelete(schedule)}
                className="absolute right-2 top-2 hidden rounded-md bg-white/90 p-1 text-slate-400 shadow-sm hover:text-red-700 group-hover:block focus:block"
                aria-label={`Hapus jadwal ${schedule.title}`}
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export default function WeekCalendar({ week, schedules, dayFilter, onNavigate, onEdit, onDelete, readOnly = false }) {
    const days = dayFilter ? week.days.filter((d) => d.day === Number(dayFilter)) : week.days;

    return (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            {/* Navigasi minggu + legenda */}
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
                    <button
                        type="button"
                        onClick={() => onNavigate(null)}
                        disabled={week.is_current}
                        className="border-x border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-default disabled:hover:bg-white"
                    >
                        Minggu Ini
                    </button>
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

                <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    {Object.values(CATEGORY_STYLES).map((c) => (
                        <span key={c.label} className="flex items-center gap-1.5">
                            <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                            {c.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Grid hari */}
            <div className="overflow-x-auto">
                <div className="grid min-w-[960px] divide-x divide-slate-100 border-t border-slate-100" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
                    {days.map((d) => {
                        const isToday = d.date === week.today;
                        const items = schedules.filter((s) => s.day_of_week === d.day);

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
                                            Di luar rentang semester
                                        </p>
                                    ) : items.length === 0 ? (
                                        <p className="rounded-lg border border-dashed border-slate-200 px-2 py-6 text-center text-xs text-slate-400">
                                            Tidak ada sesi
                                        </p>
                                    ) : (
                                        items.map((s) => <SessionCard key={s.id} schedule={s} onEdit={onEdit} onDelete={onDelete} readOnly={readOnly} />)
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
