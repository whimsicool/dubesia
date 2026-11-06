<?php

namespace App\Http\Controllers;

use App\Enums\MaterialType;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use App\Models\MaterialProgress;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

/**
 * Pustaka materi untuk murid.
 * Semua materi TERBIT tampil untuk semua murid — tidak bergantung kelas atau jadwal.
 */
class MaterialController extends Controller
{
    /** MIME yang aman ditampilkan inline di browser; selain itu dipaksa unduh. */
    private const INLINE_MIME_PREFIXES = ['application/pdf', 'video/', 'audio/'];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->resolveIndexFilters($request);
        $active = $this->resolveActiveMaterial($request, $user);

        $materials = $this->buildMaterialsQuery($user->id, $filters)
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Material $material) => MaterialResource::make($material)->resolve());

        return Inertia::render('Materials/Index', [
            'materials' => $materials,
            'active' => $active ? MaterialResource::make($active)->withBody()->resolve() : null,
            'filters' => [
                'q' => $filters['q'] ?: null,
                'type' => $filters['type']?->value,
                'status' => $filters['status'],
                'sort' => $filters['sort'],
                'view' => $filters['view'],
                'material' => $active?->id,
            ],
            'stats' => $this->stats(),
            'types' => collect(MaterialType::cases())->map(fn (MaterialType $type) => ['value' => $type->value, 'label' => $type->label()]),
        ]);
    }

    /**
     * @return array{q: string, type: ?MaterialType, status: ?string, sort: string, view: string}
     */
    private function resolveIndexFilters(Request $request): array
    {
        $q = trim((string) $request->query('q', ''));
        $type = MaterialType::tryFrom((string) $request->query('type'));
        $status = in_array($request->query('status'), ['unopened', 'learning', 'completed'], true) ? $request->query('status') : null;
        $sort = in_array($request->query('sort'), ['newest', 'oldest', 'title'], true) ? $request->query('sort') : 'newest';
        $view = $request->query('view') === 'list' ? 'list' : 'grid';

        return [
            'q' => $q,
            'type' => $type,
            'status' => $status,
            'sort' => $sort,
            'view' => $view,
        ];
    }

    private function resolveActiveMaterial(Request $request, $user): ?Material
    {
        if (! $id = $request->integer('material')) {
            return null;
        }

        $candidate = Material::with('uploader:id,name')->find($id);

        if (! $candidate || ! Gate::allows('view', $candidate)) {
            return null;
        }

        if ($user->isStudent()) {
            MaterialProgress::firstOrCreate(
                ['material_id' => $candidate->id, 'user_id' => $user->id],
                ['status' => MaterialProgress::OPENED, 'opened_at' => now()],
            );
        }

        $candidate->load(['progresses' => fn ($progress) => $progress->where('user_id', $user->id)]);

        return $candidate;
    }

    /**
     * @param  array{q: string, type: ?MaterialType, status: ?string, sort: string, view: string}  $filters
     */
    private function buildMaterialsQuery(int $userId, array $filters): Builder
    {
        $q = $filters['q'];
        $type = $filters['type'];
        $status = $filters['status'];
        $sort = $filters['sort'];

        return $this->baseQuery($userId)
            ->when($type, fn (Builder $query) => $query->where('type', $type->value))
            ->when($q !== '', function (Builder $query) use ($q) {
                $like = '%'.addcslashes($q, '%_\\').'%';
                $query->where(fn (Builder $w) => $w
                    ->where('title', 'like', $like)
                    ->orWhere('description', 'like', $like));
            })
            ->when($status === 'unopened', fn (Builder $query) => $query->whereDoesntHave('progresses', fn ($progress) => $progress->where('user_id', $userId)))
            ->when($status === 'learning', fn (Builder $query) => $query->whereHas('progresses', fn ($progress) => $progress->where('user_id', $userId)->where('status', MaterialProgress::OPENED)))
            ->when($status === 'completed', fn (Builder $query) => $query->whereHas('progresses', fn ($progress) => $progress->where('user_id', $userId)->where('status', MaterialProgress::COMPLETED)))
            ->when($sort === 'newest', fn (Builder $query) => $query->orderByDesc('published_at')->orderByDesc('id'))
            ->when($sort === 'oldest', fn (Builder $query) => $query->orderBy('published_at')->orderBy('id'))
            ->when($sort === 'title', fn (Builder $query) => $query->orderBy('title'));
    }

    /** Tampilkan berkas inline (PDF / video / audio) — hanya untuk user yang berhak. */
    public function file(Material $material): BinaryFileResponse
    {
        return $this->serve($material, inline: true);
    }

    public function download(Material $material): BinaryFileResponse
    {
        return $this->serve($material, inline: false);
    }

    /** Tandai selesai / batalkan tanda selesai. */
    public function progress(Request $request, Material $material): RedirectResponse
    {
        Gate::authorize('view', $material);

        $action = $request->validate(['action' => ['required', 'in:complete,uncomplete']])['action'];

        $progress = MaterialProgress::firstOrNew(['material_id' => $material->id, 'user_id' => $request->user()->id]);
        $progress->opened_at ??= now();

        if ($action === 'complete') {
            $progress->status = MaterialProgress::COMPLETED;
            $progress->completed_at = now();
        } else {
            $progress->status = MaterialProgress::OPENED;
            $progress->completed_at = null;
        }

        $progress->save();

        return back();
    }

    /* ------------------------------------------------------------------ */

    private function serve(Material $material, bool $inline): BinaryFileResponse
    {
        Gate::authorize('view', $material);
        abort_unless($material->hasFile() && $material->disk()->exists($material->file_path), 404);

        $mime = (string) $material->file_mime;
        $canInline = $inline && Str::startsWith($mime, self::INLINE_MIME_PREFIXES);
        $name = $material->file_name ?: basename($material->file_path);
        $fallback = str_replace(['%', '/', '\\'], '-', Str::ascii($name));

        // BinaryFileResponse mendukung HTTP Range, sehingga video/audio bisa di-seek.
        return response()->file($material->disk()->path($material->file_path), [
            'Content-Type' => $mime ?: 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => 'sandbox',
            'Cache-Control' => 'private, max-age=3600',
        ])->setContentDisposition(
            $canInline ? ResponseHeaderBag::DISPOSITION_INLINE : ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $name,
            $fallback,
        );
    }

    private function baseQuery(int $userId): Builder
    {
        return Material::published()->with([
            'uploader:id,name',
            'progresses' => fn ($p) => $p->where('user_id', $userId),
        ]);
    }

    /** @return array<string, int> */
    private function stats(): array
    {
        $byType = Material::published()->selectRaw('type, count(*) as total')->groupBy('type')->pluck('total', 'type');

        $sum = fn (array $types) => (int) collect($types)->sum(fn ($t) => $byType[$t] ?? 0);

        return [
            'total' => (int) $byType->sum(),
            'documents' => $sum(['document', 'slide']),
            'media' => $sum(['video', 'audio']),
            'new_this_week' => Material::published()->where('published_at', '>=', now()->subDays(7))->count(),
        ];
    }
}
