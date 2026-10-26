<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RoomType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RoomRequest;
use App\Models\Room;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    /** Halaman Kelola Ruangan: statistik ringkas, filter, dan tabel ruang / platform. */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));
        $type = $request->query('type');
        $status = $request->query('status');

        $query = Room::query()->withCount('schedules');

        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(fn (Builder $group) => $group
                ->where('name', 'like', $like)
                ->orWhere('location', 'like', $like)
                ->orWhere('platform', 'like', $like));
        }

        if (in_array($type, array_column(RoomType::cases(), 'value'), true)) {
            $query->where('type', $type);
        }

        if (in_array($status, ['active', 'inactive'], true)) {
            $query->where('is_active', $status === 'active');
        }

        match ($request->query('sort')) {
            'oldest' => $query->oldest(),
            'name' => $query->orderBy('name'),
            default => $query->latest(),
        };
        $query->orderBy('id');

        return Inertia::render('Admin/Rooms/Index', [
            'rooms' => $query->paginate(10)->withQueryString()->through(fn (Room $room): array => [
                'id' => $room->id,
                'name' => $room->name,
                'type' => $room->type->value,
                'type_label' => $room->type->label(),
                'location' => $room->location,
                'platform' => $room->platform,
                'capacity' => $room->capacity,
                'is_active' => $room->is_active,
                'schedules_count' => $room->schedules_count,
            ]),
            'filters' => [
                'q' => $search ?: null,
                'type' => in_array($type, array_column(RoomType::cases(), 'value'), true) ? $type : null,
                'status' => in_array($status, ['active', 'inactive'], true) ? $status : null,
                'sort' => $request->query('sort', 'newest'),
            ],
            'stats' => [
                'total' => Room::count(),
                'physical_lab' => Room::whereIn('type', [RoomType::Physical, RoomType::Lab])->where('is_active', true)->count(),
                'online' => Room::where('type', RoomType::Online)->where('is_active', true)->count(),
                'inactive' => Room::where('is_active', false)->count(),
            ],
            'options' => [
                'types' => RoomType::options(),
            ],
        ]);
    }

    public function store(RoomRequest $request): RedirectResponse
    {
        $room = Room::create($request->storageAttributes() + ['is_active' => true]);

        return back()->with('success', [
            'title' => 'Ruangan Tersimpan',
            'message' => sprintf('Ruangan "%s" berhasil ditambahkan.', $room->name),
        ]);
    }

    public function update(RoomRequest $request, Room $room): RedirectResponse
    {
        $room->update($request->storageAttributes());

        return back()->with('success', [
            'title' => 'Perubahan Ruangan Tersimpan',
            'message' => sprintf('Data ruangan "%s" berhasil diperbarui.', $room->name),
        ]);
    }

    public function toggleStatus(Room $room): RedirectResponse
    {
        $room->update(['is_active' => ! $room->is_active]);

        return back()->with('success', [
            'title' => $room->is_active ? 'Ruangan Diaktifkan' : 'Ruangan Dinonaktifkan',
            'message' => $room->is_active
                ? sprintf('Ruangan "%s" kembali muncul di pilihan jadwal.', $room->name)
                : sprintf('Ruangan "%s" tidak lagi muncul di pilihan jadwal.', $room->name),
        ]);
    }

    public function destroy(Room $room): RedirectResponse
    {
        $schedules = $room->schedules()->count();

        if ($schedules > 0) {
            return back()->with('error', [
                'title' => 'Ruangan Tidak Dapat Dihapus',
                'message' => sprintf(
                    'Ruangan "%s" dipakai oleh %d jadwal. Nonaktifkan ruangan ini agar tidak muncul di pilihan jadwal.',
                    $room->name, $schedules
                ),
            ]);
        }

        $name = $room->name;
        $room->delete();

        return back()->with('success', [
            'title' => 'Ruangan Dihapus',
            'message' => sprintf('Ruangan "%s" berhasil dihapus.', $name),
        ]);
    }
}
