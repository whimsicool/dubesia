import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
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

export default function RoomFormModal({ open, onClose, room, types }) {
    const isEdit = !!room;
    const isOnline = (value) => value === 'online';
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: '',
        capacity: '',
        location: '',
    });

    // Isi ulang formulir setiap kali modal dibuka / ruangan yang diedit berganti.
    useEffect(() => {
        if (!open) return;

        clearErrors();
        setData({
            name: room?.name ?? '',
            type: room?.type ?? '',
            capacity: room?.capacity ?? '',
            location: room?.platform ?? room?.location ?? '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, room?.id]);

    const submit = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                reset();
            },
        };

        if (isEdit) put(route('admin.rooms.update', room.id), options);
        else post(route('admin.rooms.store'), options);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? 'Ubah Data Ruangan' : 'Tambah Ruangan Baru'}
            description="Masukkan nama ruangan atau platform sesuai kebutuhan."
        >
            <form onSubmit={submit} className="space-y-4">
                <Field
                    label="Nama ruangan / platform"
                    hint={isOnline(data.type) ? 'Contoh: Zoom atau Google Meet.' : 'Admin dapat memasukkan nomor atau nama ruang sesuai kebutuhan.'}
                    error={errors.name}
                >
                    <input
                        type="text"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        className={inputClass}
                        placeholder={isOnline(data.type) ? 'Zoom' : 'Ruang 1'}
                        autoFocus
                    />
                </Field>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Jenis" error={errors.type}>
                        <select
                            value={data.type}
                            onChange={(event) => setData('type', event.target.value)}
                            className={inputClass}
                        >
                            <option value="">Pilih jenis…</option>
                            {types.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Kapasitas (peserta)" error={errors.capacity}>
                        <input
                            type="number"
                            min="1"
                            max="1000"
                            value={data.capacity}
                            onChange={(event) => setData('capacity', event.target.value)}
                            className={inputClass}
                            placeholder="20"
                        />
                    </Field>
                </div>

                {!isOnline(data.type) && (
                    <Field
                        label="Lokasi ruang (opsional)"
                        hint="Keterangan gedung atau lantai untuk ruang kelas."
                        error={errors.location}
                    >
                        <input
                            type="text"
                            value={data.location}
                            onChange={(event) => setData('location', event.target.value)}
                            placeholder="Gedung Utama, Lantai 2"
                            className={inputClass}
                        />
                    </Field>
                )}

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <span className="inline-flex items-center gap-2"><X aria-hidden="true" className="h-4 w-4" />Batal</span>
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                        <span className="inline-flex items-center gap-2"><Save aria-hidden="true" className="h-4 w-4" />{processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Ruangan'}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
}
