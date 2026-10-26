<?php

namespace Tests\Feature\Admin;

use App\Models\ClassGroup;
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

class ClassGroupTest extends TestCase
{
    use RefreshDatabase;

    private Instructor $tutor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tutor = Instructor::create(['name' => 'Dr. Kevin Kusuma']);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function payload(array $override = []): array
    {
        return array_merge([
            'name' => 'Diplomatic Speech Batch #4',
            'level' => 'C1',
            'description' => 'Retorika bilateral',
            'tutor_id' => $this->tutor->id,
            'capacity' => 20,
        ], $override);
    }

    private function makeClass(array $override = []): ClassGroup
    {
        return ClassGroup::create(array_merge([
            'name' => 'Kelas '.uniqid(), 'level' => 'B1', 'tutor_id' => $this->tutor->id, 'capacity' => 10, 'is_active' => true,
        ], $override));
    }

    private function student(string $nisn, string $status = 'active'): Student
    {
        return Student::create(['nisn' => $nisn, 'name' => "Murid $nisn", 'status' => $status]);
    }

    private function scheduleFor(ClassGroup $class, bool $activeSemester = true): Schedule
    {
        $semester = Semester::create(['name' => 'S '.uniqid(), 'start_date' => '2026-08-01', 'end_date' => '2027-01-31', 'is_active' => $activeSemester]);

        return Schedule::create([
            'semester_id' => $semester->id,
            'program_id' => Program::create(['code' => uniqid(), 'name' => 'P', 'category' => 'english'])->id,
            'instructor_id' => $this->tutor->id,
            'room_id' => Room::create(['name' => 'R'.uniqid(), 'type' => 'physical', 'capacity' => 20])->id,
            'class_group_id' => $class->id,
            'title' => 'Sesi', 'class_name' => $class->name, 'day_of_week' => 1, 'start_time' => '08:00', 'end_time' => '09:00',
        ]);
    }

    /* ---------------- akses ---------------- */

    public function test_guest_and_non_admin_are_blocked(): void
    {
        $this->get(route('admin.classes.index'))->assertRedirect('/login');

        $teacher = User::factory()->create(['role' => User::ROLE_TUTOR]);
        $this->actingAs($teacher)->get(route('admin.classes.index'))->assertForbidden();
        $this->actingAs($teacher)->post(route('admin.classes.store'), $this->payload())->assertForbidden();
    }

    /* ---------------- 1. daftar ---------------- */

    public function test_index_lists_classes_with_counts_and_stats(): void
    {
        $class = $this->makeClass(['name' => 'Alpha']);
        $class->students()->attach($this->student('0001')->id);
        $this->makeClass(['name' => 'Beta', 'is_active' => false]);

        $this->actingAs($this->admin())->get(route('admin.classes.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Classes/Index')
                ->has('classes.data', 2)
                ->where('stats.total', 2)->where('stats.active', 1)->where('stats.inactive', 1)->where('stats.members', 1)
                ->has('options.levels', 6)
                ->has('options.tutors', 1));
    }

    public function test_index_filters(): void
    {
        $this->makeClass(['name' => 'Speech Alpha', 'level' => 'C1']);
        $this->makeClass(['name' => 'IELTS Beta', 'level' => 'B2', 'is_active' => false]);
        $admin = $this->admin();

        $this->actingAs($admin)->get(route('admin.classes.index', ['q' => 'speech']))
            ->assertInertia(fn (Assert $p) => $p->has('classes.data', 1)->where('classes.data.0.name', 'Speech Alpha'));
        $this->actingAs($admin)->get(route('admin.classes.index', ['level' => 'B2']))
            ->assertInertia(fn (Assert $p) => $p->has('classes.data', 1)->where('classes.data.0.name', 'IELTS Beta'));
        $this->actingAs($admin)->get(route('admin.classes.index', ['status' => 'active']))
            ->assertInertia(fn (Assert $p) => $p->has('classes.data', 1)->where('classes.data.0.name', 'Speech Alpha'));
        $this->actingAs($admin)->get(route('admin.classes.index', ['q' => 'Kevin']))
            ->assertInertia(fn (Assert $p) => $p->has('classes.data', 2)); // pencarian juga mencocokkan nama tutor
    }

    /* ---------------- 3. tambah ---------------- */

