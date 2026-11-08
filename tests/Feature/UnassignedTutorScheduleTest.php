<?php

namespace Tests\Feature;

use App\Enums\ClassLevel;
use App\Models\CourseClass;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Jadwal yang tutornya dihapus paksa tetap ada dengan tutor_id null.
 * Semua halaman dan PDF harus menampilkan keadaan itu tanpa error.
 */
class UnassignedTutorScheduleTest extends TestCase
{
    use RefreshDatabase;

    private Semester $semester;

    private Room $room;

    private CourseClass $courseClass;

    private User $studentUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->semester = Semester::create([
            'name' => 'Ganjil Test',
            'start_date' => now()->subMonth()->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'is_active' => true,
        ]);
        $this->room = Room::create(['name' => 'Hall A', 'type' => 'physical', 'capacity' => 20]);
        $this->courseClass = CourseClass::create([
            'name' => 'Kelas Tanpa Tutor',
            'level' => ClassLevel::Beginner->value,
            'is_active' => true,
        ]);
        $this->studentUser = User::factory()->create(['role' => User::ROLE_STUDENT, 'name' => 'Murid Satu']);
        $this->courseClass->students()->attach($this->studentUser);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function tutor(string $name = 'Dr. Kevin Kusuma'): User
    {
        return User::factory()->create(['role' => User::ROLE_TUTOR, 'name' => $name]);
    }

    private function student(): Student
    {
        return Student::firstOrCreate(
            ['user_id' => $this->studentUser->id],
            [
                'name' => $this->studentUser->name,
                'email' => $this->studentUser->email,
                'status' => Student::STATUS_ACTIVE,
            ],
        );
    }

    private function schedule(User $tutor, array $override = []): Schedule
    {
        return Schedule::create(array_merge([
            'semester_id' => $this->semester->id,
            'class_id' => $this->courseClass->id,
            'tutor_id' => $tutor->id,
            'room_id' => $this->room->id,
            'title' => $this->courseClass->name,
            'class_name' => $this->courseClass->name,
            'day_of_week' => now()->dayOfWeekIso,
            'scheduled_date' => now()->toDateString(),
            'start_time' => '13:00',
            'end_time' => '15:00',
        ], $override));
    }

    /** Hapus tutor lewat route admin yang sama dengan insiden aslinya. */
    private function forceDeleteTutor(User $tutor): void
    {
        $this->actingAs($this->admin())
            ->delete(route('admin.data-pengguna.destroy', $tutor), ['force' => 1])
            ->assertRedirect(route('admin.data-pengguna.index'));

        $this->assertDatabaseMissing('users', ['id' => $tutor->id]);
        $this->assertDatabaseCount('class_tutor', 0);
    }

    private function assertScheduleHasNoTutor(Schedule $schedule): void
    {
        $this->assertNull($schedule->fresh()->tutor_id);
    }

    public function test_admin_schedule_index_shows_an_unassigned_schedule(): void
    {
        $tutor = $this->tutor();
        $this->courseClass->tutors()->attach($tutor);
        $schedule = $this->schedule($tutor);

        $this->forceDeleteTutor($tutor);
        $this->assertScheduleHasNoTutor($schedule);

        $this->actingAs($this->admin())
            ->get(route('admin.schedules.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Schedules/Index')
                ->has('schedules', 1)
                ->where('schedules.0.id', $schedule->id)
                ->where('schedules.0.tutor', null));
    }

    public function test_student_schedule_index_shows_an_unassigned_schedule(): void
    {
        $tutor = $this->tutor();
        $this->courseClass->tutors()->attach($tutor);
        $schedule = $this->schedule($tutor);
        $schedule->students()->attach($this->student()->id);

        $this->forceDeleteTutor($tutor);

        $this->actingAs($this->studentUser)
            ->get(route('schedules.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Schedules/Index')
                ->has('schedules', 1)
                ->where('schedules.0.id', $schedule->id)
                ->where('schedules.0.tutor', null));
    }

