<?php

namespace App\Http\Controllers\Manage;

use App\Enums\MaterialType;
use App\Http\Controllers\MaterialController as StudentMaterialController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\MaterialRequest;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kelola materi oleh tutor. Materi bersifat umum: tidak terikat kelas / jadwal.
 */
class MaterialController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('create', Material::class);

        $user = $request->user();
        $q = trim((string) $request->query('q', ''));
        $type = MaterialType::tryFrom((string) $request->query('type'));
        $status = in_array($request->query('status'), [Material::STATUS_DRAFT, Material::STATUS_PUBLISHED], true)
            ? $request->query('status') : null;
        $scope = $request->query('scope') === 'mine' ? 'mine' : 'all';
        $view = in_array($request->query('view'), ['list', 'grid'], true) ? $request->query('view') : 'list';

        $materials = Material::query()
            ->with('uploader:id,name')
            ->withCount([
                'progresses as opened_count',
                'progresses as completed_count' => fn (Builder $p) => $p->where('status', 'completed'),
            ])
            ->when($scope === 'mine', fn (Builder $query) => $query->where('user_id', $user->id))
            ->when($type, fn (Builder $query) => $query->where('type', $type->value))
            ->when($status, fn (Builder $query) => $query->where('status', $status))
            ->when($q !== '', function (Builder $query) use ($q) {
                $like = '%'.addcslashes($q, '%_\\').'%';
                $query->where(fn (Builder $w) => $w
                    ->where('title', 'like', $like)
                    ->orWhere('description', 'like', $like)
                    ->orWhere('topic', 'like', $like));
            })
            ->latest('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Material $m) => MaterialResource::make($m)->resolve());

        return Inertia::render('Manage/Materials/Index', [
            'routePrefix' => 'tutor.materials',
            'materials' => $materials,
            'filters' => ['q' => $q ?: null, 'type' => $type?->value, 'status' => $status, 'scope' => $scope, 'view' => $view],
            'types' => $this->typeOptions(),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Material::class);

        return Inertia::render('Manage/Materials/Form', [
            'routePrefix' => 'tutor.materials',
            'material' => null,
            'options' => $this->formOptions(),
        ]);
    }

    public function store(MaterialRequest $request): RedirectResponse
    {
        $material = $this->persist(new Material(['user_id' => $request->user()->id]), $request);

        return redirect()->route('tutor.materials.index')->with('success', [
            'title' => $material->isPublished() ? 'Materi Diterbitkan' : 'Draft Tersimpan',
            'message' => $material->isPublished()
                ? sprintf('"%s" sekarang tersedia untuk seluruh murid.', $material->title)
                : sprintf('"%s" disimpan sebagai draft dan belum terlihat oleh murid.', $material->title),
        ]);
    }

    public function edit(Material $material): Response
    {
        Gate::authorize('update', $material);

        return Inertia::render('Manage/Materials/Form', [
            'routePrefix' => 'tutor.materials',
            'material' => MaterialResource::make($material->load('uploader:id,name'))->withBody()->resolve(),
            'options' => $this->formOptions(),
        ]);
    }

    public function preview(Material $material): Response
    {
        Gate::authorize('view', $material);

        return Inertia::render('Tutor/Materials/Preview', [
            'material' => MaterialResource::make($material->load('uploader:id,name'))->withBody()->resolve(),
        ]);
    }

    public function file(StudentMaterialController $materials, Material $material): BinaryFileResponse
    {
        return $materials->file($material);
    }

    public function download(StudentMaterialController $materials, Material $material): BinaryFileResponse
    {
        return $materials->download($material);
    }

    public function update(MaterialRequest $request, Material $material): RedirectResponse
    {
        $this->persist($material, $request);

        return redirect()->route('tutor.materials.index')->with('success', [
            'title' => 'Materi Diperbarui',
            'message' => sprintf('Perubahan pada "%s" berhasil disimpan.', $material->title),
        ]);
    }

    public function destroy(Material $material): RedirectResponse
    {
        Gate::authorize('delete', $material);

        $title = $material->title;
        $material->delete(); // berkas fisik ikut terhapus (event deleting); progres murid ikut terhapus (cascade)

        return back()->with('success', [
            'title' => 'Materi Dihapus',
            'message' => sprintf('"%s" beserta berkas dan progres belajarnya telah dihapus.', $title),
        ]);
    }

    /** Terbitkan / tarik kembali ke draft. */
    public function publish(Material $material): RedirectResponse
    {
        Gate::authorize('update', $material);

        $publishing = ! $material->isPublished();

        $material->update([
            'status' => $publishing ? Material::STATUS_PUBLISHED : Material::STATUS_DRAFT,
            'published_at' => $publishing ? ($material->published_at ?? now()) : $material->published_at,
        ]);

        return back()->with('success', [
            'title' => $publishing ? 'Materi Diterbitkan' : 'Materi Ditarik ke Draft',
            'message' => $publishing
                ? sprintf('"%s" sekarang terlihat oleh seluruh murid.', $material->title)
                : sprintf('"%s" tidak lagi terlihat oleh murid.', $material->title),
        ]);
    }

    /* ------------------------------------------------------------------ */

    private function persist(Material $material, MaterialRequest $request): Material
    {
        $data = $request->validated();
        $type = MaterialType::from($data['type']);
        $file = $request->file('file');
        unset($data['file']);

        // Bersihkan field yang tidak relevan untuk tipe terpilih.
        if ($type !== MaterialType::Article) {
            $data['body'] = null;              // isi teks hanya untuk artikel
        }
        if ($type === MaterialType::Article) {
            $data['external_url'] = null;
        }
        if (! $type->usesFile()) {
            $data['duration_minutes'] = null;
            $data['page_count'] = null;
        }

        DB::transaction(function () use ($material, $data, $type, $file) {
            $material->fill($data);

            if (! $type->usesFile()) {
                // Pindah ke tipe tanpa berkas => hapus berkas lama.
                $material->deleteFile();
                $material->fill(['file_path' => null, 'file_name' => null, 'file_mime' => null, 'file_size' => null]);
            }

            $oldPath = $material->getOriginal('file_path');

            if ($file instanceof UploadedFile) {
                $material->fill([
                    'file_path' => $file->store(config('dubesia.materials.directory'), config('dubesia.materials.disk')),
                    'file_name' => $file->getClientOriginalName(),
                    'file_mime' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);

                if ($oldPath) {
                    $material->disk()->delete($oldPath);
                }
            }

            if ($material->status === Material::STATUS_PUBLISHED && ! $material->published_at) {
                $material->published_at = now();
            }

            $material->save();
        });

        return $material;
    }

    /** @return array<int, array{value: string, label: string}> */
    private function typeOptions(): array
    {
        return collect(MaterialType::cases())
            ->map(fn (MaterialType $t) => ['value' => $t->value, 'label' => $t->label()])
            ->all();
    }

    /** @return array<string, mixed> */
    private function formOptions(): array
    {
        return [
            'types' => collect(MaterialType::cases())->map(fn (MaterialType $t) => [
                'value' => $t->value,
                'label' => $t->label(),
                'uses_file' => $t->usesFile(),
                'extensions' => $t->allowedExtensions(),
            ])->all(),
            'levels' => config('dubesia.materials.levels'),
            'topics' => Material::query()->whereNotNull('topic')->distinct()->orderBy('topic')->pluck('topic'),
            'max_upload_mb' => (int) round(config('dubesia.materials.max_upload_kb') / 1024),
        ];
    }
}
