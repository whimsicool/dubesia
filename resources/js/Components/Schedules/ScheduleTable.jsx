import { ClipboardCheck, Pencil, Trash2 } from 'lucide-react';
import RoomIcon from './RoomIcon';
import { CATEGORY_STYLES, DAY_NAMES, UNASSIGNED_TUTOR_LABEL, formatDate } from './constants';

function attendanceDate(schedule, week) {
    return schedule.scheduled_date ?? week?.days?.find((day) => day.day === schedule.day_of_week)?.date;
}

function ScheduleActions({ schedule, week, onEdit, onDelete, onAttendance, attendanceLabel, readOnly }) {
    return (
        <span className="flex shrink-0 items-center gap-1 print:hidden">
            {onAttendance && (
                <button
                    type="button"
                    onClick={() => onAttendance(schedule, attendanceDate(schedule, week))}
                    className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                    aria-label={`${attendanceLabel} ${schedule.title}`}
                >
                    <ClipboardCheck className="h-4 w-4" />
                </button>
            )}
            {!readOnly && (
                <>
                    <button
                        type="button"
                        onClick={() => onEdit(schedule)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        aria-label={`Ubah jadwal ${schedule.title}`}
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(schedule)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Hapus jadwal ${schedule.title}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </>
            )}
        </span>
    );
}

function TutorLabel({ tutor, className = '' }) {
    if (!tutor) {
        return <span className="text-slate-500">{UNASSIGNED_TUTOR_LABEL}</span>;
    }

    return (
        <span className={`flex min-w-0 items-center gap-2 ${className}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {tutor.initials}
            </span>
            <span className="truncate">{tutor.name}</span>
        </span>
    );
}

export default function ScheduleTable({ schedules, week, onEdit, onDelete, onAttendance, attendanceLabel = 'Isi presensi', readOnly = false }) {
    if (schedules.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
                Tidak ada jadwal yang cocok dengan filter saat ini.
            </div>
        );
    }

    return (
        <>
            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm lg:hidden print:hidden">
                {schedules.map((s) => {
                    const style = CATEGORY_STYLES[s.program?.category] ?? CATEGORY_STYLES.english;

                    return (
                        <article key={s.id} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        {s.scheduled_date ? formatDate(s.scheduled_date) : `Setiap ${DAY_NAMES[s.day_of_week]}`}
                                    </p>
                                    <p className="mt-0.5 break-words text-sm font-semibold text-slate-900">{s.title}</p>
                                    <p className="break-words text-xs text-slate-500">{s.class_name}</p>
                                </div>
                                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold ${style.chip}`}>
                                    {s.start_time}–{s.end_time}
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                <span className={`rounded-full px-2.5 py-1 font-semibold ${style.badge}`}>{s.program?.name ?? '—'}</span>
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                                <span className="inline-flex min-w-0 items-center gap-1">
                                    <RoomIcon type={s.room.type} className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span className="truncate">{s.room.name}</span>
                                </span>
                                <span className="whitespace-nowrap text-slate-500">
                                    {s.participants} / {s.room.capacity} peserta
                                </span>
                            </div>

                            {s.student_names?.length > 0 && (
                                <p className="mt-2 break-words text-xs text-slate-500">
                                    Murid: {s.student_names.slice(0, 2).join(', ')}
                                    {s.student_names.length > 2 ? ` +${s.student_names.length - 2}` : ''}
                                </p>
                            )}

                            <div className="mt-3 flex items-end justify-between gap-2">
                                <TutorLabel tutor={s.tutor} className="text-xs font-semibold text-slate-800" />
                                {(!readOnly || onAttendance) && (
                                    <ScheduleActions
                                        schedule={s}
                                        week={week}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onAttendance={onAttendance}
                                        attendanceLabel={attendanceLabel}
                                        readOnly={readOnly}
                                    />
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="hidden overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm lg:block">
                <table className="w-full min-w-[980px] divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Hari & Jam</th>
                            <th className="px-4 py-3">Sesi</th>
                            <th className="px-4 py-3">Program</th>
                            <th className="px-4 py-3">Tutor</th>
                            <th className="px-4 py-3">Ruang / Platform</th>
                            <th className="px-4 py-3 text-right">Peserta</th>
                            {(!readOnly || onAttendance) && <th className="px-4 py-3 text-right print:hidden">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {schedules.map((s) => {
                            const style = CATEGORY_STYLES[s.program?.category] ?? CATEGORY_STYLES.english;

                            return (
                                <tr key={s.id} className="hover:bg-slate-50/60">
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <p className="font-semibold text-slate-900">{s.scheduled_date ? formatDate(s.scheduled_date) : `Setiap ${DAY_NAMES[s.day_of_week]}`}</p>
                                        <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-bold ${style.chip}`}>
                                            {s.start_time} - {s.end_time}
                                        </span>
                                    </td>
                                    <td className="min-w-56 px-4 py-3">
                                        <p className="font-semibold text-slate-900">{s.title}</p>
                                        <p className="text-xs text-slate-500">{s.class_name}</p>
                                        {s.student_names?.length > 0 && <p className="mt-1 max-w-64 truncate text-xs text-slate-500" title={s.student_names.join(', ')}>Murid: {s.student_names.slice(0, 3).join(', ')}{s.student_names.length > 3 ? ` +${s.student_names.length - 3}` : ''}</p>}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}>{s.program?.name ?? '—'}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <TutorLabel tutor={s.tutor} />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <span className="flex items-center gap-2 text-slate-700">
                                            <RoomIcon type={s.room.type} className="h-4 w-4 text-slate-400" />
                                            {s.room.name}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                                        {s.participants} <span className="text-slate-400">/ {s.room.capacity}</span>
                                    </td>
                                    {(!readOnly || onAttendance) && (
                                        <td className="whitespace-nowrap px-4 py-3 text-right print:hidden">
                                            <ScheduleActions
                                                schedule={s}
                                                week={week}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                onAttendance={onAttendance}
                                                attendanceLabel={attendanceLabel}
                                                readOnly={readOnly}
                                            />
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}
