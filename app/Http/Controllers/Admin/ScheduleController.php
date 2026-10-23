<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ScheduleRequest;
use App\Http\Resources\ScheduleResource;
use App\Models\Instructor;
use App\Models\Program;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Student;
use App\Services\ScheduleConflictService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class ScheduleController extends Controller
{
    public function __construct(private readonly ScheduleConflictService $conflicts)
    {
    }

    /* ---------------------------------------------------------------------
     |  Halaman utama: kalender mingguan + tabel
     | ------------------------------------------------------------------- */
    public function index(Request $request): Response
    {
        $semester = Semester::active()->first();
        $weekStart = $this->resolveWeekStart($request->query('week'));
        $today = now()->startOfDay();

        $schedules = $semester
            ? $this->filteredQuery($request, $semester)->get()
            : collect();

        return Inertia::render('Admin/Schedules/Index', [
            'semester' => $semester ? [
                'id' => $semester->id,
                'name' => $semester->name,
                'start_date' => $semester->start_date->toDateString(),
                'end_date' => $semester->end_date->toDateString(),
            ] : null,
            'week' => [
                'start' => $weekStart->toDateString(),
                'end' => $weekStart->copy()->addDays(5)->toDateString(), // Senin–Sabtu
                'prev' => $weekStart->copy()->subWeek()->toDateString(),
                'next' => $weekStart->copy()->addWeek()->toDateString(),
                'is_current' => $weekStart->equalTo($today->copy()->startOfWeek(Carbon::MONDAY)),
                'today' => $today->toDateString(),
                'days' => $this->weekDays($weekStart, $semester),
            ],
            'filters' => [
                'day' => $request->integer('day') ?: null,
                'program_id' => $request->integer('program_id') ?: null,
                'instructor_id' => $request->integer('instructor_id') ?: null,
                'room_id' => $request->integer('room_id') ?: null,
                'q' => trim((string) $request->query('q', '')) ?: null,
            ],
            'schedules' => ScheduleResource::collection($schedules)->resolve(),
            'options' => [
                'programs' => Program::where('is_active', true)->orderBy('name')->get(['id', 'name', 'category'])
                    ->map(fn ($p) => ['id' => $p->id, 'name' => $p->name, 'category' => $p->category->value]),
                'instructors' => Instructor::where('is_active', true)->orderBy('name')->get(['id', 'name']),
                'rooms' => Room::where('is_active', true)->orderBy('name')->get(['id', 'name', 'type', 'platform', 'capacity'])
                    ->map(fn ($r) => [
                        'id' => $r->id, 'name' => $r->name, 'type' => $r->type->value,
                        'platform' => $r->platform, 'capacity' => $r->capacity,
                    ]),
                'students' => Student::whereIn('status', [Student::STATUS_ACTIVE, Student::STATUS_PENDING])
                    ->orderBy('name')->get(['id', 'nisn', 'name', 'status']),
            ],
        ]);
    }

    /* ---------------------------------------------------------------------
     |  Create / Update / Delete
     | ------------------------------------------------------------------- */
    public function store(ScheduleRequest $request): RedirectResponse
    {
        $schedule = DB::transaction(fn () => $this->persist(new Schedule(), $request->validated()));

        return back()->with('success', [
            'title' => 'Pembaruan Jadwal Tersimpan',
            'message' => sprintf(
                'Jadwal "%s" berhasil ditambahkan untuk kelas %s dengan %d murid terdaftar.',
                $schedule->title, $schedule->class_name, $schedule->students()->count()
            ),
        ]);
    }

    public function update(ScheduleRequest $request, Schedule $schedule): RedirectResponse
    {
        DB::transaction(fn () => $this->persist($schedule, $request->validated()));

        return back()->with('success', [
            'title' => 'Pembaruan Jadwal Tersimpan',
            'message' => sprintf(
                'Data sesi belajar berhasil diperbarui dan disinkronisasi ke %d murid terdaftar di kelas %s.',
                $schedule->students()->count(), $schedule->class_name
            ),
        ]);
    }

    public function destroy(Schedule $schedule): RedirectResponse
    {
        abort_unless(auth()->user()?->isAdmin(), 403);

        $enrolled = $schedule->students()->count();
        $title = $schedule->title;

        // Pendaftaran murid (schedule_student) & presensi ikut terhapus lewat ON DELETE CASCADE.
        $schedule->delete();

        return back()->with('success', [
            'title' => 'Jadwal Dihapus',
            'message' => sprintf('Jadwal "%s" dihapus beserta %d data pendaftaran murid dan presensi terkait.', $title, $enrolled),
        ]);
    }

    /* ---------------------------------------------------------------------
     |  Cek bentrok real-time untuk form (JSON)
     | ------------------------------------------------------------------- */
    public function checkConflict(Request $request): JsonResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $data = $request->validate([
            'scheduled_date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'instructor_id' => ['nullable', 'integer'],
            'room_id' => ['nullable', 'integer'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['integer'],
            'ignore_id' => ['nullable', 'integer'],
        ]);

        $semester = Semester::active()->first();

        if (! $semester) {
            return response()->json(['conflicts' => []]);
        }

        $conflicts = $this->conflicts->check(
            semesterId: $semester->id,
            day: Carbon::createFromFormat('Y-m-d', $data['scheduled_date'])->dayOfWeekIso,
            start: $data['start_time'],
            end: $data['end_time'],
            instructorId: $data['instructor_id'] ?? null,
            roomId: $data['room_id'] ?? null,
            studentIds: $data['student_ids'] ?? [],
            ignoreId: $data['ignore_id'] ?? null,
            scheduledDate: $data['scheduled_date'],
        );

        return response()->json(['conflicts' => $conflicts->values()]);
    }

    /* ---------------------------------------------------------------------
     |  Ekspor CSV (mengikuti filter yang sedang aktif)
     | ------------------------------------------------------------------- */
    public function export(Request $request): StreamedResponse
    {
        $semester = Semester::active()->first();
        $rows = $semester ? $this->filteredQuery($request, $semester)->get() : collect();
        $days = config('dubesia.days');

        return response()->streamDownload(function () use ($rows, $days, $semester) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM agar Excel membaca UTF-8 dengan benar

            fputcsv($out, ['Semester', 'Tanggal', 'Hari', 'Mulai', 'Selesai', 'Sesi', 'Kelas', 'Program', 'Instruktur', 'Ruang', 'Peserta']);

            foreach ($rows as $s) {
                fputcsv($out, [
                    $semester?->name,
                    $s->scheduled_date?->toDateString() ?? 'Berulang mingguan',
                    $days[$s->day_of_week] ?? $s->day_of_week,
                    substr($s->start_time, 0, 5),
                    substr($s->end_time, 0, 5),
                    $s->title,
                    $s->class_name,
                    $s->program?->name ?? '',
                    $s->instructor->name,
                    $s->room->name,
                    $s->students->count(),
                ]);
            }

            fclose($out);
        }, 'jadwal-belajar-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /* ---------------------------------------------------------------------
     |  Helpers
     | ------------------------------------------------------------------- */
    private function persist(Schedule $schedule, array $data): Schedule
    {
        $studentIds = $data['student_ids'] ?? [];
        unset($data['student_ids']);

        $schedule->fill($data)->save();
        $schedule->students()->sync($studentIds);

        // Murid yang baru ditempatkan ke kelas otomatis berstatus aktif.
        Student::whereIn('id', $studentIds)
            ->where('status', Student::STATUS_PENDING)
            ->update(['status' => Student::STATUS_ACTIVE]);

        return $schedule;
    }

    private function filteredQuery(Request $request, Semester $semester): Builder
    {
        $q = trim((string) $request->query('q', ''));
        $like = '%'.addcslashes($q, '%_\\').'%';

        $query = Schedule::query();
        $query->with(['program', 'instructor', 'room', 'students:id']);
        $query->where('semester_id', $semester->getKey());

        foreach ([
            'day' => 'day_of_week',
            'program_id' => 'program_id',
            'instructor_id' => 'instructor_id',
            'room_id' => 'room_id',
        ] as $parameter => $column) {
            $value = $request->integer($parameter);
            if ($value) {
                $query->where($column, $value);
            }
        }

        if ($q !== '') {
            $query->where(function (Builder $w) use ($like) {
                $w->where('title', 'like', $like)
                    ->orWhere('class_name', 'like', $like)
                    ->orWhereHas('program', fn ($p) => $p->where('name', 'like', $like))
                    ->orWhereHas('instructor', fn ($i) => $i->where('name', 'like', $like))
                    ->orWhereHas('room', fn ($r) => $r->where('name', 'like', $like))
                    ->orWhereHas('students', fn ($s) => $s->where('name', 'like', $like)->orWhere('nisn', 'like', $like));
            });
        }

        $query->orderBy('day_of_week');
        $query->orderBy('start_time');

        return $query;
    }

    private function resolveWeekStart(mixed $week): Carbon
    {
        try {
            $date = Carbon::parse($week ?: 'now');
            $date->startOfWeek(Carbon::MONDAY);
            $date->startOfDay();

            return Carbon::instance($date);
        } catch (Throwable) {
            $date = now();
            $date->startOfWeek(Carbon::MONDAY);
            $date->startOfDay();

            return Carbon::instance($date);
        }
    }

    /** @return array<int, array<string, mixed>> */
    private function weekDays(Carbon $weekStart, ?Semester $semester): array
    {
        return collect(config('dubesia.days'))->map(function ($name, $day) use ($weekStart, $semester) {
            $date = $weekStart->copy()->addDays($day - 1);

            return [
                'day' => (int) $day,
                'name' => $name,
                'date' => $date->toDateString(),
                // Sesi mingguan hanya berlaku di dalam rentang tanggal semester.
                'in_semester' => $semester ? $date->between($semester->start_date, $semester->end_date) : false,
            ];
        })->values()->all();
    }

}
