<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProductionAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_be_created_without_demo_accounts(): void
    {
        $this->artisan('dubesia:create-admin')
            ->expectsQuestion('Nama admin', 'Admin Produksi')
            ->expectsQuestion('Email admin', 'admin@example.com')
            ->expectsQuestion('Kata sandi (minimal 12 karakter)', 'Production-test-123!')
            ->expectsQuestion('Ulangi kata sandi', 'Production-test-123!')
            ->assertSuccessful();

        $admin = User::where('email', 'admin@example.com')->sole();
        $this->assertTrue($admin->isAdmin());
        $this->assertTrue($admin->is_active);
        $this->assertSame('aktif', $admin->status_akun);
        $this->assertTrue(Hash::check('Production-test-123!', $admin->password));
        $this->assertDatabaseCount('users', 1);
    }

    public function test_existing_account_is_never_promoted_or_overwritten(): void
    {
        $student = User::factory()->create(['email' => 'student@example.com', 'role' => User::ROLE_STUDENT]);
        $originalPassword = $student->password;
        $this->artisan('dubesia:create-admin')
            ->expectsQuestion('Nama admin', 'Replacement')
            ->expectsQuestion('Email admin', $student->email)
            ->expectsQuestion('Kata sandi (minimal 12 karakter)', 'Production-test-123!')
            ->expectsQuestion('Ulangi kata sandi', 'Production-test-123!')
            ->assertFailed();

        $this->assertSame(User::ROLE_STUDENT, $student->fresh()->role);
        $this->assertSame($originalPassword, $student->fresh()->password);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_mismatched_password_is_rejected(): void
    {
        $this->artisan('dubesia:create-admin')
            ->expectsQuestion('Nama admin', 'Admin')
            ->expectsQuestion('Email admin', 'admin@example.com')
            ->expectsQuestion('Kata sandi (minimal 12 karakter)', 'Production-test-123!')
            ->expectsQuestion('Ulangi kata sandi', 'different-password')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }
}
