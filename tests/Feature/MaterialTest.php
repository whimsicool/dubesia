<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\MaterialProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MaterialTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake(config('dubesia.materials.disk'));
    }

    private function user(string $role): User
    {
        return User::factory()->create(['role' => $role]);
    }

    private function payload(array $override = []): array
    {
        return array_merge([
            'type' => 'article',
            'title' => 'Etiket Diplomatik',
            'description' => 'Ringkasan',
            'topic' => 'Protocol',
            'level' => 'C1',
            'body' => "# Judul\n\nIsi materi",
            'status' => 'published',
        ], $override);
    }

    private function material(User $owner, array $override = []): Material
    {
        return Material::create(array_merge([
            'user_id' => $owner->id,
            'type' => 'article',
            'title' => 'Materi Contoh',
            'body' => 'Isi',
            'status' => 'published',
            'published_at' => now(),
        ], $override));
    }

    /* ----------------------------- akses ----------------------------- */

    public function test_guest_is_redirected(): void
    {
        $this->get(route('materials.index'))->assertRedirect('/login');
        $this->get(route('tutor.materials.index'))->assertRedirect('/login');
    }

    public function test_student_cannot_access_manage_pages(): void
    {
        $student = $this->user('student');

        $this->actingAs($student)->get(route('tutor.materials.index'))->assertForbidden();
        $this->actingAs($student)->get(route('tutor.materials.create'))->assertForbidden();
        $this->actingAs($student)->post(route('tutor.materials.store'), $this->payload())->assertForbidden();
    }

    public function test_tutor_can_open_manage_page(): void
    {
        $tutor = $this->user('tutor');
        $this->material($tutor);

        $this->actingAs($tutor)->get(route('tutor.materials.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Manage/Materials/Index')->has('materials.data', 1));
    }

    /* ----------------------------- membuat ----------------------------- */

    public function test_tutor_creates_article_without_class_or_schedule(): void
    {
        $tutor = $this->user('tutor');

        $this->actingAs($tutor)->post(route('tutor.materials.store'), $this->payload())
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('tutor.materials.index'));

        $material = Material::firstOrFail();
        $this->assertSame($tutor->id, $material->user_id);
        $this->assertSame('published', $material->status);
        $this->assertNotNull($material->published_at);
    }

    public function test_tutor_uploads_pdf_document(): void
    {
        $tutor = $this->user('tutor');

        $this->actingAs($tutor)->post(route('tutor.materials.store'), $this->payload([
            'type' => 'document',
            'body' => null,
            'file' => UploadedFile::fake()->create('modul.pdf', 200, 'application/pdf'),
        ]))->assertSessionHasNoErrors();

        $material = Material::firstOrFail();
        $this->assertSame('modul.pdf', $material->file_name);
        $this->assertSame(204800, $material->file_size);
        Storage::disk(config('dubesia.materials.disk'))->assertExists($material->file_path);
    }

    public function test_file_type_requires_file_or_url(): void
    {
        $this->actingAs($this->user('tutor'))
            ->post(route('tutor.materials.store'), $this->payload(['type' => 'video', 'body' => null]))
            ->assertSessionHasErrors('file');
    }

    public function test_video_can_use_external_url_instead_of_file(): void
    {
        $this->actingAs($this->user('tutor'))
            ->post(route('tutor.materials.store'), $this->payload([
                'type' => 'video', 'body' => null, 'external_url' => 'https://youtu.be/aqz-KE-bpKQ', 'duration_minutes' => 10,
            ]))->assertSessionHasNoErrors();

        $this->assertSame('https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ', Material::firstOrFail()->embed_url);
    }

    public function test_disallowed_file_format_is_rejected(): void
    {
        $this->actingAs($this->user('tutor'))
            ->post(route('tutor.materials.store'), $this->payload([
                'type' => 'document', 'body' => null,
                'file' => UploadedFile::fake()->create('virus.exe', 10, 'application/x-msdownload'),
            ]))->assertSessionHasErrors('file');

        $this->assertDatabaseCount('materials', 0);
    }

    public function test_article_requires_body_and_link_requires_valid_url(): void
    {
        $tutor = $this->user('tutor');

        $this->actingAs($tutor)->post(route('tutor.materials.store'), $this->payload(['body' => '']))->assertSessionHasErrors('body');
        $this->actingAs($tutor)->post(route('tutor.materials.store'), $this->payload(['type' => 'link', 'body' => null, 'external_url' => 'javascript:alert(1)']))
            ->assertSessionHasErrors('external_url');
    }

    /* ----------------------------- otorisasi ubah / hapus ----------------------------- */

    public function test_tutors_share_one_material_library(): void
    {
        $owner = $this->user('tutor');
        $colleague = $this->user('tutor');
        $material = $this->material($owner);

        $this->actingAs($colleague)->get(route('tutor.materials.edit', $material))->assertOk();
        $this->actingAs($colleague)
            ->put(route('tutor.materials.update', $material), $this->payload(['title' => 'Diubah Rekan Tutor']))
            ->assertSessionHasNoErrors();

        $this->assertSame('Diubah Rekan Tutor', $material->fresh()->title);
    }

    public function test_admin_cannot_manage_materials(): void
    {
        $this->actingAs($this->user('admin'))->get(route('tutor.materials.index'))->assertForbidden();
    }

    public function test_changing_type_to_article_removes_old_file(): void
    {
        $tutor = $this->user('tutor');
        $this->actingAs($tutor)->post(route('tutor.materials.store'), $this->payload([
            'type' => 'document', 'body' => null, 'file' => UploadedFile::fake()->create('a.pdf', 10, 'application/pdf'),
        ]));
        $material = Material::firstOrFail();
        $path = $material->file_path;

        $this->actingAs($tutor)->put(route('tutor.materials.update', $material), $this->payload(['type' => 'article']))->assertSessionHasNoErrors();

        Storage::disk(config('dubesia.materials.disk'))->assertMissing($path);
        $this->assertNull($material->fresh()->file_path);
    }

    public function test_replacing_file_deletes_old_file(): void
    {
        $tutor = $this->user('tutor');
        $this->actingAs($tutor)->post(route('tutor.materials.store'), $this->payload([
            'type' => 'document', 'body' => null, 'file' => UploadedFile::fake()->create('a.pdf', 10, 'application/pdf'),
        ]));
        $material = Material::firstOrFail();
        $old = $material->file_path;

        $this->actingAs($tutor)->put(route('tutor.materials.update', $material), $this->payload([
            'type' => 'document', 'body' => null, 'file' => UploadedFile::fake()->create('b.pdf', 10, 'application/pdf'),
        ]))->assertSessionHasNoErrors();

        $material->refresh();
        Storage::disk(config('dubesia.materials.disk'))->assertMissing($old);
        Storage::disk(config('dubesia.materials.disk'))->assertExists($material->file_path);
        $this->assertSame('b.pdf', $material->file_name);
    }

    public function test_delete_removes_file_and_progress(): void
    {
        $tutor = $this->user('tutor');
        $student = $this->user('student');

        $this->actingAs($tutor)->post(route('tutor.materials.store'), $this->payload([
            'type' => 'document', 'body' => null, 'file' => UploadedFile::fake()->create('a.pdf', 10, 'application/pdf'),
        ]));
        $material = Material::firstOrFail();
        MaterialProgress::create(['material_id' => $material->id, 'user_id' => $student->id, 'status' => 'opened']);

        $this->actingAs($tutor)->delete(route('tutor.materials.destroy', $material))->assertSessionHas('success');

        $this->assertDatabaseCount('materials', 0);
        $this->assertDatabaseCount('material_progress', 0);
        Storage::disk(config('dubesia.materials.disk'))->assertMissing($material->file_path);
    }

    public function test_publish_toggle(): void
    {
        $tutor = $this->user('tutor');
        $material = $this->material($tutor, ['status' => 'draft', 'published_at' => null]);

        $this->actingAs($tutor)->patch(route('tutor.materials.publish', $material));
        $this->assertSame('published', $material->fresh()->status);
        $this->assertNotNull($material->fresh()->published_at);

        $this->actingAs($tutor)->patch(route('tutor.materials.publish', $material));
        $this->assertSame('draft', $material->fresh()->status);
    }

    /* ----------------------------- pustaka murid ----------------------------- */

    public function test_students_see_all_published_materials_regardless_of_class(): void
    {
        $tutor = $this->user('tutor');
        $this->material($tutor, ['title' => 'Terbit 1']);
        $this->material($tutor, ['title' => 'Terbit 2']);
        $this->material($tutor, ['title' => 'Draft', 'status' => 'draft']);

        $this->actingAs($this->user('student'))->get(route('materials.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Materials/Index')
                ->has('materials.data', 2)
                ->where('stats.total', 2)
                ->where('active', null));
    }

    public function test_search_type_and_status_filters(): void
    {
        $tutor = $this->user('tutor');
        $student = $this->user('student');
        $a = $this->material($tutor, ['title' => 'Rhetoric Dasar', 'topic' => 'Speaking']);
        $this->material($tutor, ['title' => 'Video Pidato', 'type' => 'video', 'body' => null, 'external_url' => 'https://vimeo.com/1']);
        MaterialProgress::create(['material_id' => $a->id, 'user_id' => $student->id, 'status' => 'completed']);

        $this->actingAs($student)->get(route('materials.index', ['q' => 'rhetoric']))
            ->assertInertia(fn (Assert $page) => $page->has('materials.data', 1));
        $this->actingAs($student)->get(route('materials.index', ['type' => 'video']))
            ->assertInertia(fn (Assert $page) => $page->has('materials.data', 1)->where('materials.data.0.title', 'Video Pidato'));
        $this->actingAs($student)->get(route('materials.index', ['status' => 'completed']))
            ->assertInertia(fn (Assert $page) => $page->has('materials.data', 1)->where('materials.data.0.progress_status', 'completed'));
        $this->actingAs($student)->get(route('materials.index', ['status' => 'unopened']))
            ->assertInertia(fn (Assert $page) => $page->has('materials.data', 1)->where('materials.data.0.title', 'Video Pidato'));
    }

    public function test_opening_a_material_records_progress_for_students_only(): void
    {
        $tutor = $this->user('tutor');
        $student = $this->user('student');
        $material = $this->material($tutor);

        $this->actingAs($student)->get(route('materials.index', ['material' => $material->id]))
            ->assertInertia(fn (Assert $page) => $page->where('active.id', $material->id)->where('active.body', 'Isi'));
        $this->assertDatabaseHas('material_progress', ['material_id' => $material->id, 'user_id' => $student->id, 'status' => 'opened']);

        $this->actingAs($tutor)->get(route('materials.index', ['material' => $material->id]))->assertForbidden();
        $this->assertDatabaseCount('material_progress', 1);
    }

    public function test_student_cannot_open_draft(): void
    {
        $draft = $this->material($this->user('tutor'), ['status' => 'draft']);

        $this->actingAs($this->user('student'))->get(route('materials.index', ['material' => $draft->id]))
            ->assertInertia(fn (Assert $page) => $page->where('active', null));
    }

    public function test_complete_and_uncomplete(): void
    {
        $student = $this->user('student');
        $material = $this->material($this->user('tutor'));

        $this->actingAs($student)->post(route('materials.progress', $material), ['action' => 'complete'])->assertRedirect();
        $this->assertDatabaseHas('material_progress', ['material_id' => $material->id, 'user_id' => $student->id, 'status' => 'completed']);

        $this->actingAs($student)->post(route('materials.progress', $material), ['action' => 'uncomplete']);
        $this->assertDatabaseHas('material_progress', ['material_id' => $material->id, 'user_id' => $student->id, 'status' => 'opened']);
    }

    /* ----------------------------- berkas ----------------------------- */

    private function materialWithFile(User $owner, array $override = []): Material
    {
        $this->actingAs($owner)->post(route('tutor.materials.store'), $this->payload(array_merge([
            'type' => 'document', 'body' => null, 'file' => UploadedFile::fake()->create('modul.pdf', 10, 'application/pdf'),
        ], $override)));

        return Material::firstOrFail();
    }

    public function test_student_can_view_and_download_published_file(): void
    {
        $material = $this->materialWithFile($this->user('tutor'));
        $student = $this->user('student');

        $view = $this->actingAs($student)->get(route('materials.file', $material))->assertOk();
        $this->assertStringContainsString('inline', $view->headers->get('Content-Disposition'));
        $this->assertSame('nosniff', $view->headers->get('X-Content-Type-Options'));

        $download = $this->actingAs($student)->get(route('materials.download', $material))->assertOk();
        $this->assertStringContainsString('attachment', $download->headers->get('Content-Disposition'));
    }

    public function test_student_cannot_fetch_file_of_draft(): void
    {
        $material = $this->materialWithFile($this->user('tutor'), ['status' => 'draft']);

        $this->actingAs($this->user('student'))->get(route('materials.file', $material))->assertForbidden();
    }

    public function test_guest_cannot_fetch_file(): void
    {
        $material = $this->materialWithFile($this->user('tutor'));
        $this->app['auth']->forgetGuards();

        $this->get(route('materials.file', $material))->assertRedirect('/login');
    }
}
