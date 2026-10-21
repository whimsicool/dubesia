import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ courseClass }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        weight: '',
        max_score: '100',
        is_required: true,
    });

    const submit = (e) => {
        e.preventDefault();

        post(
            route('tutor.classes.grade-components.store', {
                courseClass: courseClass.id,
            })
        );
    };

    return (
        <>
            <Head title={`Add Grade Component - ${courseClass.name}`} />

            <div className="p-6">
                <div className="mb-6">
                    <Link
                        href={route(
                            'tutor.classes.grade-components.index',
                            { courseClass: courseClass.id }
                        )}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        &larr; Back to Grade Components
                    </Link>

                    <h1 className="mt-3 text-2xl font-bold text-gray-800">
                        Add Grade Component
                    </h1>

                    <p className="mt-1 text-gray-600">
                        Add an assessment component for {courseClass.name}.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="max-w-2xl space-y-5 rounded-lg border bg-white p-6"
                >
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Component Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Speaking Practice"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            required
                        />

                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="weight"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Weight (%)
                        </label>

                        <input
                            id="weight"
                            type="number"
                            min="0.01"
                            max="100"
                            step="0.01"
                            value={data.weight}
                            onChange={(e) => setData('weight', e.target.value)}
                            placeholder="e.g. 10"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            required
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            The total weight of all components cannot exceed 100%.
                        </p>

                        {errors.weight && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.weight}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="max_score"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Maximum Score
                        </label>

                        <input
                            id="max_score"
                            type="number"
                            min="1"
                            max="1000"
                            step="0.01"
                            value={data.max_score}
                            onChange={(e) =>
                                setData('max_score', e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            required
                        />

                        {errors.max_score && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.max_score}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={data.is_required}
                                onChange={(e) =>
                                    setData('is_required', e.target.checked)
                                }
                                className="rounded border-gray-300"
                            />
                            Required assessment component
                        </label>

                        {errors.is_required && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.is_required}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Component'}
                        </button>

                        <Link
                            href={route(
                                'tutor.classes.grade-components.index',
                                { courseClass: courseClass.id }
                            )}
                            className="rounded-lg border px-5 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}