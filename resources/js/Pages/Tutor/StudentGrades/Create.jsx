import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ students }) {
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        subject: '',
        score: '',
        grade: '',
        feedback: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('tutor.student-grades.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Add Student Grade
                </h2>
            }
        >
            <Head title="Add Student Grade" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Add Student Grade
                                </h3>

                                <p className="mt-1 text-sm text-gray-600">
                                    Enter the student's English course grade
                                    information.
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                {/* Student */}
                                <div>
                                    <label
                                        htmlFor="student_id"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Student
                                    </label>

                                    <select
                                        id="student_id"
                                        value={data.student_id}
                                        onChange={(e) =>
                                            setData(
                                                'student_id',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">
                                            Select Student
                                        </option>

                                        {students.map((student) => (
                                            <option
                                                key={student.id}
                                                value={student.id}
                                            >
                                                {student.name} ({student.email})
                                            </option>
                                        ))}
                                    </select>

                                    {errors.student_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.student_id}
                                        </p>
                                    )}
                                </div>

                                {/* Subject */}
                                <div>
                                    <label
                                        htmlFor="subject"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Subject
                                    </label>

                                    <input
                                        id="subject"
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) =>
                                            setData(
                                                'subject',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Example: English Grammar"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {errors.subject && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.subject}
                                        </p>
                                    )}
                                </div>

                                {/* Score */}
                                <div>
                                    <label
                                        htmlFor="score"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Score
                                    </label>

                                    <input
                                        id="score"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={data.score}
                                        onChange={(e) =>
                                            setData('score', e.target.value)
                                        }
                                        placeholder="0 - 100"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {errors.score && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.score}
                                        </p>
                                    )}
                                </div>

                                {/* Grade */}
                                <div>
                                    <label
                                        htmlFor="grade"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Grade
                                    </label>

                                    <select
                                        id="grade"
                                        value={data.grade}
                                        onChange={(e) =>
                                            setData('grade', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">
                                            Select Grade
                                        </option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                        <option value="E">E</option>
                                    </select>

                                    {errors.grade && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.grade}
                                        </p>
                                    )}
                                </div>

                                {/* Feedback */}
                                <div>
                                    <label
                                        htmlFor="feedback"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Feedback
                                    </label>

                                    <textarea
                                        id="feedback"
                                        rows="4"
                                        value={data.feedback}
                                        onChange={(e) =>
                                            setData(
                                                'feedback',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter feedback for the student..."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {errors.feedback && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.feedback}
                                        </p>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-end gap-3">
                                    <Link
                                        href={route(
                                            'tutor.student-grades.index',
                                        )}
                                        className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                                    >
                                        Cancel
                                    </Link>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Grade'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}