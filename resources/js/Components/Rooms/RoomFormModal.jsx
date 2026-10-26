import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Admin/Modal';
import { axiosMessage } from './constants';

const BLANK = { name: '', type: '', location: '', platform: '', capacity: '' };

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
 * Form tambah / ubah ruang.
 * Mode ubah: detail ruang diminta dulu ke server (GET .../show) sebelum form ditampilkan (sequence 4.1–4.3).
 */
export default function RoomFormModal({ open, onClose, roomId, options }) {
    const isEdit = roomId != null;
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
            .get(route('admin.rooms.show', roomId))
            .then((res) => {
                if (cancelled) return;
                const r = res.data.data;
                setData({ name: r.name, type: r.type, location: r.location ?? '', platform: r.platform ?? '', capacity: r.capacity ?? '' });
            })
            .catch((e) => !cancelled && setLoadError(axiosMessage(e, 'Gagal memuat detail ruangan.')))
            .finally(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, roomId]);

    const submit = (e) => {
        e.preventDefault();
        const visitOptions = { preserveScroll: true, onSuccess: () => onClose() };

        if (isEdit) put(route('admin.rooms.update', roomId), visitOptions);
        else post(route('admin.rooms.store'), visitOptions);
    };

    const online = data.type === 'online';

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title={isEdit ? 'Ubah Data Ruangan' : 'Tambah Ruangan Baru'}
            description="Isi nama, jenis, lokasi, dan kapasitas. Ruang online memakai platform (mis. Zoom) sebagai ganti lokasi."
        >
            {loading ? (
                <p className="py-10 text-center text-sm text-slate-500" role="status">
                    Memuat detail ruangan…
                </p>
            ) : loadError ? (
                <p className="py-10 text-center text-sm text-red-700" role="alert">
                    {loadError}
                </p>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Nama ruangan / platform" error={errors.name}>
                        <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Diplomatic Hall A" className={inputClass} autoFocus />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Jenis" error={errors.type}>
                            <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={inputClass}>
                                <option value="">Pilih jenis…</option>
                                {options.types.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Kapasitas (peserta)" error={errors.capacity}>
                            <input type="number" min="1" value={data.capacity} onChange={(e) => setData('capacity', e.target.value)} className={inputClass} />
                        </Field>
                    </div>

                    {online && (
                        <Field label="Platform" error={errors.platform}>
                            <input type="text" value={data.platform} onChange={(e) => setData('platform', e.target.value)} placeholder="Zoom, Google Meet, …" className={inputClass} />
                        </Field>
                    )}

                    <Field label={online ? 'Lokasi / tautan (opsional)' : 'Lokasi'} error={errors.location} hint={online ? 'Mis. tautan ruang virtual atau catatan akses.' : 'Gedung, lantai, atau alamat ruangan.'}>
                        <input type="text" value={data.location} onChange={(e) => setData('location', e.target.value)} placeholder={online ? 'https://zoom.us/j/…' : 'Gedung Utama, Lantai 2'} className={inputClass} />
                    </Field>

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" disabled={processing} className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                            {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Ruangan'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
