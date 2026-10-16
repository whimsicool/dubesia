<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GradeController extends Controller
{
    public function index(Request $request): Response
    {
        $grades = StudentGrade::query()
            ->where('student_id', $request->user()->id)
            ->with([
                'courseClass:id,name',
                'componentScores.gradeComponent:id,name,weight,max_score',
            ])
            ->latest()
            ->get();

        return Inertia::render('Student/Grades/Index', [
            'grades' => $grades,
        ]);
    }
}
