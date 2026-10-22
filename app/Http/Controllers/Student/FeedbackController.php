<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentFeedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Student/Feedback/Create', [
            'feedbackEntries' => $request->user()->feedbackEntries()
                ->latest()
                ->get(['id', 'subject', 'message', 'created_at']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['nullable', 'string', 'max:150'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ]);

        StudentFeedback::create([
            ...$validated,
            'student_id' => $request->user()->id,
        ]);

        return to_route('student.feedback.create')
            ->with('success', 'Kritik dan saran berhasil dikirim.');
    }
}
