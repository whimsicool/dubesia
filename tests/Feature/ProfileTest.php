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

    public function test_admin_profile_offers_photo_upload(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get('/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('profile.can_upload_photo', true)
                ->where('pendaftaran', null)
            );
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

    public function test_user_dapat_menghapus_foto_profil(): void
    {
        Storage::fake('public');
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)->post(route('profile.photo.update'), [
            'photo' => UploadedFile::fake()->image('foto.jpg'),
        ]);

        $path = $student->refresh()->photo_path;
        $this->assertNotNull($path);

        $this->actingAs($student)
            ->delete(route('profile.photo.destroy'))
            ->assertRedirect(route('profile.edit'))
            ->assertSessionHasNoErrors();

        $this->assertNull($student->refresh()->photo_path);
        Storage::disk('public')->assertMissing($path);
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

    public function test_admin_can_save_a_profile_photo(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('profile.photo.update'), [
            'photo' => UploadedFile::fake()->image('admin.png'),
        ])->assertRedirect(route('profile.edit'))->assertSessionHasNoErrors();

        Storage::disk('public')->assertExists($admin->refresh()->photo_path);
    }

    public function test_tutor_can_save_a_photo_without_changing_another_users_photo(): void
    {
        Storage::fake('public');
        $tutor = User::factory()->create(['role' => 'tutor']);
        $other = User::factory()->create();

        $this->actingAs($tutor)->post(route('profile.photo.update'), [
            'photo' => UploadedFile::fake()->image('tutor.webp'),
            'user_id' => $other->id,
        ])->assertSessionHasNoErrors();

        Storage::disk('public')->assertExists($tutor->refresh()->photo_path);
        $this->assertNull($other->refresh()->photo_path);
    }

    public function test_guest_cannot_upload_a_profile_photo(): void
    {
        Storage::fake('public');

        $this->post(route('profile.photo.update'), [
            'photo' => UploadedFile::fake()->image('guest.jpg'),
        ])->assertRedirect(route('login'));

        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_oversized_photo_is_rejected_without_replacing_existing_photo(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['photo_path' => 'profile-photos/original.jpg']);
        Storage::disk('public')->put($user->photo_path, 'original');

        $this->actingAs($user)->post(route('profile.photo.update'), [
            'photo' => UploadedFile::fake()->image('large.jpg')->size(2049),
        ])->assertSessionHasErrors('photo');

        $this->assertSame('profile-photos/original.jpg', $user->refresh()->photo_path);
        Storage::disk('public')->assertExists($user->photo_path);
    }
}
