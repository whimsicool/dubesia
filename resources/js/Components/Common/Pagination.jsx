import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** `paginator` = objek paginator Laravel (current_page, last_page, from, to, total). */
export default function Pagination({ paginator, onPage, noun = 'data' }) {
    const { current_page: page, last_page: last, from, to, total } = paginator;
    const swipeStart = useRef(null);

    if (!total) return null;

    const handleTouchStart = (event) => {
        const touch = event.touches[0];
        swipeStart.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (event) => {
        if (!swipeStart.current || last <= 1) return;

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - swipeStart.current.x;
        const deltaY = touch.clientY - swipeStart.current.y;
        swipeStart.current = null;

        // Geser horizontal minimal 60 px, dan lebih mendatar daripada vertikal.
        if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY)) return;

        if (deltaX < 0 && page < last) onPage(page + 1);
        if (deltaX > 0 && page > 1) onPage(page - 1);
    };

    const start = Math.max(1, Math.min(page - 2, last - 4));
    const pages = Array.from({ length: Math.min(5, last) }, (_, i) => start + i);

    const btn = 'flex h-9 min-w-[36px] items-center justify-center rounded-lg border px-2 text-sm font-semibold';

    return (
        <div
            className="flex flex-col items-center justify-between gap-3 sm:flex-row print:hidden"
            style={{ touchAction: 'pan-y' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
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
