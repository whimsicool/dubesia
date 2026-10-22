<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentFeedback;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Feedback/Index', [
            'feedbackEntries' => StudentFeedback::query()
                ->with('student:id,name,email')
                ->latest()
                ->paginate(15)
                ->withQueryString(),
        ]);
    }
}
