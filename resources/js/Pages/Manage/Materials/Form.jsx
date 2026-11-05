import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, FileEdit, Save, Upload, X } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import FileDropzone from '@/Components/Materials/FileDropzone';
import SimpleMarkdown from '@/Components/Materials/SimpleMarkdown';
import { TYPE_META } from '@/Components/Materials/constants';

const input =
    'w-full rounded-lg border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900';

function Field({ label, hint, error, children, className = '' }) {
    return (
        <div className={className}>
            <label className="mb-1 block text-xs font-semibold text-slate-700">{label}</label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
        </div>
    );
}

export default function Form({ material, options, routePrefix = 'tutor.materials' }) {
    const isEdit = !!material;
    const [preview, setPreview] = useState(false);

    const { data, setData, post, processing, errors, progress, transform, clearErrors } = useForm({
        _method: isEdit ? 'put' : 'post',
        type: material?.type ?? 'document',
        title: material?.title ?? '',
        description: material?.description ?? '',
        level: material?.level ?? '',
        body: material?.body ?? '',
        external_url: material?.external_url ?? '',
        duration_minutes: material?.duration_minutes ?? '',
        is_featured: material?.is_featured ?? false,
        status: material?.status ?? 'draft',
        file: null,
    });

    const typeOpt = options.types.find((t) => t.value === data.type);
    const usesFile = !!typeOpt?.uses_file;
    const isArticle = data.type === 'article';
    const isLink = data.type === 'link';
    const existingFile = isEdit && material.type === data.type ? material.file : null;

    // Ganti jenis materi mengosongkan seluruh isian di bawah pemilih jenis,
    // supaya sisa isian iseng tidak ikut terkirim bersama jenis yang baru.
    const changeType = (nextType) => {
        if (nextType === data.type) return;

        setData((current) => ({
            ...current,
            type: nextType,
            title: '',
            description: '',
            level: '',
            body: '',
            external_url: '',
            duration_minutes: '',
            is_featured: false,
            file: null,
        }));
        clearErrors('type', 'file', 'external_url', 'body', 'duration_minutes');
        setPreview(false);
    };

    const submit = (status) => (e) => {
        e?.preventDefault();

        // Kirim hanya field yang relevan untuk jenis materi terpilih.
        transform((d) => {
            const out = { ...d, status };
            if (!isEdit) delete out._method;
            if (!usesFile || !out.file) delete out.file;
            if (!isArticle) out.body = '';
            if (isArticle) out.external_url = '';
            return out;
        });

        post(isEdit ? route(`${routePrefix}.update`, material.id) : route(`${routePrefix}.store`), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const publishLabel = isEdit && material.status === 'published' ? 'Simpan Perubahan' : 'Upload';

    return (
        <AdminLayout>
            <Head title={isEdit ? 'Ubah Materi' : 'Tambah Materi'} />

            <Link href={route(`${routePrefix}.index`)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" /> Kembali ke daftar materi
            </Link>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{isEdit ? 'Ubah Materi' : 'Tambah Materi Baru'}</h1>
            <p className="mt-2 text-sm text-slate-600">Materi akan tampil untuk semua murid setelah diterbitkan — tidak perlu memilih kelas atau jadwal.</p>

            <form onSubmit={submit('published')} className="mt-6 space-y-6">
                {/* Jenis materi */}
                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-bold text-slate-900">1. Jenis materi</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" role="radiogroup" aria-label="Jenis materi">
                        {options.types.map((t) => {
                            const meta = TYPE_META[t.value];
                            const Icon = meta.icon;
                            const selected = data.type === t.value;

                            return (
                                <button
                                    key={t.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => changeType(t.value)}
                                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition ${
                                        selected ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.chip}`}>
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                    {errors.type && <p className="mt-2 text-xs text-red-700">{errors.type}</p>}
                </section>

                {/* Informasi */}
                <section className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:grid-cols-2">
                    <h2 className="text-sm font-bold text-slate-900 md:col-span-2">2. Informasi materi</h2>

                    <Field label="Judul materi" error={errors.title} className="md:col-span-2">
                        <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Modul 04: Bilateral Diplomatic Negotiation" className={input} />
                    </Field>

                    <Field label="Deskripsi singkat" error={errors.description} className="md:col-span-2" hint="Tampil di kartu materi (maks. 600 karakter).">
                        <textarea rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} className={input} />
                    </Field>

                    <Field label="Level" error={errors.level} className="md:col-span-2">
                        <select value={data.level} onChange={(e) => setData('level', e.target.value)} className={input}>
                            <option value="">Semua level</option>
                            {options.levels.map((l) => (
                                <option key={l} value={l}>
                                    {l}
                                </option>
                            ))}
                        </select>
                    </Field>
                </section>

                {/* Konten */}
                <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900">3. Konten</h2>

                    {usesFile && (
                        <>
                            <Field label={`Berkas ${typeOpt.label.toLowerCase()}`} error={null}>
                                <FileDropzone
                                    key={data.type}
                                    file={data.file}
                                    onFile={(f) => setData('file', f)}
                                    extensions={typeOpt.extensions}
                                    maxMb={typeOpt.max_upload_mb}
                                    existing={existingFile}
                                    progress={progress}
                                    error={errors.file}
                                />
                            </Field>

                            <Field
                                label="Atau tempel tautan (opsional)"
                                error={errors.external_url}
                                hint="YouTube, Vimeo, Google Drive, atau Google Slides akan ditampilkan langsung di viewer. Jika berkas juga diunggah, berkas yang dipakai."
                            >
                                <input type="url" value={data.external_url} onChange={(e) => setData('external_url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={input} />
                            </Field>

                            {(data.type === 'video' || data.type === 'audio') && (
                                <Field label="Durasi (menit)" error={errors.duration_minutes}>
                                    <input type="number" min="1" value={data.duration_minutes} onChange={(e) => setData('duration_minutes', e.target.value)} className={input} />
                                </Field>
                            )}
                        </>
                    )}

                    {isLink && (
                        <Field label="Tautan materi" error={errors.external_url} hint="Tautan dibuka di tab baru oleh murid.">
                            <input type="url" value={data.external_url} onChange={(e) => setData('external_url', e.target.value)} placeholder="https://..." className={input} />
                        </Field>
                    )}

                    {isArticle && (
                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-700">Isi artikel</label>
                                <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                                    <button type="button" onClick={() => setPreview(false)} className={`rounded-md px-3 py-1 ${!preview ? 'bg-white shadow-sm' : 'text-slate-500'}`}>
                                        <FileEdit className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                                        Tulis
                                    </button>
                                    <button type="button" onClick={() => setPreview(true)} className={`rounded-md px-3 py-1 ${preview ? 'bg-white shadow-sm' : 'text-slate-500'}`}>
                                        <Eye className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                                        Pratinjau
                                    </button>
                                </div>
                            </div>

                            {preview ? (
                                <div className="min-h-[240px] rounded-lg border border-slate-200 bg-slate-50 p-5">
                                    <SimpleMarkdown source={data.body} />
                                </div>
                            ) : (
                                <textarea
                                    rows={14}
                                    value={data.body}
                                    onChange={(e) => setData('body', e.target.value)}
                                    placeholder={'# Judul\n\nParagraf pembuka dengan **teks tebal** dan [tautan](https://...)\n\n- Poin pertama\n- Poin kedua'}
                                    className={`${input} font-mono`}
                                />
                            )}
                            {errors.body && <p className="mt-1 text-xs text-red-700">{errors.body}</p>}
                            <p className="mt-1 text-xs text-slate-400">Format: # Judul, ## Subjudul, - daftar, 1. daftar bernomor, &gt; kutipan, **tebal**, *miring*, [teks](url).</p>
                        </div>
                    )}
                </section>

                {/* Publikasi */}
                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-bold text-slate-900">4. Publikasi</h2>
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                        <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                        Tandai sebagai <strong>Rekomendasi</strong> (badge bintang di pustaka murid)
                    </label>
                </section>

                <div className="flex flex-wrap justify-end gap-3">
                    <Link href={route(`${routePrefix}.index`)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <X className="h-4 w-4" /> Batal
                    </Link>
                    <button type="button" disabled={processing} onClick={submit('draft')} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60">
                        <Save className="h-4 w-4" /> Simpan sebagai Draft
                    </button>
                    <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                        <Upload className="h-4 w-4" /> {processing ? 'Menyimpan…' : publishLabel}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