    public function test_admin_creates_class(): void
    {
        $this->actingAs($this->admin())->post(route('admin.classes.store'), $this->payload())
            ->assertSessionHasNoErrors()->assertSessionHas('success');

        $this->assertDatabaseHas('class_groups', ['name' => 'Diplomatic Speech Batch #4', 'level' => 'C1', 'tutor_id' => $this->tutor->id, 'is_active' => true]);
    }

    public function test_store_validation(): void
    {
        $admin = $this->admin();
        $this->makeClass(['name' => 'Sudah Ada']);

        $this->actingAs($admin)->post(route('admin.classes.store'), ['name' => '', 'level' => 'Z9', 'tutor_id' => null])
            ->assertSessionHasErrors(['name', 'level', 'tutor_id']);
        $this->actingAs($admin)->post(route('admin.classes.store'), $this->payload(['name' => 'Sudah Ada']))->assertSessionHasErrors('name');
        $this->actingAs($admin)->post(route('admin.classes.store'), $this->payload(['tutor_id' => 9999]))->assertSessionHasErrors('tutor_id');
        $this->actingAs($admin)->post(route('admin.classes.store'), $this->payload(['capacity' => 0]))->assertSessionHasErrors('capacity');
    }

    /* ---------------- 4–5. detail & ubah ---------------- */

    public function test_show_returns_detail_json(): void
    {
        $class = $this->makeClass(['name' => 'Detail', 'level' => 'B2']);

        $this->actingAs($this->admin())->getJson(route('admin.classes.show', $class))
            ->assertOk()
            ->assertJsonPath('data.name', 'Detail')
            ->assertJsonPath('data.level_label', 'B2 – Upper Intermediate')
            ->assertJsonPath('data.tutor.name', 'Dr. Kevin Kusuma');
    }

    public function test_update_class_and_keep_own_name(): void
    {
        $class = $this->makeClass(['name' => 'Lama']);

        $this->actingAs($this->admin())->put(route('admin.classes.update', $class), $this->payload(['name' => 'Lama', 'level' => 'A2']))
            ->assertSessionHasNoErrors();

        $this->assertSame('A2', $class->fresh()->level);
    }

    public function test_capacity_cannot_go_below_member_count(): void
    {
        $class = $this->makeClass();
        $class->students()->attach([$this->student('1')->id, $this->student('2')->id, $this->student('3')->id]);

        $this->actingAs($this->admin())->put(route('admin.classes.update', $class), $this->payload(['name' => $class->name, 'capacity' => 2]))
            ->assertSessionHasErrors('capacity');
    }

    /* ---------------- 6–7. murid ---------------- */

    public function test_students_endpoint_flags_members(): void
    {
        $class = $this->makeClass();
        $in = $this->student('1');
        $out = $this->student('2');
        $this->student('3', 'inactive'); // nonaktif & bukan anggota => tidak tampil
        $class->students()->attach($in->id);

        $this->actingAs($this->admin())->getJson(route('admin.classes.students', $class))
            ->assertOk()
            ->assertJsonCount(2, 'students')
            ->assertJsonPath('class.members_count', 1)
            ->assertJsonFragment(['id' => $in->id, 'member' => true])
            ->assertJsonFragment(['id' => $out->id, 'member' => false]);
    }

    public function test_add_student_activates_pending_and_is_idempotent(): void
    {
        $class = $this->makeClass();
        $pending = $this->student('1', 'pending');
        $admin = $this->admin();

        $this->actingAs($admin)->postJson(route('admin.classes.students.sync', $class), ['student_id' => $pending->id, 'member' => true])
            ->assertOk()->assertJson(['member' => true, 'members_count' => 1, 'status' => 'active']);
        $this->actingAs($admin)->postJson(route('admin.classes.students.sync', $class), ['student_id' => $pending->id, 'member' => true])
            ->assertOk()->assertJson(['members_count' => 1]);

        $this->assertSame('active', $pending->fresh()->status);
    }

    public function test_remove_student_also_leaves_class_schedules(): void
    {
        $class = $this->makeClass();
        $student = $this->student('1');
        $class->students()->attach($student->id);
        $schedule = $this->scheduleFor($class);
        $schedule->students()->attach($student->id);

        $this->actingAs($this->admin())->postJson(route('admin.classes.students.sync', $class), ['student_id' => $student->id, 'member' => false])
            ->assertOk()->assertJson(['member' => false, 'members_count' => 0]);

        $this->assertDatabaseCount('class_group_student', 0);
        $this->assertDatabaseCount('schedule_student', 0);
    }

