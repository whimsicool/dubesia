<?php

namespace Tests\Feature\Tutor;

use App\Models\Attendance;
use App\Models\Instructor;
use App\Models\Program;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ScheduleAttendanceTest extends TestCase
{
    use RefreshDatabase;

    private User $tutor;

    private Schedule $schedule;

    private Student $student;

    private string $date;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tutor = User::factory()->create(['role' => User::ROLE_TUTOR, 'name' => 'Dr. Kevin Kusuma']);
        $this->date = now()->toDateString();

        $semester = Semester::create([
            'name' => 'Ganjil Test',
            'start_date' => now()->subMonth()->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'is_active' => true,
        ]);
        $program = Program::create(['code' => 'DSP', 'name' => 'Diplomatic Speech', 'category' => 'english']);
        $room = Room::create(['name' => '1', 'type' => 'physical', 'capacity' => 20]);
        $instructor = Instructor::create(['user_id' => $this->tutor->id, 'name' => $this->tutor->name]);

        $studentUser = User::factory()->create(['role' => User::ROLE_STUDENT, 'name' => 'Murid Satu']);
        $this->student = Student::create([
            'user_id' => $studentUser->id,
            'name' => $studentUser->name,
            'email' => $studentUser->email,
            'status' => Student::STATUS_ACTIVE,
        ]);

        $this->schedule = Schedule::create([
            'semester_id' => $semester->id,
            'program_id' => $program->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room->id,
            'title' => 'Diplomatic Speech & Rhetoric',
            'class_name' => 'Diplomatic Speech Batch #4',
            'day_of_week' => now()->dayOfWeekIso,
            'scheduled_date' => $this->date,
            'start_time' => '08:30',
            'end_time' => '10:00',
        ]);
        $this->schedule->students()->attach($this->student->id);
    }

    public function test_show_returns_the_roster_with_the_saved_status(): void
    {
        Attendance::create([
            'schedule_id' => $this->schedule->id,
            'student_id' => $this->student->id,
            'date' => $this->date,
            'status' => 'present',
        ]);

        $this->actingAs($this->tutor)
            ->getJson(route('tutor.schedules.attendance', [
                'schedule' => $this->schedule->id,
                'date' => $this->date,
            ]))
            ->assertOk()
            ->assertJsonPath('students.0.id', $this->student->id)
            ->assertJsonPath('students.0.status', 'present');
    }

    public function test_store_saves_and_then_updates_attendance_for_the_meeting(): void
    {
        $url = route('tutor.schedules.attendance.store', $this->schedule->id);

        $this->actingAs($this->tutor)
            ->putJson($url, [
                'date' => $this->date,
                'students' => [['id' => $this->student->id, 'status' => 'present']],
            ])
            ->assertOk();

        $this->assertDatabaseHas('attendances', [
            'schedule_id' => $this->schedule->id,
            'student_id' => $this->student->id,
            'status' => 'present',
        ]);

        $this->actingAs($this->tutor)
            ->putJson($url, [
                'date' => $this->date,
                'students' => [['id' => $this->student->id, 'status' => 'absent']],
            ])
            ->assertOk();

        $this->assertDatabaseCount('attendances', 1);
        $this->assertDatabaseHas('attendances', ['status' => 'absent']);
    }

    public function test_store_rejects_a_date_that_is_not_a_meeting_day(): void
    {
        $this->actingAs($this->tutor)
            ->putJson(route('tutor.schedules.attendance.store', $this->schedule->id), [
                'date' => Carbon::parse($this->date)->addDay()->toDateString(),
                'students' => [['id' => $this->student->id, 'status' => 'present']],
            ])
            ->assertStatus(422);

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_store_rejects_students_outside_the_class_roster(): void
    {
        $outsider = Student::create([
            'name' => 'Murid Lain',
            'status' => Student::STATUS_ACTIVE,
        ]);

        $this->actingAs($this->tutor)
            ->putJson(route('tutor.schedules.attendance.store', $this->schedule->id), [
                'date' => $this->date,
                'students' => [['id' => $outsider->id, 'status' => 'present']],
            ])
            ->assertStatus(422);

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_only_the_assigned_tutor_can_manage_attendance(): void
    {
        $otherTutor = User::factory()->create(['role' => User::ROLE_TUTOR]);

        $this->actingAs($otherTutor)
            ->getJson(route('tutor.schedules.attendance', [
                'schedule' => $this->schedule->id,
                'date' => $this->date,
            ]))
            ->assertForbidden();

        $this->actingAs($otherTutor)
            ->putJson(route('tutor.schedules.attendance.store', $this->schedule->id), [
                'date' => $this->date,
                'students' => [['id' => $this->student->id, 'status' => 'present']],
            ])
            ->assertForbidden();
    }

    public function test_history_lists_sessions_saved_by_the_tutor(): void
    {
        $this->actingAs($this->tutor)
            ->putJson(route('tutor.schedules.attendance.store', $this->schedule->id), [
                'date' => $this->date,
                'students' => [['id' => $this->student->id, 'status' => 'present']],
            ])
            ->assertOk();

        $this->actingAs($this->tutor)
            ->get(route('tutor.attendance.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Tutor/Attendance/Index')
                ->has('history', 1)
                ->where('history.0.date', $this->date)
                ->where('history.0.counts.present', 1)
                ->where('history.0.students.0.id', $this->student->id)
            );
    }
}
