export const DAYS = [
    { value: 1, label: 'Senin' },
    { value: 2, label: 'Selasa' },
    { value: 3, label: 'Rabu' },
    { value: 4, label: 'Kamis' },
    { value: 5, label: 'Jumat' },
    { value: 6, label: 'Sabtu' },
];

export const DAY_NAMES = Object.fromEntries(DAYS.map((d) => [d.value, d.label]));

/** Warna per kategori program (sesuai legenda kalender). Class ditulis utuh agar tidak di-purge Tailwind. */
export const CATEGORY_STYLES = {
    english: {
        label: 'Diplomatic/English',
        dot: 'bg-slate-900',
        border: 'border-l-slate-900',
        chip: 'bg-slate-100 text-slate-700',
        badge: 'bg-slate-900 text-white',
    },
    exam: {
        label: 'IELTS / Exam',
        dot: 'bg-red-700',
        border: 'border-l-red-700',
        chip: 'bg-red-700 text-white',
        badge: 'bg-red-700 text-white',
    },
    mandarin: {
        label: 'Mandarin / Asian',
        dot: 'bg-sky-300',
        border: 'border-l-sky-300',
        chip: 'bg-sky-100 text-sky-700',
        badge: 'bg-sky-100 text-sky-700',
    },
};

export function parseISODate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

export function formatDate(iso, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
    return new Intl.DateTimeFormat('id-ID', options).format(parseISODate(iso));
}

/** "21 Oktober – 26 Oktober 2026" */
export function formatWeekRange(startIso, endIso) {
    const start = formatDate(startIso, { day: 'numeric', month: 'long' });
    const end = formatDate(endIso);
    return `${start} – ${end}`;
}

/** Hapus nilai kosong dari object query string. */
export function cleanParams(params) {
    return Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== ''),
    );
}
