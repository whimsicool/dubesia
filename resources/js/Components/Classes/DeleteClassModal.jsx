import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Trash2, TriangleAlert, X } from 'lucide-react';
import Modal from '@/Components/Admin/Modal';

export default function DeleteClassModal({ open, courseClass, onClose }) {
    const [processing, setProcessing] = useState(false);

    const students = courseClass?.students_count ?? 0;
    const schedules = courseClass?.schedules_count ?? 0;
    const grades = courseClass?.grades_count ?? 0;
    const isUsed = students > 0 || schedules > 0 || grades > 0;
    const related = [
        students > 0 ? `${students} murid` : null,
        schedules > 0 ? `${schedules} jadwal` : null,
        grades > 0 ? `${grades} komponen nilai` : null,
    ].filter(Boolean);

    const remove = () => {
        setProcessing(true);
        router.delete(route('admin.classes.destroy', courseClass.id), {
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
            title="Hapus kelas?"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <span className="inline-flex items-center gap-2"><X aria-hidden="true" className="h-4 w-4" />Batal</span>
                    </button>
                    {!isUsed && (
                        <button
                            type="button"
                            onClick={remove}
                            disabled={processing}
                            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span className="inline-flex items-center gap-2"><Trash2 aria-hidden="true" className="h-4 w-4" />{processing ? 'Menghapus…' : 'Ya, hapus kelas'}</span>
                        </button>
                    )}
                </>
            }
        >
            {courseClass && (
                <div className="space-y-3 text-sm text-slate-600">
                    <p>
                        Anda akan menghapus <strong className="text-slate-900">{courseClass.name}</strong>.
                    </p>

                    {isUsed ? (
                        <div className="flex gap-3 rounded-xl bg-red-50 p-3 text-red-800">
                            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                            <p>
                                Kelas ini masih terhubung dengan <strong>{related.join(', ')}</strong>. Lepaskan murid, jadwal, dan komponen nilai sebelum menghapus kelas ini.
                            </p>
                        </div>
                    ) : (
                        <div className="flex gap-3 rounded-xl bg-red-50 p-3 text-red-800">
                            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                            <p>Kelas belum punya murid, jadwal, atau nilai. Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
