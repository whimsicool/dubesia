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
                // Kolom pengirim tidak diambil agar masukan tetap anonim.
                ->select(['id', 'subject', 'message', 'created_at'])
                ->latest()
                ->paginate(15)
                ->withQueryString(),
        ]);
    }
}
