<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TutorClassController extends Controller
{
    public function index(Request $request): Response
    {
        $classes = $request->user()
            ->teachingClasses()
            ->withCount('students')
            ->orderBy('name')
            ->get();

        return Inertia::render('Tutor/Classes/Index', [
            'classes' => $classes,
        ]);
    }
}
