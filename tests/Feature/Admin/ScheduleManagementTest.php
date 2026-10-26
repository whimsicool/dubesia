<?php

namespace Tests\Feature\Admin;

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

class ScheduleManagementTest extends TestCase
{
    use RefreshDatabase;

    private Semester $semester;
    private Program $program;
    private Instructor $instructor;
    private Room $room;

    protected function setUp(): void
    {
        parent::setUp();

        $this->semester = Semester::create([
            'name' => 'Ganjil Test',
            'start_date' => now()->subMonth()->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'is_active' => true,
        ]);
        $this->program = Program::create(['code' => 'DSP', 'name' => 'Diplomatic Speech', 'category' => 'english']);
        $this->instructor = Instructor::create(['name' => 'Dr. Kevin Kusuma']);
        $this->room = Room::create(['name' => 'Hall A', 'type' => 'physical', 'capacity' => 20]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function payload(array $override = []): array
    {
        return array_merge([
            'title' => 'Diplomatic Speech & Rhetoric',
            'class_name' => 'Diplomatic Speech Batch #4',
            'program_id' => $this->program->id,
            'instructor_id' => $this->instructor->id,
            'room_id' => $this->room->id,
            'scheduled_date' => now()->startOfWeek(Carbon::MONDAY)->toDateString(),
            'day_of_week' => 1,
            'start_time' => '08:30',
            'end_time' => '10:00',
            'student_ids' => [],
        ], $override);
    }

    private function makeSchedule(array $override = []): Schedule
    {
        return Schedule::create(array_merge([
            'semester_id' => $this->semester->id,
            'program_id' => $this->program->id,
            'instructor_id' => $this->instructor->id,
            'room_id' => $this->room->id,
            'title' => 'Sesi Existing',
            'class_name' => 'Existing Batch',
            'scheduled_date' => now()->startOfWeek(Carbon::MONDAY)->toDateString(),
            'day_of_week' => Carbon::MONDAY,
            'start_time' => '08:30',
            'end_time' => '10:00',
        ], $override));
    }

    private function student(string $nisn, string $status = 'active'): Student
    {
        return Student::create(['nisn' => $nisn, 'name' => "Murid $nisn", 'status' => $status]);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(route('admin.schedules.index'))->assertRedirect('/login');
    }

    public function test_non_admin_is_forbidden(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_STUDENT]);

        $this->actingAs($user)->get(route('admin.schedules.index'))->assertForbidden();
        $this->actingAs($user)->post(route('admin.schedules.store'), $this->payload())->assertForbidden();
    }

    public function test_admin_can_view_schedule_page(): void
    {
        $this->makeSchedule();

        $this->actingAs($this->admin())
            ->get(route('admin.schedules.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Schedules/Index')
                ->has('schedules', 1)
                ->where('schedules.0.scheduled_date', now()->startOfWeek(Carbon::MONDAY)->toDateString())
                ->has('week.days', 6)
            );
    }

