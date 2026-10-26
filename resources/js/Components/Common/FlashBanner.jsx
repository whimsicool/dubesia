import { useEffect, useState } from 'react';
import { CircleCheck, TriangleAlert, X } from 'lucide-react';

const TONES = {
    success: {
        icon: CircleCheck,
        frame: 'border-slate-100 bg-white',
        badge: 'bg-red-50 text-red-700',
    },
    error: {
        icon: TriangleAlert,
        frame: 'border-red-100 bg-white',
        badge: 'bg-red-50 text-red-700',
    },
};

/**
 * Banner di atas halaman, hilang otomatis setelah 7 detik.
 * `flash` = { title, message } | null, `tone` = 'success' | 'error'.
 */
export default function FlashBanner({ flash, tone = 'success' }) {
    const [visible, setVisible] = useState(false);
    const style = TONES[tone] ?? TONES.success;
    const Icon = style.icon;

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
            className={`mb-5 flex items-center gap-4 rounded-2xl border p-4 shadow-sm print:hidden ${style.frame}`}
            role="status"
        >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.badge}`}>
                <Icon className="h-6 w-6" />
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
