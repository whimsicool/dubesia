<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RoomType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use App\Models\Schedule;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kelola Ruang / Platform (admin) — mengikuti sequence diagram "Kelola Ruang":
 *   1  index()        BukaMenu → MintaDaftarRuang → AmbilDaftarRuang → TampilkanDaftarRuang
 *   3  store()        KirimDataRuang → ValidasiDataRuang → SimpanRuang
 *   4  show()         MintaDetailRuang → AmbilDetailRuang           (data awal form ubah)
 *   5  update()       KirimPerubahanRuang → ValidasiDataRuang → PerbaruiRuang
 *   7  toggleActive() / destroy()   PeriksaJadwalPemakaian → TolakPenghapusan | NonaktifkanAtauHapusRuang
 *   7.3 schedules()   TampilkanJadwalTerkait (jadwal yang memakai ruang)
 */
class RoomController extends Controller
{
    /* ------------------------------------------------------------------
     | 1. Daftar ruang
     | ---------------------------------------------------------------- */
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $type = RoomType::tryFrom((string) $request->query('type'))?->value;
        $status = in_array($request->query('status'), ['active', 'inactive'], true) ? $request->query('status') : null;
        $sort = in_array($request->query('sort'), ['name', 'capacity'], true) ? $request->query('sort') : 'newest';

        $rooms = Room::query()
            ->withCount('schedules')
            ->when($type, fn (Builder $query) => $query->where('type', $type))
            ->when($status, fn (Builder $query) => $query->where('is_active', $status === 'active'))
            ->when($q !== '', function (Builder $query) use ($q) {
                $like = '%'.addcslashes($q, '%_\\').'%';
                $query->where(fn (Builder $w) => $w
                    ->where('name', 'like', $like)
                    ->orWhere('location', 'like', $like)
                    ->orWhere('platform', 'like', $like));
            })
            ->when($sort === 'name', fn (Builder $query) => $query->orderBy('name'))
            ->when($sort === 'capacity', fn (Builder $query) => $query->orderByDesc('capacity')->orderBy('name'))
            ->when($sort === 'newest', fn (Builder $query) => $query->orderByDesc('id'))
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Room $r) => RoomResource::make($r)->resolve());

        $active = Room::where('is_active', true);

        return Inertia::render('Admin/Rooms/Index', [
            'rooms' => $rooms,
            'filters' => ['q' => $q ?: null, 'type' => $type, 'status' => $status, 'sort' => $sort],
            'stats' => [
                'total' => Room::count(),
                'physical' => (clone $active)->whereIn('type', [RoomType::Physical->value, RoomType::Lab->value])->count(),
                'online' => (clone $active)->where('type', RoomType::Online->value)->count(),
                'inactive' => Room::where('is_active', false)->count(),
            ],
            'options' => ['types' => RoomType::options()],
        ]);
    }

    /* ------------------------------------------------------------------
     | 3. Tambah ruang
     | ---------------------------------------------------------------- */
    public function store(RoomRequest $request): RedirectResponse
    {
        $room = Room::create($request->roomData() + ['is_active' => true]);

        return back()->with('success', [
            'title' => 'Ruangan Tersimpan',
            'message' => sprintf('Ruangan "%s" berhasil ditambahkan.', $room->name),
        ]);
    }

    /* ------------------------------------------------------------------
     | 4. Detail ruang untuk form ubah — JSON
     | ---------------------------------------------------------------- */
    public function show(Room $room): JsonResponse
    {
        return response()->json(['data' => RoomResource::make($room->loadCount('schedules'))->resolve()]);
    }

    /* ------------------------------------------------------------------
     | 5. Ubah ruang
     | ---------------------------------------------------------------- */
    public function update(RoomRequest $request, Room $room): RedirectResponse
    {
        $room->update($request->roomData());

        return back()->with('success', [
            'title' => 'Perubahan Ruangan Tersimpan',
            'message' => sprintf('Data ruangan "%s" berhasil diperbarui.', $room->name),
        ]);
    }

    /* ------------------------------------------------------------------
     | 7.3 Jadwal yang memakai ruang — JSON (untuk "TampilkanJadwalTerkait")
     | ---------------------------------------------------------------- */
    public function schedules(Room $room): JsonResponse
    {
        $days = config('dubesia.days');

        $all = $room->schedules()->with(['semester:id,name,is_active', 'instructor:id,name'])->get();

        // Semester aktif lebih dulu, lalu urut hari & jam.
        $schedules = $all
            ->sortBy([
                fn ($a, $b) => (int) ($b->semester?->is_active) <=> (int) ($a->semester?->is_active),
                ['day_of_week', 'asc'],
                ['start_time', 'asc'],
            ])
            ->take(50)
            ->values()
            ->map(fn (Schedule $s) => [
                'id' => $s->id,
                'title' => $s->title,
                'class_name' => $s->class_name,
                'day' => $days[$s->day_of_week] ?? '-',
                'start_time' => substr($s->start_time, 0, 5),
                'end_time' => substr($s->end_time, 0, 5),
                'instructor' => $s->instructor?->name,
                'semester' => $s->semester?->name,
                'semester_active' => (bool) $s->semester?->is_active,
            ]);

        return response()->json([
            'room' => ['id' => $room->id, 'name' => $room->name],
            'total' => $all->count(),
            'schedules' => $schedules,
        ]);
    }

    /* ------------------------------------------------------------------
     | 6–7. Nonaktifkan / aktifkan
     | ---------------------------------------------------------------- */
    public function toggleActive(Room $room): RedirectResponse
    {
        if ($room->is_active) {
            // 7.1.1 PeriksaJadwalPemakaian: ruang yang masih dipakai jadwal semester aktif tidak boleh dinonaktifkan.
            $inUse = $room->schedules()->whereHas('semester', fn ($s) => $s->where('is_active', true))->count();

            if ($inUse > 0) {
                // 7.2 TolakPenghapusan
                return back()->withErrors([
                    'action' => "Ruangan \"{$room->name}\" tidak dapat dinonaktifkan karena masih dipakai pada {$inUse} jadwal di semester aktif. Pindahkan jadwal tersebut ke ruang lain terlebih dahulu.",
                ]);
            }
        }

        $room->update(['is_active' => ! $room->is_active]);

        return back()->with('success', [
            'title' => $room->is_active ? 'Ruangan Diaktifkan' : 'Ruangan Dinonaktifkan',
            'message' => $room->is_active
                ? sprintf('Ruangan "%s" aktif kembali dan dapat dipakai pada jadwal.', $room->name)
                : sprintf('Ruangan "%s" dinonaktifkan dan tidak muncul lagi di pilihan jadwal.', $room->name),
        ]);
    }

    /* ------------------------------------------------------------------
     | 6–7. Hapus
     | ---------------------------------------------------------------- */
    public function destroy(Room $room): RedirectResponse
    {
        // 7.1.1 PeriksaJadwalPemakaian: jadwal apa pun (semester aktif maupun lampau) menahan penghapusan.
        $schedules = $room->schedules()->count();

        if ($schedules > 0) {
            // 7.2 TolakPenghapusan
            return back()->withErrors([
                'action' => sprintf(
                    'Ruangan "%s" tidak dapat dihapus karena masih dipakai pada %d jadwal. Pindahkan atau hapus jadwal terkait, atau gunakan Nonaktifkan.',
                    $room->name,
                    $schedules,
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
