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
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RoomTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function payload(array $override = []): array
    {
        return array_merge([
            'name' => 'Ruang Pidato 1',
            'type' => 'physical',
            'location' => 'Gedung Utama, Lantai 2',
            'platform' => null,
            'capacity' => 20,
        ], $override);
    }

    private function room(array $override = []): Room
    {
        return Room::create(array_merge(['name' => 'R '.uniqid(), 'type' => 'physical', 'location' => 'Lantai 1', 'capacity' => 20, 'is_active' => true], $override));
    }

    private function scheduleIn(Room $room, bool $activeSemester = true, int $students = 0): Schedule
    {
        $semester = Semester::create(['name' => 'S '.uniqid(), 'start_date' => '2026-08-01', 'end_date' => '2027-01-31', 'is_active' => $activeSemester]);
        $instructor = Instructor::create(['name' => 'Tutor '.uniqid()]);

        $schedule = Schedule::create([
            'semester_id' => $semester->id,
            'program_id' => Program::create(['code' => uniqid(), 'name' => 'P', 'category' => 'english'])->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room->id,
            'title' => 'Sesi Pidato', 'class_name' => 'Batch 1', 'day_of_week' => 2, 'start_time' => '09:00', 'end_time' => '10:30',
        ]);

        for ($i = 0; $i < $students; $i++) {
            $schedule->students()->attach(Student::create(['nisn' => uniqid(), 'name' => "Murid $i", 'status' => 'active'])->id);
        }

        return $schedule;
    }

    public function test_guest_and_non_admin_are_blocked(): void
    {
        $this->get(route('admin.rooms.index'))->assertRedirect('/login');

        $tutor = User::factory()->create(['role' => User::ROLE_TUTOR]);
        $this->actingAs($tutor)->get(route('admin.rooms.index'))->assertForbidden();
        $this->actingAs($tutor)->post(route('admin.rooms.store'), $this->payload())->assertForbidden();
    }

    public function test_index_lists_rooms_with_stats_and_filters(): void
    {
        $this->room(['name' => 'Hall A', 'location' => 'Gedung Utama']);
        $this->room(['name' => 'Lab 1', 'type' => 'lab']);
        $this->room(['name' => 'Zoom 1', 'type' => 'online', 'platform' => 'Zoom', 'location' => null, 'capacity' => 100]);
        $this->room(['name' => 'Tutup', 'is_active' => false]);

        $this->actingAs($this->admin())->get(route('admin.rooms.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Rooms/Index')
                ->has('rooms.data', 4)
                ->where('stats', ['total' => 4, 'physical' => 2, 'online' => 1, 'inactive' => 1])
                ->has('options.types', 3));

        $this->actingAs($this->admin())->get(route('admin.rooms.index', ['type' => 'online']))
            ->assertInertia(fn (Assert $page) => $page->has('rooms.data', 1)->where('rooms.data.0.name', 'Zoom 1'));

        $this->actingAs($this->admin())->get(route('admin.rooms.index', ['status' => 'inactive']))
            ->assertInertia(fn (Assert $page) => $page->has('rooms.data', 1)->where('rooms.data.0.name', "Tutup"));

        $this->actingAs($this->admin())->get(route('admin.rooms.index', ['q' => 'gedung utama']))
            ->assertInertia(fn (Assert $page) => $page->has('rooms.data', 1)->where('rooms.data.0.name', 'Hall A'));

        $this->actingAs($this->admin())->get(route('admin.rooms.index', ['sort' => 'capacity']))
            ->assertInertia(fn (Assert $page) => $page->where('rooms.data.0.name', 'Zoom 1'));
    }

    public function test_store_creates_active_room(): void
    {
        $this->actingAs($this->admin())->post(route('admin.rooms.store'), $this->payload())
            ->assertRedirect()->assertSessionHas('success.title', 'Ruangan Tersimpan');

        $room = Room::firstWhere('name', 'Ruang Pidato 1');
        $this->assertTrue($room->is_active);
        $this->assertSame('Gedung Utama, Lantai 2', $room->location);
        $this->assertSame(20, $room->capacity);
    }

    public function test_store_validation(): void
    {
        $this->room(['name' => 'Ada']);
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('admin.rooms.store'), [])->assertSessionHasErrors(['name', 'type', 'capacity']);
        $this->actingAs($admin)->post(route('admin.rooms.store'), $this->payload(['name' => 'Ada']))->assertSessionHasErrors('name');
        $this->actingAs($admin)->post(route('admin.rooms.store'), $this->payload(['type' => 'gudang']))->assertSessionHasErrors('type');
        $this->actingAs($admin)->post(route('admin.rooms.store'), $this->payload(['capacity' => 0]))->assertSessionHasErrors('capacity');
        $this->actingAs($admin)->post(route('admin.rooms.store'), $this->payload(['location' => '']))->assertSessionHasErrors('location');
        $this->actingAs($admin)->post(route('admin.rooms.store'), $this->payload(['type' => 'online', 'location' => null, 'platform' => '']))->assertSessionHasErrors('platform');
    }

    public function test_online_room_needs_platform_not_location_and_physical_drops_platform(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('admin.rooms.store'), $this->payload(['name' => 'Zoom X', 'type' => 'online', 'location' => null, 'platform' => 'Zoom', 'capacity' => 100]))
            ->assertSessionHasNoErrors();
        $this->assertSame('Zoom', Room::firstWhere('name', 'Zoom X')->platform);

        $this->actingAs($admin)->post(route('admin.rooms.store'), $this->payload(['name' => 'Fisik X', 'platform' => 'Zoom']))->assertSessionHasNoErrors();
        $this->assertNull(Room::firstWhere('name', 'Fisik X')->platform);
    }

    public function test_show_returns_detail_json(): void
    {
        $room = $this->room(['name' => 'Hall A']);
        $this->scheduleIn($room);

        $this->actingAs($this->admin())->getJson(route('admin.rooms.show', $room))
            ->assertOk()
            ->assertJsonPath('data.name', 'Hall A')
            ->assertJsonPath('data.type', 'physical')
            ->assertJsonPath('data.type_label', 'Ruang Kelas')
            ->assertJsonPath('data.schedules_count', 1);
    }

    public function test_update_changes_room_and_allows_same_name(): void
    {
        $room = $this->room(['name' => 'Hall A']);

        $this->actingAs($this->admin())->put(route('admin.rooms.update', $room), $this->payload(['name' => 'Hall A', 'capacity' => 35, 'location' => 'Baru']))
            ->assertSessionHasNoErrors()->assertSessionHas('success.title', 'Perubahan Ruangan Tersimpan');

        $this->assertSame(35, $room->fresh()->capacity);
        $this->assertSame('Baru', $room->fresh()->location);
    }

    public function test_capacity_cannot_go_below_largest_schedule_roster(): void
    {
        $room = $this->room(['capacity' => 20]);
        $this->scheduleIn($room, true, 5);

        $this->actingAs($this->admin())->put(route('admin.rooms.update', $room), $this->payload(['name' => $room->name, 'capacity' => 4]))
            ->assertSessionHasErrors('capacity');
        $this->assertSame(20, $room->fresh()->capacity);

        $this->actingAs($this->admin())->put(route('admin.rooms.update', $room), $this->payload(['name' => $room->name, 'capacity' => 5]))
            ->assertSessionHasNoErrors();
    }

    public function test_schedules_endpoint_lists_related_schedules(): void
    {
        $room = $this->room();
        $this->scheduleIn($room, false);
        $this->scheduleIn($room, true);

        $res = $this->actingAs($this->admin())->getJson(route('admin.rooms.schedules', $room))->assertOk();
        $res->assertJsonPath('total', 2)
            ->assertJsonPath('schedules.0.semester_active', true)
            ->assertJsonPath('schedules.0.day', 'Selasa')
            ->assertJsonPath('schedules.0.start_time', '09:00');
    }

    public function test_deactivate_and_reactivate_unused_room(): void
    {
        $room = $this->room();
        $admin = $this->admin();

        $this->actingAs($admin)->patch(route('admin.rooms.status', $room))->assertSessionHas('success.title', 'Ruangan Dinonaktifkan');
        $this->assertFalse($room->fresh()->is_active);

        $this->actingAs($admin)->patch(route('admin.rooms.status', $room))->assertSessionHas('success.title', 'Ruangan Diaktifkan');
        $this->assertTrue($room->fresh()->is_active);
    }

    public function test_deactivate_rejected_when_used_in_active_semester_but_allowed_for_past_semester(): void
    {
        $inUse = $this->room();
        $this->scheduleIn($inUse, true);

        $this->actingAs($this->admin())->patch(route('admin.rooms.status', $inUse))->assertSessionHasErrors('action');
        $this->assertTrue($inUse->fresh()->is_active);

        $past = $this->room();
        $this->scheduleIn($past, false);
        $this->actingAs($this->admin())->patch(route('admin.rooms.status', $past))->assertSessionHasNoErrors();
        $this->assertFalse($past->fresh()->is_active);
    }

    public function test_delete_rejected_when_any_schedule_uses_room(): void
    {
        $room = $this->room();
        $this->scheduleIn($room, false);

        $this->actingAs($this->admin())->delete(route('admin.rooms.destroy', $room))->assertSessionHasErrors('action');
        $this->assertDatabaseHas('rooms', ['id' => $room->id]);
    }

    public function test_unused_room_can_be_deleted(): void
    {
        $room = $this->room();

        $this->actingAs($this->admin())->delete(route('admin.rooms.destroy', $room))
            ->assertSessionHas('success.title', 'Ruangan Dihapus');
        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
    }

    public function test_inactive_room_hidden_from_schedule_options(): void
    {
        $this->room(['name' => 'Aktif']);
        $this->room(['name' => 'Tutup', 'is_active' => false]);

        $this->actingAs($this->admin())->get(route('admin.schedules.index'))
            ->assertInertia(fn (Assert $page) => $page->has('options.rooms', 1)->where('options.rooms.0.name', 'Aktif'));
    }
}
