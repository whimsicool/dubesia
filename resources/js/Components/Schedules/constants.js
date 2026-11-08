export const DAYS = [
    { value: 1, label: 'Senin' },
    { value: 2, label: 'Selasa' },
    { value: 3, label: 'Rabu' },
    { value: 4, label: 'Kamis' },
    { value: 5, label: 'Jumat' },
    { value: 6, label: 'Sabtu' },
];

export const DAY_NAMES = Object.fromEntries(DAYS.map((d) => [d.value, d.label]));

/** Jadwal yang tutornya dihapus paksa tetap tampil dengan label ini. */
export const UNASSIGNED_TUTOR_LABEL = 'Tutor belum ditugaskan';

/** Warna per kategori program (sesuai legenda kalender). Class ditulis utuh agar tidak di-purge Tailwind. */
export const CATEGORY_STYLES = {
    english: {
        label: 'Diplomatic/English',
        dot: 'bg-slate-900',
        border: 'border-l-slate-900',
        chip: 'bg-slate-100 text-slate-700',
        badge: 'bg-slate-900 text-white',
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
