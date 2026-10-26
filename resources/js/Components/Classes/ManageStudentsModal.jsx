import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Modal from '@/Components/Admin/Modal';
import { axiosMessage } from './constants';

const FILTERS = [
    { key: 'all', label: 'Semua' },
    { key: 'members', label: 'Anggota' },
    { key: 'others', label: 'Belum masuk' },
];

/**
 * Atur murid dalam sebuah kelas (sequence 6–7).
 * Daftar murid + keanggotaan dimuat dari server; tiap klik langsung menyimpan satu murid
 * dan hasilnya (anggota terbaru) ditampilkan seketika.
 */
export default function ManageStudentsModal({ classGroup, onClose }) {
    const open = !!classGroup;
    const [students, setStudents] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState(null);
    const [changed, setChanged] = useState(false);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!open) return undefined;

        let cancelled = false;
        setLoading(true);
        setError(null);
        setChanged(false);
        setQuery('');
        setFilter('all');

        window.axios
            .get(route('admin.classes.students', classGroup.id))
            .then((res) => {
                if (cancelled) return;
                setStudents(res.data.students);
                setMeta(res.data.class);
            })
            .catch((e) => !cancelled && setError(axiosMessage(e, null, 'Gagal memuat daftar murid.')))
            .finally(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
    }, [classGroup?.id]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();

        return students.filter((s) => {
            if (filter === 'members' && !s.member) return false;
            if (filter === 'others' && s.member) return false;
            return !q || s.name.toLowerCase().includes(q) || s.nisn.toLowerCase().includes(q);
        });
    }, [students, query, filter]);

    const toggle = (student) => {
        setBusyId(student.id);
        setError(null);

        window.axios
            .post(route('admin.classes.students.sync', classGroup.id), { student_id: student.id, member: !student.member })
            .then((res) => {
                setStudents((list) => list.map((s) => (s.id === student.id ? { ...s, member: res.data.member, status: res.data.status } : s)));
                setMeta((m) => ({ ...m, members_count: res.data.members_count }));
                setChanged(true);
            })
            .catch((e) => setError(axiosMessage(e, 'student_id')))
            .finally(() => setBusyId(null));
    };

    const close = () => onClose(changed);
    const capacity = meta?.capacity;
    const count = meta?.members_count ?? 0;
    const pct = capacity ? Math.min(100, Math.round((count / capacity) * 100)) : null;

    return (
        <Modal
            open={open}
            onClose={close}
            size="lg"
            title={classGroup ? `Kelola Murid — ${classGroup.name}` : 'Kelola Murid'}
            description="Centang untuk memasukkan murid ke kelas, hapus centang untuk mengeluarkannya. Perubahan tersimpan otomatis."
            footer={
                <button type="button" onClick={close} className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                    Selesai
                </button>
            }
        >
            {loading ? (
                <p className="py-10 text-center text-sm text-slate-500" role="status">
                    Memuat daftar murid…
                </p>
            ) : (
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-800">
                                {count} murid{capacity ? ` / ${capacity}` : ''}
                            </span>
                            {meta && !meta.is_active && <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Kelas nonaktif</span>}
                        </div>
                        {pct !== null && (
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-700' : 'bg-slate-900'}`} style={{ width: `${pct}%` }} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari nama atau NISN…"
                                className="w-full rounded-lg border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-slate-900 focus:ring-slate-900"
                            />
                        </div>
                        <div className="flex rounded-lg bg-slate-100 p-1" role="tablist">
                            {FILTERS.map((f) => (
                                <button
                                    key={f.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={filter === f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ${filter === f.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                            {error}
                        </p>
                    )}

                    <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
                        {visible.length === 0 && <li className="px-4 py-8 text-center text-sm text-slate-400">Tidak ada murid yang cocok.</li>}
                        {visible.map((s) => (
                            <li key={s.id}>
                                <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                                    <input
                                        type="checkbox"
                                        checked={s.member}
                                        disabled={busyId === s.id}
                                        onChange={() => toggle(s)}
                                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                        aria-label={`${s.member ? 'Keluarkan' : 'Masukkan'} ${s.name}`}
                                    />
                                    <span className="flex-1 text-sm text-slate-800">{s.name}</span>
                                    <span className="text-xs text-slate-400">{s.nisn}</span>
                                    {s.status === 'pending' && <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">Baru</span>}
                                    {s.status === 'inactive' && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">Nonaktif</span>}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Modal>
    );
}
