import { useState } from 'react';
import { Link } from '@inertiajs/react';

const TONES = {
    attention: 'bg-red-50 text-red-700',
    success: 'bg-emerald-50 text-emerald-700',
    neutral: 'bg-slate-100 text-slate-600',
};

/** Panel bertab untuk daftar kerja role: pendaftaran, kelas, nilai, dan materi. */
export default function ActionPanel({ panel }) {
    const [tabKey, setTabKey] = useState(panel.tabs[0]?.key);
    const tab = panel.tabs.find((item) => item.key === tabKey) ?? panel.tabs[0];

    if (!tab) {
        return null;
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 pt-4">
                <h2 className="px-1 text-sm font-bold text-slate-900">{panel.title}</h2>

                <div className="mt-3 flex gap-1" role="tablist" aria-label={panel.title}>
                    {panel.tabs.map((item) => {
                        const isActive = item.key === tab.key;

                        return (
                            <button
                                key={item.key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setTabKey(item.key)}
                                className={`flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-xs font-semibold transition ${
                                    isActive
                                        ? 'border-red-600 text-red-800'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {item.label}
                                {item.count > 0 && (
                                    <span
                                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                                            isActive ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <ul className="divide-y divide-slate-100">
                {tab.items.length === 0 ? (
                    <li className="px-4 py-8 text-center text-sm text-slate-500">{tab.empty}</li>
                ) : (
                    tab.items.map((item) => {
                        const content = (
                            <>
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                    {item.badge && (
                                        <span
                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                TONES[item.tone] ?? TONES.neutral
                                            }`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-xs leading-5 text-slate-500">{item.meta}</p>
                            </>
                        );

                        return (
                            <li key={item.id}>
                                {item.href ? (
                                    <Link href={item.href} className="block px-4 py-3 transition hover:bg-slate-50">
                                        {content}
                                    </Link>
                                ) : (
                                    <div className="px-4 py-3">{content}</div>
                                )}
                            </li>
                        );
                    })
                )}
            </ul>

            {tab.footer && (
                <div className="border-t border-slate-100 px-4 py-3">
                    <Link href={tab.footer.href} className="text-xs font-semibold text-red-700 hover:text-red-900">
                        {tab.footer.label} →
                    </Link>
                </div>
            )}
        </section>
    );
}
