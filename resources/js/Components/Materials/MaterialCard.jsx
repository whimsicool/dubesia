import { CalendarDays, Download, Eye, Star, User } from 'lucide-react';
import { TYPE_META, formatDate, metaLine, progressLabel } from './constants';

function Badges({ m }) {
    return (
        <>
            {m.is_featured && (
                <span className="flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Star className="h-3 w-3" /> Rekomendasi
                </span>
            )}
            {m.is_new && <span className="rounded bg-red-700 px-2 py-0.5 text-[10px] font-bold text-white">BARU</span>}
        </>
    );
}

/** Kartu materi untuk murid. `layout` = 'grid' | 'list'. */
export default function MaterialCard({ material: m, active, layout = 'grid', onOpen }) {
    const meta = TYPE_META[m.type] ?? TYPE_META.document;
    const Icon = meta.icon;
    const status = progressLabel(m);
    const completed = m.progress_status === 'completed';

    const openBtn = (
        <button
            type="button"
            onClick={() => onOpen(m)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${
                completed ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
        >
            <Eye className="h-4 w-4" />
            {completed ? 'Buka Kembali' : m.progress_status === 'opened' ? 'Lanjutkan' : 'Buka Materi'}
        </button>
    );

    const downloadBtn = m.file && (
        <a
            href={m.file.download_url}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
        >
            <Download className="h-4 w-4" /> Unduh
        </a>
    );

    if (layout === 'list') {
        return (
            <article
                className={`flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center ${
                    active ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200'
                }`}
            >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.chip}`}>
                    <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">{m.title}</h3>
                        <Badges m={m} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                        {metaLine(m)} • {m.uploader?.name} • {formatDate(m.published_at)}
                    </p>
                </div>
                <span className={`text-xs font-semibold ${status.tone}`}>{status.text}</span>
                <div className="flex gap-2 sm:w-64">
                    {openBtn}
                    {downloadBtn}
                </div>
            </article>
        );
    }

    return (
        <article
            className={`flex flex-col rounded-2xl border border-t-4 bg-white p-4 shadow-sm ${meta.bar} ${
                active ? 'border-x-slate-900 border-b-slate-900 ring-1 ring-slate-900' : 'border-x-slate-200 border-b-slate-200'
            }`}
        >
            <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.chip}`}>{meta.label}</span>
                {m.level && <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{m.level}</span>}
                <span className="ml-auto flex items-center gap-1.5">
                    <Badges m={m} />
                </span>
            </div>

            <h3 className="mt-3 text-[17px] font-bold leading-snug text-slate-900">{m.title}</h3>
            {m.description && <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{m.description}</p>}

            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${meta.text}`} /> {metaLine(m)}
                </li>
                <li className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-400" /> {m.uploader?.name ?? '—'}
                </li>
                <li className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" /> Diunggah: {formatDate(m.published_at)}
                </li>
            </ul>

            <div className="mt-auto pt-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1.5 font-semibold ${status.tone}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" /> {status.text}
                    </span>
                </div>
                <div className="flex gap-2">
                    {openBtn}
                    {downloadBtn}
                </div>
            </div>
        </article>
    );
}
