import { Head, Link } from '@inertiajs/react';

export default function Index({ classes }) {
    return (
        <>
            <Head title="My Classes" />

            <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">My Classes</h1>
                        <p className="mt-2 text-gray-600">
                            View your assigned classes and manage student grades.
                        </p>
                    </div>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                    >
                        Log out
                    </Link>
                </div>

                {classes.length === 0 ? (
                    <div className="mt-6 rounded-lg border p-6">
                        <h2 className="font-semibold">
                            No classes assigned yet
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Your assigned classes will appear here once
                            they have been set up.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {classes.map((courseClass) => (
                            <Link
                                key={courseClass.id}
                                href={route('tutor.classes.students.index', courseClass.id)}
                                className="block rounded-lg border p-5 shadow-sm transition hover:shadow-md"
                            >
                                <h2 className="text-lg font-semibold">
                                    {courseClass.name}
                                </h2>

                                <p className="mt-2 text-sm text-gray-600">
                                    {courseClass.students_count} students
                                </p>

                                {courseClass.description && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {courseClass.description}
                                    </p>
                                )}

                                <p className="mt-4 text-sm font-medium text-blue-600">
                                    View Students →
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
