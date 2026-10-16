import { ChevronLeft, ChevronRight } from 'lucide-react';

/** `paginator` = objek paginator Laravel (current_page, last_page, from, to, total). */
export default function Pagination({ paginator, onPage, noun = 'data' }) {
    const { current_page: page, last_page: last, from, to, total } = paginator;

    if (!total) return null;

    const start = Math.max(1, Math.min(page - 2, last - 4));
    const pages = Array.from({ length: Math.min(5, last) }, (_, i) => start + i);

    const btn = 'flex h-9 min-w-[36px] items-center justify-center rounded-lg border px-2 text-sm font-semibold';

    return (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row print:hidden">
            <p className="text-sm text-slate-500">
                Menampilkan {from}–{to} dari {total} {noun}
            </p>

            {last > 1 && (
                <nav className="flex items-center gap-1" aria-label="Halaman">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => onPage(page - 1)}
                        className={`${btn} border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40`}
                        aria-label="Halaman sebelumnya"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {pages.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPage(p)}
                            aria-current={p === page ? 'page' : undefined}
                            className={`${btn} ${p === page ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        type="button"
                        disabled={page >= last}
                        onClick={() => onPage(page + 1)}
                        className={`${btn} border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40`}
                        aria-label="Halaman berikutnya"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </nav>
            )}
        </div>
    );
}
