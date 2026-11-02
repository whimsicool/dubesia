<?php

namespace Tests\Feature\Admin;

use App\Models\CourseClass;
use App\Models\Instructor;
use App\Models\Program;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ScheduleManagementTest extends TestCase
{
    use RefreshDatabase;

    private Semester $semester;

    private Program $program;

    private Room $room;

    private User $tutor;

    private CourseClass $courseClass;

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
        $this->room = Room::create(['name' => 'Hall A', 'type' => 'physical', 'capacity' => 20]);

        $this->tutor = User::factory()->create(['role' => User::ROLE_TUTOR, 'name' => 'Dr. Kevin Kusuma, M.A.']);
        $this->courseClass = CourseClass::create([
            'name' => 'Diplomatic Speech Batch #4',
            'level' => 'B2',
            'capacity' => 15,
            'is_active' => true,
        ]);
        $this->courseClass->tutors()->attach($this->tutor->id);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function scheduledDate(): string
    {
        return now()->next('Monday')->toDateString();
    }

    /** @return array<string, mixed> */
    private function payload(array $override = []): array
    {
        return array_merge([
            'class_id' => $this->courseClass->id,
            'tutor_id' => $this->tutor->id,
            'room_id' => $this->room->id,
            'scheduled_date' => $this->scheduledDate(),
            'start_time' => '08:30',
            'end_time' => '10:00',
        ], $override);
    }

    private function instructorFor(User $tutor): Instructor
    {
        return Instructor::firstOrCreate(['user_id' => $tutor->id], ['name' => $tutor->name]);
    }

    private function makeSchedule(array $override = []): Schedule
    {
        return Schedule::create(array_merge([
            'semester_id' => $this->semester->id,
            'program_id' => $this->program->id,
            'class_id' => $this->courseClass->id,
            'instructor_id' => $this->instructorFor($this->tutor)->id,
            'room_id' => $this->room->id,
            'title' => $this->courseClass->name,
            'class_name' => $this->courseClass->name,
            'day_of_week' => 1,
            'start_time' => '08:30',
            'end_time' => '10:00',
        ], $override));
    }

    private function student(string $name = 'Murid Satu'): User
    {
        return User::factory()->create(['role' => User::ROLE_STUDENT, 'name' => $name]);
    }

    /** Baris students adalah pasangan murid (user) yang dipakai pivot jadwal. */
    private function mirrorStudent(User $user, string $nisn, string $status = Student::STATUS_ACTIVE): Student
    {
        return Student::create([
            'user_id' => $user->id,
            'nisn' => $nisn,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $status,
        ]);
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
                ->has('week.days', 6)
                ->where('week.days.0.date', fn ($date) => is_string($date))
                ->has('options.classes', 1)
                ->has('options.tutors', 1)
                ->where('options.classes.0.tutor.id', $this->tutor->id)
            );
    }

    public function test_admin_can_create_schedule_from_class_and_tutor(): void
    {
        $newStudent = $this->student('Murid Baru');
        $this->mirrorStudent($newStudent, '0001', Student::STATUS_PENDING);
        $active = $this->student('Murid Aktif');

        // Daftar peserta diambil dari anggota kelas, bukan lagi dari formulir jadwal.
        $this->courseClass->students()->attach([$newStudent->id, $active->id]);

        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload())
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $schedule = Schedule::firstOrFail();

        // Kelas menentukan judul dan nama kelas jadwal.
        $this->assertSame($this->courseClass->id, $schedule->class_id);
        $this->assertSame($this->courseClass->name, $schedule->title);
        $this->assertSame($this->courseClass->name, $schedule->class_name);

        // Tutor dipetakan ke baris instruktur, murid ke baris students.
        $this->assertSame($this->tutor->id, $schedule->instructor->user_id);
        $this->assertCount(2, $schedule->students);
        $this->assertSame(
            Student::STATUS_ACTIVE,
            Student::where('user_id', $newStudent->id)->value('status')
        );
    }

    public function test_create_requires_class_tutor_and_valid_time_range(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload([
                'class_id' => '',
                'tutor_id' => '',
                'start_time' => '10:00',
                'end_time' => '09:00',
            ]))
            ->assertSessionHasErrors(['class_id', 'tutor_id', 'end_time']);
    }

    public function test_tutor_must_be_a_tutor_account(): void
    {
        $student = $this->student();

        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload(['tutor_id' => $student->id]))
            ->assertSessionHasErrors('tutor_id');
    }

    public function test_tutor_conflict_is_rejected(): void
    {
        $this->makeSchedule();
        $otherRoom = Room::create(['name' => 'Hall B', 'type' => 'physical', 'capacity' => 20]);

        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload(['room_id' => $otherRoom->id, 'start_time' => '09:00', 'end_time' => '10:30']))
            ->assertSessionHasErrors('tutor_id');

        $this->assertDatabaseCount('schedules', 1);
    }

    public function test_room_conflict_is_rejected(): void
    {
        $this->makeSchedule();
        $otherTutor = User::factory()->create(['role' => User::ROLE_TUTOR, 'name' => 'Siti Aisyah']);

        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload(['tutor_id' => $otherTutor->id, 'start_time' => '09:00', 'end_time' => '10:30']))
            ->assertSessionHasErrors('room_id');
    }

    public function test_student_conflict_is_rejected(): void
    {
        $student = $this->student('Murid Terdaftar');
        $this->makeSchedule()->students()->attach($this->mirrorStudent($student, '0001')->id);

        $otherClass = CourseClass::create(['name' => 'Kelas Lain', 'capacity' => 15, 'is_active' => true]);
        $otherClass->students()->attach($student->id);
        $otherRoom = Room::create(['name' => 'Hall B', 'type' => 'physical', 'capacity' => 20]);
        $otherTutor = User::factory()->create(['role' => User::ROLE_TUTOR, 'name' => 'Siti Aisyah']);

        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload([
                'class_id' => $otherClass->id,
                'room_id' => $otherRoom->id,
                'tutor_id' => $otherTutor->id,
            ]))
            ->assertSessionHasErrors('class_id');

        $this->assertDatabaseCount('schedules', 1);
    }

    public function test_back_to_back_sessions_are_not_a_conflict(): void
    {
        $this->makeSchedule(); // 08:30–10:00

        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload(['start_time' => '10:00', 'end_time' => '11:30']))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('schedules', 2);
    }

    public function test_participants_cannot_exceed_room_or_class_capacity(): void
    {
        $small = Room::create(['name' => 'Kecil', 'type' => 'physical', 'capacity' => 1]);
        $a = $this->student('Murid A');
        $b = $this->student('Murid B');
        $this->courseClass->students()->attach([$a->id, $b->id]);

        // Dua murid kelas tidak muat di ruang berkapasitas satu.
        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload(['room_id' => $small->id]))
            ->assertSessionHasErrors('class_id');

        $smallClass = CourseClass::create(['name' => 'Kelas Kecil', 'capacity' => 1, 'is_active' => true]);
        $smallClass->students()->attach([$a->id, $b->id]);

        // Dua anggota kelas melebihi kapasitas kelas itu sendiri.
        $this->actingAs($this->admin())
            ->post(route('admin.schedules.store'), $this->payload(['class_id' => $smallClass->id]))
            ->assertSessionHasErrors('class_id');
    }

    public function test_update_does_not_conflict_with_itself_and_uses_the_selected_class(): void
    {
        $schedule = $this->makeSchedule();
        $otherClass = CourseClass::create(['name' => 'Executive Batch #3', 'level' => 'B1', 'is_active' => true]);

        $this->actingAs($this->admin())
            ->put(route('admin.schedules.update', $schedule), $this->payload([
                'class_id' => $otherClass->id,
                'start_time' => '09:00',
                'end_time' => '10:30',
            ]))
            ->assertSessionHasNoErrors();

        $schedule->refresh();
        $this->assertSame('Executive Batch #3', $schedule->title);
        $this->assertSame('Executive Batch #3', $schedule->class_name);
        $this->assertSame($otherClass->id, $schedule->class_id);
    }

    public function test_delete_cascades_enrollments_and_attendances(): void
    {
        $student = $this->mirrorStudent($this->student('Murid Satu'), '0001');
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

    public function test_check_conflict_endpoint_returns_json(): void
    {
        $this->makeSchedule();

        $this->actingAs($this->admin())
            ->postJson(route('admin.schedules.check-conflict'), [
                'scheduled_date' => $this->scheduledDate(), 'start_time' => '09:00', 'end_time' => '10:00',
                'tutor_id' => $this->tutor->id, 'room_id' => $this->room->id,
            ])
            ->assertOk()
            ->assertJsonCount(2, 'conflicts');
    }

    public function test_export_returns_csv(): void
    {
        $this->makeSchedule(['title' => 'Sesi Existing']);

        $response = $this->actingAs($this->admin())->get(route('admin.schedules.export'));

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('Sesi Existing', $response->streamedContent());
    }
}
