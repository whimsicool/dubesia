import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Admin/Modal';
import { axiosMessage } from './constants';

const BLANK = { name: '', level: '', tutor_id: '', capacity: '', description: '' };

const inputClass =
    'w-full rounded-lg border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900';

function Field({ label, error, hint, children, className = '' }) {
    return (
        <div className={className}>
            <label className="mb-1 block text-xs font-semibold text-slate-700">{label}</label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
        </div>
    );
}

/**
 * Form tambah / ubah kelas.
 * Mode ubah: detail kelas diminta dulu ke server (GET .../show) sebelum form ditampilkan (sequence 4.1–4.3).
 */
export default function ClassFormModal({ open, onClose, classId, options }) {
    const isEdit = classId != null;
    const { data, setData, post, put, processing, errors, clearErrors } = useForm(BLANK);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        if (!open) return undefined;

        clearErrors();
        setLoadError(null);

        if (!isEdit) {
            setData(BLANK);
            return undefined;
        }

        let cancelled = false;
        setLoading(true);

        window.axios
            .get(route('admin.classes.show', classId))
            .then((res) => {
                if (cancelled) return;
                const c = res.data.data;
                setData({
                    name: c.name,
                    level: c.level,
                    tutor_id: c.tutor?.id ?? '',
                    capacity: c.capacity ?? '',
                    description: c.description ?? '',
                });
            })
            .catch((e) => !cancelled && setLoadError(axiosMessage(e, null, 'Gagal memuat detail kelas.')))
            .finally(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, classId]);

    const submit = (e) => {
        e.preventDefault();
        const visitOptions = { preserveScroll: true, onSuccess: () => onClose() };

        if (isEdit) put(route('admin.classes.update', classId), visitOptions);
        else post(route('admin.classes.store'), visitOptions);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title={isEdit ? 'Ubah Data Kelas' : 'Tambah Kelas Baru'}
            description="Isi nama kelas, level, tutor, dan deskripsi. Murid dapat diatur setelah kelas tersimpan."
        >
            {loading ? (
                <p className="py-10 text-center text-sm text-slate-500" role="status">
                    Memuat detail kelas…
                </p>
            ) : loadError ? (
                <p className="py-10 text-center text-sm text-red-700" role="alert">
                    {loadError}
                </p>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Nama kelas" error={errors.name}>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Diplomatic Speech Batch #4"
                            className={inputClass}
                            autoFocus
                        />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Level" error={errors.level}>
                            <select value={data.level} onChange={(e) => setData('level', e.target.value)} className={inputClass}>
                                <option value="">Pilih level…</option>
                                {options.levels.map((l) => (
                                    <option key={l.value} value={l.value}>
                                        {l.label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Tutor" error={errors.tutor_id}>
                            <select value={data.tutor_id} onChange={(e) => setData('tutor_id', e.target.value)} className={inputClass}>
                                <option value="">Pilih tutor…</option>
                                {options.tutors.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <Field label="Kapasitas murid (opsional)" error={errors.capacity} hint="Kosongkan bila tanpa batas.">
                        <input
                            type="number"
                            min="1"
                            value={data.capacity}
                            onChange={(e) => setData('capacity', e.target.value)}
                            className={`${inputClass} sm:w-48`}
                        />
                    </Field>

                    <Field label="Deskripsi" error={errors.description}>
                        <textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Tujuan pembelajaran, target peserta, dsb."
                            className={inputClass}
                        />
                    </Field>

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" disabled={processing} className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                            {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Kelas'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
