import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import Modal from '@/Components/Admin/Modal';

const initials = (name = '') =>
    name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

export default function ClassStudentsModal({ open, onClose, courseClass, students }) {
    const [selected, setSelected] = useState([]);
    const [query, setQuery] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open) return;

        setSelected(courseClass?.student_ids ?? []);
        setQuery('');
        setError(null);
    }, [open, courseClass?.id]);

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return students;

        return students.filter(
            (student) =>
                student.name.toLowerCase().includes(needle) ||
                (student.email ?? '').toLowerCase().includes(needle),
        );
    }, [students, query]);

    const toggle = (id) => {
        setSelected((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
    };

    const submit = () => {
        if (!courseClass) return;

        setProcessing(true);
        router.put(
            route('admin.classes.students', courseClass.id),
            { student_ids: selected },
            {
                preserveScroll: true,
                onSuccess: () => onClose(),
                onError: (errors) => setError(errors.student_ids ?? 'Murid gagal disimpan.'),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="xl"
            title={`Atur Murid${courseClass ? ` — ${courseClass.name}` : ''}`}
            description="Centang murid yang tergabung di kelas ini. Daftar murid juga dipakai tutor untuk mengisi nilai."
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
                        onClick={submit}
                        disabled={processing}
                        className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                        {processing ? 'Menyimpan…' : 'Simpan Murid'}
                    </button>
                </>
            }
        >
            <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative min-w-[220px] flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Cari nama atau email murid…"
                            className="w-full rounded-lg border-slate-200 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900"
                        />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">{selected.length} murid dipilih</p>
                </div>

                <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200">
                    {filtered.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-slate-500">Tidak ada murid yang cocok.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {filtered.map((student) => (
                                <li key={student.id}>
                                    <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(student.id)}
                                            onChange={() => toggle(student.id)}
                                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                        />
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                                            {initials(student.name)}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-slate-900">
                                                {student.name}
                                            </span>
                                            <span className="block truncate text-xs text-slate-500">{student.email}</span>
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {error && <p className="text-xs text-red-700">{error}</p>}
            </div>
        </Modal>
    );
}
