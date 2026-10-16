import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Index({ grades }) {
    const { flash } = usePage().props;

    console.log('Flash:', flash);

    const handleDelete = (gradeId) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this grade?',
        );

        if (!confirmed) {
            return;
        }

        router.delete(route('tutor.student-grades.destroy', gradeId));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Manage Student Grades
                </h2>
            }
        >
            <Head title="Manage Student Grades" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {flash?.success && (
                                <div className="mb-6 rounded-md bg-green-50 p-4 text-sm font-medium text-green-700">
                                    {flash.success}
                                </div>
                            )}

                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Student Grades
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Manage and review student grades for
                                        English courses.
                                    </p>
                                </div>

                                <Link
                                    href={route(
                                        'tutor.student-grades.create',
                                    )}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Add Grade
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Student
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Subject
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Score
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Grade
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Feedback
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {grades.length > 0 ? (
                                            grades.map((grade) => (
                                                <tr key={grade.id}>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                        {grade.student?.name ??
                                                            '-'}
                                                    </td>

                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                        {grade.subject}
                                                    </td>

                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                        {grade.score}
                                                    </td>

                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                                        {grade.grade ?? '-'}
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-gray-700">
                                                        {grade.feedback ?? '-'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <Link
                                                            href={route(
                                                                'tutor.student-grades.edit',
                                                                grade.id,
                                                            )}
                                                            className="font-medium text-red-600 hover:text-red-900"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(grade.id)}
                                                            className="ml-4 font-medium text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="px-6 py-8 text-center text-sm text-gray-500"
                                                >
                                                    No student grades have
                                                    been recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}