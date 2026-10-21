<?php

namespace App\Http\Controllers;

use App\Models\CourseClass;
use App\Models\StudentGrade;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudentGradeController extends Controller
{
    /**
     * Display a listing of grades for the classes the tutor teaches.
     */
    public function index(Request $request): Response
    {
        $grades = StudentGrade::with('student')
            ->whereIn('class_id', $this->teachingClassIds($request))
            ->latest()
            ->get();

        return Inertia::render('Tutor/StudentGrades/Index', [
            'grades' => $grades,
        ]);
    }

    /**
     * Show the form for creating a new grade.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Tutor/StudentGrades/Create', [
            'classes' => $this->teachingClasses($request),
            'students' => $this->teachingStudents($request),
        ]);
    }

    /**
     * Store a newly created grade.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'class_id' => ['required', 'integer'],
            ...$this->gradeRules(),
        ]);

        $courseClass = $this->ownedClass($request, (int) $validated['class_id']);

        $this->ensureStudentIsEnrolled($courseClass, (int) $validated['student_id']);

        StudentGrade::create($validated);

        return redirect()
            ->route('tutor.student-grades.index')
            ->with('success', 'Student grade has been added successfully.');
    }

    /**
     * Show the form for editing the specified grade.
     */
    public function edit(Request $request, StudentGrade $studentGrade): Response
    {
        $this->ownedClass($request, (int) $studentGrade->class_id);

        return Inertia::render('Tutor/StudentGrades/Edit', [
            'grade' => $studentGrade,
            'students' => $this->teachingStudents($request),
        ]);
    }

    /**
     * Update the specified grade.
     */
    public function update(Request $request, StudentGrade $studentGrade): RedirectResponse
    {
        $courseClass = $this->ownedClass($request, (int) $studentGrade->class_id);

        $validated = $request->validate($this->gradeRules());

        $this->ensureStudentIsEnrolled($courseClass, (int) $validated['student_id']);

        $studentGrade->update($validated);

        return redirect()
            ->route('tutor.student-grades.index')
            ->with('success', 'Student grade has been updated successfully.');
    }

    /**
     * Remove the specified grade.
     */
    public function destroy(Request $request, StudentGrade $studentGrade): RedirectResponse
    {
        $this->ownedClass($request, (int) $studentGrade->class_id);

        $studentGrade->delete();

        return redirect()
            ->route('tutor.student-grades.index')
            ->with('success', 'Student grade has been deleted successfully.');
    }

    /**
     * The validation rules shared by storing and updating a grade.
     *
     * @return array<string, array<int, string>>
     */
    private function gradeRules(): array
    {
        return [
            'student_id' => ['required', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:100'],
            'score' => ['required', 'numeric', 'min:0', 'max:100'],
            'grade' => ['nullable', 'string', 'max:2'],
            'feedback' => ['nullable', 'string'],
        ];
    }

    /**
     * Resolve a class the current tutor teaches, or abort with a 403.
     */
    private function ownedClass(Request $request, int $classId): CourseClass
    {
        $courseClass = $request->user()
            ->teachingClasses()
            ->where('classes.id', $classId)
            ->first();

        abort_unless($courseClass, 403);

        return $courseClass;
    }

    /**
     * Abort with a validation error when the student is not in the class.
     */
    private function ensureStudentIsEnrolled(
        CourseClass $courseClass,
        int $studentId
    ): void {
        $isEnrolled = $courseClass->students()
            ->where('users.id', $studentId)
            ->exists();

        if (! $isEnrolled) {
            throw ValidationException::withMessages([
                'student_id' => 'The selected student is not enrolled in this class.',
            ]);
        }
    }

    /**
     * The ids of the classes the current tutor teaches.
     *
     * @return array<int, int>
     */
    private function teachingClassIds(Request $request): array
    {
        return $request->user()
            ->teachingClasses()
            ->pluck('classes.id')
            ->all();
    }

    /**
     * The classes the current tutor teaches.
     *
     * @return Collection<int, CourseClass>
     */
    private function teachingClasses(Request $request): Collection
    {
        return $request->user()
            ->teachingClasses()
            ->orderBy('classes.name')
            ->get(['classes.id', 'classes.name']);
    }

    /**
     * The students enrolled in any class the current tutor teaches.
     *
     * @return Collection<int, User>
     */
    private function teachingStudents(Request $request): Collection
    {
        $classIds = $this->teachingClassIds($request);

        return User::where('role', 'student')
            ->whereHas(
                'enrolledClasses',
                fn ($query) => $query->whereIn('classes.id', $classIds)
            )
            ->orderBy('name')
            ->get(['id', 'name', 'email']);
    }
}
