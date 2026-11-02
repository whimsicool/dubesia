<?php

namespace Tests\Feature\Student;

use App\Models\Instructor;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ScheduleViewTest extends TestCase
{
    use RefreshDatabase;

    private User $studentUser;

    private Schedule $schedule;

    protected function setUp(): void
    {
        parent::setUp();

        $this->studentUser = User::factory()->create(['role' => User::ROLE_STUDENT, 'name' => 'Murid Satu']);

        $semester = Semester::create([
            'name' => 'Ganjil Test',
            'start_date' => now()->subMonth()->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'is_active' => true,
        ]);
        $room = Room::create(['name' => '1', 'type' => 'physical', 'capacity' => 20]);
        $instructor = Instructor::create(['name' => 'Dr. Kevin Kusuma']);

        $student = Student::create([
            'user_id' => $this->studentUser->id,
            'name' => $this->studentUser->name,
            'email' => $this->studentUser->email,
            'status' => Student::STATUS_ACTIVE,
        ]);

        // Jadwal berbasis kelas tidak selalu memiliki program studi.
        $this->schedule = Schedule::create([
            'semester_id' => $semester->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room->id,
            'title' => 'DEMO English Class A',
            'class_name' => 'DEMO English Class A',
            'day_of_week' => now()->dayOfWeekIso,
            'scheduled_date' => now()->toDateString(),
            'start_time' => '13:00',
            'end_time' => '15:00',
        ]);
        $this->schedule->students()->attach($student->id);
    }

    public function test_schedule_without_program_renders_for_the_student(): void
    {
        $this->actingAs($this->studentUser)
            ->get(route('schedules.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Schedules/Index')
                ->where('schedules.0.id', $this->schedule->id)
                ->where('schedules.0.program', null)
                ->where('schedules.0.room.name', '1')
            );
    }

    public function test_schedule_pdf_without_program_can_be_downloaded(): void
    {
        $this->actingAs($this->studentUser)
            ->get(route('schedules.pdf'))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }
}
