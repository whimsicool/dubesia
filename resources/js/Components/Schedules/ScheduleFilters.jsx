import { CalendarRange, Columns3, Table2 } from 'lucide-react';
import { DAYS } from './constants';

function Select({ label, value, onChange, children }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
            <select
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-800 focus:border-slate-900 focus:ring-slate-900"
            >
                {children}
            </select>
        </label>
    );
}

export default function ScheduleFilters({ filters, options, view, onViewChange, onChange }) {
    const tabs = [
        { key: 'calendar', label: 'Kalender Mingguan', short: 'Kalender', icon: Columns3 },
        { key: 'month', label: 'Kalender Bulanan', short: 'Bulanan', icon: CalendarRange },
        { key: 'table', label: 'Daftar Rinci (Tabel)', short: 'Tabel', icon: Table2 },
    ];

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-end print:hidden">
            <div className="flex shrink-0 rounded-xl bg-slate-100 p-1 lg:w-auto" role="tablist">
                {tabs.map(({ key, label, short, icon: Icon }) => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={view === key}
                        onClick={() => onViewChange(key)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                            view === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="whitespace-nowrap sm:hidden">{short}</span>
                        <span className="hidden whitespace-nowrap sm:inline">{label}</span>
                    </button>
                ))}
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-4">
                <Select label="Hari" value={filters.day} onChange={(v) => onChange({ day: v })}>
                    <option value="">Semua</option>
                    {DAYS.map((d) => (
                        <option key={d.value} value={d.value}>
                            {d.label}
                        </option>
                    ))}
                </Select>

                <Select label="Program Kursus" value={filters.program_id} onChange={(v) => onChange({ program_id: v })}>
                    <option value="">Semua</option>
                    {options.programs.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </Select>

                <Select label="Tutor" value={filters.instructor_id} onChange={(v) => onChange({ instructor_id: v })}>
                    <option value="">Semua</option>
                    {options.instructors.map((i) => (
                        <option key={i.id} value={i.id}>
                            {i.name}
                        </option>
                    ))}
                </Select>

                <Select label="Ruang / Platform" value={filters.room_id} onChange={(v) => onChange({ room_id: v })}>
                    <option value="">Semua</option>
                    {options.rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.name}
                        </option>
                    ))}
                </Select>
            </div>
        </div>
    );
}
