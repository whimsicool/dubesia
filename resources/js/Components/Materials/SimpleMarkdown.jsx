import { Fragment } from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * Renderer markdown sederhana & AMAN (tanpa dangerouslySetInnerHTML).
 * Mendukung: # ## ### judul, - / * daftar, 1. daftar bernomor, > kutipan,
 * **tebal**, *miring*, `kode`, [teks](https://tautan) — hanya http(s).
 */
const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;

function renderInline(text, keyPrefix) {
    return text.split(INLINE).map((part, i) => {
        const key = `${keyPrefix}-${i}`;
        if (!part) return null;

        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={key}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return (
                <code key={key} className="rounded bg-slate-100 px-1 py-0.5 text-[0.9em]">
                    {part.slice(1, -1)}
                </code>
            );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={key}>{part.slice(1, -1)}</em>;

        const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (link) {
            return (
                <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-medium text-red-700 underline">
                    {link[1]} <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </a>
            );
        }

        return <Fragment key={key}>{part}</Fragment>;
    });
}

export function parseBlocks(source) {
    const lines = String(source ?? '').replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let para = [];
    let list = null;

    const flushPara = () => {
        if (para.length) blocks.push({ type: 'p', text: para.join(' ') });
        para = [];
    };
    const flushList = () => {
        if (list) blocks.push(list);
        list = null;
    };

    for (const raw of lines) {
        const line = raw.trimEnd();
        let m;

        if (!line.trim()) {
            flushPara();
            flushList();
        } else if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
            flushPara();
            flushList();
            blocks.push({ type: 'h', level: m[1].length, text: m[2] });
        } else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
            flushPara();
            if (!list || list.ordered) {
                flushList();
                list = { type: 'list', ordered: false, items: [] };
            }
            list.items.push(m[1]);
        } else if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
            flushPara();
            if (!list || !list.ordered) {
                flushList();
                list = { type: 'list', ordered: true, items: [] };
            }
            list.items.push(m[1]);
        } else if ((m = line.match(/^>\s?(.*)$/))) {
            flushPara();
            flushList();
            blocks.push({ type: 'quote', text: m[1] });
        } else {
            flushList();
            para.push(line.trim());
        }
    }
    flushPara();
    flushList();

    return blocks;
}

const HEADINGS = {
    1: 'mt-6 text-2xl font-extrabold text-slate-900 first:mt-0',
    2: 'mt-6 text-xl font-bold text-slate-900 first:mt-0',
    3: 'mt-5 text-lg font-bold text-slate-900 first:mt-0',
};

export default function SimpleMarkdown({ source, className = '' }) {
    const blocks = parseBlocks(source);

    if (blocks.length === 0) return <p className="text-sm text-slate-400">Belum ada isi.</p>;

    return (
        <div className={`space-y-3 text-[15px] leading-relaxed text-slate-700 ${className}`}>
            {blocks.map((b, i) => {
                if (b.type === 'h') {
                    const Tag = `h${b.level}`;
                    return (
                        <Tag key={i} className={HEADINGS[b.level]}>
                            {renderInline(b.text, i)}
                        </Tag>
                    );
                }
                if (b.type === 'list') {
                    const Tag = b.ordered ? 'ol' : 'ul';
                    return (
                        <Tag key={i} className={`space-y-1 pl-6 ${b.ordered ? 'list-decimal' : 'list-disc'}`}>
                            {b.items.map((it, j) => (
                                <li key={j}>{renderInline(it, `${i}-${j}`)}</li>
                            ))}
                        </Tag>
                    );
                }
                if (b.type === 'quote') {
                    return (
                        <blockquote key={i} className="border-l-4 border-red-700 bg-red-50/50 px-4 py-2 italic text-slate-700">
                            {renderInline(b.text, i)}
                        </blockquote>
                    );
                }
                return <p key={i}>{renderInline(b.text, i)}</p>;
            })}
        </div>
    );
}
