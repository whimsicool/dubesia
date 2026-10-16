<?php

namespace App\Http\Controllers;

use App\Models\StudentGrade;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StudentGradeController extends Controller
{
    /**
     * Display a listing of student grades.
     */
    public function index(): Response
    {
        $grades = StudentGrade::with('student')
            ->latest()
            ->get();

        return Inertia::render('Tutor/StudentGrades/Index', [
            'grades' => $grades,
        ]);
    }

    /**
     * Show the form for creating a new grade.
     */
    public function create(): Response
    {
        $students = User::where('role', 'student')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Tutor/StudentGrades/Create', [
            'students' => $students,
        ]);
    }

    /**
     * Store a newly created grade.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:100'],
            'score' => ['required', 'numeric', 'min:0', 'max:100'],
            'grade' => ['nullable', 'string', 'max:2'],
            'feedback' => ['nullable', 'string'],
        ]);

        StudentGrade::create($validated);

        return redirect()
            ->route('tutor.student-grades.index')
            ->with('success', 'Student grade has been added successfully.');
    }

    /**
     * Display the specified grade.
     */
    public function show(StudentGrade $studentGrade): Response
    {
        $studentGrade->load('student');

        return Inertia::render('Tutor/StudentGrades/Show', [
            'grade' => $studentGrade,
        ]);
    }

    /**
     * Show the form for editing the specified grade.
     */
    public function edit(StudentGrade $studentGrade): Response
    {
        $students = User::where('role', 'student')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Tutor/StudentGrades/Edit', [
            'grade' => $studentGrade,
            'students' => $students,
        ]);
    }

    /**
     * Update the specified grade.
     */
    public function update(
        Request $request,
        StudentGrade $studentGrade
    ): RedirectResponse {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:100'],
            'score' => ['required', 'numeric', 'min:0', 'max:100'],
            'grade' => ['nullable', 'string', 'max:2'],
            'feedback' => ['nullable', 'string'],
        ]);

        $studentGrade->update($validated);

        return redirect()
            ->route('tutor.student-grades.index')
            ->with('success', 'Student grade has been updated successfully.');
    }

    /**
     * Remove the specified grade.
     */
    public function destroy(StudentGrade $studentGrade): RedirectResponse
    {
        $studentGrade->delete();

        return redirect()
            ->route('tutor.student-grades.index')
            ->with('success', 'Student grade has been deleted successfully.');
    }
}