<?php

namespace App\Http\Controllers;

use App\Models\CourseClass;
use App\Models\GradeComponentScore;
use App\Models\StudentGrade;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TutorClassStudentController extends Controller
{
    public function index(
        Request $request,
        CourseClass $courseClass
    ): Response {
        $tutor = $request->user();

        $isAssigned = $tutor->teachingClasses()
            ->where('classes.id', $courseClass->id)
            ->exists();

        abort_unless($isAssigned, 403);

        $components = $courseClass->gradeComponents()
            ->orderBy('id')
            ->get();

        $students = $courseClass->students()
            ->where('users.role', 'student')
            ->orderBy('users.name')
            ->with(['grades' => function ($query) use ($courseClass) {
                $query->where('class_id', $courseClass->id)
                    ->with('componentScores');
            }])
            ->get(['users.id', 'users.name', 'users.email']);

        $students = $students->map(function ($student) use ($components) {
            $grade = $student->grades->first();
            $scores = $grade?->componentScores->keyBy('grade_component_id') ?? collect();

            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'grade_id' => $grade?->id,
                'score' => $grade?->score,
                'grade' => $grade?->grade,
                'components' => $components->mapWithKeys(function ($component) use ($scores) {
                    return [
                        $component->id => $scores->get($component->id)?->score,
                    ];
                }),
            ];
        });

        return Inertia::render('Tutor/Classes/Students', [
            'courseClass' => $courseClass,
            'students' => $students,
            'components' => $components,
        ]);
    }

    public function updateGrades(
        Request $request,
        CourseClass $courseClass
    ): RedirectResponse {
        $isAssigned = $request->user()
            ->teachingClasses()
            ->where('classes.id', $courseClass->id)
            ->exists();

        abort_unless($isAssigned, 403);

        $validated = $request->validate([
            'scores' => ['required', 'array'],
            'scores.*' => ['required', 'array'],
            'scores.*.*' => ['nullable', 'numeric', 'min:0'],
        ]);

        $students = $courseClass->students()
            ->where('users.role', 'student')
            ->get(['users.id']);
        $studentIds = $students->modelKeys();
        $components = $courseClass->gradeComponents()
            ->get()
            ->keyBy('id');

        foreach ($validated['scores'] as $studentId => $studentScores) {
            abort_unless(in_array((int) $studentId, $studentIds, true), 422);

            foreach ($studentScores as $componentId => $score) {
                abort_unless($components->has((int) $componentId), 422);

                $component = $components->get((int) $componentId);

                if ($score !== null && (float) $score > (float) $component->max_score) {
                    return back()->withErrors([
                        "scores.$studentId.$componentId" => "Nilai maksimal untuk {$component->name} adalah {$component->max_score}.",
                    ])->withInput();
                }
            }
        }

        DB::transaction(function () use ($validated, $components, $courseClass) {
            foreach ($validated['scores'] as $studentId => $studentScores) {
                $grade = StudentGrade::firstOrNew([
                    'student_id' => $studentId,
                    'class_id' => $courseClass->id,
                ]);
                $grade->subject = $courseClass->name;
                $grade->save();

                foreach ($studentScores as $componentId => $score) {
                    GradeComponentScore::updateOrCreate(
                        [
                            'student_grade_id' => $grade->id,
                            'grade_component_id' => $componentId,
                        ],
                        ['score' => $score]
                    );
                }

                $scoreMap = $grade->componentScores()
                    ->get()
                    ->keyBy('grade_component_id');
                $finalScore = $this->calculateFinalScore($components, $scoreMap);

                $grade->update([
                    'score' => $finalScore,
                    'grade' => $this->letterGrade($finalScore),
                ]);
            }
        });

        return back()->with('success', 'Nilai seluruh murid berhasil disimpan.');
    }

    private function calculateFinalScore(
        Collection $components,
        Collection $scores
    ): ?float {
        if ($components->isEmpty() || abs((float) $components->sum('weight') - 100) > 0.01) {
            return null;
        }

        $weightedScore = 0;

        foreach ($components as $component) {
            $score = $scores->get($component->id)?->score;

            if ($score === null) {
                if ($component->is_required) {
                    return null;
                }

                continue;
            }

            $weightedScore += ((float) $score / (float) $component->max_score)
                * (float) $component->weight;
        }

        return round($weightedScore, 2);
    }

    private function letterGrade(?float $score): ?string
    {
        if ($score === null) {
            return null;
        }

        return match (true) {
            $score >= 90 => 'A',
            $score >= 80 => 'B',
            $score >= 70 => 'C',
            $score >= 60 => 'D',
            default => 'E',
        };
    }
}
