import { useEffect, useState } from 'react';
import { Check, ClipboardCheck } from 'lucide-react';
import Modal from '@/Components/Admin/Modal';

const STATUS_LABELS = { present: 'Hadir', permit: 'Izin', sick: 'Sakit', absent: 'Alpa' };

export default function AttendanceModal({ schedule, date, onClose, audience = 'admin' }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const canEdit = audience === 'tutor';
    const attendanceRoute = canEdit ? 'tutor.schedules.attendance' : 'admin.schedules.attendance';

    useEffect(() => {
        if (!schedule || !date) return;
        let cancelled = false;
        setLoading(true);
        setError('');
        setSaved(false);
        window.axios.get(route(attendanceRoute, { schedule: schedule.id, date }))
            .then(({ data }) => {
                if (!cancelled) setStudents(data.students.map((student) => ({ ...student, status: student.status ?? '' })));
            })
            .catch((exception) => {
                if (!cancelled) setError(exception.response?.data?.message ?? 'Data presensi gagal dimuat.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [schedule?.id, date, attendanceRoute]);

    const updateStatus = (id, status) => { setSaved(false); setStudents((items) => items.map((student) => student.id === id ? { ...student, status } : student)); };
    const markEveryonePresent = () => { setSaved(false); setStudents((items) => items.map((student) => ({ ...student, status: 'present' }))); };
    const save = async () => {
        setSaving(true);
        setError('');
        setSaved(false);
        try {
            await window.axios.put(route('tutor.schedules.attendance.store', schedule.id), {
                date,
                students: students.map(({ id, status }) => ({ id, status })),
            });
            setSaved(true);
        } catch (exception) {
            const validationErrors = Object.values(exception.response?.data?.errors ?? {}).flat().join(' ');
            setError(exception.response?.data?.message ?? validationErrors ?? 'Presensi gagal disimpan.');
        } finally {
            setSaving(false);
        }
    };

    const footer = (
        <>
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">{canEdit ? 'Batal' : 'Tutup'}</button>
            {canEdit && <button type="button" disabled={saving || loading || students.length === 0 || students.some((student) => !student.status)} onClick={save} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Presensi'}</button>}
        </>
    );

    return (
        <Modal open={!!schedule} onClose={onClose} title={canEdit ? 'Isi Presensi Kelas' : 'Daftar Murid & Presensi'} description={schedule ? `${schedule.title} | ${schedule.class_name} | ${date}` : ''} footer={footer}>
            {loading ? <p className="py-8 text-center text-sm text-slate-500">Memuat daftar murid...</p> : students.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Belum ada murid di kelas ini. Tambahkan murid melalui menu Kelola Kelas.</p> : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className={`grid ${canEdit ? 'grid-cols-[1fr_160px]' : 'grid-cols-[1fr_160px]'} gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500`}><span>Murid</span><span>Status Presensi</span></div>
                    {canEdit && <div className="flex justify-end border-t border-slate-100 px-4 py-2"><button type="button" onClick={markEveryonePresent} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"><Check className="h-4 w-4" /> Tandai semua hadir</button></div>}
                    {students.map((student) => (
                        <div key={student.id} className="grid grid-cols-[1fr_160px] items-center gap-3 border-t border-slate-100 px-4 py-3">
                            <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{student.name}</p></div>
                            {canEdit ? (
                                <select value={student.status} onChange={(event) => updateStatus(student.id, event.target.value)} className="rounded-lg border-slate-200 text-sm">
                                    <option value="">Pilih status...</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                </select>
                            ) : (
                                <span className={`text-sm font-semibold ${student.status ? 'text-slate-800' : 'text-slate-400'}`}>{student.status ? STATUS_LABELS[student.status] : 'Belum diisi'}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
            {saved && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Presensi berhasil disimpan dan dapat dilihat admin.</p>}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><ClipboardCheck className="h-4 w-4"/> {canEdit ? 'Status presensi tersimpan untuk pertemuan ini.' : 'Admin dapat melihat hasil presensi; pengisian dilakukan oleh tutor.'}</div>
        </Modal>
    );
}