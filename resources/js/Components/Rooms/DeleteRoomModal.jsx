import { useState } from 'react';
import { router } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';
import Modal from '@/Components/Admin/Modal';

export default function DeleteRoomModal({ open, room, onClose }) {
    const [processing, setProcessing] = useState(false);

    const schedules = room?.schedules_count ?? 0;
    const isUsed = schedules > 0;

    const remove = () => {
        setProcessing(true);
        router.delete(route('admin.rooms.destroy', room.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onFinish: () => setProcessing(false),
        });
    };



    return (
        <Modal
            open={open}
            onClose={onClose}
            size="md"
            title="Hapus ruangan?"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    {!isUsed && (
                        <button
                            type="button"
                            onClick={remove}
                            disabled={processing}
                            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? 'Menghapus…' : 'Ya, hapus ruangan'}
                        </button>
                    )}
                </>
            }
        >
            {room && (
                <div className="space-y-3 text-sm text-slate-600">
                    <p>
                        Anda akan menghapus <strong className="text-slate-900">{room.name}</strong>.
                    </p>

                    {isUsed ? (
                        <div className="flex gap-3 rounded-xl bg-red-50 p-3 text-red-800">
                            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                            <p>
                                Ruangan ini dipakai oleh <strong>{schedules} jadwal</strong>. Pindahkan jadwal ke ruangan lain sebelum menghapus ruangan ini.
                            </p>
                        </div>
                    ) : (
                        <div className="flex gap-3 rounded-xl bg-red-50 p-3 text-red-800">
                            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                            <p>Ruangan ini belum dipakai jadwal. Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
