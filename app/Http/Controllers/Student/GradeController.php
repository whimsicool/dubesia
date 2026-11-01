<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentGrade;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
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

    public function pdf(Request $request)
    {
        $grades = StudentGrade::query()
            ->where('student_id', $request->user()->id)
            ->with([
                'courseClass:id,name',
                'componentScores.gradeComponent:id,name,weight,max_score',
            ])
            ->latest()
            ->get();

        return Pdf::loadView('pdf.student-grades', [
            'grades' => $grades,
            'student' => $request->user(),
            'generatedAt' => now(),
        ])
            ->setPaper('a4', 'portrait')
            ->download('Laporan-Nilai-Dubesia.pdf');
    }
}
