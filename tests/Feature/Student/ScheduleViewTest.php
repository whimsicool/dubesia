<?php

namespace Tests\Feature\Student;

use App\Models\CourseClass;
use App\Enums\ClassLevel;
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

    public function test_filters_only_offer_enrolled_classes_and_their_tutors_but_all_rooms(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        $instructor = Instructor::create(['name' => $tutor->name, 'email' => $tutor->email, 'user_id' => $tutor->id]);
        $ownClass = CourseClass::create(['name' => 'My class', 'level' => ClassLevel::Beginner->value, 'is_active' => true]);
        $ownClass->students()->attach($this->studentUser);
        $ownClass->tutors()->attach($tutor);
        CourseClass::create(['name' => 'Other class', 'level' => ClassLevel::Beginner->value, 'is_active' => true]);
        Room::create(['name' => 'Unused room', 'type' => 'physical', 'capacity' => 20]);

        $this->actingAs($this->studentUser)->get(route('schedules.index'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
                ->has('options.classes', 1)
                ->where('options.classes.0.id', $ownClass->id)
                ->has('options.instructors', 1)
                ->where('options.instructors.0.id', $instructor->id)
                ->has('options.rooms', 2));
    }

    public function test_class_filter_excludes_schedules_from_other_classes(): void
    {
        $courseClass = CourseClass::create(['name' => 'Selected class', 'level' => ClassLevel::Beginner->value, 'is_active' => true]);
        $courseClass->students()->attach($this->studentUser);
        $this->schedule->update(['class_id' => $courseClass->id]);
        $other = $this->schedule->replicate();
        $other->class_id = null;
        $other->save();
        $other->students()->sync($this->schedule->students()->pluck('students.id'));

        $this->actingAs($this->studentUser)->get(route('schedules.index', ['class_id' => $courseClass->id]))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
                ->has('schedules', 1)
                ->where('schedules.0.id', $this->schedule->id));
    }
}
