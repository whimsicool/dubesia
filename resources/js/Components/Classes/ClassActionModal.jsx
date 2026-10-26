import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';
import Modal from '@/Components/Admin/Modal';

const COPY = {
    delete: { title: 'Hapus kelas?', confirm: 'Ya, hapus kelas', busy: 'Menghapus…', tone: 'bg-red-700 hover:bg-red-800' },
    deactivate: { title: 'Nonaktifkan kelas?', confirm: 'Ya, nonaktifkan', busy: 'Memproses…', tone: 'bg-slate-900 hover:bg-slate-800' },
    activate: { title: 'Aktifkan kembali kelas?', confirm: 'Ya, aktifkan', busy: 'Memproses…', tone: 'bg-slate-900 hover:bg-slate-800' },
};

/**
 * Konfirmasi nonaktifkan / aktifkan / hapus (sequence 8–9).
 * Server memeriksa keterkaitan; bila masih dipakai, permintaan ditolak dan alasannya ditampilkan di sini.
 */
export default function ClassActionModal({ target, onClose }) {
    const [processing, setProcessing] = useState(false);
    const [reason, setReason] = useState(null);

    const classGroup = target?.classGroup;
    const action = target?.action;

    useEffect(() => setReason(null), [classGroup?.id, action]);

    if (!target) return <Modal open={false} onClose={onClose} title="" />;

    const copy = COPY[action];
    const url = action === 'delete' ? route('admin.classes.destroy', classGroup.id) : route('admin.classes.status', classGroup.id);

    const confirm = () => {
        setProcessing(true);
        setReason(null);

        const options = {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError: (errors) => setReason(errors.action ?? 'Permintaan ditolak oleh server.'),
            onFinish: () => setProcessing(false),
        };

        if (action === 'delete') router.delete(url, options);
        else router.patch(url, {}, options);
    };

    // Peringatan dini berdasarkan data yang sudah ada di daftar.
    const warnings = [];
    if (action === 'delete') {
        if (classGroup.students_count > 0) warnings.push(`${classGroup.students_count} murid masih terdaftar`);
        if (classGroup.schedules_count > 0) warnings.push(`${classGroup.schedules_count} jadwal masih memakai kelas ini`);
    }

    return (
        <Modal
            open
            onClose={onClose}
            size="md"
            title={copy.title}
            footer={
                <>
                    <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        Batal
                    </button>
                    <button type="button" onClick={confirm} disabled={processing} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${copy.tone}`}>
                        {processing ? copy.busy : copy.confirm}
                    </button>
                </>
            }
        >
            <div className="space-y-3 text-sm text-slate-600">
                <p>
                    Kelas <strong className="text-slate-900">{classGroup.name}</strong> (Level {classGroup.level}).
                </p>

                {action === 'delete' && <p>Kelas hanya dapat dihapus jika tidak memiliki murid dan tidak dipakai pada jadwal mana pun. Jika masih digunakan, gunakan Nonaktifkan.</p>}
                {action === 'deactivate' && <p>Kelas nonaktif tidak dapat dijadwalkan atau menerima murid baru. Data murid anggota tetap tersimpan dan kelas dapat diaktifkan kembali.</p>}
                {action === 'activate' && <p>Kelas akan dapat dijadwalkan dan menerima murid baru kembali.</p>}

                {warnings.length > 0 && !reason && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">Perhatian: {warnings.join(' dan ')}.</p>
                )}

                {reason && (
                    <div className="flex gap-3 rounded-xl bg-red-50 p-3 text-red-800" role="alert">
                        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>{reason}</p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