    public function test_cannot_add_student_when_class_is_full_inactive_or_student_inactive(): void
    {
        $admin = $this->admin();

        $full = $this->makeClass(['capacity' => 1]);
        $full->students()->attach($this->student('1')->id);
        $this->actingAs($admin)->postJson(route('admin.classes.students.sync', $full), ['student_id' => $this->student('2')->id, 'member' => true])
            ->assertStatus(422)->assertJsonValidationErrors('student_id');

        $inactiveClass = $this->makeClass(['is_active' => false]);
        $this->actingAs($admin)->postJson(route('admin.classes.students.sync', $inactiveClass), ['student_id' => $this->student('3')->id, 'member' => true])
            ->assertStatus(422);

        $open = $this->makeClass();
        $this->actingAs($admin)->postJson(route('admin.classes.students.sync', $open), ['student_id' => $this->student('4', 'inactive')->id, 'member' => true])
            ->assertStatus(422);
        $this->actingAs($admin)->postJson(route('admin.classes.students.sync', $open), ['student_id' => 9999, 'member' => true])
            ->assertStatus(422);
    }

    /* ---------------- 8–9. nonaktifkan / hapus ---------------- */

    public function test_deactivate_and_reactivate(): void
    {
        $class = $this->makeClass();
        $class->students()->attach($this->student('1')->id); // anggota tidak menghalangi nonaktif
        $admin = $this->admin();

        $this->actingAs($admin)->patch(route('admin.classes.status', $class))->assertSessionHas('success');
        $this->assertFalse($class->fresh()->is_active);

        $this->actingAs($admin)->patch(route('admin.classes.status', $class));
        $this->assertTrue($class->fresh()->is_active);
    }

    public function test_deactivate_is_rejected_when_used_by_active_semester_schedule(): void
    {
        $class = $this->makeClass();
        $this->scheduleFor($class, activeSemester: true);

        $this->actingAs($this->admin())->patch(route('admin.classes.status', $class))->assertSessionHasErrors('action');
        $this->assertTrue($class->fresh()->is_active);
    }

    public function test_delete_is_rejected_when_class_has_members_or_schedules(): void
    {
        $admin = $this->admin();

        $withMembers = $this->makeClass();
        $withMembers->students()->attach($this->student('1')->id);
        $this->actingAs($admin)->delete(route('admin.classes.destroy', $withMembers))->assertSessionHasErrors('action');
        $this->assertDatabaseHas('class_groups', ['id' => $withMembers->id]);

        $withSchedule = $this->makeClass();
        $this->scheduleFor($withSchedule, activeSemester: false);
        $this->actingAs($admin)->delete(route('admin.classes.destroy', $withSchedule))->assertSessionHasErrors('action');
        $this->assertDatabaseHas('class_groups', ['id' => $withSchedule->id]);
    }

    public function test_unused_class_can_be_deleted(): void
    {
        $class = $this->makeClass();

        $this->actingAs($this->admin())->delete(route('admin.classes.destroy', $class))->assertSessionHas('success');
        $this->assertDatabaseMissing('class_groups', ['id' => $class->id]);
    }

    /* ---------------- integrasi jadwal ---------------- */

    public function test_schedule_can_be_linked_to_a_class(): void
    {
        $class = $this->makeClass(['name' => 'Kelas Terkait']);
        $semester = Semester::create(['name' => 'Aktif', 'start_date' => now()->subMonth()->toDateString(), 'end_date' => now()->addMonths(4)->toDateString(), 'is_active' => true]);

        $this->actingAs($this->admin())->post(route('admin.schedules.store'), [
            'title' => 'Sesi Terkait', 'class_name' => $class->name, 'class_group_id' => $class->id,
            'program_id' => Program::create(['code' => 'X', 'name' => 'P', 'category' => 'english'])->id,
            'instructor_id' => $this->tutor->id,
            'room_id' => Room::create(['name' => 'R1', 'type' => 'physical', 'capacity' => 20])->id,
            'scheduled_date' => now()->startOfWeek(Carbon::MONDAY)->toDateString(),
            'day_of_week' => Carbon::MONDAY, 'start_time' => '10:00', 'end_time' => '11:00', 'student_ids' => [],
        ])->assertSessionHasNoErrors();

        $this->assertSame($class->id, Schedule::firstOrFail()->class_group_id);
        $this->assertSame($semester->id, Schedule::firstOrFail()->semester_id);
    }
}
