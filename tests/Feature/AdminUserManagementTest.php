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
        ]);

        $response->assertRedirect('/admin/data-pengguna');

        $this->assertDatabaseHas('users', [
            'email' => 'gurubaru@dubes.ac.id',
            'role' => 'tutor',
            'status_akun' => 'aktif',
        ]);
    }

    public function test_admin_can_add_guru_without_phone(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/data-pengguna', [
            'name' => 'Guru Tanpa Nomor HP',
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
}
