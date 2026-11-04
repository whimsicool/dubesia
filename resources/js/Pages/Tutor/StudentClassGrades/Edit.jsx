import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowUpRight, GraduationCap, LayoutDashboard, Save, Users, X } from 'lucide-react';

const formatNumber = (value, digits = 0) =>
    Number(value ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });

export default function Edit({
    courseClass,
    student,
    components,
    flash,
}) {
    const { data, setData, put, processing, errors } = useForm({
        scores: Object.fromEntries(
            components.map((component) => [
                component.id,
                {
                    score: component.score ?? '',
                    feedback: component.feedback ?? '',
                },
            ])
        ),
    });

    const updateScore = (componentId, field, value) => {
        setData('scores', {
            ...data.scores,
            [componentId]: {
                ...data.scores[componentId],
                [field]: value,
            },
        });
    };

    const submit = (event) => {
        event.preventDefault();
        put(
            route('tutor.classes.students.grades.update', {
                courseClass: courseClass.id,
                student: student.id,
            })
        );
    };

    const complete = components.every((component) => {
        const score = data.scores[component.id]?.score;
        return !component.is_required || (score !== '' && score != null);
    });
    const gradedCount = components.filter(
        (component) => data.scores[component.id]?.score !== '' && data.scores[component.id]?.score != null
    ).length;
    const totalWeight = components.reduce(
        (total, component) => total + Number(component.weight || 0),
        0
    );
    const enteredWeight = components.reduce((total, component) => {
        const score = data.scores[component.id]?.score;
        return score === '' || score == null ? total : total + Number(component.weight || 0);
    }, 0);
    const previewScore = enteredWeight > 0
        ? components.reduce((total, component) => {
            const score = data.scores[component.id]?.score;
            if (score === '' || score == null) return total;
            return total + (Number(score) / Number(component.max_score || 100)) * Number(component.weight || 0);
        }, 0) / enteredWeight * 100
        : null;
    const scoreProgress = components.length
        ? Math.round((gradedCount / components.length) * 100)
        : 0;

    return (
        <AdminLayout>
            <Head title={`Kelola Nilai - ${student.name}`} />

            <main>
                <div className="mx-auto max-w-6xl">
                    <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Link href={route('tutor.dashboard')} className="inline-flex items-center gap-1.5 transition hover:text-red-700"><LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />Dashboard<ArrowUpRight className="h-3 w-3" aria-hidden="true" /></Link>
                        <span aria-hidden="true">›</span>
                        <Link href={route('tutor.classes.index')} className="inline-flex items-center gap-1.5 transition hover:text-red-700"><GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />Kelas Saya<ArrowUpRight className="h-3 w-3" aria-hidden="true" /></Link>
                        <span aria-hidden="true">›</span>
                        <Link
                            href={route('tutor.classes.students.index', { courseClass: courseClass.id })}
                            className="transition hover:text-red-700"
                        ><Users className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />Kelola Nilai<ArrowUpRight className="ml-1 inline h-3 w-3" aria-hidden="true" /></Link>
                        <span aria-hidden="true">›</span>
                        <span aria-current="page" className="text-red-700">Detail Nilai</span>
                    </nav>

                    <header className="mb-6">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Kelola Nilai</h1>
                        <p className="mt-1 font-semibold text-slate-700">{courseClass.name}</p>
                        <p className="mt-2 text-sm text-slate-600">
                            Masukkan nilai setiap komponen dan catatan untuk murid ini.
                        </p>
                    </header>

                    {flash?.success && (
                        <div
                            role="status"
                            className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                        >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">✓</span>
                            <p>{flash.success}</p>
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-7 space-y-6">
                        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-xl font-bold text-red-700">
                                        {student.name?.trim()?.charAt(0)?.toUpperCase() ?? '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Murid</p>
                                        <h2 className="mt-1 truncate text-xl font-bold text-slate-900">{student.name}</h2>
                                        {student.email && <p className="mt-1 truncate text-sm text-slate-500">{student.email}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Komponen terisi</p>
                                        <p className="mt-1 text-2xl font-bold text-slate-900">
                                            {gradedCount}<span className="text-base font-medium text-slate-400"> / {components.length}</span>
                                        </p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${complete ? 'bg-red-100 text-red-800' : 'bg-red-50 text-red-700'}`}>
                                        {complete ? 'Nilai wajib lengkap' : 'Sedang diisi'}
                                    </span>
                                </div>
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-red-600 transition-all" style={{ width: `${scoreProgress}%` }} />
                                </div>
                                <p className="mt-2 text-xs text-slate-500">Total bobot komponen {formatNumber(totalWeight)}%</p>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Nilai komponen</h2>
                                    <p className="mt-1 text-sm text-slate-500">Enter a score up to each assessment’s maximum.</p>
                                </div>
                                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${Math.abs(totalWeight - 100) <= 0.01 ? 'bg-red-100 text-red-800' : 'bg-red-50 text-red-700'}`}>
                                    {formatNumber(totalWeight)}% weight
                                </span>
                            </div>

                            {components.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">—</div>
                                    <h3 className="mt-4 font-semibold text-slate-900">Belum ada komponen nilai</h3>
                                    <p className="mt-1 text-sm text-slate-500">Tambahkan komponen nilai di kelas ini sebelum mengisi nilai.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {components.map((component, index) => {
                                        const scoreError = errors[`scores.${component.id}.score`];
                                        const feedbackError = errors[`scores.${component.id}.feedback`];
                                        return (
                                            <article key={component.id} className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(150px,0.7fr)_minmax(220px,1.2fr)] lg:items-start">
                                                <div className="flex gap-3">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{String(index + 1).padStart(2, '0')}</span>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-slate-900">{component.name}</h3>
                                                        <p className="mt-1 text-sm text-slate-500">Nilai maksimum: {formatNumber(component.max_score, 2)}</p>
                                                        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${component.is_required ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                                            {component.is_required ? 'Wajib' : 'Opsional'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor={`score-${component.id}`} className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                                                        Nilai <span className="text-xs font-normal text-slate-500">Bobot {formatNumber(component.weight)}%</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            id={`score-${component.id}`}
                                                            type="number"
                                                            min="0"
                                                            max={component.max_score}
                                                            step="0.01"
                                                            value={data.scores[component.id]?.score ?? ''}
                                                            onChange={(event) => updateScore(component.id, 'score', event.target.value)}
                                                            aria-invalid={Boolean(scoreError)}
                                                            aria-describedby={scoreError ? `score-error-${component.id}` : undefined}
                                                            className={`w-full rounded-xl border bg-white px-3 py-2.5 pr-14 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${scoreError ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-red-500 focus:ring-red-100'}`}
                                                            placeholder="0"
                                                        />
                                                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">/ {formatNumber(component.max_score, 2)}</span>
                                                    </div>
                                                    {scoreError && <p id={`score-error-${component.id}`} className="mt-1.5 text-xs text-red-600">{scoreError}</p>}
                                                </div>

                                                <div>
                                                    <label htmlFor={`feedback-${component.id}`} className="mb-2 block text-sm font-medium text-slate-700">Catatan <span className="font-normal text-slate-400">(opsional)</span></label>
                                                    <textarea
                                                        id={`feedback-${component.id}`}
                                                        value={data.scores[component.id]?.feedback ?? ''}
                                                        onChange={(event) => updateScore(component.id, 'feedback', event.target.value)}
                                                        rows={2}
                                                        maxLength={1000}
                                                        aria-invalid={Boolean(feedbackError)}
                                                        aria-describedby={feedbackError ? `feedback-error-${component.id}` : undefined}
                                                        className={`w-full resize-y rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${feedbackError ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-red-500 focus:ring-red-100'}`}
                                                        placeholder="Tambahkan catatan untuk membantu murid berkembang..."
                                                    />
                                                    {feedbackError && <p id={`feedback-error-${component.id}`} className="mt-1.5 text-xs text-red-600">{feedbackError}</p>}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:p-6">
                            <div>
                                <p className="text-sm font-semibold text-red-700">Nilai akhir</p>
                                <p className="mt-1 text-sm text-slate-600">
                                    {previewScore === null
                                        ? 'Preview rata-rata akhir akan muncul saat nilai diisi.'
                                        : 'Preview rata-rata akhir dari komponen yang sudah diisi.'}
                                </p>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2 sm:mt-0 sm:text-right">
                                <span className="text-4xl font-bold tracking-tight text-slate-900">{previewScore !== null ? formatNumber(previewScore, 2) : '—'}</span>
                                {previewScore !== null && <span className="text-sm font-medium text-slate-500">/ 100</span>}
                            </div>
                        </section>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
                            <Link
                                href={route('tutor.classes.students.index', { courseClass: courseClass.id })}
                                className="inline-flex justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                            >
                                <X className="mr-2 h-4 w-4" aria-hidden="true" />Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || components.length === 0}
                                className="inline-flex justify-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save className="mr-2 h-4 w-4" aria-hidden="true" />{processing ? 'Menyimpan nilai...' : 'Simpan Nilai'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </AdminLayout>
    );
}
