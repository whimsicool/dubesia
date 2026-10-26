<?php

namespace Tests\Feature\Admin;

use App\Enums\ClassLevel;
use App\Models\CourseClass;
use App\Models\Instructor;
use App\Models\Program;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ClassManagementTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function tutor(string $name = 'Dr. Kevin Kusuma'): User
    {
        return User::factory()->create(['role' => User::ROLE_TUTOR, 'name' => $name]);
    }

    private function student(string $name = 'Murid Satu'): User
    {
        return User::factory()->create(['role' => User::ROLE_STUDENT, 'name' => $name]);
    }

    /** @return array<string, mixed> */
    private function payload(User $tutor, array $override = []): array
    {
        return array_merge([
            'name' => 'Diplomatic Speech Batch #4',
            'level' => ClassLevel::B2->value,
            'tutor_id' => $tutor->id,
            'capacity' => 15,
            'description' => 'Kelas pidato diplomatik.',
        ], $override);
    }

    private function courseClass(User $tutor, array $override = []): CourseClass
    {
        $courseClass = CourseClass::create(array_merge([
            'name' => 'Batch Lama',
            'level' => ClassLevel::A1->value,
            'capacity' => 10,
            'is_active' => true,
        ], $override));

        $courseClass->tutors()->attach($tutor->id);

        return $courseClass;
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(route('admin.classes.index'))->assertRedirect('/login');
    }

    public function test_non_admin_is_forbidden(): void
    {
        $student = $this->student();

        $this->actingAs($student)->get(route('admin.classes.index'))->assertForbidden();
        $this->actingAs($student)->post(route('admin.classes.store'), $this->payload($student))->assertForbidden();
    }

    public function test_admin_sees_classes_with_stats_and_options(): void
    {
        $tutor = $this->tutor();
        $this->courseClass($tutor);

        $this->actingAs($this->admin())
            ->get(route('admin.classes.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Classes/Index')
                ->has('classes.data', 1)
                ->where('classes.data.0.name', 'Batch Lama')
                ->where('classes.data.0.level', ClassLevel::A1->value)
                ->where('classes.data.0.tutor.name', $tutor->name)
                ->where('stats.total', 1)
                ->where('stats.active', 1)
                ->has('options.levels', 6)
                ->has('options.tutors', 1)
            );
    }

    public function test_index_filters_by_status_and_search(): void
    {
        $tutor = $this->tutor();
        $this->courseClass($tutor, ['name' => 'IELTS Batch #7', 'is_active' => false]);
        $this->courseClass($tutor, ['name' => 'TOEFL Batch #1']);

        $this->actingAs($this->admin())
            ->get(route('admin.classes.index', ['status' => 'inactive']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('classes.data', 1)
                ->where('classes.data.0.name', 'IELTS Batch #7'));

        $this->actingAs($this->admin())
            ->get(route('admin.classes.index', ['q' => 'TOEFL']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('classes.data', 1)
                ->where('classes.data.0.name', 'TOEFL Batch #1'));
    }

    public function test_admin_can_create_class_with_tutor(): void
    {
        $tutor = $this->tutor();

        $this->actingAs($this->admin())
            ->post(route('admin.classes.store'), $this->payload($tutor))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $courseClass = CourseClass::firstOrFail();
        $this->assertSame('Diplomatic Speech Batch #4', $courseClass->name);
        $this->assertSame(ClassLevel::B2, $courseClass->level);
        $this->assertSame(15, $courseClass->capacity);
        $this->assertTrue($courseClass->is_active);
        $this->assertSame([$tutor->id], $courseClass->tutors->pluck('id')->all());
    }

    public function test_create_requires_name_level_and_tutor_role(): void
    {
        $student = $this->student();

        $this->actingAs($this->admin())
            ->post(route('admin.classes.store'), ['name' => '', 'level' => '', 'tutor_id' => $student->id])
            ->assertSessionHasErrors(['name', 'level', 'tutor_id']);
    }

    public function test_class_name_must_be_unique(): void
    {
        $tutor = $this->tutor();
        $this->courseClass($tutor, ['name' => 'Batch Kembar']);

        $this->actingAs($this->admin())
            ->post(route('admin.classes.store'), $this->payload($tutor, ['name' => 'Batch Kembar']))
            ->assertSessionHasErrors('name');
    }

    public function test_admin_can_update_class_and_swap_tutor(): void
    {
        $oldTutor = $this->tutor('Tutor Lama');
        $newTutor = $this->tutor('Tutor Baru');
        $courseClass = $this->courseClass($oldTutor);

        $this->actingAs($this->admin())
            ->put(route('admin.classes.update', $courseClass), $this->payload($newTutor, ['name' => 'Batch Baru', 'capacity' => 20]))
            ->assertSessionHasNoErrors();

        $courseClass->refresh();
        $this->assertSame('Batch Baru', $courseClass->name);
        $this->assertSame(20, $courseClass->capacity);
        $this->assertSame([$newTutor->id], $courseClass->tutors->pluck('id')->all());
    }

    public function test_capacity_cannot_drop_below_enrolled_students(): void
    {
        $tutor = $this->tutor();
        $courseClass = $this->courseClass($tutor, ['capacity' => 5]);
        $courseClass->students()->attach([
            $this->student('Murid A')->id,
            $this->student('Murid B')->id,
            $this->student('Murid C')->id,
        ]);

        $this->actingAs($this->admin())
            ->put(route('admin.classes.update', $courseClass), $this->payload($tutor, ['capacity' => 2]))
            ->assertSessionHasErrors('capacity');

        $this->assertSame(5, $courseClass->fresh()->capacity);
    }

    public function test_admin_can_sync_students_and_capacity_is_enforced(): void
    {
        $courseClass = $this->courseClass($this->tutor(), ['capacity' => 1]);
        $first = $this->student('Murid Satu');
        $second = $this->student('Murid Dua');

        $this->actingAs($this->admin())
            ->put(route('admin.classes.students', $courseClass), ['student_ids' => [$first->id, $second->id]])
            ->assertSessionHasErrors('student_ids');

        $this->actingAs($this->admin())
            ->put(route('admin.classes.students', $courseClass), ['student_ids' => [$first->id]])
            ->assertSessionHasNoErrors();

        $this->assertSame([$first->id], $courseClass->students()->pluck('users.id')->all());
    }

    public function test_students_endpoint_rejects_non_student_accounts(): void
    {
        $courseClass = $this->courseClass($this->tutor());
        $tutor = $this->tutor('Tutor Lain');

        $this->actingAs($this->admin())
            ->put(route('admin.classes.students', $courseClass), ['student_ids' => [$tutor->id]])
            ->assertSessionHasErrors('student_ids.0');
    }

    public function test_admin_can_toggle_class_status(): void
    {
        $courseClass = $this->courseClass($this->tutor());

        $this->actingAs($this->admin())
            ->patch(route('admin.classes.status', $courseClass))
            ->assertSessionHasNoErrors();

        $this->assertFalse($courseClass->fresh()->is_active);
    }

    public function test_class_with_members_cannot_be_deleted(): void
    {
        $courseClass = $this->courseClass($this->tutor());
        $courseClass->students()->attach($this->student()->id);

        $this->actingAs($this->admin())
            ->delete(route('admin.classes.destroy', $courseClass))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('classes', ['id' => $courseClass->id]);
    }

    public function test_empty_class_can_be_deleted(): void
    {
        $courseClass = $this->courseClass($this->tutor());

        $this->actingAs($this->admin())
            ->delete(route('admin.classes.destroy', $courseClass))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('classes', ['id' => $courseClass->id]);
    }

    public function test_class_counts_linked_schedules(): void
    {
        $courseClass = $this->courseClass($this->tutor());

        $semester = Semester::create([
            'name' => 'Ganjil Test',
            'start_date' => now()->subMonth()->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'is_active' => true,
        ]);
        $program = Program::create(['code' => 'DSP', 'name' => 'Diplomatic Speech', 'category' => 'english']);
        $instructor = Instructor::create(['name' => 'Dr. Kevin Kusuma']);
        $room = Room::create(['name' => 'Hall A', 'type' => 'physical', 'capacity' => 20]);

        Schedule::create([
            'semester_id' => $semester->id,
            'program_id' => $program->id,
            'class_id' => $courseClass->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room->id,
            'title' => 'Diplomatic Speech & Rhetoric',
            'class_name' => $courseClass->name,
            'day_of_week' => 1,
            'start_time' => '08:30',
            'end_time' => '10:00',
        ]);

        $this->actingAs($this->admin())
            ->get(route('admin.classes.index'))
            ->assertInertia(fn (Assert $page) => $page->where('classes.data.0.schedules_count', 1));

        $this->actingAs($this->admin())
            ->delete(route('admin.classes.destroy', $courseClass))
            ->assertSessionHas('error');
    }
}
