import { useState } from 'react';
import { router } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';
import Modal from '@/Components/Admin/Modal';
import { DAY_NAMES, formatDate } from './constants';

export default function DeleteScheduleModal({ schedule, onClose }) {
    const [processing, setProcessing] = useState(false);

    const confirm = () => {
        setProcessing(true);
        router.delete(route('admin.schedules.destroy', schedule.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal
            open={!!schedule}
            onClose={onClose}
            size="md"
            title="Hapus jadwal?"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={confirm}
                        disabled={processing}
                        className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                    >
                        {processing ? 'Menghapus…' : 'Ya, hapus jadwal'}
                    </button>
                </>
            }
        >
            {schedule && (
                <div className="space-y-3 text-sm text-slate-600">
                    <p>
                        Anda akan menghapus <strong className="text-slate-900">{schedule.title}</strong> ({schedule.class_name}) —{' '}
                        {schedule.scheduled_date ? formatDate(schedule.scheduled_date) : `setiap ${DAY_NAMES[schedule.day_of_week]}`}, {schedule.start_time}–{schedule.end_time}.
                    </p>
                    <div className="flex gap-3 rounded-xl bg-red-50 p-3 text-red-800">
                        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>
                            Pendaftaran <strong>{schedule.participants} murid</strong> pada jadwal ini beserta data presensinya ikut
                            terhapus (cascade). Data murid sendiri tidak dihapus. Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>
                </div>
            )}
        </Modal>
    );
}
