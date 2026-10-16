<?php

namespace App\Http\Controllers;

use App\Enums\MaterialType;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use App\Models\MaterialProgress;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

/**
 * Pustaka materi untuk murid (dan pratinjau untuk guru/admin).
 * Semua materi TERBIT tampil untuk semua murid — tidak bergantung kelas atau jadwal.
 */
class MaterialController extends Controller
{
    /** MIME yang aman ditampilkan inline di browser; selain itu dipaksa unduh. */
    private const INLINE_MIME_PREFIXES = ['application/pdf', 'video/', 'audio/'];

    public function index(Request $request): Response
    {
        $user = $request->user();

        $q = trim((string) $request->query('q', ''));
        $type = MaterialType::tryFrom((string) $request->query('type'));
        $status = in_array($request->query('status'), ['unopened', 'learning', 'completed'], true) ? $request->query('status') : null;
        $topic = trim((string) $request->query('topic', '')) ?: null;
        $sort = in_array($request->query('sort'), ['newest', 'oldest', 'title'], true) ? $request->query('sort') : 'newest';
        $view = $request->query('view') === 'list' ? 'list' : 'grid';

        // ---- Materi yang sedang dibuka di panel viewer ----
        $active = null;
        if ($id = $request->integer('material')) {
            $candidate = Material::with('uploader:id,name')->find($id);

            if ($candidate && Gate::allows('view', $candidate)) {
                if ($user->isStudent()) {
                    MaterialProgress::firstOrCreate(
                        ['material_id' => $candidate->id, 'user_id' => $user->id],
                        ['status' => MaterialProgress::OPENED, 'opened_at' => now()],
                    );
                }
                $candidate->load(['progresses' => fn ($p) => $p->where('user_id', $user->id)]);
                $active = $candidate;
            }
        }

        // ---- Daftar materi ----
        $materials = $this->baseQuery($user->id)
            ->when($type, fn (Builder $query) => $query->where('type', $type->value))
            ->when($topic, fn (Builder $query) => $query->where('topic', $topic))
            ->when($q !== '', function (Builder $query) use ($q) {
                $like = '%'.addcslashes($q, '%_\\').'%';
                $query->where(fn (Builder $w) => $w
                    ->where('title', 'like', $like)
                    ->orWhere('description', 'like', $like)
                    ->orWhere('topic', 'like', $like));
            })
            ->when($status === 'unopened', fn (Builder $query) => $query->whereDoesntHave('progresses', fn ($p) => $p->where('user_id', $user->id)))
            ->when($status === 'learning', fn (Builder $query) => $query->whereHas('progresses', fn ($p) => $p->where('user_id', $user->id)->where('status', MaterialProgress::OPENED)))
            ->when($status === 'completed', fn (Builder $query) => $query->whereHas('progresses', fn ($p) => $p->where('user_id', $user->id)->where('status', MaterialProgress::COMPLETED)))
            ->when($sort === 'newest', fn (Builder $query) => $query->orderByDesc('published_at')->orderByDesc('id'))
            ->when($sort === 'oldest', fn (Builder $query) => $query->orderBy('published_at')->orderBy('id'))
            ->when($sort === 'title', fn (Builder $query) => $query->orderBy('title'))
            ->paginate(9)
            ->withQueryString()
            ->through(fn (Material $m) => MaterialResource::make($m)->resolve());

        return Inertia::render('Materials/Index', [
            'materials' => $materials,
            'active' => $active ? MaterialResource::make($active)->withBody()->resolve() : null,
            'filters' => [
                'q' => $q ?: null, 'type' => $type?->value, 'status' => $status,
                'topic' => $topic, 'sort' => $sort, 'view' => $view,
                'material' => $active?->id,
            ],
            'stats' => $this->stats($user->id),
            'topics' => Material::published()->whereNotNull('topic')
                ->select('topic', DB::raw('count(*) as total'))->groupBy('topic')->orderBy('topic')->get()
                ->map(fn ($t) => ['name' => $t->topic, 'total' => (int) $t->total]),
            'types' => collect(MaterialType::cases())->map(fn (MaterialType $t) => ['value' => $t->value, 'label' => $t->label()]),
        ]);
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
    private function stats(int $userId): array
    {
        $byType = Material::published()->selectRaw('type, count(*) as total')->groupBy('type')->pluck('total', 'type');

        $sum = fn (array $types) => (int) collect($types)->sum(fn ($t) => $byType[$t] ?? 0);

        $myProgress = MaterialProgress::query()
            ->where('user_id', $userId)
            ->whereHas('material', fn ($m) => $m->published())
            ->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        $total = (int) $byType->sum();
        $completed = (int) ($myProgress[MaterialProgress::COMPLETED] ?? 0);

        return [
            'total' => $total,
            'documents' => $sum(['document', 'slide']),
            'media' => $sum(['video', 'audio']),
            'reading' => $sum(['article', 'link']),
            'new_this_week' => Material::published()->where('published_at', '>=', now()->subDays(7))->count(),
            'completed' => $completed,
            'opened' => $completed + (int) ($myProgress[MaterialProgress::OPENED] ?? 0),
            'percent' => $total > 0 ? (int) round($completed / $total * 100) : 0,
        ];
    }
}