    public function test_admin_can_create_schedule_and_pending_students_become_active(): void
    {
        $pending = $this->student('0001', 'pending');
        $active = $this->student('0002');

        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload(['student_ids' => [$pending->id, $active->id]]))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $schedule = Schedule::firstOrFail();
        $this->assertSame($this->semester->id, $schedule->semester_id);
        $this->assertCount(2, $schedule->students);
        $this->assertSame('active', $pending->fresh()->status);
    }

    public function test_validation_requires_fields_and_valid_time_range(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload(['title' => '', 'start_time' => '10:00', 'end_time' => '09:00']))
            ->assertSessionHasErrors(['title', 'end_time']);
    }

    public function test_instructor_conflict_is_rejected(): void
    {
        $this->makeSchedule();
        $otherRoom = Room::create(['name' => 'Hall B', 'type' => 'physical', 'capacity' => 20]);

        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload(['room_id' => $otherRoom->id, 'start_time' => '09:00', 'end_time' => '10:30']))
            ->assertSessionHasErrors('instructor_id');

        $this->assertDatabaseCount('schedules', 1);
    }

    public function test_room_conflict_is_rejected(): void
    {
        $this->makeSchedule();
        $otherInstructor = Instructor::create(['name' => 'Siti Aisyah']);

        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload(['instructor_id' => $otherInstructor->id, 'start_time' => '09:00', 'end_time' => '10:30']))
            ->assertSessionHasErrors('room_id');
    }

    public function test_student_conflict_is_rejected(): void
    {
        $student = $this->student('0001');
        $this->makeSchedule()->students()->attach($student->id);

        $otherRoom = Room::create(['name' => 'Hall B', 'type' => 'physical', 'capacity' => 20]);
        $otherInstructor = Instructor::create(['name' => 'Siti Aisyah']);

        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload([
                'room_id' => $otherRoom->id,
                'instructor_id' => $otherInstructor->id,
                'student_ids' => [$student->id],
            ]))
            ->assertSessionHasErrors('student_ids');
    }

    public function test_back_to_back_sessions_are_not_a_conflict(): void
    {
        $this->makeSchedule(); // 08:30–10:00

        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload(['start_time' => '10:00', 'end_time' => '11:30']))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('schedules', 2);
    }

    public function test_participants_cannot_exceed_room_capacity(): void
    {
        $small = Room::create(['name' => 'Kecil', 'type' => 'physical', 'capacity' => 1]);
        $a = $this->student('0001');
        $b = $this->student('0002');

        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload(['room_id' => $small->id, 'student_ids' => [$a->id, $b->id]]))
            ->assertSessionHasErrors('student_ids');
    }

    public function test_update_does_not_conflict_with_itself(): void
    {
        $schedule = $this->makeSchedule();

        $this->actingAs($this->admin())
            ->put(route('admin.schedules.update', $schedule), $this->payload(['title' => 'Judul Baru']))
            ->assertSessionHasNoErrors();

        $this->assertSame('Judul Baru', $schedule->fresh()->title);
    }

    public function test_delete_cascades_enrollments_and_attendances(): void
    {
        $student = $this->student('0001');
        $schedule = $this->makeSchedule();
        $schedule->students()->attach($student->id);
        $schedule->attendances()->create(['student_id' => $student->id, 'date' => now()->toDateString(), 'status' => 'present']);

        $this->actingAs($this->admin())
            ->delete(route('admin.schedules.destroy', $schedule))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('schedules', ['id' => $schedule->id]);
        $this->assertDatabaseCount('schedule_student', 0);
        $this->assertDatabaseCount('attendances', 0);
        $this->assertDatabaseHas('students', ['id' => $student->id]); // murid tidak ikut terhapus
    }

    public function test_schedule_page_includes_the_scheduled_date(): void
    {
        $this->makeSchedule();
        $otherRoom = Room::create(['name' => 'Hall B', 'type' => 'physical', 'capacity' => 20]);
        $this->makeSchedule(['class_name' => 'Batch Lain', 'room_id' => $otherRoom->id, 'start_time' => '09:00', 'end_time' => '10:30']);

        $this->actingAs($this->admin())
            ->get(route('admin.schedules.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('schedules', 2)
                ->where('schedules.0.scheduled_date', now()->startOfWeek(Carbon::MONDAY)->toDateString()));
    }

    public function test_check_conflict_endpoint_returns_json(): void
    {
        $this->makeSchedule();

        $this->actingAs($this->admin())
            ->postJson(route('admin.schedules.check-conflict'), [
                'scheduled_date' => now()->startOfWeek(Carbon::MONDAY)->toDateString(),
                'day_of_week' => 1, 'start_time' => '09:00', 'end_time' => '10:00',
                'instructor_id' => $this->instructor->id, 'room_id' => $this->room->id,
            ])
            ->assertOk()
            ->assertJsonCount(2, 'conflicts');
    }

    public function test_export_returns_csv(): void
    {
        $this->makeSchedule();

        $response = $this->actingAs($this->admin())->get(route('admin.schedules.export'));

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('Sesi Existing', $response->streamedContent());
    }
}
