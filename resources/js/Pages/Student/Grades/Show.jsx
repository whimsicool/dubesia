import { Head, Link } from '@inertiajs/react';

const formatNumber = (value, digits = 2) =>
    value === null || value === undefined ? '—' : Number(value).toFixed(digits);

export default function Show({ courseClass, student, components, finalScore, letterGrade, feedback }) {
    const reportUrl = route('student.grades.download', { courseClass: courseClass.id });

    return (
        <>
            <Head title={`${courseClass.name} grades`} />

            <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link href={route('student.dashboard')} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
                            ← Back to my grades
                        </Link>
                        <a
                            href={reportUrl}
                            className="inline-flex items-center gap-2 rounded-xl border border-indigo-600 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                        >
                            <span aria-hidden="true">↓</span> Download report (PDF)
                        </a>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                        >
                            Log out
                        </Link>
                    </div>

                    <header className="mt-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Grade report</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{courseClass.name}</h1>
                        <p className="mt-2 text-slate-600">Results for {student.name}</p>
                    </header>

                    <section className="mt-7 grid gap-4 sm:grid-cols-[1fr_auto]">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Final score</p>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-4xl font-bold tracking-tight text-slate-900">{formatNumber(finalScore)}</span>
                                {finalScore !== null && finalScore !== undefined && <span className="text-sm text-slate-500">/ 100</span>}
                            </div>
                            {feedback && <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">{feedback}</p>}
                        </div>
                        <div className="flex min-w-32 flex-col justify-center rounded-2xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
                            <p className="text-sm font-medium text-indigo-700">Letter grade</p>
                            <p className="mt-1 text-4xl font-bold text-indigo-800">{letterGrade ?? '—'}</p>
                        </div>
                    </section>

                    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                            <h2 className="text-lg font-bold text-slate-900">Assessment breakdown</h2>
                            <p className="mt-1 text-sm text-slate-500">Scores and feedback recorded by your tutor.</p>
                        </div>
                        {components.length === 0 ? (
                            <p className="px-6 py-10 text-center text-sm text-slate-500">There are no assessments for this class yet.</p>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {components.map((component) => (
                                    <article key={component.id} className="grid gap-3 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-6">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-slate-900">{component.name}</h3>
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{component.weight}% weight</span>
                                                {component.is_required && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">Required</span>}
                                            </div>
                                            {component.feedback && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{component.feedback}</p>}
                                        </div>
                                        <div className="sm:min-w-32 sm:text-right">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Score</p>
                                            <p className="mt-1 text-lg font-bold text-slate-900">{formatNumber(component.score)} <span className="text-sm font-medium text-slate-400">/ {formatNumber(component.max_score)}</span></p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
