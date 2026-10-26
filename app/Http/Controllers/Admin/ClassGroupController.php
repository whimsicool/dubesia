<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ClassGroupRequest;
use App\Http\Resources\ClassGroupResource;
use App\Models\ClassGroup;
use App\Models\Instructor;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kelola Kelas (admin) — mengikuti sequence diagram "Kelola Kelas":
 *   1  index()        BukaMenu → MintaDaftarKelas → AmbilDaftarKelas → TampilkanDaftarKelas
 *   3  store()        KirimDataKelas → ValidasiDataKelas → SimpanKelas
 *   4  show()         MintaDetailKelas → AmbilDetailKelas          (data awal form ubah)
 *   5  update()       KirimPerubahanKelas → ValidasiDataKelas → PerbaruiKelas
 *   6  students()     MintaDaftarMurid → AmbilMuridDanKeanggotaan
 *   7  syncStudent()  SimpanKeanggotaanKelas → ValidasiKelasDanMurid → PerbaruiRelasiKelasMurid
 *   9  toggleActive() / destroy()  PeriksaKeterkaitan → Tolak (alasan) | NonaktifkanAtauHapusKelas
 */
class ClassGroupController extends Controller
{
    /* ------------------------------------------------------------------
     | 1. Daftar kelas
     | ---------------------------------------------------------------- */
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $level = array_key_exists((string) $request->query('level'), config('dubesia.class_levels')) ? $request->query('level') : null;
        $status = in_array($request->query('status'), ['active', 'inactive'], true) ? $request->query('status') : null;
        $tutorId = $request->integer('tutor_id') ?: null;
        $sort = $request->query('sort') === 'name' ? 'name' : 'newest';

        $classes = ClassGroup::query()
            ->with('tutor:id,name')
            ->withCount(['students', 'schedules'])
            ->when($level, fn (Builder $query) => $query->where('level', $level))
            ->when($status, fn (Builder $query) => $query->where('is_active', $status === 'active'))
            ->when($tutorId, fn (Builder $query) => $query->where('tutor_id', $tutorId))
            ->when($q !== '', function (Builder $query) use ($q) {
                $like = '%'.addcslashes($q, '%_\\').'%';
                $query->where(fn (Builder $w) => $w
                    ->where('name', 'like', $like)
                    ->orWhere('description', 'like', $like)
                    ->orWhereHas('tutor', fn ($t) => $t->where('name', 'like', $like)));
            })
            ->when($sort === 'name', fn (Builder $query) => $query->orderBy('name'), fn (Builder $query) => $query->orderByDesc('id'))
            ->paginate(10)
            ->withQueryString()
            ->through(fn (ClassGroup $c) => ClassGroupResource::make($c)->resolve());

