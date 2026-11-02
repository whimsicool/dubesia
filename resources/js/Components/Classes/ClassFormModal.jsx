import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Admin/Modal';

const inputClass =
    'w-full rounded-lg border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900';

function Field({ label, hint, error, children, className = '' }) {
    return (
        <div className={className}>
            <label className="mb-1 block text-xs font-semibold text-slate-700">{label}</label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
        </div>
    );
}

export default function ClassFormModal({ open, onClose, courseClass, levels, tutors }) {
    const isEdit = !!courseClass;
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        level: '',
        tutor_id: '',
        description: '',
    });

    // Isi ulang formulir setiap kali modal dibuka / kelas yang diedit berganti.
    useEffect(() => {
        if (!open) return;

        clearErrors();
        setData({
            name: courseClass?.name ?? '',
            level: courseClass?.level ?? '',
            tutor_id: courseClass?.tutor ? String(courseClass.tutor.id) : '',
            description: courseClass?.description ?? '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, courseClass?.id]);

    const submit = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                reset();
            },
        };

        if (isEdit) put(route('admin.classes.update', courseClass.id), options);
        else post(route('admin.classes.store'), options);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? 'Ubah Data Kelas' : 'Tambah Kelas Baru'}
            description={
                isEdit
                    ? 'Perbarui nama, level, tutor, dan deskripsi kelas.'
                    : 'Isi nama kelas, level, tutor, dan deskripsi. Murid dapat diatur setelah kelas tersimpan.'
            }
        >
            <form onSubmit={submit} className="space-y-4">
                <Field label="Nama kelas" error={errors.name}>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        placeholder="Diplomatic Speech Batch #4"
                        className={inputClass}
                        autoFocus
                    />
                </Field>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Level" error={errors.level}>
                        <select
                            value={data.level}
                            onChange={(event) => setData('level', event.target.value)}
                            className={inputClass}
                        >
                            <option value="">Pilih level…</option>
                            {levels.map((level) => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Tutor" error={errors.tutor_id}>
                        <select
                            value={data.tutor_id}
                            onChange={(event) => setData('tutor_id', event.target.value)}
                            className={inputClass}
                        >
                            <option value="">Pilih tutor…</option>
                            {tutors.map((tutor) => (
                                <option key={tutor.id} value={tutor.id}>
                                    {tutor.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field label="Deskripsi" error={errors.description}>
                    <textarea
                        rows={3}
                        value={data.description}
                        onChange={(event) => setData('description', event.target.value)}
                        className={inputClass}
                        placeholder="Tujuan pembelajaran, target peserta, dsb."
                    />
                </Field>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                        {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Kelas'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
