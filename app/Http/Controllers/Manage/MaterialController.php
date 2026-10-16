<?php

namespace App\Http\Controllers\Manage;

use App\Enums\MaterialType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\MaterialRequest;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kelola materi (guru & admin). Materi bersifat umum: tidak terikat kelas / jadwal.
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

        $counts = Material::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        return Inertia::render('Manage/Materials/Index', [
            'routePrefix' => $request->routeIs('tutor.materials.*') ? 'tutor.materials' : 'manage.materials',
            'materials' => $materials,
            'filters' => ['q' => $q ?: null, 'type' => $type?->value, 'status' => $status, 'scope' => $scope],
            'stats' => [
                'total' => (int) $counts->sum(),
                'published' => (int) ($counts[Material::STATUS_PUBLISHED] ?? 0),
                'draft' => (int) ($counts[Material::STATUS_DRAFT] ?? 0),
                'mine' => Material::where('user_id', $user->id)->count(),
            ],
            'types' => $this->typeOptions(),
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', Material::class);

        return Inertia::render('Manage/Materials/Form', [
            'routePrefix' => $request->routeIs('tutor.materials.*') ? 'tutor.materials' : 'manage.materials',
            'material' => null,
            'options' => $this->formOptions(),
        ]);
    }

    public function store(MaterialRequest $request): RedirectResponse
    {
        $material = $this->persist(new Material(['user_id' => $request->user()->id]), $request);

        return redirect()->route($this->routePrefix($request).'.index')->with('success', [
            'title' => $material->isPublished() ? 'Materi Diterbitkan' : 'Draft Tersimpan',
            'message' => $material->isPublished()
                ? sprintf('"%s" sekarang tersedia untuk seluruh murid.', $material->title)
                : sprintf('"%s" disimpan sebagai draft dan belum terlihat oleh murid.', $material->title),
        ]);
    }

    public function edit(Request $request, Material $material): Response
    {
        Gate::authorize('update', $material);

        return Inertia::render('Manage/Materials/Form', [
            'routePrefix' => $request->routeIs('tutor.materials.*') ? 'tutor.materials' : 'manage.materials',
            'material' => MaterialResource::make($material->load('uploader:id,name'))->withBody()->resolve(),
            'options' => $this->formOptions(),
        ]);
    }

    public function update(MaterialRequest $request, Material $material): RedirectResponse
    {
        $this->persist($material, $request);

        return redirect()->route($this->routePrefix($request).'.index')->with('success', [
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

    private function routePrefix(Request $request): string
    {
        return $request->routeIs('tutor.materials.*') ? 'tutor.materials' : 'manage.materials';
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
