import { Link } from '@inertiajs/react';
import { iconFor } from './icons';

const TONES = {
    attention: { badge: 'bg-red-50 text-red-700', hint: 'text-red-700' },
    neutral: { badge: 'bg-slate-100 text-slate-600', hint: 'text-slate-500' },
};

/** Kartu statistik dashboard; seluruh kartu menuju halaman fiturnya. */
export default function StatTile({ stat }) {
    const Icon = iconFor(stat.icon);
    const tone = TONES[stat.tone] ?? TONES.neutral;

    return (
        <Link
            href={stat.href}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
            <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.badge}`}>
                    <Icon className="h-4 w-4" />
                </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold tabular-nums tracking-tight text-slate-900">{stat.value}</p>
            <p className={`mt-1 text-xs leading-5 ${tone.hint}`}>{stat.hint}</p>
        </Link>
    );
}
