<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ScheduleRequest;
use App\Http\Resources\ScheduleResource;
use App\Models\Attendance;
use App\Models\CourseClass;
use App\Models\Instructor;
use App\Models\Program;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use App\Services\ScheduleConflictService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ScheduleController extends Controller
{
    public function __construct(private readonly ScheduleConflictService $conflicts) {}

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
                'classes' => CourseClass::where('is_active', true)->with(['tutors:id,name'])->withCount('students')->orderBy('name')->get()
                    ->map(fn (CourseClass $class) => [
                        'id' => $class->id,
                        'name' => $class->name,
                        'level' => $class->level?->value,
                        'tutor' => $class->tutors->first() ? [
                            'id' => $class->tutors->first()->id,
                            'name' => $class->tutors->first()->name,
                        ] : null,
                        'students_count' => $class->students_count,
                    ]),
                'tutors' => User::where('role', User::ROLE_TUTOR)->where('status_akun', 'aktif')->orderBy('name')->get(['id', 'name']),
                'rooms' => Room::where('is_active', true)->orderBy('name')->get(['id', 'name', 'type', 'platform', 'location', 'capacity'])
                    ->map(fn ($r) => [
                        'id' => $r->id,
                        'name' => $r->name,
                        'type' => $r->type->value,
                        'platform' => $r->platform,
                        'location' => $r->location,
                        'capacity' => $r->capacity,
                    ]),
            ],
        ]);
    }

    public function pdf(Request $request)
    {
        $semester = Semester::active()->first();
        $weekStart = $this->resolveWeekStart($request->query('week'));

        $rows = $semester
            ? $this->filteredQuery($request, $semester)->get()
            : collect();

        $days = collect($this->weekDays($weekStart, $semester))
            ->map(function ($day) use ($rows) {
                $day['formatted_date'] = Carbon::parse($day['date'])->format('d/m/Y');

                $day['schedules'] = $rows
                    ->filter(function ($schedule) use ($day) {
                        if (! $day['in_semester']) {
                            return false;
                        }

                        if ($schedule->scheduled_date) {
                            return $schedule->scheduled_date->toDateString() === $day['date'];
                        }

                        return (int) $schedule->day_of_week === (int) $day['day'];
                    })
                    ->map(fn ($schedule) => [
                        'title' => $schedule->title,
                        'class_name' => $schedule->class_name,
                        'start_time' => substr($schedule->start_time, 0, 5),
                        'end_time' => substr($schedule->end_time, 0, 5),
                        'program' => $schedule->program?->name ?? '-',
                        'instructor' => $schedule->instructor?->name ?? '-',
                        'room' => $schedule->room?->name ?? '-',
                        'participants' => $schedule->students->count(),
                    ])
                    ->values()
                    ->all();

                return $day;
            })
            ->all();

        return Pdf::loadView('pdf.schedules', [
            'title' => 'Jadwal Belajar',
            'user' => $request->user(),
            'semester' => $semester,
            'days' => $days,
            'audience' => 'Administrator',
            'generatedAt' => now(),
        ])
            ->setPaper('a4', 'landscape')
            ->download('Jadwal-Belajar-Dubesia.pdf');
    }

    /* ---------------------------------------------------------------------
     |  Create / Update / Delete
     | ------------------------------------------------------------------- */
    public function store(ScheduleRequest $request): RedirectResponse
    {
        $schedule = DB::transaction(fn () => $this->persist(new Schedule, $request->validated()));

        return back()->with('success', [
            'title' => 'Jadwal Tersimpan',
            'message' => sprintf(
                'Jadwal "%s" berhasil ditambahkan untuk kelas %s dengan %d murid terdaftar.',
                $schedule->title,
                $schedule->class_name,
                $schedule->students()->count()
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
                $schedule->students()->count(),
                $schedule->class_name
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
            'tutor_id' => ['nullable', 'integer'],
            'room_id' => ['nullable', 'integer'],
            'class_id' => ['nullable', 'integer', 'exists:classes,id'],
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
            // Formulir mengirim tutor & murid (user); mesin bentrok bekerja dengan id instruktur & students.
            instructorId: empty($data['tutor_id']) ? null : Instructor::where('user_id', $data['tutor_id'])->value('id'),
            roomId: $data['room_id'] ?? null,
            studentIds: empty($data['class_id']) ? [] : $this->studentIdsForClass((int) $data['class_id']),
            ignoreId: $data['ignore_id'] ?? null,
            scheduledDate: $data['scheduled_date'],
        );

        return response()->json(['conflicts' => $conflicts->values()]);
    }

    /** Daftar murid kelas dan status presensi untuk tanggal pertemuan tertentu. */
    public function attendanceData(Request $request, Schedule $schedule): JsonResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);
        $data = $request->validate(['date' => ['required', 'date_format:Y-m-d']]);
        $date = Carbon::createFromFormat('Y-m-d', $data['date']);
        abort_unless($this->scheduleOccursOn($schedule, $date), 422, 'Tanggal bukan tanggal pertemuan jadwal ini.');

        $students = $schedule->students()->orderBy('name')->get(['students.id', 'students.name']);
        $records = Attendance::query()
            ->where('schedule_id', $schedule->id)
            ->whereDate('date', $date->toDateString())
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        return response()->json([
            'schedule' => ['id' => $schedule->id, 'title' => $schedule->title, 'class_name' => $schedule->class_name],
            'date' => $date->toDateString(),
            'students' => $students->map(fn (Student $student) => [
                'id' => $student->id,
                'name' => $student->name,
                'status' => $records->get($student->id)?->status?->value,
            ])->values(),
        ]);
    }

    private function scheduleOccursOn(Schedule $schedule, Carbon $date): bool
    {
        return $schedule->scheduled_date
            ? $schedule->scheduled_date->toDateString() === $date->toDateString()
            : (int) $schedule->day_of_week === $date->dayOfWeekIso;
    }

    /** @return array<int, int> */
    private function studentIdsForClass(int $classId): array
    {
        $userIds = CourseClass::with('students:id')->find($classId)?->students->pluck('id')->map(fn ($id) => (int) $id)->all() ?? [];

        return Student::whereIn('user_id', $userIds)->pluck('id')->map(fn ($id) => (int) $id)->all();
    }

    /* ---------------------------------------------------------------------
     |  Helpers
     | ------------------------------------------------------------------- */
    /**
     * Simpan jadwal. Kelas menentukan judul & nama kelas; tutor dan murid dipetakan ke
     * baris `instructors` / `students` yang sudah dipakai kalender, presensi, dan ekspor.
     */
    private function persist(Schedule $schedule, array $data): Schedule
    {
        $class = CourseClass::with('students:id')->findOrFail($data['class_id']);
        $studentUserIds = $class->students->pluck('id')->map(fn ($id) => (int) $id)->all();
        $tutor = User::findOrFail($data['tutor_id']);
        unset($data['tutor_id']);

        $data['title'] = $class->name;
        $data['class_name'] = $class->name;
        $data['instructor_id'] = $this->instructorFor($tutor);

        $studentIds = $this->studentsFor($studentUserIds);

        $schedule->fill($data)->save();
        $schedule->students()->sync($studentIds);

        // Murid yang baru ditempatkan ke jadwal otomatis berstatus aktif.
        Student::whereIn('id', $studentIds)
            ->where('status', Student::STATUS_PENDING)
            ->update(['status' => Student::STATUS_ACTIVE]);

        return $schedule;
    }

    /** Baris instruktur adalah pasangan tutor (user) pada jadwal; dibuat saat tutor pertama kali dipakai. */
    private function instructorFor(User $tutor): int
    {
        $instructor = Instructor::firstOrCreate(
            ['user_id' => $tutor->id],
            ['name' => $tutor->name, 'is_active' => true],
        );

        if ($instructor->name !== $tutor->name) {
            $instructor->update(['name' => $tutor->name]);
        }

        return $instructor->id;
    }

    /**
     * Petakan murid (user) ke baris `students` yang dipakai pivot jadwal dan presensi.
     *
     * @param  array<int, int>  $userIds
     * @return array<int, int>
     */
    private function studentsFor(array $userIds): array
    {
        if ($userIds === []) {
            return [];
        }

        return User::whereIn('id', $userIds)->get(['id', 'name', 'email'])
            ->map(function (User $user): int {
                $student = Student::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'name' => $user->name,
                        'email' => $user->email,
                        'status' => Student::STATUS_ACTIVE,
                    ],
                );

                return $student->id;
            })
            ->all();
    }

    private function filteredQuery(Request $request, Semester $semester): Builder
    {
        $q = trim((string) $request->query('q', ''));
        $like = '%'.addcslashes($q, '%_\\').'%';

        $query = Schedule::query();
        $query->with(['program', 'instructor', 'room', 'students:id,name']);
        $query->where('semester_id', $semester->getKey());

        foreach (
            [
                'day' => 'day_of_week',
                'program_id' => 'program_id',
                'instructor_id' => 'instructor_id',
                'room_id' => 'room_id',
            ] as $parameter => $column
        ) {
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
                    ->orWhereHas('students', fn ($s) => $s->where('name', 'like', $like));
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
