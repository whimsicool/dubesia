import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';

const getInitials = (name = '') =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

const getGradeTone = (score) => {
    if (score === null || score === undefined || score === '') {
        return 'bg-red-100 text-red-800';
    }

    if (Number(score) >= 90) {
        return 'bg-red-100 text-red-900';
    }

    if (Number(score) >= 75) {
        return 'bg-red-100 text-red-900';
    }

    return 'bg-red-100 text-red-800';
};

export default function Index({ grades }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    const [selectedGrades, setSelectedGrades] = useState([]);
    const [showFeedback, setShowFeedback] = useState(true);

    const filteredGrades = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return grades;
        }

        return grades.filter((grade) =>
            [grade.student?.name, grade.student?.email, grade.subject, grade.grade]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query)),
        );
    }, [grades, search]);

    const allVisibleSelected =
        filteredGrades.length > 0 &&
        filteredGrades.every((grade) => selectedGrades.includes(grade.id));

    const toggleGrade = (gradeId) => {
        setSelectedGrades((current) =>
            current.includes(gradeId)
                ? current.filter((id) => id !== gradeId)
                : [...current, gradeId],
        );
    };

    const toggleVisibleGrades = () => {
        setSelectedGrades((current) => {
            if (allVisibleSelected) {
                return current.filter(
                    (id) => !filteredGrades.some((grade) => grade.id === id),
                );
            }

            return [...new Set([...current, ...filteredGrades.map((grade) => grade.id)])];
        });
    };

    const handleDelete = (gradeId) => {
        if (!window.confirm('Hapus data nilai murid ini?')) {
            return;
        }

        router.delete(route('tutor.student-grades.destroy', gradeId));
    };

    const firstSelectedGrade = grades.find((grade) =>
        selectedGrades.includes(grade.id),
    );

    return (
        <AdminLayout title="Kelola Nilai"
        >
            <Head title="Kelola Nilai" />

            <div>
                <div className="mx-auto max-w-[1500px]">
                    {flash?.success && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="status">
                            {flash.success}
                        </div>
                    )}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <label className="flex w-full items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-slate-500 sm:max-w-xl">
                                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-4-4" />
                                </svg>
                                <span className="sr-only">Cari murid atau program</span>
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Cari nama murid, email, atau program..."
                                    className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-0"
                                />
                            </label>

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-900">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <circle cx="12" cy="12" r="9" />
                                        <path d="M12 11v5m0-8h.01" />
                                    </svg>
                                    Pilih murid untuk melihat aksi
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowFeedback((visible) => !visible)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-red-100"
                                    aria-pressed={showFeedback}
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <path d="M4 6h16M7 12h10m-7 6h4" />
                                        <circle cx="6" cy="6" r="1" />
                                        <circle cx="18" cy="12" r="1" />
                                        <circle cx="9" cy="18" r="1" />
                                    </svg>
                                    {showFeedback ? 'Sembunyikan umpan balik' : 'Tampilkan umpan balik'}
                                </button>
                                <Link
                                    href={route('tutor.student-grades.create')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                                >
                                    <span aria-hidden="true" className="text-lg leading-none">+</span>
                                    Tambah Nilai
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead className="bg-red-50 text-slate-700">
                                    <tr className="text-left text-xs font-bold uppercase tracking-wide">
                                        <th className="w-12 px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={allVisibleSelected}
                                                onChange={toggleVisibleGrades}
                                                aria-label="Pilih semua nilai yang terlihat"
                                                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                                            />
                                        </th>
                                        <th className="px-3 py-4">No</th>
                                        <th className="min-w-64 px-4 py-4">Nama Murid</th>
                                        <th className="min-w-40 px-4 py-4">Status Input</th>
                                        <th className="min-w-36 px-4 py-4 text-center">Program</th>
                                        <th className="min-w-32 px-4 py-4 text-center">Nilai Akhir</th>
                                        <th className="min-w-32 px-4 py-4 text-center">Predikat</th>
                                        {showFeedback && <th className="min-w-52 px-4 py-4">Umpan Balik</th>}
                                        <th className="px-4 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-red-100">
                                    {filteredGrades.length > 0 ? (
                                        filteredGrades.map((grade, index) => {
                                            const hasScore = grade.score !== null && grade.score !== undefined && grade.score !== '';

                                            return (
                                                <tr
                                                    key={grade.id}
                                                    className={`transition-colors hover:bg-red-50/60 ${selectedGrades.includes(grade.id) ? 'bg-red-50/40' : 'bg-white'}`}
                                                >
                                                    <td className="px-4 py-5">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedGrades.includes(grade.id)}
                                                            onChange={() => toggleGrade(grade.id)}
                                                            aria-label={`Pilih nilai ${grade.student?.name ?? 'murid'}`}
                                                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                                                        />
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm font-medium text-slate-600">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                                                                {getInitials(grade.student?.name)}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-slate-900">{grade.student?.name ?? 'Murid tidak ditemukan'}</p>
                                                                <p className="mt-0.5 truncate text-xs text-slate-500">{grade.student?.email ?? 'Informasi murid tidak tersedia'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${hasScore ? 'bg-red-100 text-red-900' : 'bg-red-100 text-red-900'}`}>
                                                            <span className={`h-2 w-2 rounded-full ${hasScore ? 'bg-slate-900' : 'bg-red-600'}`} />
                                                            {hasScore ? 'Sudah Diisi' : 'Belum Diisi'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-5 text-center text-sm font-medium text-slate-700">{grade.subject}</td>
                                                    <td className="px-4 py-5 text-center">
                                                        <span className="inline-flex min-w-16 justify-center rounded-lg bg-red-50 px-3 py-2 text-lg font-bold tabular-nums text-slate-900">
                                                            {hasScore ? Number(grade.score).toLocaleString('id-ID') : '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-5 text-center">
                                                        <span className={`inline-flex min-w-24 justify-center rounded-full px-3 py-2 text-sm font-bold ${getGradeTone(grade.score)}`}>
                                                            {grade.grade ?? (hasScore ? 'Nilai tersimpan' : 'Pending')}
                                                        </span>
                                                    </td>
                                                    {showFeedback && (
                                                        <td className="max-w-xs px-4 py-5 text-sm text-slate-600">
                                                            <p className="line-clamp-2">{grade.feedback || 'Belum ada umpan balik'}</p>
                                                        </td>
                                                    )}
                                                    <td className="whitespace-nowrap px-4 py-5 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Link
                                                                href={route('tutor.student-grades.edit', grade.id)}
                                                                aria-label={`Edit nilai ${grade.student?.name ?? ''}`}
                                                                title="Edit nilai"
                                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-red-100 hover:text-red-900"
                                                            >
                                                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                                    <path d="M12 20h9" />
                                                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                                                                </svg>
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(grade.id)}
                                                                aria-label={`Hapus nilai ${grade.student?.name ?? ''}`}
                                                                title="Hapus nilai"
                                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-100 hover:text-red-700"
                                                            >
                                                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                                    <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={showFeedback ? 9 : 8} className="px-6 py-16 text-center">
                                                <p className="font-semibold text-slate-800">Belum ada data nilai yang cocok</p>
                                                <p className="mt-1 text-sm text-slate-500">Coba ubah kata pencarian atau tambahkan nilai baru.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-semibold text-slate-900">{grades.length} data nilai</p>
                                <p className="text-xs text-slate-500">Nilai akhir ditampilkan sesuai data yang tersimpan.</p>
                            </div>
                            {selectedGrades.length > 0 && (
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <span className="text-sm text-slate-600">{selectedGrades.length} dipilih</span>
                                    {firstSelectedGrade && (
                                        <Link
                                            href={route('tutor.student-grades.edit', firstSelectedGrade.id)}
                                            className="inline-flex justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                                        >
                                            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />Edit nilai terpilih
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}
