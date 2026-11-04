import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { GraduationCap, LayoutDashboard, SlidersHorizontal } from 'lucide-react';

const initials = (name = '') =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

const formatScore = (score) =>
    score === null || score === undefined || score === ''
        ? '—'
        : Number(score).toLocaleString('id-ID', { maximumFractionDigits: 2 });

const calculateStudentScore = (student, components, scores) => {
    const totalWeight = components.reduce(
        (total, component) => total + Number(component.weight || 0),
        0,
    );

    if (!components.length || Math.abs(totalWeight - 100) > 0.01) {
        return null;
    }

    let weightedScore = 0;

    for (const component of components) {
        const score = scores[student.id]?.[component.id];

        if (score === '' || score === null || score === undefined) {
            if (component.is_required) {
                return null;
            }

            continue;
        }

        weightedScore +=
            (Number(score) / Number(component.max_score)) * Number(component.weight);
    }

    return Math.round(weightedScore * 100) / 100;
};

const getLetterGrade = (score) => {
    if (score === null) {
        return null;
    }

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
};

export default function Students({ courseClass, students, components }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    const { data, setData, put, errors } = useForm({
        scores: Object.fromEntries(
            students.map((student) => [student.id, student.components]),
        ),
    });

    const visibleStudents = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return students;
        }

        return students.filter((student) =>
            `${student.name} ${student.email}`.toLowerCase().includes(query),
        );
    }, [search, students]);

    const updateScore = (studentId, componentId, value) => {
        setData('scores', {
            ...data.scores,
            [studentId]: {
                ...data.scores[studentId],
                [componentId]: value,
            },
        });
    };

    const moveToNextRow = (event, componentId) => {
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();
        const fields = Array.from(
            document.querySelectorAll(`[data-grade-component="${componentId}"]`),
        );
        const nextField = fields[fields.indexOf(event.currentTarget) + 1];
        nextField?.focus();
    };

    const submit = (event) => {
        event.preventDefault();
        put(route('tutor.classes.grades.update', courseClass.id));
    };

    const totalWeight = components.reduce(
        (total, component) => total + Number(component.weight || 0),
        0,
    );

    return (
        <AdminLayout>
            <Head title={`Kelola Nilai - ${courseClass.name}`} />

            <div>
                <main>
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <Link href={route('tutor.dashboard')} className="inline-flex items-center gap-1.5 transition hover:text-red-700"><LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />Dashboard</Link>
                                <span aria-hidden="true">›</span>
                                <Link href={route('tutor.classes.index')} className="inline-flex items-center gap-1.5 transition hover:text-red-700"><GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />Kelas Saya</Link>
                                <span aria-hidden="true">›</span>
                                <span aria-current="page" className="text-red-700">Kelola Nilai</span>
                            </nav>
                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                                Kelola Nilai
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                {courseClass.name} <span className="px-1 text-slate-300">/</span>{' '}
                                {students.length} murid
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href={route('tutor.classes.grade-components.index', courseClass.id)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                            >
                                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                                Atur Komponen Nilai
                            </Link>
                            <div className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${Math.abs(totalWeight - 100) < 0.01 ? 'bg-red-100 text-red-950' : 'bg-red-100 text-red-900'}`}>
                                Bobot {formatScore(totalWeight)}%
                            </div>
                        </div>
                    </div>

                    {flash?.success && (
                        <div role="status" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <label className="flex w-full items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-slate-500 sm:max-w-xl">
                                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <circle cx="11" cy="11" r="7" />
                                        <path d="m20 20-4-4" />
                                    </svg>
                                    <span className="sr-only">Cari siswa</span>
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Cari nama murid atau email..."
                                        className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-0"
                                    />
                                </label>

                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                    <thead className="bg-red-50 text-slate-700">
                                        <tr className="text-left text-xs font-bold uppercase tracking-wide">
                                            <th className="px-3 py-4">No</th>
                                            <th className="min-w-64 px-4 py-4">Nama Murid &amp; Email</th>
                                            <th className="min-w-36 px-4 py-4">Status Input</th>
                                            {components.map((component) => (
                                                <th key={component.id} className="min-w-36 px-4 py-4 text-center">
                                                    <span className="block">{component.name}</span>
                                                    <span className="mt-1 block text-[10px] font-medium normal-case tracking-normal text-slate-500">
                                                        Bobot {formatScore(component.weight)}%
                                                    </span>
                                                </th>
                                            ))}
                                            <th className="min-w-28 px-4 py-4 text-center">Nilai Akhir</th>
                                            <th className="min-w-28 px-4 py-4 text-center">Predikat</th>
                                            <th className="px-4 py-4 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-100">
                                        {visibleStudents.length > 0 ? visibleStudents.map((student, index) => {
                                            const finalScore = calculateStudentScore(student, components, data.scores);
                                            const finalGrade = getLetterGrade(finalScore);
                                            const gradedCount = components.filter((component) => {
                                                const score = data.scores[student.id]?.[component.id];
                                                return score !== '' && score !== null && score !== undefined;
                                            }).length;
                                            const isComplete = components.length > 0 && components.every((component) => {
                                                const score = data.scores[student.id]?.[component.id];
                                                return !component.is_required || (score !== '' && score !== null && score !== undefined);
                                            });

                                            return (
                                                <tr key={student.id} className="bg-white transition-colors hover:bg-red-50/60">
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm font-medium text-slate-600">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{initials(student.name)}</span>
                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-slate-950">{student.name}</p>
                                                                <p className="mt-0.5 truncate text-xs text-slate-500">{student.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${isComplete ? 'bg-red-100 text-red-950' : 'bg-red-100 text-red-900'}`}>
                                                            <span className={`h-2 w-2 rounded-full ${isComplete ? 'bg-slate-900' : 'bg-red-600'}`} />
                                                            {isComplete ? 'Sudah Diisi' : `${gradedCount}/${components.length} diisi`}
                                                        </span>
                                                    </td>
                                                    {components.map((component) => {
                                                        const error = errors[`scores.${student.id}.${component.id}`];
                                                        return (
                                                            <td key={component.id} className="px-4 py-4 text-center">
                                                                <div className="mx-auto max-w-28">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max={component.max_score}
                                                                        step="0.01"
                                                                        value={data.scores[student.id]?.[component.id] ?? ''}
                                                                        onChange={(event) => updateScore(student.id, component.id, event.target.value)}
                                                                        onKeyDown={(event) => moveToNextRow(event, component.id)}
                                                                        data-grade-component={component.id}
                                                                        aria-label={`${component.name}, ${student.name}`}
                                                                        aria-invalid={Boolean(error)}
                                                                        className={`w-full rounded-lg border-0 bg-red-50 px-3 py-2 text-center text-lg font-bold tabular-nums text-slate-950 focus:ring-2 ${error ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-red-500'}`}
                                                                    />
                                                                    {error && <p className="mt-1 max-w-28 text-left text-[10px] leading-tight text-red-700">{error}</p>}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="px-4 py-5 text-center">
                                                        <span className="text-xl font-bold tabular-nums text-slate-950">{formatScore(finalScore)}</span>
                                                    </td>
                                                    <td className="px-4 py-5 text-center">
                                                        <span className={`inline-flex min-w-20 justify-center rounded-full px-3 py-2 text-sm font-bold ${finalGrade ? 'bg-red-100 text-red-950' : 'bg-slate-100 text-slate-500'}`}>{finalGrade ?? '—'}</span>
                                                    </td>
                                                    <td className="px-4 py-5 text-center">
                                                        <Link
                                                            href={route('tutor.classes.students.grades.edit', { courseClass: courseClass.id, student: student.id })}
                                                            aria-label={`Buka detail nilai ${student.name}`}
                                                            title="Detail nilai"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-red-100 hover:text-red-900"
                                                        >
                                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                                                <circle cx="12" cy="12" r="3" />
                                                            </svg>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={components.length + 6} className="px-6 py-16 text-center">
                                                    <p className="font-semibold text-slate-800">{students.length ? 'Tidak ada murid yang cocok' : 'Belum ada murid di kelas ini'}</p>
                                                    <p className="mt-1 text-sm text-slate-500">{students.length ? 'Coba ubah kata pencarian.' : 'Murid yang terdaftar di kelas akan tampil di sini.'}</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {components.length === 0 && (
                                <div className="border-t border-red-200 bg-red-50 px-5 py-3 text-sm text-red-900">
                                    Tambahkan komponen penilaian agar nilai bisa diinput dan dihitung.
                                </div>
                            )}
                        </section>

                    </form>
                </main>
            </div>
        </AdminLayout>
    );
}
