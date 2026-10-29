import { useState } from 'react';

/** Agenda pekanan: pilih hari untuk melihat sesi pada hari itu. */
export default function WeekAgenda({ agenda }) {
    const initialDay = agenda.days.find((day) => day.is_today)?.day ?? agenda.days[0]?.day;
    const [selectedDay, setSelectedDay] = useState(initialDay);
    const selected = agenda.days.find((day) => day.day === selectedDay) ?? agenda.days[0];

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">{agenda.title}</h2>

            <div className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                {agenda.days.map((day) => {
                    const isSelected = day.day === selected?.day;

                    return (
                        <button
                            key={day.day}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedDay(day.day)}
                            className={`rounded-xl border px-2 py-2 text-center transition ${
                                isSelected
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <span className={`block text-xs font-semibold ${isSelected ? 'text-red-800' : 'text-slate-700'}`}>
                                {day.name.slice(0, 3)}
                            </span>
                            <span
                                className={`mt-0.5 block text-[10px] tabular-nums ${
                                    day.is_today ? 'font-bold text-red-700' : 'text-slate-400'
                                }`}
                            >
                                {day.is_today ? 'Hari ini' : day.items.length > 0 ? `${day.items.length} sesi` : '—'}
                            </span>
                        </button>
                    );
                })}
            </div>

            <ul className="mt-4 space-y-2">
                {selected?.items.length > 0 ? (
                    selected.items.map((item) => (
                        <li key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3">
                            <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[11px] font-bold tabular-nums text-red-800 ring-1 ring-slate-200">
                                {item.time}
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                <p className="mt-0.5 truncate text-xs text-slate-500">{item.meta}</p>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                        Tidak ada sesi pada hari {selected?.name}.
                    </li>
                )}
            </ul>
        </section>
    );
}
