import { useMemo, useState } from 'react';

/**
 * Bagan batang interaktif: pilih rentang waktu, lalu arahkan kursor
 * atau fokuskan tombol batang untuk melihat angkanya.
 */
export default function ActivityChart({ chart }) {
    const [rangeKey, setRangeKey] = useState(chart.ranges[0]?.key);
    const [activeKey, setActiveKey] = useState(null);

    const range = chart.ranges.find((item) => item.key === rangeKey) ?? chart.ranges[0];
    const points = range?.points ?? [];
    const active = useMemo(() => points.find((point) => point.key === activeKey) ?? null, [points, activeKey]);
    const max = Math.max(1, ...points.map((point) => point.value));
    const total = points.reduce((sum, point) => sum + point.value, 0);
    const labelStep = points.length > 7 ? 2 : 1;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-900">{chart.title}</h2>
                    {points.length > 0 && (
                        <p className="mt-1 text-xs text-slate-500">
                            {active
                                ? `${active.label} · ${active.detail}`
                                : (chart.summary ?? `${total} ${chart.unit} dalam ${range?.label.toLowerCase()}`)}
                        </p>
                    )}
                </div>

                {chart.ranges.length > 1 && (
                    <div className="flex rounded-lg bg-slate-100 p-1" role="group" aria-label="Rentang waktu bagan">
                        {chart.ranges.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                aria-pressed={item.key === range?.key}
                                onClick={() => {
                                    setRangeKey(item.key);
                                    setActiveKey(null);
                                }}
                                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                                    item.key === range?.key
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            {points.length === 0 ? (
                <p className="mt-6 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                    Belum ada data untuk ditampilkan.
                </p>
            ) : (
                <div className="mt-6 flex h-44 items-end gap-1.5" onMouseLeave={() => setActiveKey(null)}>
                    {points.map((point, index) => {
                        const isActive = point.key === activeKey;

                        return (
                            <button
                                key={point.key}
                                type="button"
                                title={`${point.label}: ${point.detail}`}
                                aria-label={`${point.label}: ${point.detail}`}
                                onMouseEnter={() => setActiveKey(point.key)}
                                onFocus={() => setActiveKey(point.key)}
                                onBlur={() => setActiveKey(null)}
                                onClick={() => setActiveKey(point.key)}
                                className="group flex h-full flex-1 flex-col justify-end gap-2"
                            >
                                <span className="flex w-full flex-1 items-end">
                                    <span
                                        style={{ height: `${(point.value / max) * 100}%` }}
                                        className={`w-full min-h-[3px] rounded-t-md transition-colors ${
                                            point.value === 0
                                                ? isActive
                                                    ? 'bg-slate-300'
                                                    : 'bg-slate-200 group-hover:bg-slate-300'
                                                : isActive
                                                    ? 'bg-red-700'
                                                    : 'bg-red-200 group-hover:bg-red-500'
                                        }`}
                                    />
                                </span>
                                <span className="h-4 truncate text-[9px] font-semibold tabular-nums text-slate-400">
                                    {index % labelStep === 0 ? point.label.split(' ')[0] : ''}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
