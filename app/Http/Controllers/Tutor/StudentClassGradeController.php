<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Models\CourseClass;
use App\Models\GradeComponentScore;
use App\Models\StudentGrade;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class StudentClassGradeController extends Controller
{
    private function authorizeStudent(
        Request $request,
        CourseClass $courseClass,
        User $student
    ): void {
        $isAssigned = $request->user()
            ->teachingClasses()
            ->where('classes.id', $courseClass->id)
            ->exists();

        abort_unless($isAssigned, 403);

        $isEnrolled = $courseClass->students()
            ->where('users.id', $student->id)
            ->exists();

        abort_unless($isEnrolled, 404);
    }

    public function edit(
        Request $request,
        CourseClass $courseClass,
        User $student
    ): Response {
        $this->authorizeStudent($request, $courseClass, $student);

        $components = $courseClass->gradeComponents()
            ->orderBy('id')
            ->get();

        $grade = StudentGrade::firstOrCreate(
            [
                'student_id' => $student->id,
                'class_id' => $courseClass->id,
            ],
            [
                'subject' => $courseClass->name,
                'score' => null,
            ]
        );

        $grade->load('componentScores');

        $scores = $grade->componentScores
            ->keyBy('grade_component_id');

        $componentData = $components->map(function ($component) use ($scores) {
            $savedScore = $scores->get($component->id);

            return [
                'id' => $component->id,
                'name' => $component->name,
                'weight' => (float) $component->weight,
                'max_score' => (float) $component->max_score,
                'is_required' => $component->is_required,
                'score' => $savedScore?->score,
                'feedback' => $savedScore?->feedback,
            ];
        });

        $finalScore = $this->calculateFinalScore(
            $components,
            $scores
        );

        return Inertia::render('Tutor/StudentClassGrades/Edit', [
            'courseClass' => $courseClass,
            'student' => $student,
            'grade' => $grade,
            'components' => $componentData,
            'finalScore' => $finalScore,
        ]);
    }

    public function update(
        Request $request,
        CourseClass $courseClass,
        User $student
    ): RedirectResponse {
        $this->authorizeStudent($request, $courseClass, $student);

        $grade = StudentGrade::where('student_id', $student->id)
            ->where('class_id', $courseClass->id)
            ->firstOrFail();

        $components = $courseClass->gradeComponents()
            ->get()
            ->keyBy('id');

        $validated = $request->validate([
            'scores' => ['required', 'array'],
            'scores.*.score' => ['nullable', 'numeric', 'min:0'],
            'scores.*.feedback' => ['nullable', 'string', 'max:1000'],
        ]);

        foreach ($validated['scores'] as $componentId => $scoreData) {
            if (!$components->has((int) $componentId)) {
                abort(422, 'Invalid assessment component.');
            }

            $component = $components->get((int) $componentId);
            $score = $scoreData['score'] ?? null;

            if (
                $score !== null &&
                (float) $score > (float) $component->max_score
            ) {
                return back()->withErrors([
                    "scores.$componentId.score" =>
                    "The score cannot exceed {$component->max_score}.",
                ])->withInput();
            }
        }

        DB::transaction(function () use ($validated, $components, $grade) {
            foreach ($validated['scores'] as $componentId => $scoreData) {
                $component = $components->get((int) $componentId);

                GradeComponentScore::updateOrCreate(
                    [
                        'student_grade_id' => $grade->id,
                        'grade_component_id' => $component->id,
                    ],
                    [
                        'score' => $scoreData['score'] ?? null,
                        'feedback' => $scoreData['feedback'] ?? null,
                    ]
                );
            }

            $grade->load('componentScores');

            $scoreMap = $grade->componentScores
                ->keyBy('grade_component_id');

            $finalScore = $this->calculateFinalScore(
                $components->values(),
                $scoreMap
            );

            $grade->update([
                'score' => $finalScore,
                'grade' => $this->letterGrade($finalScore),
            ]);
        });

        return redirect()
            ->route('tutor.classes.students.index', [
                'courseClass' => $courseClass->id,
            ])
            ->with('success', 'Student grades saved successfully.');
    }

    private function calculateFinalScore(
        \Illuminate\Support\Collection $components,
        \Illuminate\Support\Collection $scores
    ): ?float {
        if ($components->isEmpty()) {
            return null;
        }

        $totalWeight = (float) $components->sum('weight');

        if (abs($totalWeight - 100) > 0.01) {
            return null;
        }

        $weightedScore = 0;

        foreach ($components as $component) {
            $savedScore = $scores->get($component->id);
            $score = $savedScore?->score;

            if ($score === null) {
                if ($component->is_required) {
                    return null;
                }

                continue;
            }

            $weightedScore +=
                ((float) $score / (float) $component->max_score)
                * (float) $component->weight;
        }

        return round($weightedScore, 2);
    }

    private function letterGrade(?float $score): ?string
    {
        if ($score === null) {
            return null;
        }

        if ($score >= 90) {
            return 'A';
        }

        if ($score >= 80) {
            return 'B';
        }

        if ($score >= 70) {
            return 'C';
        }

        if ($score >= 60) {
            return 'D';
        }

        return 'E';
    }
}
