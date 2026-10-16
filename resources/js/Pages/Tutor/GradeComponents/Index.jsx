import { Head, Link, router } from '@inertiajs/react';

export default function Index({ courseClass, components, totalWeight }) {
    const deleteComponent = (component) => {
        if (confirm(`Delete "${component.name}"?`)) {
            router.delete(
                route('tutor.classes.grade-components.destroy', {
                    courseClass: courseClass.id,
                    grade_component: component.id,
                })
            );
        }
    };

    return (
        <>
            <Head title={`Grade Components - ${courseClass.name}`} />

            <div className="p-6">
                <div className="mb-6">
                    <Link
                        href={route('tutor.classes.students.index', courseClass.id)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        &larr; Back to Students
                    </Link>

                    <h1 className="mt-3 text-2xl font-bold text-gray-800">
                        Grade Components
                    </h1>

                    <p className="mt-1 text-gray-600">
                        Manage assessment components for {courseClass.name}.
                    </p>
                </div>

                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-sm text-gray-500">
                            Total Weight
                        </p>

                        <p
                            className={`text-2xl font-bold ${
                                Number(totalWeight) === 100
                                    ? 'text-green-600'
                                    : 'text-amber-600'
                            }`}
                        >
                            {Number(totalWeight).toFixed(2)}%
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            The total must equal 100%.
                        </p>
                    </div>

                    <Link
                        href={route(
                            'tutor.classes.grade-components.create',
                            courseClass.id
                        )}
                        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                    >
                        + Add Component
                    </Link>
                </div>

                {components.length === 0 ? (
                    <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
                        No grade components have been added yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border bg-white">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-5 py-3">Component</th>
                                    <th className="px-5 py-3">Weight</th>
                                    <th className="px-5 py-3">Maximum Score</th>
                                    <th className="px-5 py-3">Required</th>
                                    <th className="px-5 py-3">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {components.map((component) => (
                                    <tr key={component.id}>
                                        <td className="px-5 py-4 font-medium text-gray-800">
                                            {component.name}
                                        </td>

                                        <td className="px-5 py-4">
                                            {Number(component.weight).toFixed(2)}%
                                        </td>

                                        <td className="px-5 py-4">
                                            {Number(component.max_score).toFixed(2)}
                                        </td>

                                        <td className="px-5 py-4">
                                            {component.is_required ? 'Yes' : 'No'}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex gap-3">
                                                <Link
                                                    href={route(
                                                        'tutor.classes.grade-components.edit',
                                                        {
                                                            courseClass: courseClass.id,
                                                            grade_component: component.id,
                                                        }
                                                    )}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => deleteComponent(component)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}