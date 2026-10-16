import { Head, Link } from '@inertiajs/react';

const formatScore = (score) =>
    score === null || score === undefined
        ? 'Not available'
        : Number(score).toFixed(2);

export default function Index({ classes }) {
    return (
        <>
            <Head title="My grades" />

            <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <header className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Student portal</p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">My grades</h1>
                            <p className="mt-2 text-slate-600">View your class results and download a report for each class.</p>
                        </div>
                        <Link
                            href={route('student.feedback.create')}
                            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                        >
                            Kritik dan saran
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                        >
                            Log out
                        </Link>
                    </header>

                    {classes.length === 0 ? (
                        <section className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-xl text-indigo-600">—</div>
                            <h2 className="mt-4 font-semibold text-slate-900">No classes assigned yet</h2>
                            <p className="mt-1 text-sm text-slate-500">Your enrolled classes and grades will appear here.</p>
                        </section>
                    ) : (
                        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {classes.map((courseClass) => (
                                <article key={courseClass.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Class</p>
                                        <h2 className="mt-2 text-xl font-bold text-slate-900">{courseClass.name}</h2>
                                        {courseClass.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{courseClass.description}</p>}
                                        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Final score</p>
                                                <p className="mt-1 text-2xl font-bold text-slate-900">{formatScore(courseClass.score)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Grade</p>
                                                <p className="mt-1 text-lg font-semibold text-indigo-700">{courseClass.grade ?? '—'}</p>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-xs text-slate-500">{courseClass.assessment_count} assessment{courseClass.assessment_count === 1 ? '' : 's'}</p>
                                    </div>
                                    <Link
                                        href={route('student.grades.show', { courseClass: courseClass.id })}
                                        className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                                    >
                                        View grade details
                                    </Link>
                                </article>
                            ))}
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}
