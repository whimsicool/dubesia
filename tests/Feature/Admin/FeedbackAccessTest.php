<?php

namespace Tests\Feature\Admin;

use App\Models\StudentFeedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedbackAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_student_feedback(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.feedback.index'));

        $response
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Feedback/Index')
                ->has('feedbackEntries.data', 0));
    }

    public function test_feedback_entries_do_not_reveal_the_student(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student']);

        StudentFeedback::create([
            'student_id' => $student->id,
            'subject' => 'Jadwal bentrok',
            'message' => 'Jadwal kelas saya bertabrakan dengan kelas lain.',
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.feedback.index'));

        $response
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Feedback/Index')
                ->has('feedbackEntries.data', 1)
                ->missing('feedbackEntries.data.0.student')
                ->missing('feedbackEntries.data.0.student_id'));
    }

    public function test_admin_cannot_open_tutor_grade_management(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this
            ->actingAs($admin)
            ->get(route('tutor.classes.index'));

        $response->assertForbidden();
    }

    public function test_tutor_can_open_tutor_grade_management(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);

        $response = $this
            ->actingAs($tutor)
            ->get(route('tutor.classes.index'));

        $response->assertOk();
    }
}
