<?php

namespace Tests\Feature\Admin;

use App\Enums\RoomType;
use App\Models\Instructor;
use App\Models\Program;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RoomManagementTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    /** @return array<string, mixed> */
    private function payload(array $override = []): array
    {
        return array_merge([
            'name' => 'Diplomatic Hall A',
            'type' => RoomType::Physical->value,
            'capacity' => 30,
            'location' => 'Gedung Utama, Lantai 2',
        ], $override);
    }

    private function room(array $override = []): Room
    {
        return Room::create(array_merge([
            'name' => 'Diplomatic Hall A',
            'type' => RoomType::Physical->value,
            'capacity' => 30,
            'location' => 'Gedung Utama, Lantai 2',
            'is_active' => true,
        ], $override));
    }

    private function scheduledRoom(Room $room): void
    {
        $semester = Semester::create([
            'name' => 'Ganjil Test',
            'start_date' => now()->subMonth()->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'is_active' => true,
        ]);
        $program = Program::create(['code' => 'DSP', 'name' => 'Diplomatic Speech', 'category' => 'english']);
        $instructor = Instructor::create(['name' => 'Dr. Kevin Kusuma']);

        Schedule::create([
            'semester_id' => $semester->id,
            'program_id' => $program->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room->id,
            'title' => 'Diplomatic Speech & Rhetoric',
            'class_name' => 'Diplomatic Speech Batch #4',
            'day_of_week' => 1,
            'start_time' => '08:30',
            'end_time' => '10:00',
        ]);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(route('admin.rooms.index'))->assertRedirect('/login');
    }

    public function test_non_admin_is_forbidden(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        $this->actingAs($student)->get(route('admin.rooms.index'))->assertForbidden();
        $this->actingAs($student)->post(route('admin.rooms.store'), $this->payload())->assertForbidden();
    }

    public function test_admin_sees_rooms_with_stats(): void
    {
        $this->room(['name' => 'Diplomatic Hall A']);
        $this->room(['name' => 'Audiovisual Lab 2', 'type' => RoomType::Lab->value]);
        $this->room(['name' => 'Zoom Room 01', 'type' => RoomType::Online->value, 'location' => null, 'platform' => 'Zoom']);

        $this->actingAs($this->admin())
            ->get(route('admin.rooms.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Rooms/Index')
                ->has('rooms.data', 3)
                ->where('stats.total', 3)
                ->where('stats.physical_lab', 2)
                ->where('stats.online', 1)
                ->where('stats.inactive', 0)
                ->has('options.types', 3)
            );
    }

    public function test_admin_can_create_physical_room_with_location(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.rooms.store'), $this->payload())
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $room = Room::firstOrFail();
        $this->assertSame('Diplomatic Hall A', $room->name);
        $this->assertSame(RoomType::Physical, $room->type);
        $this->assertSame('Gedung Utama, Lantai 2', $room->location);
        $this->assertNull($room->platform);
        $this->assertTrue($room->is_active);
    }

    public function test_online_room_stores_platform_instead_of_location(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.rooms.store'), $this->payload([
                'name' => 'Zoom Room 01',
                'type' => RoomType::Online->value,
                'capacity' => 100,
                'location' => 'Zoom',
            ]))
            ->assertSessionHasNoErrors();

        $room = Room::firstOrFail();
        $this->assertSame('Zoom', $room->platform);
        $this->assertNull($room->location);
    }

    public function test_create_requires_fields_and_unique_name(): void
    {
        $this->room(['name' => 'Diplomatic Hall A']);

        $this->actingAs($this->admin())
            ->post(route('admin.rooms.store'), ['name' => '', 'type' => '', 'capacity' => '', 'location' => ''])
            ->assertSessionHasErrors(['name', 'type', 'capacity', 'location']);

        $this->actingAs($this->admin())
            ->post(route('admin.rooms.store'), $this->payload())
            ->assertSessionHasErrors('name');
    }

    public function test_admin_can_update_room_into_online_platform(): void
    {
        $room = $this->room();

        $this->actingAs($this->admin())
            ->put(route('admin.rooms.update', $room), $this->payload([
                'name' => 'Zoom Room 04',
                'type' => RoomType::Online->value,
                'capacity' => 100,
                'location' => 'Google Meet',
            ]))
            ->assertSessionHasNoErrors();

        $room->refresh();
        $this->assertSame('Zoom Room 04', $room->name);
        $this->assertSame(RoomType::Online, $room->type);
        $this->assertSame('Google Meet', $room->platform);
        $this->assertNull($room->location);
        $this->assertSame(100, $room->capacity);
    }

    public function test_admin_can_toggle_room_status(): void
    {
        $room = $this->room();

        $this->actingAs($this->admin())
            ->patch(route('admin.rooms.status', $room))
            ->assertSessionHasNoErrors();

        $this->assertFalse($room->fresh()->is_active);
    }

    public function test_room_used_by_schedule_cannot_be_deleted(): void
    {
        $room = $this->room();
        $this->scheduledRoom($room);

        $this->actingAs($this->admin())
            ->delete(route('admin.rooms.destroy', $room))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('rooms', ['id' => $room->id]);
    }

    public function test_unused_room_can_be_deleted(): void
    {
        $room = $this->room();

        $this->actingAs($this->admin())
            ->delete(route('admin.rooms.destroy', $room))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
    }
}
