/** Badge jenis ruangan (class ditulis utuh agar tidak di-purge Tailwind). */
export const TYPE_STYLES = {
    physical: 'bg-slate-100 text-slate-700',
    lab: 'bg-sky-50 text-sky-700',
    online: 'bg-red-50 text-red-700',
};

export const typeStyle = (type) => TYPE_STYLES[type] ?? 'bg-slate-100 text-slate-700';

/** Ambil pesan error dari respons axios. */
export function axiosMessage(error, fallback = 'Terjadi kesalahan. Coba lagi.') {
    const data = error?.response?.data;
    if (data?.errors) return Object.values(data.errors)[0]?.[0] ?? fallback;
    return data?.message ?? fallback;
}
