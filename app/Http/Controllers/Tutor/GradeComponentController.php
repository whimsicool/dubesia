<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Models\CourseClass;
use App\Models\GradeComponent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GradeComponentController extends Controller
{
    private function authorizeClass(
        Request $request,
        CourseClass $courseClass
    ): void {
        $isAssigned = $request->user()
            ->teachingClasses()
            ->where('classes.id', $courseClass->id)
            ->exists();

        abort_unless($isAssigned, 403);
    }

    public function index(
        Request $request,
        CourseClass $courseClass
    ): Response {
        $this->authorizeClass($request, $courseClass);

        $components = $courseClass->gradeComponents()
            ->orderBy('id')
            ->get();

        return Inertia::render('Tutor/GradeComponents/Index', [
            'courseClass' => $courseClass,
            'components' => $components,
            'totalWeight' => (float) $components->sum('weight'),
        ]);
    }

    public function create(
        Request $request,
        CourseClass $courseClass
    ): Response {
        $this->authorizeClass($request, $courseClass);

        return Inertia::render('Tutor/GradeComponents/Create', [
            'courseClass' => $courseClass,
        ]);
    }

    public function store(
        Request $request,
        CourseClass $courseClass
    ): RedirectResponse {
        $this->authorizeClass($request, $courseClass);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('grade_components', 'name')
                    ->where('class_id', $courseClass->id),
            ],
            'weight' => ['required', 'numeric', 'min:0.01', 'max:100'],
            'max_score' => ['required', 'numeric', 'min:1', 'max:1000'],
            'is_required' => ['required', 'boolean'],
        ]);

        $currentWeight = (float) $courseClass->gradeComponents()
            ->sum('weight');

        if ($currentWeight + (float) $validated['weight'] > 100) {
            return back()->withErrors([
                'weight' => 'The total component weight cannot exceed 100%.',
            ])->withInput();
        }

        $courseClass->gradeComponents()->create($validated);

        return redirect()
            ->route('tutor.classes.grade-components.index', $courseClass)
            ->with('success', 'Grade component created successfully.');
    }

    public function edit(
        Request $request,
        CourseClass $courseClass,
        GradeComponent $gradeComponent
    ): Response {
        $this->authorizeClass($request, $courseClass);
        abort_unless($gradeComponent->class_id === $courseClass->id, 404);

        return Inertia::render('Tutor/GradeComponents/Edit', [
            'courseClass' => $courseClass,
            'component' => $gradeComponent,
        ]);
    }

    public function update(
        Request $request,
        CourseClass $courseClass,
        GradeComponent $gradeComponent
    ): RedirectResponse {
        $this->authorizeClass($request, $courseClass);
        abort_unless($gradeComponent->class_id === $courseClass->id, 404);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('grade_components', 'name')
                    ->where('class_id', $courseClass->id)
                    ->ignore($gradeComponent->id),
            ],
            'weight' => ['required', 'numeric', 'min:0.01', 'max:100'],
            'max_score' => ['required', 'numeric', 'min:1', 'max:1000'],
            'is_required' => ['required', 'boolean'],
        ]);

        $otherWeight = (float) $courseClass->gradeComponents()
            ->where('id', '!=', $gradeComponent->id)
            ->sum('weight');

        if ($otherWeight + (float) $validated['weight'] > 100) {
            return back()->withErrors([
                'weight' => 'The total component weight cannot exceed 100%.',
            ])->withInput();
        }

        $gradeComponent->update($validated);

        return redirect()
            ->route('tutor.classes.grade-components.index', $courseClass)
            ->with('success', 'Grade component updated successfully.');
    }

    public function destroy(
        Request $request,
        CourseClass $courseClass,
        GradeComponent $gradeComponent
    ): RedirectResponse {
        $this->authorizeClass($request, $courseClass);
        abort_unless($gradeComponent->class_id === $courseClass->id, 404);

        if ($gradeComponent->scores()->exists()) {
            return back()->withErrors([
                'component' => 'This component cannot be deleted because scores have already been recorded.',
            ]);
        }

        $gradeComponent->delete();

        return redirect()
            ->route('tutor.classes.grade-components.index', $courseClass)
            ->with('success', 'Grade component deleted successfully.');
    }
}