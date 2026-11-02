<?php

namespace Tests\Feature\Student;

use App\Models\Attendance;
use App\Models\Instructor;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ScheduleAttendanceTest extends TestCase
{
    use RefreshDatabase;

    private User $studentUser;

    private Schedule $schedule;

    private Student $student;

    private string $date;

    protected function setUp(): void
    {
        parent::setUp();

        $this->studentUser = User::factory()->create(['role' => User::ROLE_STUDENT, 'name' => 'Murid Satu']);
        $this->date = now()->toDateString();

        $semester = Semester::create([
            'name' => 'Ganjil Test',
            'start_date' => now()->subMonth()->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'is_active' => true,
        ]);
        $room = Room::create(['name' => '1', 'type' => 'physical', 'capacity' => 20]);
        $instructor = Instructor::create(['name' => 'Dr. Kevin Kusuma']);

        $this->student = Student::create([
            'user_id' => $this->studentUser->id,
            'name' => $this->studentUser->name,
            'email' => $this->studentUser->email,
            'status' => Student::STATUS_ACTIVE,
        ]);

        $this->schedule = Schedule::create([
            'semester_id' => $semester->id,
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

    private function url(array $query = []): string
    {
        return route('schedules.attendance', array_merge([
            'schedule' => $this->schedule->id,
            'date' => $this->date,
        ], $query));
    }

    public function test_student_sees_their_own_attendance_status(): void
    {
        Attendance::create([
            'schedule_id' => $this->schedule->id,
            'student_id' => $this->student->id,
            'date' => $this->date,
            'status' => 'present',
        ]);

        $this->actingAs($this->studentUser)
            ->getJson($this->url())
            ->assertOk()
            ->assertJsonPath('status', 'present')
            ->assertJsonPath('date', $this->date)
            ->assertJsonPath('schedule.class_name', 'Diplomatic Speech Batch #4');
    }

    public function test_status_is_null_when_the_tutor_has_not_filled_it(): void
    {
        $this->actingAs($this->studentUser)
            ->getJson($this->url())
            ->assertOk()
            ->assertJsonPath('status', null);
    }

    public function test_student_outside_the_class_cannot_read_the_attendance(): void
    {
        $outsider = User::factory()->create(['role' => User::ROLE_STUDENT]);
        Student::create([
            'user_id' => $outsider->id,
            'name' => $outsider->name,
            'status' => Student::STATUS_ACTIVE,
        ]);

        $this->actingAs($outsider)->getJson($this->url())->assertForbidden();
    }

    public function test_tutor_cannot_use_the_student_endpoint(): void
    {
        $tutor = User::factory()->create(['role' => User::ROLE_TUTOR]);

        $this->actingAs($tutor)->getJson($this->url())->assertForbidden();
    }

    public function test_date_must_be_a_meeting_day(): void
    {
        $this->actingAs($this->studentUser)
            ->getJson($this->url(['date' => Carbon::parse($this->date)->addDay()->toDateString()]))
            ->assertStatus(422);
    }
}