        return Inertia::render('Admin/Classes/Index', [
            'classes' => $classes,
            'filters' => ['q' => $q ?: null, 'level' => $level, 'status' => $status, 'tutor_id' => $tutorId, 'sort' => $sort],
            'stats' => [
                'total' => ClassGroup::count(),
                'active' => ClassGroup::where('is_active', true)->count(),
                'inactive' => ClassGroup::where('is_active', false)->count(),
                'members' => (int) DB::table('class_group_student')
                    ->join('class_groups', 'class_groups.id', '=', 'class_group_student.class_group_id')
                    ->where('class_groups.is_active', true)
                    ->distinct()->count('class_group_student.student_id'),
            ],
            'options' => [
                'levels' => collect(config('dubesia.class_levels'))->map(fn ($label, $code) => ['value' => $code, 'label' => $label])->values(),
                'tutors' => Instructor::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            ],
        ]);
    }

    /* ------------------------------------------------------------------
     | 3. Tambah kelas
     | ---------------------------------------------------------------- */
    public function store(ClassGroupRequest $request): RedirectResponse
    {
        $classGroup = ClassGroup::create($request->validated() + ['is_active' => true]);

        return back()->with('success', [
            'title' => 'Kelas Tersimpan',
            'message' => sprintf('Kelas "%s" (level %s) berhasil dibuat. Atur murid melalui tombol "Kelola Murid".', $classGroup->name, $classGroup->level),
        ]);
    }

    /* ------------------------------------------------------------------
     | 4. Detail kelas (untuk form ubah) — JSON
     | ---------------------------------------------------------------- */
    public function show(ClassGroup $classGroup): JsonResponse
    {
        $classGroup->load('tutor:id,name')->loadCount(['students', 'schedules']);

        return response()->json(['data' => ClassGroupResource::make($classGroup)->resolve()]);
    }

    /* ------------------------------------------------------------------
     | 5. Ubah kelas
     | ---------------------------------------------------------------- */
    public function update(ClassGroupRequest $request, ClassGroup $classGroup): RedirectResponse
    {
        $classGroup->update($request->validated());

        return back()->with('success', [
            'title' => 'Perubahan Kelas Tersimpan',
            'message' => sprintf('Data kelas "%s" berhasil diperbarui.', $classGroup->name),
        ]);
    }

    /* ------------------------------------------------------------------
     | 6. Daftar murid + status keanggotaan — JSON
     | ---------------------------------------------------------------- */
    public function students(ClassGroup $classGroup): JsonResponse
    {
        $memberIds = $classGroup->students()->pluck('students.id');

        $students = Student::query()
            ->whereIn('status', [Student::STATUS_ACTIVE, Student::STATUS_PENDING])
            ->orWhereIn('id', $memberIds) // anggota tetap tampil walau statusnya sudah nonaktif
            ->orderBy('name')
            ->get(['id', 'nisn', 'name', 'status'])
            ->map(fn (Student $s) => [
                'id' => $s->id,
                'nisn' => $s->nisn,
                'name' => $s->name,
                'status' => $s->status,
                'member' => $memberIds->contains($s->id),
            ]);

        return response()->json([
            'class' => [
                'id' => $classGroup->id,
                'name' => $classGroup->name,
                'is_active' => $classGroup->is_active,
                'capacity' => $classGroup->capacity,
                'members_count' => $memberIds->count(),
            ],
            'students' => $students,
        ]);
    }

    /* ------------------------------------------------------------------
     | 7. Masukkan / keluarkan satu murid — JSON
     |    body: { student_id, member: true|false }
     | ---------------------------------------------------------------- */
    public function syncStudent(Request $request, ClassGroup $classGroup): JsonResponse
    {
        // 7.1.1 ValidasiKelasDanMurid
        $data = Validator::make($request->all(), [
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'member' => ['required', 'boolean'],
        ], [
            'student_id.required' => 'Murid belum dipilih.',
            'student_id.exists' => 'Murid tidak ditemukan.',
        ])->validate();

        $student = Student::findOrFail($data['student_id']);
        $wantsMember = filter_var($data['member'], FILTER_VALIDATE_BOOLEAN);
        $isMember = $classGroup->students()->whereKey($student->id)->exists();

        if ($wantsMember && ! $isMember) {
            if (! $classGroup->is_active) {
                throw ValidationException::withMessages(['student_id' => 'Kelas nonaktif tidak dapat menerima murid baru. Aktifkan kelas terlebih dahulu.']);
            }
            if ($student->status === Student::STATUS_INACTIVE) {
                throw ValidationException::withMessages(['student_id' => "Murid {$student->name} berstatus nonaktif."]);
            }
            if ($classGroup->isFull()) {
                throw ValidationException::withMessages(['student_id' => "Kelas sudah penuh (kapasitas {$classGroup->capacity} murid)."]);
            }
        }

        // 7.1.2 PerbaruiRelasiKelasMurid
        DB::transaction(function () use ($classGroup, $student, $wantsMember, $isMember) {
            if ($wantsMember && ! $isMember) {
                $classGroup->students()->attach($student->id);

                // Murid yang baru ditempatkan ke kelas otomatis berstatus aktif.
                if ($student->status === Student::STATUS_PENDING) {
                    $student->update(['status' => Student::STATUS_ACTIVE]);
                }
            }

            if (! $wantsMember && $isMember) {
                $classGroup->students()->detach($student->id);

                // Murid yang keluar dari kelas juga dikeluarkan dari roster jadwal kelas tersebut.
                $scheduleIds = $classGroup->schedules()->pluck('id');
                DB::table('schedule_student')->whereIn('schedule_id', $scheduleIds)->where('student_id', $student->id)->delete();
            }
        });

        return response()->json([
            'member' => $wantsMember,
            'status' => $student->fresh()->status,
            'members_count' => $classGroup->students()->count(),
        ]);
    }

    /* ------------------------------------------------------------------
     | 8–9. Nonaktifkan / aktifkan kembali
     | ---------------------------------------------------------------- */
    public function toggleActive(ClassGroup $classGroup): RedirectResponse
    {
        if ($classGroup->is_active) {
            // 9.1.1 PeriksaKeterkaitan: kelas yang masih dijadwalkan di semester aktif tidak boleh dinonaktifkan.
            $activeSchedules = $classGroup->schedules()->whereHas('semester', fn ($s) => $s->where('is_active', true))->count();

            if ($activeSchedules > 0) {
                return back()->withErrors([
                    'action' => "Kelas \"{$classGroup->name}\" tidak dapat dinonaktifkan karena masih dipakai pada {$activeSchedules} jadwal di semester aktif. Pindahkan atau hapus jadwal tersebut terlebih dahulu.",
                ]);
            }
        }

        $classGroup->update(['is_active' => ! $classGroup->is_active]);

        return back()->with('success', [
            'title' => $classGroup->is_active ? 'Kelas Diaktifkan' : 'Kelas Dinonaktifkan',
            'message' => $classGroup->is_active
                ? sprintf('Kelas "%s" aktif kembali dan dapat dijadwalkan.', $classGroup->name)
                : sprintf('Kelas "%s" dinonaktifkan. Data murid anggota tetap tersimpan.', $classGroup->name),
        ]);
    }

    /* ------------------------------------------------------------------
     | 8–9. Hapus
     | ---------------------------------------------------------------- */
    public function destroy(ClassGroup $classGroup): RedirectResponse
    {
        // 9.1.1 PeriksaKeterkaitan
        $members = $classGroup->students()->count();
        $schedules = $classGroup->schedules()->count();

        if ($members > 0 || $schedules > 0) {
            $reasons = array_filter([
                $members > 0 ? "{$members} murid terdaftar" : null,
                $schedules > 0 ? "{$schedules} jadwal" : null,
            ]);

            // 9.2 TolakPenghapusan + 9.3 TampilkanAlasan
            return back()->withErrors([
                'action' => sprintf(
                    'Kelas "%s" tidak dapat dihapus karena masih memiliki %s. Keluarkan murid dan lepas/hapus jadwalnya terlebih dahulu, atau gunakan Nonaktifkan.',
                    $classGroup->name,
                    implode(' dan ', $reasons),
                ),
            ]);
        }

        $name = $classGroup->name;
        $classGroup->delete();

        return back()->with('success', [
            'title' => 'Kelas Dihapus',
            'message' => sprintf('Kelas "%s" berhasil dihapus.', $name),
        ]);
    }
}
