import { Link } from '@inertiajs/react';
import { iconFor } from './icons';

/** Pintasan ke fitur yang tersedia untuk role user. */
export default function QuickActions({ actions }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="px-1 text-sm font-bold text-slate-900">Aksi Cepat</h2>

            <div className="mt-3 grid grid-cols-2 gap-2">
                {actions.map((action) => {
                    const Icon = iconFor(action.icon);

                    return (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="group flex items-start gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold leading-snug text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-800"
                        >
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 group-hover:text-red-700" />
                            <span>{action.label}</span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
