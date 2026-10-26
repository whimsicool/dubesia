import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Search, TriangleAlert } from 'lucide-react';
import Modal from '@/Components/Admin/Modal';
const BLANK = {
    title: '',
    program_id: '',
    instructor_id: '',
    room_id: '',
    class_group_id: '',
    scheduled_date: '',
    start_time: '08:00',
    end_time: '09:30',
    notes: '',
    student_ids: [],
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

function StudentPicker({ students, selected, onChange, capacity, error }) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return students;
        return students.filter((s) => s.name.toLowerCase().includes(q) || s.nisn.toLowerCase().includes(q));
    }, [students, query]);

    const toggle = (id) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
    const selectAllShown = () => onChange([...new Set([...selected, ...filtered.map((s) => s.id)])]);
    const over = capacity != null && selected.length > capacity;

    return (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Peserta (murid terdaftar)</label>
                <span className={`text-xs font-semibold ${over ? 'text-red-700' : 'text-slate-500'}`}>
                    {selected.length}
                    {capacity != null && ` / ${capacity}`} dipilih
                </span>
            </div>

            <div className="rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari nama atau NISN…"
                        className="w-full border-0 p-0 text-sm placeholder:text-slate-400 focus:ring-0"
                    />
                    <button type="button" onClick={selectAllShown} className="shrink-0 text-xs font-semibold text-slate-700 hover:underline">
                        Pilih semua
                    </button>
                    <button type="button" onClick={() => onChange([])} className="shrink-0 text-xs font-semibold text-red-700 hover:underline">
                        Kosongkan
                    </button>
                </div>

                <ul className="max-h-48 divide-y divide-slate-50 overflow-y-auto">
                    {filtered.length === 0 && <li className="px-3 py-4 text-center text-xs text-slate-400">Murid tidak ditemukan.</li>}
                    {filtered.map((s) => (
                        <li key={s.id}>
                            <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-slate-50">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(s.id)}
                                    onChange={() => toggle(s.id)}
                                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                />
                                <span className="flex-1 text-sm text-slate-800">{s.name}</span>
                                <span className="text-xs text-slate-400">{s.nisn}</span>
                                {s.status === 'pending' && (
                                    <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">Baru</span>
                                )}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
            {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
        </div>
    );
}

export default function ScheduleFormModal({ open, onClose, schedule, options, defaultDate, semester }) {
    const isEdit = !!schedule;
    const { data, setData, post, put, processing, errors, clearErrors } = useForm(BLANK);
    const [liveConflicts, setLiveConflicts] = useState([]);

    // Isi ulang form setiap kali modal dibuka / jadwal yang diedit berganti.
    useEffect(() => {
        if (!open) return;

        clearErrors();
        setLiveConflicts([]);
        setData(
            schedule
                ? {
                      title: schedule.title,
                      class_name: schedule.title,
                      program_id: schedule.program?.id ?? '',
                      instructor_id: schedule.instructor.id,
                      room_id: schedule.room.id,
                      class_group_id: schedule.class_group?.id ?? '',
                      scheduled_date: schedule.scheduled_date ?? '',
                      start_time: schedule.start_time,
                      end_time: schedule.end_time,
                      notes: schedule.notes ?? '',
                      student_ids: schedule.student_ids,
                  }
                : { ...BLANK, scheduled_date: defaultDate ?? '' },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, schedule?.id]);

    // Cek bentrok real-time (debounce 350 ms) sebelum form dikirim.
    useEffect(() => {
        if (!open) return undefined;

        const validTime = data.scheduled_date && data.start_time && data.end_time && data.end_time > data.start_time;
        const hasSubject = data.instructor_id || data.room_id || data.student_ids.length > 0;

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
                        instructor_id: data.instructor_id || null,
                        room_id: data.room_id || null,
                        student_ids: data.student_ids,
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
    }, [open, data.scheduled_date, data.start_time, data.end_time, data.instructor_id, data.room_id, data.student_ids, schedule?.id]);

    const selectedRoom = options.rooms.find((r) => String(r.id) === String(data.room_id));

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
                : 'Jadwal hanya berlaku pada tanggal yang dipilih. Bentrok instruktur, ruang, dan murid dicek otomatis.'}
        >
            <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Kelas" error={errors.title}>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Diplomatic Speech & Rhetoric"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Tutor" error={errors.instructor_id}>
                        <select value={data.instructor_id} onChange={(e) => setData('instructor_id', e.target.value)} className={inputClass}>
                            <option value="">Pilih tutor…</option>
                            {options.instructors.map((i) => (
                                <option key={i.id} value={i.id}>
                                    {i.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Kelas terdaftar (opsional)" error={errors.class_group_id}>
                        <select value={data.class_group_id} onChange={(e) => setData('class_group_id', e.target.value)} className={inputClass}>
                            <option value="">Tanpa kelas terdaftar</option>
                            {(options.classes ?? []).map((group) => (
                                <option key={group.id} value={group.id}>{group.name} — {group.level}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Ruang / Platform" error={errors.room_id}>
                        <select value={data.room_id} onChange={(e) => setData('room_id', e.target.value)} className={inputClass}>
                            <option value="">Pilih ruang…</option>
                            {options.rooms.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name} — {r.type === 'online' ? `Online${r.platform ? ` (${r.platform})` : ''}` : 'Tatap muka'}, kap. {r.capacity}
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

                <StudentPicker
                    students={options.students}
                    selected={data.student_ids}
                    onChange={(ids) => setData('student_ids', ids)}
                    capacity={selectedRoom?.capacity}
                    error={errors.student_ids}
                />

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
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                        {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Jadwal'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
