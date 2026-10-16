import { Pencil, Trash2 } from 'lucide-react';
import RoomIcon from './RoomIcon';
import { CATEGORY_STYLES, DAY_NAMES } from './constants';

export default function ScheduleTable({ schedules, onEdit, onDelete, readOnly = false }) {
    if (schedules.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
                Tidak ada jadwal yang cocok dengan filter saat ini.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Hari & Jam</th>
                        <th className="px-4 py-3">Sesi</th>
                        <th className="px-4 py-3">Program</th>
                        <th className="px-4 py-3">Instruktur</th>
                        <th className="px-4 py-3">Ruang / Platform</th>
                        <th className="px-4 py-3 text-right">Peserta</th>
                        {!readOnly && <th className="px-4 py-3 text-right print:hidden">Aksi</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {schedules.map((s) => {
                        const style = CATEGORY_STYLES[s.program.category] ?? CATEGORY_STYLES.english;

                        return (
                            <tr key={s.id} className="hover:bg-slate-50/60">
                                <td className="whitespace-nowrap px-4 py-3">
                                    <p className="font-semibold text-slate-900">{DAY_NAMES[s.day_of_week]}</p>
                                    <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-bold ${style.chip}`}>
                                        {s.start_time} - {s.end_time}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-slate-900">{s.title}</p>
                                    <p className="text-xs text-slate-500">{s.class_name}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}>{s.program.name}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                                            {s.instructor.initials}
                                        </span>
                                        {s.instructor.name}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="flex items-center gap-2 text-slate-700">
                                        <RoomIcon type={s.room.type} className="h-4 w-4 text-slate-400" />
                                        {s.room.name}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                                    {s.participants} <span className="text-slate-400">/ {s.room.capacity}</span>
                                </td>
                                {!readOnly && (
                                    <td className="whitespace-nowrap px-4 py-3 text-right print:hidden">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(s)}
                                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                            aria-label={`Ubah jadwal ${s.title}`}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(s)}
                                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                                            aria-label={`Hapus jadwal ${s.title}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
