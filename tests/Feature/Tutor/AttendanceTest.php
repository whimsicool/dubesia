<?php

namespace Tests\Feature\Tutor;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    private function tutor(): User
    {
        return User::factory()->create(['role' => 'tutor']);
    }

    private function student(string $level): User
    {
        return User::factory()->create(['role' => 'student', 'class_level' => $level]);
    }

    private function payload(User $student, string $status = 'Hadir'): array
    {
        return [
            'class_level' => 'Beginner',
            'attendance_date' => now()->toDateString(),
            'students' => [
                ['id' => $student->id, 'status' => $status, 'notes' => ''],
            ],
        ];
    }

    public function test_index_lists_students_of_the_selected_level(): void
    {
        $beginner = $this->student('Beginner');
        $this->student('Upper Intermediate');

        $this->actingAs($this->tutor())
            ->get(route('tutor.attendance.index', ['level' => 'Beginner']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Tutor/Attendance/Index')
                ->has('students', 1)
                ->where('students.0.id', $beginner->id)
            );
    }

    public function test_tutor_saves_attendance_for_a_class_level(): void
    {
        $student = $this->student('Beginner');

        $this->actingAs($this->tutor())
            ->post(route('tutor.attendance.store'), $this->payload($student))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('class_attendances', [
            'student_id' => $student->id,
            'class_level' => 'Beginner',
            'status' => 'Hadir',
        ]);
    }

    public function test_attendance_for_the_same_level_and_date_cannot_be_saved_twice(): void
    {
        $student = $this->student('Beginner');
        $tutor = $this->tutor();

        $this->actingAs($tutor)->post(route('tutor.attendance.store'), $this->payload($student));

        $this->actingAs($tutor)
            ->post(route('tutor.attendance.store'), $this->payload($student, 'Izin'))
            ->assertSessionHasErrors('students');

        $this->assertDatabaseCount('class_attendances', 1);
        $this->assertDatabaseHas('class_attendances', ['student_id' => $student->id, 'status' => 'Hadir']);
    }

    public function test_students_cannot_save_attendance(): void
    {
        $student = $this->student('Beginner');

        $this->actingAs($student)
            ->post(route('tutor.attendance.store'), $this->payload($student))
            ->assertForbidden();

        $this->assertDatabaseCount('class_attendances', 0);
    }
}
