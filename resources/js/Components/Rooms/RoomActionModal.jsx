import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';
import Modal from '@/Components/Admin/Modal';

const COPY = {
    delete: { title: 'Hapus ruangan?', confirm: 'Ya, hapus ruangan', busy: 'Menghapus…', tone: 'bg-red-700 hover:bg-red-800' },
    deactivate: { title: 'Nonaktifkan ruangan?', confirm: 'Ya, nonaktifkan', busy: 'Memproses…', tone: 'bg-slate-900 hover:bg-slate-800' },
    activate: { title: 'Aktifkan kembali ruangan?', confirm: 'Ya, aktifkan', busy: 'Memproses…', tone: 'bg-slate-900 hover:bg-slate-800' },
};

/**
 * Konfirmasi nonaktifkan / aktifkan / hapus (sequence 6–7).
 * Bila server menolak karena ruang masih dipakai, alasan ditampilkan dan jadwal terkait dimuat (7.3).
 */
export default function RoomActionModal({ target, onClose }) {
    const [processing, setProcessing] = useState(false);
    const [reason, setReason] = useState(null);
    const [related, setRelated] = useState(null); // { total, schedules } | 'error'

    const room = target?.room;
    const action = target?.action;

    useEffect(() => {
        setReason(null);
        setRelated(null);
    }, [room?.id, action]);

    if (!target) return <Modal open={false} onClose={onClose} title="" />;

    const copy = COPY[action];
    const url = action === 'delete' ? route('admin.rooms.destroy', room.id) : route('admin.rooms.status', room.id);

    const loadRelated = () =>
        window.axios
            .get(route('admin.rooms.schedules', room.id))
            .then((res) => setRelated(res.data))
            .catch(() => setRelated('error'));

    const confirm = () => {
        setProcessing(true);
        setReason(null);
        setRelated(null);

        const options = {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError: (errors) => {
                setReason(errors.action ?? 'Permintaan ditolak oleh server.');
                loadRelated();
            },
            onFinish: () => setProcessing(false),
        };

        if (action === 'delete') router.delete(url, options);
        else router.patch(url, {}, options);
    };

    return (
        <Modal
            open
            onClose={onClose}
            size="md"
            title={copy.title}
            footer={
                <>
                    <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        {reason ? 'Tutup' : 'Batal'}
                    </button>
                    {!reason && (
                        <button type="button" onClick={confirm} disabled={processing} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${copy.tone}`}>
                            {processing ? copy.busy : copy.confirm}
                        </button>
                    )}
                </>
            }
        >
            <div className="space-y-3 text-sm text-slate-600">
                <p>
                    Ruangan <strong className="text-slate-900">{room.name}</strong> ({room.type_label}).
                </p>

                {action === 'delete' && <p>Ruangan hanya dapat dihapus jika tidak dipakai pada jadwal mana pun. Jika masih dipakai, gunakan Nonaktifkan.</p>}
                {action === 'deactivate' && <p>Ruangan nonaktif tidak muncul lagi di pilihan jadwal. Jadwal lama tetap tersimpan, dan ruangan dapat diaktifkan kembali.</p>}
                {action === 'activate' && <p>Ruangan akan muncul kembali di pilihan jadwal.</p>}

                {action === 'delete' && room.schedules_count > 0 && !reason && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">Perhatian: ruangan ini dipakai pada {room.schedules_count} jadwal.</p>
                )}

                {reason && (
                    <div className="flex gap-3 rounded-xl bg-red-50 p-3 text-red-800" role="alert">
                        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>{reason}</p>
                    </div>
                )}

                {reason && related && related !== 'error' && (
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Jadwal terkait ({related.total})</p>
                        <ul className="max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
                            {related.schedules.map((s) => (
                                <li key={s.id} className="px-3 py-2">
                                    <p className="font-semibold text-slate-800">{s.title}</p>
                                    <p className="text-xs text-slate-500">
                                        {s.day}, {s.start_time}–{s.end_time} • {s.class_name}
                                        {s.instructor ? ` • ${s.instructor}` : ''}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        {s.semester}
                                        {s.semester_active ? ' (aktif)' : ''}
                                    </p>
                                </li>
                            ))}
                        </ul>
                        {related.total > related.schedules.length && <p className="mt-1 text-xs text-slate-400">Menampilkan {related.schedules.length} dari {related.total} jadwal.</p>}
                    </div>
                )}
                {reason && related === 'error' && <p className="text-xs text-slate-400">Daftar jadwal terkait gagal dimuat.</p>}
            </div>
        </Modal>
    );
}
