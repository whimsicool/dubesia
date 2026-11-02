<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ClassLevel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ClassRequest;
use App\Models\CourseClass;
use App\Models\Schedule;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    /** Halaman Kelola Kelas: statistik ringkas, filter, dan tabel kelas. */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));
        $status = $request->query('status');
        $level = $request->query('level');
        $tutorId = $request->integer('tutor_id');

        $query = CourseClass::query()
            ->with(['tutors:id,name', 'students:id'])
            ->withCount(['schedules', 'gradeComponents']);

        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(fn (Builder $group) => $group
                ->where('name', 'like', $like)
                ->orWhere('description', 'like', $like)
                ->orWhereHas('tutors', fn (Builder $tutor) => $tutor->where('name', 'like', $like)));
        }

        if (in_array($level, array_column(ClassLevel::cases(), 'value'), true)) {
            $query->where('level', $level);
        }

        if ($tutorId) {
            $query->whereHas('tutors', fn (Builder $tutor) => $tutor->where('users.id', $tutorId));
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

        return Inertia::render('Admin/Classes/Index', [
            'classes' => $query->paginate(10)->withQueryString()->through(fn (CourseClass $courseClass): array => [
                'id' => $courseClass->id,
                'name' => $courseClass->name,
                'description' => $courseClass->description,
                'level' => $courseClass->level?->value,
                'level_label' => $courseClass->level?->label(),
                'capacity' => $courseClass->capacity,
                'is_active' => $courseClass->is_active,
                'students_count' => $courseClass->students->count(),
                'student_ids' => $courseClass->students->pluck('id'),
                'schedules_count' => $courseClass->schedules_count,
                'grades_count' => $courseClass->grade_components_count,
                'tutor' => $courseClass->tutors->first() ? [
                    'id' => $courseClass->tutors->first()->id,
                    'name' => $courseClass->tutors->first()->name,
                    'initials' => $courseClass->tutors->first()->initials,
                ] : null,
            ]),
            'filters' => [
                'q' => $search ?: null,
                'level' => $level,
                'tutor_id' => $tutorId ?: null,
                'status' => in_array($status, ['active', 'inactive'], true) ? $status : null,
                'sort' => $request->query('sort', 'newest'),
            ],
            'options' => [
                'levels' => ClassLevel::options(),
                'tutors' => User::where('role', User::ROLE_TUTOR)->orderBy('name')->get(['id', 'name'])
                    ->map(fn (User $tutor): array => ['id' => $tutor->id, 'name' => $tutor->name, 'initials' => $tutor->initials]),
                'students' => User::where('role', User::ROLE_STUDENT)->orderBy('name')->get(['id', 'name', 'email', 'class_level']),
            ],
        ]);
    }

    public function store(ClassRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $courseClass = DB::transaction(function () use ($data): CourseClass {
            $courseClass = CourseClass::create([
                'name' => $data['name'],
                'level' => $data['level'],
                'capacity' => $data['capacity'] ?? null,
                'description' => $data['description'] ?? null,
                'is_active' => true,
            ]);
            $courseClass->tutors()->sync([$data['tutor_id']]);

            return $courseClass;
        });

        return back()->with('success', [
            'title' => 'Kelas Tersimpan',
            'message' => sprintf('Kelas "%s" berhasil ditambahkan. Atur murid lewat tombol murid pada tabel.', $courseClass->name),
        ]);
    }

    public function update(ClassRequest $request, CourseClass $courseClass): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($courseClass, $data): void {
            $courseClass->update([
                'name' => $data['name'],
                'level' => $data['level'],
                'capacity' => $data['capacity'] ?? null,
                'description' => $data['description'] ?? null,
            ]);
            $courseClass->tutors()->sync([$data['tutor_id']]);
        });

        return back()->with('success', [
            'title' => 'Perubahan Kelas Tersimpan',
            'message' => sprintf('Data kelas "%s" berhasil diperbarui.', $courseClass->name),
        ]);
    }

    /** Anggota kelas disimpan di pivot `class_student`, sumber yang sama dengan penilaian tutor. */
    public function syncStudents(Request $request, CourseClass $courseClass): RedirectResponse
    {
        $data = $request->validate([
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['integer', 'distinct', Rule::exists('users', 'id')->where('role', User::ROLE_STUDENT)],
        ], [
            'student_ids.array' => 'Daftar murid tidak valid.',
            'student_ids.*.exists' => 'Murid yang dipilih tidak ditemukan.',
        ]);

        $studentIds = $data['student_ids'] ?? [];

        if ($courseClass->capacity !== null && count($studentIds) > $courseClass->capacity) {
            throw ValidationException::withMessages([
                'student_ids' => sprintf('Jumlah murid (%d) melebihi kapasitas kelas (%d).', count($studentIds), $courseClass->capacity),
            ]);
        }

        $courseClass->students()->sync($studentIds);
        $this->syncScheduleRosters($courseClass);

        return back()->with('success', [
            'title' => 'Murid Kelas Diperbarui',
            'message' => sprintf('%d murid tergabung di kelas "%s".', count($studentIds), $courseClass->name),
        ]);
    }

    /** Perubahan anggota kelas langsung memperbarui daftar peserta pada semua jadwal kelas. */
    private function syncScheduleRosters(CourseClass $courseClass): void
    {
        $users = User::whereIn('id', $courseClass->students()->pluck('users.id'))->get(['id', 'name', 'email', 'nip']);
        $studentIds = $users->map(function (User $user): int {
            $student = Student::firstOrCreate(
                ['user_id' => $user->id],
                ['nisn' => $user->nip && ! Student::where('nisn', $user->nip)->exists() ? $user->nip : 'USR-'.$user->id,
                    'name' => $user->name, 'email' => $user->email, 'status' => Student::STATUS_ACTIVE],
            );
            return $student->id;
        })->all();

        $courseClass->schedules()->each(fn (Schedule $schedule) => $schedule->students()->sync($studentIds));
    }

    public function destroy(CourseClass $courseClass): RedirectResponse
    {
        $students = $courseClass->students()->count();
        $schedules = $courseClass->schedules()->count();
        $grades = $courseClass->gradeComponents()->count();

        // Menghapus kelas ikut menghapus keanggotaan dan komponen nilai (cascade),
        // jadi kelas yang sudah dipakai hanya boleh diarsipkan.
        if ($students > 0 || $schedules > 0 || $grades > 0) {
            return back()->with('error', [
                'title' => 'Kelas Tidak Dapat Dihapus',
                'message' => sprintf(
                    'Kelas "%s" masih terhubung dengan %d murid, %d jadwal, dan %d komponen nilai. Lepaskan relasi murid, jadwal, dan komponen nilainya terlebih dahulu.',
                    $courseClass->name, $students, $schedules, $grades
                ),
            ]);
        }

        $name = $courseClass->name;
        $courseClass->delete();

        return back()->with('success', [
            'title' => 'Kelas Dihapus',
            'message' => sprintf('Kelas "%s" berhasil dihapus.', $name),
        ]);
    }
}
