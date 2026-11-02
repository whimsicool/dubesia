import { CircleCheck, Download, ExternalLink, Undo2, X } from 'lucide-react';
import SimpleMarkdown from './SimpleMarkdown';
import { TYPE_META, formatDate, initials, metaLine } from './constants';

function Fallback({ m }) {
    const meta = TYPE_META[m.type] ?? TYPE_META.document;
    const Icon = meta.icon;

    return (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
            <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${meta.chip}`}>
                <Icon className="h-8 w-8" />
            </span>
            <div>
                <p className="font-bold text-slate-900">{m.type === 'link' ? 'Materi ini berada di situs eksternal' : 'Pratinjau tidak tersedia di browser'}</p>
                <p className="mt-1 text-sm text-slate-500">
                    {m.file ? 'Unduh berkas untuk membukanya di aplikasi Anda.' : m.external_host ? `Tautan: ${m.external_host}` : ''}
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                {m.file && (
                    <a href={m.file.download_url} className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                        <Download className="h-4 w-4" /> Unduh ({m.file.size_label})
                    </a>
                )}
                {m.external_url && (
                    <a
                        href={m.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <ExternalLink className="h-4 w-4" /> Buka Tautan
                    </a>
                )}
            </div>
        </div>
    );
}

function Body({ m }) {
    const file = m.file;
    const embedAllow = 'accelerometer; encrypted-media; picture-in-picture; fullscreen';

    if (m.type === 'article') {
        return (
            <div className="p-6 sm:p-8">
                <SimpleMarkdown source={m.body} />
            </div>
        );
    }

    if (m.type === 'video') {
        if (file) return <video key={file.url} controls preload="metadata" className="aspect-video max-h-[75vh] w-full bg-black" src={file.url} />;
        if (m.embed_url) {
            return (
                <iframe
                    title={m.title}
                    src={m.embed_url}
                    className="aspect-video w-full"
                    allow={embedAllow}
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            );
        }
    }

    if (m.type === 'audio' && file) {
        return (
            <div className="flex min-h-[200px] items-center p-8">
                <audio key={file.url} controls preload="metadata" className="w-full" src={file.url} />
            </div>
        );
    }

    if (m.type === 'document' || m.type === 'slide') {
        if (file?.is_pdf) return <iframe title={m.title} src={file.url} className="h-[75vh] w-full" />;
        if (m.embed_url) return <iframe title={m.title} src={m.embed_url} className="h-[75vh] w-full" allow={embedAllow} allowFullScreen />;
    }

    return <Fallback m={m} />;
}

/**
 * Panel viewer materi (header gelap + isi + info pengampu).
 * Mendukung PDF/video/audio dari file unggahan, embed YouTube/Vimeo/Google Slides/Drive, dan artikel teks.
 */
export default function MaterialViewer({ material: m, onClose, onToggleComplete, busy, readOnly = false }) {
    const meta = TYPE_META[m.type] ?? TYPE_META.document;
    const Icon = meta.icon;
    const completed = m.progress_status === 'completed';
    const newTabUrl = m.file?.url ?? m.external_url;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label={`Viewer: ${m.title}`}>
            <div className="flex flex-wrap items-center gap-3 bg-slate-900 px-4 py-3 text-white">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-700">
                    <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-300">Viewer aktif • {m.type_label}</p>
                    <h2 className="truncate text-sm font-bold sm:text-base">{m.title}</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {newTabUrl && (
                        <a
                            href={newTabUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"
                        >
                            <ExternalLink className="h-4 w-4" /> Tab Baru
                        </a>
                    )}
                    {m.file && (
                        <a href={m.file.download_url} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20">
                            <Download className="h-4 w-4" /> Unduh
                        </a>
                    )}
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={onToggleComplete}
                            disabled={busy}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-60 ${
                                completed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-700 hover:bg-red-800'
                            }`}
                        >
                            {completed ? <Undo2 className="h-4 w-4" /> : <CircleCheck className="h-4 w-4" />}
                            {completed ? 'Selesai — Batalkan' : 'Tandai Selesai Belajar'}
                        </button>
                    )}
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="Tutup viewer">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 bg-slate-50">
                    <Body m={m} />
                </div>

                <aside className="space-y-4 border-t border-slate-100 p-5 lg:border-l lg:border-t-0">
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pengampu Materi</p>
                        <div className="mt-3 flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                                {initials(m.uploader?.name)}
                            </span>
                            <div>
                                <p className="font-bold text-slate-900">{m.uploader?.name ?? '—'}</p>
                                <p className="text-[11px] font-semibold text-red-700">Pengajar Dubes</p>
                            </div>
                        </div>
                    </div>

                    {m.description && <p className="text-sm leading-relaxed text-slate-600">{m.description}</p>}

                    <dl className="space-y-2 text-xs">
                        {[
                            ['Jenis', metaLine(m)],
                            ['Level', m.level],
                            ['Diunggah', formatDate(m.published_at)],
                        ]
                            .filter(([, v]) => v)
                            .map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
                                    <dt className="text-slate-500">{k}</dt>
                                    <dd className="text-right font-semibold text-slate-800">{v}</dd>
                                </div>
                            ))}
                    </dl>
                </aside>
            </div>
        </section>
    );
}
