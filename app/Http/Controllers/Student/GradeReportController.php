<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseClass;
use App\Models\StudentGrade;
use App\Support\GradeReportPdf;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GradeReportController extends Controller
{
    public function index(Request $request): Response
    {
        $student = $request->user();
        $classes = $student->enrolledClasses()
            ->withCount('gradeComponents')
            ->orderBy('name')
            ->get();

        $grades = $student->grades()
            ->whereIn('class_id', $classes->modelKeys())
            ->get()
            ->keyBy('class_id');

        return Inertia::render('Student/Grades/Index', [
            'classes' => $classes->map(fn (CourseClass $courseClass) => [
                'id' => $courseClass->id,
                'name' => $courseClass->name,
                'description' => $courseClass->description,
                'assessment_count' => $courseClass->grade_components_count,
                'score' => $grades->get($courseClass->id)?->score,
                'grade' => $grades->get($courseClass->id)?->grade,
            ])->values(),
        ]);
    }

    public function show(Request $request, CourseClass $courseClass): Response
    {
        $this->ensureEnrollment($request, $courseClass);

        $grade = StudentGrade::query()
            ->where('student_id', $request->user()->id)
            ->where('class_id', $courseClass->id)
            ->with('componentScores')
            ->first();

        $scores = $grade?->componentScores->keyBy('grade_component_id') ?? collect();
        $components = $courseClass->gradeComponents()
            ->orderBy('id')
            ->get()
            ->map(function ($component) use ($scores) {
                $score = $scores->get($component->id);

                return [
                    'id' => $component->id,
                    'name' => $component->name,
                    'weight' => $component->weight,
                    'max_score' => $component->max_score,
                    'is_required' => $component->is_required,
                    'score' => $score?->score,
                    'feedback' => $score?->feedback,
                ];
            });

        return Inertia::render('Student/Grades/Show', [
            'courseClass' => $courseClass->only('id', 'name', 'description'),
            'student' => $request->user()->only('name', 'email'),
            'components' => $components,
            'finalScore' => $grade?->score,
            'letterGrade' => $grade?->grade,
            'feedback' => $grade?->feedback,
        ]);
    }

    public function download(Request $request, CourseClass $courseClass)
    {
        $this->ensureEnrollment($request, $courseClass);

        $student = $request->user();
        $grade = StudentGrade::query()
            ->where('student_id', $student->id)
            ->where('class_id', $courseClass->id)
            ->with('componentScores')
            ->first();
        $scores = $grade?->componentScores->keyBy('grade_component_id') ?? collect();
        $components = $courseClass->gradeComponents()->orderBy('id')->get();
        $filename = Str::slug($student->name.'-'.$courseClass->name.'-grade-report').'.pdf';
        $pdf = app(GradeReportPdf::class)->render(
            $student->name,
            $student->email,
            $courseClass->name,
            $grade?->score,
            $grade?->grade,
            $components->map(function ($component) use ($scores) {
                $score = $scores->get($component->id);

                return [
                    'name' => $component->name,
                    'weight' => $component->weight,
                    'max_score' => $component->max_score,
                    'score' => $score?->score,
                    'required' => $component->is_required,
                    'feedback' => $score?->feedback,
                ];
            })->all(),
        );

        return response()->streamDownload(
            fn () => print($pdf),
            $filename,
            ['Content-Type' => 'application/pdf']
        );
    }

    private function ensureEnrollment(Request $request, CourseClass $courseClass): void
    {
        abort_unless(
            $request->user()->enrolledClasses()->whereKey($courseClass->id)->exists(),
            404
        );
    }
}
