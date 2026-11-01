<?php

namespace Tests\Feature;

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

    public function test_admin_can_add_guru(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/data-pengguna', [
            'name' => 'Guru Baru Test',
            'email' => 'gurubaru@dubes.ac.id',
            'no_hp' => '+62 812-0000-1111',
            'nip' => '19900101-2020-01',
        ]);

        $response->assertRedirect('/admin/data-pengguna');

        $this->assertDatabaseHas('users', [
            'email' => 'gurubaru@dubes.ac.id',
            'role' => 'tutor',
            'status_akun' => 'aktif',
        ]);
    }

    public function test_admin_can_add_guru_without_nip(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/data-pengguna', [
            'name' => 'Guru Tanpa NIP',
            'email' => 'gurutanpanip@dubes.ac.id',
            'no_hp' => '',
            'nip' => '',
        ]);

        $response->assertRedirect('/admin/data-pengguna');

        $this->assertDatabaseHas('users', [
            'email' => 'gurutanpanip@dubes.ac.id',
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

    public function test_admin_can_update_user(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'status_akun' => 'aktif']);

        $response = $this->actingAs($this->admin)->put("/admin/data-pengguna/{$tutor->id}", [
            'name' => 'Nama Baru Updated',
            'email' => $tutor->email,
            'no_hp' => '+62 821-9999-8888',
            'nip' => '19950505-2021-01',
            'role' => 'tutor',
            'status_akun' => 'aktif',
        ]);

        $response->assertRedirect('/admin/data-pengguna');

        $this->assertDatabaseHas('users', [
            'id' => $tutor->id,
            'name' => 'Nama Baru Updated',
            'no_hp' => '+62 821-9999-8888',
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

        $response = $this->actingAs($this->admin)->put("/admin/data-pengguna/{$otherAdmin->id}", [
            'name' => 'Admin Lain',
            'email' => $otherAdmin->email,
            'role' => 'student',
            'status_akun' => 'aktif',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $otherAdmin->id, 'role' => 'admin']);
    }

    public function test_default_password_generation(): void
    {
        $password = User::generateDefaultPassword('Nadia Safira');
        $this->assertEquals('dbs.nadia.'.date('Y'), $password);
    }
}
