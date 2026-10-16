<?php

namespace App\Http\Controllers;

use App\Models\CourseClass;
use Illuminate\Http\Request;
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

        $students = $courseClass->students()
            ->where('users.role', 'student')
            ->orderBy('users.name')
            ->get(['users.id', 'users.name', 'users.email']);

        return Inertia::render('Tutor/Classes/Students', [
            'courseClass' => $courseClass,
            'students' => $students,
        ]);
    }
}
