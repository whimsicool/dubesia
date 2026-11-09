<?php

namespace Tests\Feature;

use App\Models\ClassAttendance;
use App\Models\CourseClass;
use App\Models\Pendaftaran;
use App\Models\Program;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'status_akun' => 'aktif',
        ]);

        $this->student = User::factory()->create([
            'role' => 'student',
            'status_akun' => 'aktif',
        ]);
    }

    public function test_non_admin_cannot_access_data_pengguna(): void
    {
        $response = $this->actingAs($this->student)->get('/admin/data-pengguna');
        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access(): void
    {
        $response = $this->get('/admin/data-pengguna');
        $response->assertRedirect('/login');
    }

    public function test_admin_can_view_data_pengguna_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/data-pengguna');
        $response->assertStatus(200);
    }

    public function test_data_pengguna_shows_the_student_level(): void
    {
        $this->student->update(['class_level' => 'Upper Intermediate']);

        $this->actingAs($this->admin)
            ->get('/admin/data-pengguna')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/DataPengguna/Index')
                ->where('users.data', fn ($users) => collect($users)->firstWhere('id', $this->student->id)['class_level'] === 'Upper Intermediate')
            );
    }

    public function test_data_pengguna_carries_registration_labels_without_the_registration_record(): void
    {
        Pendaftaran::factory()->for($this->student)->terverifikasi()->create([
            'program' => 'toefl_preparation',
            'jenis_kelas' => 'intensive',
        ]);

        $this->actingAs($this->admin)
            ->get('/admin/data-pengguna')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/DataPengguna/Index')
                ->where('users.data', function ($users): bool {
                    $row = collect($users)->firstWhere('id', $this->student->id);

                    return $row['program_label'] === 'TOEFL Preparation'
                        && $row['jenis_kelas_label'] === 'Intensive'
                        && ! array_key_exists('pendaftaran', $row);
                }));
    }

    public function test_admin_can_add_tutor(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/data-pengguna', [
            'name' => 'Tutor Baru Test',
            'email' => 'gurubaru@dubes.ac.id',
            'no_hp' => '+62 812-0000-1111',
        ]);

        $response->assertRedirect('/admin/data-pengguna');

        $this->assertDatabaseHas('users', [
            'email' => 'gurubaru@dubes.ac.id',
            'role' => 'tutor',
            'status_akun' => 'aktif',
        ]);
    }

    public function test_admin_can_add_tutor_without_phone(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/data-pengguna', [
            'name' => 'Tutor Tanpa Nomor HP',
            'email' => 'gurutanpa.hp@dubes.ac.id',
            'no_hp' => '',
        ]);

        $response->assertRedirect('/admin/data-pengguna');

        $this->assertDatabaseHas('users', [
            'email' => 'gurutanpa.hp@dubes.ac.id',
            'role' => 'tutor',
        ]);
    }

    public function test_store_validates_required_fields(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/data-pengguna', [
            'name' => '',
            'email' => '',
        ]);

        $response->assertSessionHasErrors(['name', 'email']);
    }

    public function test_store_validates_unique_email(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/data-pengguna', [
            'name' => 'Duplicate Email',
            'email' => $this->student->email,
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    public function test_store_menolak_email_yang_sama_dengan_huruf_besar(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/data-pengguna', [
            'name' => 'Duplicate Email Kapital',
            'email' => strtoupper($this->student->email),
        ]);

        $response->assertSessionHasErrors(['email']);
        $this->assertDatabaseCount('users', 2);
    }

    public function test_admin_dapat_menonaktifkan_dan_mengaktifkan_akun(): void
    {
        $tutor = User::factory()->create([
            'role' => 'tutor',
            'status_akun' => 'aktif',
            'is_active' => true,
        ]);

        $this->actingAs($this->admin)
            ->patch(route('admin.data-pengguna.status.update', $tutor->id), ['status_akun' => 'nonaktif'])
            ->assertRedirect(route('admin.data-pengguna.index'));

        $tutor->refresh();
        $this->assertSame('nonaktif', $tutor->status_akun);
        $this->assertFalse($tutor->is_active);

        $this->actingAs($this->admin)
            ->patch(route('admin.data-pengguna.status.update', $tutor->id), ['status_akun' => 'aktif'])
            ->assertRedirect(route('admin.data-pengguna.index'));

        $tutor->refresh();
        $this->assertSame('aktif', $tutor->status_akun);
        $this->assertTrue($tutor->is_active);
    }

    public function test_admin_tidak_dapat_mengubah_identitas_atau_peran_pengguna(): void
    {
        $tutor = User::factory()->create([
            'role' => 'tutor',
            'name' => 'Nama Asli',
            'status_akun' => 'aktif',
        ]);

        $this->actingAs($this->admin)
            ->put("/admin/data-pengguna/{$tutor->id}", [
                'name' => 'Nama Palsu',
                'email' => 'palsu@dubesia.id',
                'role' => 'student',
                'status_akun' => 'nonaktif',
            ])
            ->assertStatus(405);

        $this->assertDatabaseHas('users', [
            'id' => $tutor->id,
            'name' => 'Nama Asli',
            'role' => 'tutor',
            'status_akun' => 'aktif',
        ]);
    }

    public function test_admin_can_delete_user(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'status_akun' => 'aktif']);

        $response = $this->actingAs($this->admin)->delete("/admin/data-pengguna/{$tutor->id}");

        $response->assertRedirect('/admin/data-pengguna');
        $this->assertDatabaseMissing('users', ['id' => $tutor->id]);
    }

    public function test_admin_cannot_delete_admin_account(): void
    {
        $otherAdmin = User::factory()->create(['role' => 'admin', 'status_akun' => 'aktif']);

        $response = $this->actingAs($this->admin)->delete("/admin/data-pengguna/{$otherAdmin->id}");

        $response->assertRedirect('/admin/data-pengguna');
        $this->assertDatabaseHas('users', ['id' => $otherAdmin->id]);
    }

    public function test_admin_account_cannot_be_edited_from_this_page(): void
    {
        $otherAdmin = User::factory()->create(['role' => 'admin', 'status_akun' => 'aktif']);

        $response = $this->actingAs($this->admin)->patch(
            route('admin.data-pengguna.status.update', $otherAdmin->id),
            ['status_akun' => 'nonaktif'],
        );

        $response->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $otherAdmin->id, 'role' => 'admin', 'status_akun' => 'aktif']);
    }

    public function test_data_pengguna_dapat_diunduh_sebagai_pdf(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.data-pengguna.export'));

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_default_password_generation(): void
    {
        $password = User::generateDefaultPassword('Nadia Safira');
        $this->assertEquals('dbs.nadia.'.date('Y'), $password);
    }

    /**
     * Penugasan tutor pada satu kelas beserta satu jadwal mingguan.
     *
     * @return array{0: CourseClass, 1: Schedule}
     */
    private function assignTutorToClass(User $tutor): array
    {
        $courseClass = CourseClass::create([
            'name' => 'Diplomatic Speech Batch #4',
            'level' => 'Intermediate Up',
            'is_active' => true,
        ]);
        $courseClass->tutors()->attach($tutor->id);

        $schedule = Schedule::create([
            'semester_id' => Semester::create([
                'name' => 'Ganjil Test',
                'start_date' => now()->subMonth()->toDateString(),
                'end_date' => now()->addMonths(4)->toDateString(),
                'is_active' => true,
            ])->id,
            'program_id' => Program::create(['code' => 'DSP', 'name' => 'Diplomatic Speech', 'category' => 'english'])->id,
            'class_id' => $courseClass->id,
            'tutor_id' => $tutor->id,
            'room_id' => Room::create(['name' => 'Hall A', 'type' => 'physical'])->id,
            'title' => 'Diplomatic Speech',
            'class_name' => $courseClass->name,
            'day_of_week' => 1,
            'start_time' => '08:30',
            'end_time' => '10:00',
        ]);

        return [$courseClass, $schedule];
    }

    public function test_deleting_an_assigned_tutor_warns_and_keeps_the_account(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'status_akun' => 'aktif']);
        [$courseClass, $schedule] = $this->assignTutorToClass($tutor);

        $this->actingAs($this->admin)
            ->delete(route('admin.data-pengguna.destroy', $tutor->id))
            ->assertRedirect(route('admin.data-pengguna.index'))
            ->assertSessionHas('error', fn (string $message): bool => str_contains($message, 'Diplomatic Speech Batch #4')
                && str_contains($message, 'Senin 08:30–10:00')
                && str_contains($message, 'Hall A'));

        $this->assertDatabaseHas('users', ['id' => $tutor->id]);
        $this->assertDatabaseHas('class_tutor', ['class_id' => $courseClass->id, 'tutor_id' => $tutor->id]);
        $this->assertDatabaseHas('schedules', ['id' => $schedule->id, 'tutor_id' => $tutor->id]);
    }

    public function test_force_deleting_a_tutor_removes_assignments_and_clears_schedules(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'status_akun' => 'aktif']);
        [$courseClass, $schedule] = $this->assignTutorToClass($tutor);

        $this->actingAs($this->admin)
            ->delete(route('admin.data-pengguna.destroy', $tutor->id), ['force' => true])
            ->assertRedirect(route('admin.data-pengguna.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('users', ['id' => $tutor->id]);
        $this->assertDatabaseMissing('class_tutor', ['class_id' => $courseClass->id, 'tutor_id' => $tutor->id]);
        $this->assertDatabaseHas('schedules', ['id' => $schedule->id, 'tutor_id' => null]);
    }

    public function test_deleting_a_tutor_with_attendance_is_refused_without_a_server_error(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'status_akun' => 'aktif']);
        [$courseClass, $schedule] = $this->assignTutorToClass($tutor);
        ClassAttendance::create([
            'student_id' => $this->student->id,
            'tutor_id' => $tutor->id,
            'class_level' => 'Beginner',
            'attendance_date' => now()->toDateString(),
            'status' => 'Hadir',
        ]);

        $this->actingAs($this->admin)
            ->delete(route('admin.data-pengguna.destroy', $tutor->id))
            ->assertRedirect(route('admin.data-pengguna.index'))
            ->assertSessionHas('error', fn (string $message): bool => str_contains($message, '1 catatan presensi'));

        $this->actingAs($this->admin)
            ->delete(route('admin.data-pengguna.destroy', $tutor->id), ['force' => true])
            ->assertRedirect(route('admin.data-pengguna.index'))
            ->assertSessionHas('error', fn (string $message): bool => str_contains($message, '1 catatan presensi'));

        $this->assertDatabaseHas('users', ['id' => $tutor->id]);
        $this->assertDatabaseHas('class_tutor', ['class_id' => $courseClass->id, 'tutor_id' => $tutor->id]);
        $this->assertDatabaseHas('schedules', ['id' => $schedule->id, 'tutor_id' => $tutor->id]);
        $this->assertDatabaseCount('class_attendances', 1);
    }

    public function test_deleting_a_student_with_attendance_is_refused_without_a_server_error(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'status_akun' => 'aktif']);
        ClassAttendance::create([
            'student_id' => $this->student->id,
            'tutor_id' => $tutor->id,
            'class_level' => 'Beginner',
            'attendance_date' => now()->toDateString(),
            'status' => 'Hadir',
        ]);

        $this->actingAs($this->admin)
            ->delete(route('admin.data-pengguna.destroy', $this->student->id))
            ->assertRedirect(route('admin.data-pengguna.index'))
            ->assertSessionHas('error', fn (string $message): bool => str_contains($message, '1 catatan presensi'));

        $this->assertDatabaseHas('users', ['id' => $this->student->id]);
        $this->assertDatabaseCount('class_attendances', 1);
    }

    public function test_bulk_delete_with_a_blocked_account_deletes_nothing(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'status_akun' => 'aktif', 'name' => 'Tutor Terblokir']);
        [$courseClass] = $this->assignTutorToClass($tutor);
        $otherStudent = User::factory()->create(['role' => 'student', 'status_akun' => 'aktif']);

        $this->actingAs($this->admin)
            ->post(route('admin.data-pengguna.bulk-destroy'), ['ids' => [$tutor->id, $otherStudent->id]])
            ->assertRedirect(route('admin.data-pengguna.index'))
            ->assertSessionHas('error', fn (string $message): bool => str_contains($message, 'Tutor Terblokir')
                && str_contains($message, '1 kelas'));

        $this->assertDatabaseHas('users', ['id' => $tutor->id]);
        $this->assertDatabaseHas('users', ['id' => $otherStudent->id]);
        $this->assertDatabaseHas('class_tutor', ['class_id' => $courseClass->id, 'tutor_id' => $tutor->id]);
    }

    public function test_admin_can_update_a_student_name_and_phone(): void
    {
        $this->actingAs($this->admin)
            ->patch(route('admin.data-pengguna.update', $this->student->id), [
                'name' => 'Anindya Kartika',
                'no_hp' => '+62 812-3456-7890',
            ])
            ->assertRedirect(route('admin.data-pengguna.index'))
            ->assertSessionHas('success');

        $this->student->refresh();
        $this->assertSame('Anindya Kartika', $this->student->name);
        $this->assertSame('+6281234567890', $this->student->no_hp);
        $this->assertSame('student', $this->student->role);
        $this->assertSame('aktif', $this->student->status_akun);
    }

    public function test_admin_can_update_a_tutor_name_and_clear_the_phone(): void
    {
        $tutor = User::factory()->create([
            'role' => 'tutor',
            'name' => 'Budi Santoso',
            'no_hp' => '+628111111111',
            'status_akun' => 'aktif',
        ]);

        $this->actingAs($this->admin)
            ->patch(route('admin.data-pengguna.update', $tutor->id), [
                'name' => 'Budi Santoso, S.Pd.',
                'no_hp' => '',
            ])
            ->assertRedirect(route('admin.data-pengguna.index'))
            ->assertSessionHas('success');

        $tutor->refresh();
        $this->assertSame('Budi Santoso, S.Pd.', $tutor->name);
        $this->assertNull($tutor->no_hp);
    }

    public function test_updating_an_account_does_not_change_its_email(): void
    {
        $email = $this->student->email;

        $this->actingAs($this->admin)
            ->patch(route('admin.data-pengguna.update', $this->student->id), [
                'name' => 'Nama Baru',
                'email' => 'email.lain@dubesia.id',
            ])
            ->assertRedirect(route('admin.data-pengguna.index'));

        $this->student->refresh();
        $this->assertSame($email, $this->student->email);
        $this->assertSame('student', $this->student->role);
        $this->assertSame('aktif', $this->student->status_akun);
    }

    public function test_admin_account_cannot_be_edited_through_the_update_route(): void
    {
        $otherAdmin = User::factory()->create(['role' => 'admin', 'name' => 'Admin Lain', 'status_akun' => 'aktif']);

        $this->actingAs($this->admin)
            ->patch(route('admin.data-pengguna.update', $otherAdmin->id), [
                'name' => 'Nama Diubah',
                'no_hp' => '+6281234567890',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $otherAdmin->id, 'name' => 'Admin Lain']);
    }

    public function test_non_admin_cannot_access_the_update_route(): void
    {
        $this->actingAs($this->student)
            ->patch(route('admin.data-pengguna.update', $this->student->id), [
                'name' => 'Nama Sendiri',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('users', ['id' => $this->student->id, 'name' => 'Nama Sendiri']);
    }

    public function test_update_validates_name_and_phone_length(): void
    {
        $this->actingAs($this->admin)
            ->patch(route('admin.data-pengguna.update', $this->student->id), [
                'name' => '',
                'no_hp' => str_repeat('9', 21),
            ])
            ->assertSessionHasErrors(['name', 'no_hp']);
    }
}