    public function test_tutor_schedule_index_survives_an_unassigned_schedule_in_the_semester(): void
    {
        $deletedTutor = $this->tutor('Tutor Dihapus');
        $this->courseClass->tutors()->attach($deletedTutor);
        $this->schedule($deletedTutor);

        $this->forceDeleteTutor($deletedTutor);

        $remainingTutor = $this->tutor('Tutor Aktif');

        $this->actingAs($remainingTutor)
            ->get(route('tutor.schedules.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Schedules/Index')
                ->has('schedules', 0));
    }

    public function test_schedule_pdf_routes_survive_an_unassigned_schedule(): void
    {
        $tutor = $this->tutor();
        $this->courseClass->tutors()->attach($tutor);
        // Senin pekan berjalan agar baris jadwal benar-benar dirender di PDF.
        $schedule = $this->schedule($tutor, [
            'day_of_week' => 1,
            'scheduled_date' => now()->startOfWeek()->toDateString(),
        ]);
        $schedule->students()->attach($this->student()->id);

        $this->forceDeleteTutor($tutor);

        $this->actingAs($this->admin())
            ->get(route('admin.schedules.pdf'))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->actingAs($this->studentUser)
            ->get(route('schedules.pdf'))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->actingAs($this->tutor('Tutor Aktif'))
            ->get(route('tutor.schedules.pdf'))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_class_index_shows_an_empty_tutor_state_after_force_delete(): void
    {
        $tutor = $this->tutor();
        $this->courseClass->tutors()->attach($tutor);
        $this->schedule($tutor);

        $this->forceDeleteTutor($tutor);

        $this->actingAs($this->admin())
            ->get(route('admin.classes.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Classes/Index')
                ->has('classes.data', 1)
                ->where('classes.data.0.name', $this->courseClass->name)
                ->where('classes.data.0.tutor', null));
    }

    public function test_editing_an_unassigned_schedule_requires_an_eligible_class_tutor(): void
    {
        $tutor = $this->tutor();
        $this->courseClass->tutors()->attach($tutor);
        $schedule = $this->schedule($tutor);

        $this->forceDeleteTutor($tutor);

        $payload = [
            'class_id' => $this->courseClass->id,
            'tutor_id' => '',
            'room_id' => $this->room->id,
            'scheduled_date' => now()->next('Monday')->toDateString(),
            'start_time' => '13:00',
            'end_time' => '15:00',
        ];

        $this->actingAs($this->admin())
            ->put(route('admin.schedules.update', $schedule), $payload)
            ->assertSessionHasErrors('tutor_id');

        $this->assertNull($schedule->fresh()->tutor_id);

        $replacement = $this->tutor('Tutor Pengganti');
        $this->courseClass->tutors()->attach($replacement);

        $this->actingAs($this->admin())
            ->put(route('admin.schedules.update', $schedule), [...$payload, 'tutor_id' => $replacement->id])
            ->assertSessionHasNoErrors();

        $this->assertSame($replacement->id, $schedule->fresh()->tutor_id);
    }

    public function test_attendance_data_loads_for_an_unassigned_schedule(): void
    {
        $tutor = $this->tutor();
        $this->courseClass->tutors()->attach($tutor);
        $schedule = $this->schedule($tutor);
        $schedule->students()->attach($this->student()->id);

        $this->forceDeleteTutor($tutor);

        $this->actingAs($this->admin())
            ->getJson(route('admin.schedules.attendance', [
                'schedule' => $schedule->id,
                'date' => now()->toDateString(),
            ]))
            ->assertOk()
            ->assertJsonPath('schedule.id', $schedule->id)
            ->assertJsonCount(1, 'students');
    }

    public function test_schedule_with_a_tutor_still_returns_the_tutor_data(): void
    {
        $tutor = $this->tutor('Dr. Kevin Kusuma');
        $this->courseClass->tutors()->attach($tutor);
        $this->schedule($tutor);

        $this->actingAs($this->admin())
            ->get(route('admin.schedules.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('schedules.0.tutor.id', $tutor->id)
                ->where('schedules.0.tutor.name', 'Dr. Kevin Kusuma')
                ->where('schedules.0.tutor.initials', 'KK'));
    }
}
