/** Warna badge level kelas (class ditulis utuh agar tidak di-purge Tailwind). */
export const LEVEL_STYLES = {
    A1: 'bg-emerald-50 text-emerald-700',
    A2: 'bg-emerald-50 text-emerald-700',
    B1: 'bg-sky-50 text-sky-700',
    B2: 'bg-sky-50 text-sky-700',
    C1: 'bg-red-700 text-white',
    C2: 'bg-slate-900 text-white',
};

export const levelStyle = (level) => LEVEL_STYLES[level] ?? 'bg-slate-100 text-slate-700';

/** Ambil pesan error pertama dari respons axios (422 validasi atau error umum). */
export function axiosMessage(error, field = null, fallback = 'Terjadi kesalahan. Coba lagi.') {
    const data = error?.response?.data;
    if (field && data?.errors?.[field]?.[0]) return data.errors[field][0];
    if (data?.errors) return Object.values(data.errors)[0]?.[0] ?? fallback;
    return data?.message ?? fallback;
}
