<?php

namespace Tests\Feature;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private function studentWithRegistration(string $level = 'Middle Intermediate'): User
    {
        $student = User::factory()->create([
            'role' => 'student',
            'class_level' => $level,
            'name' => 'Ayu Lestari',
        ]);

        Pendaftaran::create([
            'user_id' => $student->id,
            'nama_lengkap' => 'Ayu Lestari',
            'tanggal_lahir' => '2005-04-12',
            'email' => $student->email,
            'no_whatsapp' => '6281234567890',
            'alamat' => 'Jl. Merdeka 1',
            'asal_institusi' => 'SMA Negeri 1',
            'program' => 'toefl_ielts',
            'bukti_pembayaran' => 'bukti/pembayaran.jpg',
            'biaya' => 400000,
            'status' => Pendaftaran::STATUS_TERVERIFIKASI,
        ]);

        return $student;
    }

    public function test_profile_page_shows_read_only_data_and_registration(): void
    {
        $student = $this->studentWithRegistration();

        $this->actingAs($student)
            ->get('/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Profile/Edit')
                ->where('profile.name', 'Ayu Lestari')
                ->where('profile.class_level', 'Middle Intermediate')
                ->where('profile.can_upload_photo', true)
                ->where('pendaftaran.asal_institusi', 'SMA Negeri 1')
                ->where('pendaftaran.program', 'TOEFL & IELTS Mastery')
                ->where('pendaftaran.status_label', 'Terverifikasi')
            );
    }

    public function test_admin_dapat_mengunggah_foto_profil(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get('/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('profile.can_upload_photo', true)
                ->where('pendaftaran', null)
            );

        $this->actingAs($admin)
            ->post(route('profile.photo.update'), [
                'photo' => UploadedFile::fake()->image('admin.jpg'),
            ])
            ->assertSessionHasNoErrors();

        $this->assertNotNull($admin->refresh()->photo_path);
    }

    public function test_student_can_upload_a_profile_photo(): void
    {
        Storage::fake('public');
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)
            ->post(route('profile.photo.update'), [
                'photo' => UploadedFile::fake()->image('foto.jpg'),
            ])
            ->assertRedirect(route('profile.edit'))
            ->assertSessionHasNoErrors();

        $student->refresh();

        $this->assertNotNull($student->photo_path);
        Storage::disk('public')->assertExists($student->photo_path);
        $this->assertStringContainsString($student->photo_path, $student->avatar_url);
    }

    public function test_replacing_a_photo_removes_the_previous_file(): void
    {
        Storage::fake('public');
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)->post(route('profile.photo.update'), [
            'photo' => UploadedFile::fake()->image('lama.jpg'),
        ]);

        $oldPath = $student->refresh()->photo_path;

        $this->actingAs($student)->post(route('profile.photo.update'), [
            'photo' => UploadedFile::fake()->image('baru.jpg'),
        ]);

        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($student->refresh()->photo_path);
    }

    public function test_profile_photo_must_be_an_image(): void
    {
        Storage::fake('public');
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)
            ->post(route('profile.photo.update'), [
                'photo' => UploadedFile::fake()->create('bukti.pdf', 200, 'application/pdf'),
            ])
            ->assertSessionHasErrors('photo');

        $this->assertNull($student->refresh()->photo_path);
    }

    public function test_profile_information_cannot_be_edited(): void
    {
        $student = User::factory()->create(['role' => 'student', 'name' => 'Nama Asli']);

        $this->actingAs($student)
            ->patch('/profile', ['name' => 'Nama Baru', 'email' => 'baru@example.com'])
            ->assertStatus(405);

        $this->assertSame('Nama Asli', $student->refresh()->name);
    }
}
