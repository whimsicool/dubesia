import { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import Modal from '@/Components/Admin/Modal';

const STATUS = {
    present: { label: 'Hadir', className: 'bg-emerald-50 text-emerald-700' },
    permit: { label: 'Izin', className: 'bg-amber-50 text-amber-700' },
    sick: { label: 'Sakit', className: 'bg-sky-50 text-sky-700' },
    absent: { label: 'Alpa', className: 'bg-rose-50 text-rose-700' },
};

function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
}

export default function StudentAttendanceModal({ schedule, date, onClose }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!schedule || !date) return undefined;

        let cancelled = false;
        setLoading(true);
        setStatus(null);
        setError('');

        window.axios
            .get(route('schedules.attendance', { schedule: schedule.id, date }))
            .then(({ data }) => {
                if (!cancelled) setStatus(data.status);
            })
            .catch((exception) => {
                if (!cancelled) setError(exception.response?.data?.message ?? 'Status presensi gagal dimuat.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [schedule?.id, date]);

    const meta = status ? STATUS[status] : null;

    const footer = (
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            Tutup
        </button>
    );

    return (
        <Modal
            open={!!schedule}
            onClose={onClose}
            title="Presensi Pertemuan"
            description={schedule && date ? `${schedule.title} | ${schedule.class_name} | ${formatDate(date)}` : ''}
            footer={footer}
        >
            {loading ? (
                <p className="py-8 text-center text-sm text-slate-500">Memuat status presensi...</p>
            ) : error ? (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>
            ) : (
                <div className="rounded-xl border border-slate-200 px-5 py-8 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Status presensi Anda</p>
                    {meta ? (
                        <span className={`mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-bold ${meta.className}`}>{meta.label}</span>
                    ) : (
                        <p className="mt-3 text-sm font-semibold text-slate-500">Belum diisi tutor</p>
                    )}
                    <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                        <ClipboardCheck className="h-4 w-4" /> Presensi diisi oleh tutor pada menu Jadwal Mengajar.
                    </p>
                </div>
            )}
        </Modal>
    );
}
