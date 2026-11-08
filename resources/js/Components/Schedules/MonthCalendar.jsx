import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, Pencil, Plus } from 'lucide-react';
import { CATEGORY_STYLES, UNASSIGNED_TUTOR_LABEL, formatDate, parseISODate } from './constants';

const WEEKDAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function toISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function monthDates(month) {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
    const count = Math.ceil((offset + new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) / 7) * 7;

    return Array.from({ length: count }, (_, index) => {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
        return {
            date,
            iso: toISO(date),
            day: date.getDay() === 0 ? 7 : date.getDay(),
            inMonth: date.getMonth() === month.getMonth(),
        };
    });
}

function ScheduleChip({ schedule, date, onEdit, onAttendance, attendanceLabel, readOnly }) {
    const style = CATEGORY_STYLES[schedule.program?.category] ?? CATEGORY_STYLES.english;
    const content = (
        <>
            <span className={`block w-fit rounded px-1 py-0.5 text-[10px] font-bold ${style.chip}`}>
                {schedule.start_time}–{schedule.end_time}
            </span>
            <span className="mt-1 block truncate text-xs font-semibold text-slate-900">{schedule.title}</span>
            <span className="block truncate text-[10px] text-slate-500">{schedule.tutor?.name ?? UNASSIGNED_TUTOR_LABEL}</span>
            {schedule.student_names?.length > 0 && <span className="block truncate text-[10px] text-slate-500" title={schedule.student_names.join(', ')}>Murid: {schedule.student_names.slice(0, 2).join(', ')}{schedule.student_names.length > 2 ? ` +${schedule.student_names.length - 2}` : ''}</span>}
        </>
    );

    return readOnly ? (
        <div className={`rounded-md border border-l-2 border-slate-200 ${style.border} bg-white p-1.5`}>{content}{onAttendance && <button type="button" onClick={() => onAttendance(schedule, date)} className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-emerald-700"><ClipboardCheck className="h-3 w-3" /> {attendanceLabel}</button>}</div>
    ) : (
        <div className={`rounded-md border border-l-2 border-slate-200 ${style.border} bg-white p-1.5`}>
            <button type="button" onClick={() => onEdit(schedule)} className="group w-full text-left hover:bg-slate-50" aria-label={`Ubah jadwal ${schedule.title}`}>
                {content}
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 group-hover:text-slate-700"><Pencil className="h-3 w-3" aria-hidden="true" /> Ubah jadwal</span>
            </button>
            <button type="button" onClick={() => onAttendance(schedule, date)} className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-emerald-700" aria-label={`${attendanceLabel} ${schedule.title}`}><ClipboardCheck className="h-3 w-3" /> {attendanceLabel}</button>
        </div>
    );
}

export default function MonthCalendar({ week, semester, schedules, dayFilter, onNavigate, onAdd, onEdit, onAttendance, attendanceLabel = 'Presensi', readOnly = false }) {
    const [month, setMonth] = useState(() => parseISODate(`${week.start.slice(0, 7)}-15`));

    useEffect(() => {
        setMonth(parseISODate(`${week.start.slice(0, 7)}-15`));
    }, [week.start]);

    const dates = monthDates(month);
    const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const moveMonth = (amount) => {
        const next = new Date(month.getFullYear(), month.getMonth() + amount, 15);
        setMonth(next);
        onNavigate(toISO(next));
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => moveMonth(-1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Bulan sebelumnya">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h2 className="min-w-40 text-center text-lg font-bold capitalize text-slate-900">
                        {formatDate(toISO(firstOfMonth), { month: 'long', year: 'numeric' })}
                    </h2>
                    <button type="button" onClick={() => moveMonth(1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Bulan berikutnya">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays className="h-4 w-4 text-red-700" />
                    Kalender semua tanggal
                </div>
            </header>

            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                {WEEKDAYS.map((day) => (
                    <div key={day} className="px-2 py-3 text-center text-xs font-bold uppercase text-slate-600">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {dates.map(({ date, iso, day, inMonth }) => {
                    const inSemester = semester && iso >= semester.start_date && iso <= semester.end_date;
                    const isSunday = date.getDay() === 0;
                    const visible = inMonth && inSemester && (!dayFilter || day === Number(dayFilter));
                    const items = visible
                        ? schedules.filter((schedule) => schedule.scheduled_date ? schedule.scheduled_date === iso : schedule.day_of_week === day)
                        : [];
                    const canAdd = !readOnly && visible && !isSunday;

                    return (
                        <div key={iso} className={`min-h-32 border-b border-r border-slate-100 p-2 ${!inMonth ? 'bg-slate-50/70' : ''} ${inMonth && !inSemester ? 'bg-slate-100/70' : ''}`}>
                            <div className="mb-2 flex items-center justify-between">
                                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${iso === week.today ? 'bg-red-700 text-white' : inMonth ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {date.getDate()}
                                </span>
                                {canAdd && (
                                    <button type="button" onClick={() => onAdd(iso)} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-900" aria-label={`Tambah jadwal tanggal ${formatDate(iso)}`}>
                                        <Plus className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                {items.map((schedule) => <ScheduleChip key={schedule.id} schedule={schedule} date={iso} onEdit={onEdit} onAttendance={onAttendance} attendanceLabel={attendanceLabel} readOnly={readOnly} />)}
                                {visible && items.length === 0 && <p className="pt-1 text-[10px] text-slate-400">Tidak ada sesi</p>}
                                {inMonth && !inSemester && <p className="pt-1 text-[10px] text-slate-400">Di luar periode</p>}
                                {visible && isSunday && <p className="pt-1 text-[10px] text-slate-400">Tidak ada kelas</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
