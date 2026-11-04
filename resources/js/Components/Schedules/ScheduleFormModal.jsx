import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Save, TriangleAlert, X } from 'lucide-react';
import Modal from '@/Components/Admin/Modal';
const BLANK = {
    class_id: '',
    tutor_id: '',
    room_id: '',
    scheduled_date: '',
    start_time: '08:00',
    end_time: '09:30',
    notes: '',
};

const inputClass =
    'w-full rounded-lg border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900';

function Field({ label, error, children, className = '' }) {
    return (
        <div className={className}>
            <label className="mb-1 block text-xs font-semibold text-slate-700">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
        </div>
    );
}

export default function ScheduleFormModal({ open, onClose, schedule, options, defaultDate, semester }) {
    const isEdit = !!schedule;
    const { data, setData, post, put, processing, errors, clearErrors } = useForm(BLANK);
    const [liveConflicts, setLiveConflicts] = useState([]);

    const selectedClass = options.classes.find((item) => String(item.id) === String(data.class_id));

    // Isi ulang form setiap kali modal dibuka / jadwal yang diedit berganti.
    useEffect(() => {
        if (!open) return;

        clearErrors();
        setLiveConflicts([]);
        setData(
            schedule
                ? {
                      class_id: schedule.class_id ?? '',
                      tutor_id: schedule.instructor?.user_id ?? '',
                      room_id: schedule.room.id,
                      scheduled_date: schedule.scheduled_date ?? '',
                      start_time: schedule.start_time,
                      end_time: schedule.end_time,
                      notes: schedule.notes ?? '',
                  }
                : { ...BLANK, scheduled_date: defaultDate ?? '' },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, schedule?.id]);

    // Cek bentrok real-time (debounce 350 ms) sebelum form dikirim.
    useEffect(() => {
        if (!open) return undefined;

        const validTime = data.scheduled_date && data.start_time && data.end_time && data.end_time > data.start_time;
        const hasSubject = data.tutor_id || data.room_id || data.class_id;

        if (!validTime || !hasSubject) {
            setLiveConflicts([]);
            return undefined;
        }

        const controller = new AbortController();
        const timer = setTimeout(() => {
            window.axios
                .post(
                    route('admin.schedules.check-conflict'),
                    {
                        scheduled_date: data.scheduled_date,
                        start_time: data.start_time,
                        end_time: data.end_time,
                        tutor_id: data.tutor_id || null,
                        room_id: data.room_id || null,
                        class_id: data.class_id || null,
                        ignore_id: schedule?.id ?? null,
                    },
                    { signal: controller.signal },
                )
                .then((res) => setLiveConflicts(res.data.conflicts))
                .catch(() => {});
        }, 350);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [open, data.scheduled_date, data.start_time, data.end_time, data.tutor_id, data.room_id, data.class_id, schedule?.id]);

    const selectedRoom = options.rooms.find((r) => String(r.id) === String(data.room_id));

    /** Pilih kelas: tutor kelas ikut terpilih dan pesertanya diisi dari anggota kelas. */
    const selectClass = (classId) => {
        const courseClass = options.classes.find((item) => String(item.id) === String(classId));

        setData({
            ...data,
            class_id: classId,
            tutor_id: courseClass?.tutor ? String(courseClass.tutor.id) : data.tutor_id,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        const visitOptions = { preserveScroll: true, onSuccess: () => onClose() };

        if (isEdit) put(route('admin.schedules.update', schedule.id), visitOptions);
        else post(route('admin.schedules.store'), visitOptions);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="xl"
            title={isEdit ? 'Ubah Jadwal Belajar' : 'Tambah Jadwal Baru'}
            description={isEdit && !schedule.scheduled_date
                ? 'Jadwal lama berulang mingguan. Isi tanggal untuk mengubahnya menjadi jadwal khusus tanggal.'
                : 'Kelas, tutor, dan murid diambil dari data Kelola Kelas dan Data Murid & Tutor. Bentrok jadwal dicek otomatis.'}
        >
            <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Kelas" error={errors.class_id}>
                        <select value={data.class_id} onChange={(e) => selectClass(e.target.value)} className={inputClass}>
                            <option value="">Pilih kelas…</option>
                            {options.classes.map((courseClass) => (
                                <option key={courseClass.id} value={courseClass.id}>
                                    {courseClass.name}
                                    {courseClass.level ? ` (${courseClass.level})` : ''}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Tutor" error={errors.tutor_id}>
                        <select value={data.tutor_id} onChange={(e) => setData('tutor_id', e.target.value)} className={inputClass}>
                            <option value="">Pilih tutor…</option>
                            {options.tutors.map((tutor) => (
                                <option key={tutor.id} value={tutor.id}>
                                    {tutor.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Ruang / Platform" error={errors.room_id}>
                        <select value={data.room_id} onChange={(e) => setData('room_id', e.target.value)} className={inputClass}>
                            <option value="">Pilih ruang…</option>
                            {options.rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                    {room.type === 'online' ? `Ruang ${room.name} — Online${room.platform ? ` (${room.platform})` : ''}` : `Ruang Kelas ${room.name}`}, kap. {room.capacity}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Tanggal jadwal" error={errors.scheduled_date}>
                        <input
                            type="date"
                            value={data.scheduled_date}
                            min={semester?.start_date}
                            max={semester?.end_date}
                            required={!isEdit || !!schedule.scheduled_date}
                            onChange={(e) => setData('scheduled_date', e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Jam mulai" error={errors.start_time}>
                        <input type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Jam selesai" error={errors.end_time}>
                        <input type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} className={inputClass} />
                    </Field>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {selectedClass
                        ? `${selectedClass.students_count ?? 0} murid terdaftar akan otomatis mengikuti jadwal ini. Atur anggota melalui menu Kelola Kelas.`
                        : 'Pilih kelas untuk menggunakan daftar murid yang sudah diatur di Kelola Kelas.'}
                </div>

                <Field label="Catatan (opsional)" error={errors.notes}>
                    <textarea
                        rows={2}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        className={inputClass}
                        placeholder="Mis. membawa laptop, materi tambahan, dst."
                    />
                </Field>

                {liveConflicts.length > 0 && (
                    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
                        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-semibold">Terdeteksi bentrok jadwal</p>
                            <ul className="mt-1 list-disc space-y-0.5 pl-5">
                                {liveConflicts.map((c, i) => (
                                    <li key={`${c.schedule_id}-${c.type}-${i}`}>{c.message}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
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
                        <span className="inline-flex items-center gap-2"><Save aria-hidden="true" className="h-4 w-4" />{processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Jadwal'}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
}
