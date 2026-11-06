<?php

namespace Tests\Feature;

use App\Models\CourseClass;
use App\Models\Pendaftaran;
use App\Models\StudentGrade;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_summarises_the_registration_queue(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student', 'name' => 'Ayu Lestari']);

        Pendaftaran::create([
            'user_id' => $student->id,
            'nama_lengkap' => 'Ayu Lestari',
            'tanggal_lahir' => '2005-04-12',
            'email' => $student->email,
            'no_whatsapp' => '081234567890',
            'alamat' => 'Jl. Merdeka 1',
            'program' => 'reguler',
            'bukti_pembayaran' => 'bukti/pembayaran.jpg',
            'status' => Pendaftaran::STATUS_MENUNGGU,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('dashboard.role', 'admin')
                ->where('dashboard.stats', fn (Collection $stats) => $stats->firstWhere('key', 'pending')['value'] === 1)
                ->where('dashboard.panel.tabs', fn (Collection $tabs) => $tabs->firstWhere('key', 'pendaftaran')['count'] === 1)
                ->where('dashboard.panel.tabs.0.items.0.title', 'Ayu Lestari')
            );
    }

    public function test_tutor_dashboard_lists_only_classes_they_teach(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        $otherTutor = User::factory()->create(['role' => 'tutor']);

        $mine = CourseClass::create(['name' => 'English Speaking A', 'is_active' => true]);
        $theirs = CourseClass::create(['name' => 'Kelas Tutor Lain', 'is_active' => true]);

        $tutor->teachingClasses()->attach($mine->id);
        $otherTutor->teachingClasses()->attach($theirs->id);

        $this->actingAs($tutor)
            ->get(route('tutor.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('dashboard.role', 'tutor')
                ->where('dashboard.panel.tabs', fn (Collection $tabs) => collect($tabs->firstWhere('key', 'kelas')['items'])
                    ->pluck('title')
                    ->all() === ['English Speaking A'])
            );

        // Halaman "Kelas Saya" tetap tersedia setelah dashboard tutor memakai route sendiri.
        $this->actingAs($tutor)->get(route('tutor.classes.index'))->assertOk();
    }

    public function test_student_dashboard_averages_only_their_own_grades(): void
    {
        $student = User::factory()->create(['role' => 'student', 'class_level' => 'Middle Intermediate']);
        $otherStudent = User::factory()->create(['role' => 'student']);

        StudentGrade::create(['student_id' => $student->id, 'subject' => 'Speaking', 'score' => 90, 'grade' => 'A']);
        StudentGrade::create(['student_id' => $student->id, 'subject' => 'Writing', 'score' => 80, 'grade' => 'B']);
        StudentGrade::create(['student_id' => $otherStudent->id, 'subject' => 'Speaking', 'score' => 50, 'grade' => 'D']);

        $this->actingAs($student)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('dashboard.role', 'student')
                ->where('dashboard.stats', fn (Collection $stats) => $stats->firstWhere('key', 'average')['value'] === '85')
                ->where('dashboard.panel.tabs', fn (Collection $tabs) => $tabs->firstWhere('key', 'nilai')['count'] === 2)
            );
    }

    public function test_dashboard_routes_are_scoped_to_the_user_role(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)->get(route('admin.dashboard'))->assertForbidden();
        $this->actingAs($student)->get(route('tutor.dashboard'))->assertForbidden();
        $this->actingAs($student)->get(route('dashboard'))->assertOk();
    }
}
