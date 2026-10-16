import { useEffect, useState } from 'react';
import { CircleCheck, X } from 'lucide-react';

/** Banner sukses di atas halaman, hilang otomatis setelah 7 detik. `flash` = { title, message } | null */
export default function FlashBanner({ flash }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!flash) {
            setVisible(false);
            return undefined;
        }

        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 7000);
        return () => clearTimeout(timer);
    }, [flash]);

    if (!flash || !visible) return null;

    return (
        <div
            className="mb-5 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm print:hidden"
            role="status"
        >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
                <CircleCheck className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">{flash.title}</p>
                <p className="text-sm text-slate-600">{flash.message}</p>
            </div>
            <button
                type="button"
                onClick={() => setVisible(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
}
