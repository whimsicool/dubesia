<?php

namespace Tests\Feature\Student;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class FeedbackControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_open_feedback_page_with_their_previous_feedback(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $student->feedbackEntries()->create([
            'subject' => 'Tampilan nilai',
            'message' => 'Mohon perjelas tampilan nilai.',
        ]);

        $response = $this
            ->actingAs($student)
            ->get(route('student.feedback.create'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Student/Feedback/Create')
                ->has('feedbackEntries', 1)
                ->where('feedbackEntries.0.message', 'Mohon perjelas tampilan nilai.'));
    }
}
