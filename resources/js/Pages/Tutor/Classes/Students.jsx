import { Head, Link } from '@inertiajs/react';

export default function Students({ courseClass, students, flash }) {
    return (
        <>
            <Head title={`${courseClass.name} - Students`} />

            <div className="p-6">
                {flash?.success && (
                    <div
                        role="status"
                        className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                    >
                        {flash.success}
                    </div>
                )}

                <div className="flex items-start justify-between gap-4">
                    <Link
                        href={route('tutor.classes.index')}
                        className="pt-2 text-sm text-blue-600 hover:underline"
                    >
                        &larr; Back to My Classes
                    </Link>

                    <Link
                        href={route('tutor.classes.grade-components.index', courseClass.id)}
                        className="shrink-0 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                        Manage Grade Components
                    </Link>
                </div>

                <div className="mt-4">
                    <h1 className="text-2xl font-bold">
                        {courseClass.name}
                    </h1>

                    <p className="mt-2 text-gray-600">
                        View students enrolled in this class and manage
                        their English course grades.
                    </p>
                </div>

                <div className="mt-6 overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">No.</th>
                                <th className="px-4 py-3">Student Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-4 py-6 text-center text-gray-500"
                                    >
                                        No students enrolled in this class yet.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student, index) => (
                                    <tr
                                        key={student.id}
                                        className="border-t"
                                    >
                                        <td className="px-4 py-3">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-3 font-medium">
                                            {student.name}
                                        </td>

                                        <td className="px-4 py-3">
                                            {student.email}
                                        </td>

                                        <td className="px-4 py-3">
                                            <Link
                                                href={route('tutor.classes.students.grades.edit', {
                                                    courseClass: courseClass.id,
                                                    student: student.id,
                                                })}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Manage Grades
                                            </Link>

                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
