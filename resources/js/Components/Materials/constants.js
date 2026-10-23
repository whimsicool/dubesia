import { FileText, Headphones, Link2, Newspaper, Presentation, Video } from 'lucide-react';

/** Tampilan per jenis materi. Class ditulis utuh agar tidak di-purge Tailwind. */
export const TYPE_META = {
    document: { label: 'Dokumen', icon: FileText, bar: 'border-t-red-700', chip: 'bg-red-50 text-red-700', text: 'text-red-700' },
    video: { label: 'Video', icon: Video, bar: 'border-t-emerald-600', chip: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700' },
    audio: { label: 'Audio', icon: Headphones, bar: 'border-t-violet-600', chip: 'bg-violet-50 text-violet-700', text: 'text-violet-700' },
    slide: { label: 'Slide', icon: Presentation, bar: 'border-t-amber-500', chip: 'bg-amber-50 text-amber-700', text: 'text-amber-700' },
    article: { label: 'Artikel / Teks', icon: Newspaper, bar: 'border-t-sky-600', chip: 'bg-sky-50 text-sky-700', text: 'text-sky-700' },
    link: { label: 'Tautan', icon: Link2, bar: 'border-t-slate-500', chip: 'bg-slate-100 text-slate-700', text: 'text-slate-700' },
};

export const STATUS_OPTIONS = [
    { value: 'unopened', label: 'Belum Dibuka' },
    { value: 'learning', label: 'Sedang Dipelajari' },
    { value: 'completed', label: 'Selesai' },
];

export function formatDate(iso) {
    if (!iso) return '-';
    const [y, m, d] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d));
}

/** "Dokumen PDF • 4.8 MB • 28 Halaman" */
export function metaLine(m) {
    const parts = [];
    const ext = m.file?.name?.includes('.') ? m.file.name.split('.').pop().toUpperCase() : null;

    parts.push(ext && (m.type === 'document' || m.type === 'slide') ? `${m.type_label} ${ext}` : m.type_label);
    if (m.file?.size_label) parts.push(m.file.size_label);
    if (m.page_count) parts.push(`${m.page_count} Halaman`);
    if (m.duration_minutes) parts.push(`${m.duration_minutes} Menit`);
    if (!m.file && m.external_host) parts.push(m.external_host);

    return parts.join(' • ');
}

export function progressLabel(m) {
    if (m.progress_status === 'completed') return { text: m.type === 'video' ? 'Selesai Ditonton' : 'Selesai', tone: 'text-emerald-700' };
    if (m.progress_status === 'opened') return { text: 'Sedang Dipelajari', tone: 'text-red-700' };
    return { text: 'Belum Dibuka', tone: 'text-slate-500' };
}

export function initials(name = '') {
    return name
        .replace(/^(dr|prof|ir|drs)\.?\s+/i, '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();
}
