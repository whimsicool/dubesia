<?php

namespace App\Http\Controllers;

use App\Models\ClassAttendance;
use App\Models\CourseClass;
use App\Models\Material;
use App\Models\MaterialProgress;
use App\Models\Pendaftaran;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\StudentFeedback;
use App\Models\StudentGrade;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Dashboard universal: satu halaman dipakai semua role.
 *
 * Isi halaman mengikuti fitur role user, tetapi bentuk payload-nya seragam
 * (statistik, bagan, agenda, aksi cepat, panel) supaya satu set komponen
 * React dapat melayani admin, tutor, dan murid.
 */
class DashboardController extends Controller
{
    /** Jumlah hari pada bagan tren. */
    private const TREND_DAYS = 14;

    /** Jumlah butir pada tiap tab panel. */
    private const PANEL_ITEM_LIMIT = 5;

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Dashboard', [
            'dashboard' => [
                'role' => $user->role,
                ...match ($user->role) {
                    User::ROLE_ADMIN => $this->adminDashboard(),
                    User::ROLE_TUTOR => $this->tutorDashboard($user),
                    default => $this->studentDashboard($user),
                },
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Admin */
    /* ------------------------------------------------------------------ */

    /**
     * @return array<string, mixed>
     */
    private function adminDashboard(): array
    {
        $semester = Semester::active()->first();
        $pending = Pendaftaran::query()->where('status', Pendaftaran::STATUS_MENUNGGU)->count();
        $newAccountsThisWeek = User::query()
            ->where('role', '!=', User::ROLE_ADMIN)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
        $activeTutors = User::query()
            ->where('role', User::ROLE_TUTOR)
            ->where('status_akun', 'aktif')
            ->count();
        $activeClasses = CourseClass::query()->where('is_active', true)->count();

        $schedules = $semester
            ? Schedule::query()
                ->where('semester_id', $semester->id)
                ->with('room:id,name')
                ->orderBy('start_time')
                ->get()
            : new Collection;

        return [
            'stats' => [
                $this->stat(
                    'pending',
                    'Menunggu Verifikasi',
                    $pending,
                    $pending > 0 ? 'Calon murid perlu diperiksa' : 'Semua pendaftaran sudah diperiksa',
                    route('admin.calon-murid.index', absolute: false),
                    'user-check',
                    $pending > 0 ? 'attention' : 'neutral',
                ),
                $this->stat(
                    'students',
                    'Murid Terdaftar',
                    User::query()->where('role', User::ROLE_STUDENT)->count(),
                    $newAccountsThisWeek.' akun baru dalam 7 hari',
                    route('admin.data-pengguna.index', ['role' => User::ROLE_STUDENT], absolute: false),
                    'users',
                ),
                $this->stat(
                    'tutors',
                    'Tutor',
                    User::query()->where('role', User::ROLE_TUTOR)->count(),
                    $activeTutors.' akun aktif',
                    route('admin.data-pengguna.index', ['role' => User::ROLE_TUTOR], absolute: false),
                    'graduation-cap',
                ),
                $this->stat(
                    'sessions',
                    'Sesi per Pekan',
                    $schedules->count(),
                    $activeClasses.' kelas aktif',
                    route('admin.schedules.index', absolute: false),
                    'calendar-days',
                ),
            ],
            'chart' => $this->trendChart(
                'Pendaftaran Masuk',
                $this->dailySeries(Pendaftaran::query()->where('created_at', '>=', now()->subDays(self::TREND_DAYS))->pluck('created_at'), 'pendaftar'),
                'pendaftar',
            ),
            'agenda' => $this->scheduleAgenda('Jadwal Pekan Ini', $schedules),
            'actions' => [
                $this->action('Verifikasi Pendaftaran', route('admin.calon-murid.index', absolute: false), 'user-check'),
                $this->action('Data Pengguna', route('admin.data-pengguna.index', absolute: false), 'users'),
                $this->action('Jadwal Belajar', route('admin.schedules.index', absolute: false), 'calendar-days'),
                $this->action('Kelola Kelas', route('admin.classes.index', absolute: false), 'graduation-cap'),
                $this->action('Kelola Ruangan', route('admin.rooms.index', absolute: false), 'building'),
                $this->action('Kotak Aspirasi', route('admin.feedback.index', absolute: false), 'message-square'),
            ],
            'panel' => [
                'title' => 'Perlu Tindakan',
                'tabs' => [
                    [
                        'key' => 'pendaftaran',
                        'label' => 'Pendaftaran',
                        'count' => $pending,
                        'empty' => 'Tidak ada pendaftaran yang menunggu verifikasi.',
                        'footer' => ['label' => 'Lihat semua pendaftaran', 'href' => route('admin.calon-murid.index', absolute: false)],
                        'items' => Pendaftaran::query()
                            ->where('status', Pendaftaran::STATUS_MENUNGGU)
                            ->orderByRaw('COALESCE(resubmitted_at, created_at) DESC')
                            ->limit(self::PANEL_ITEM_LIMIT)
                            ->get(['id', 'nama_lengkap', 'program', 'resubmitted_at', 'created_at'])
                            ->map(fn (Pendaftaran $pendaftaran): array => $this->panelItem(
                                $pendaftaran->id,
                                $pendaftaran->nama_lengkap,
                                (Pendaftaran::PROGRAMS[$pendaftaran->program] ?? $pendaftaran->program).' · '.$pendaftaran->created_at->format('d M Y'),
                                $pendaftaran->resubmitted_at ? 'Perbaikan' : null,
                                $pendaftaran->resubmitted_at ? 'attention' : 'neutral',
                                route('admin.calon-murid.show', $pendaftaran->id, absolute: false),
                            ))
                            ->all(),
                    ],
                    [
                        'key' => 'aspirasi',
                        'label' => 'Aspirasi',
                        'count' => StudentFeedback::query()->count(),
                        'empty' => 'Belum ada aspirasi yang dikirim murid.',
                        'footer' => ['label' => 'Buka kotak aspirasi', 'href' => route('admin.feedback.index', absolute: false)],
                        'items' => StudentFeedback::query()
                            ->latest()
                            ->limit(self::PANEL_ITEM_LIMIT)
                            ->get(['id', 'subject', 'message', 'created_at'])
                            ->map(fn (StudentFeedback $feedback): array => $this->panelItem(
                                $feedback->id,
                                $feedback->subject ?: 'Tanpa topik',
                                Str::limit(preg_replace('/\s+/', ' ', $feedback->message), 80),
                                $feedback->created_at->format('d M'),
                            ))
                            ->all(),
                    ],
                ],
            ],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Tutor */
    /* ------------------------------------------------------------------ */

    /**
     * @return array<string, mixed>
     */
    private function tutorDashboard(User $user): array
    {
        $semester = Semester::active()->first();
        $classes = $user->teachingClasses()->withCount('students')->orderBy('name')->get();
        $studentCount = User::query()
            ->where('role', User::ROLE_STUDENT)
            ->whereHas('enrolledClasses', fn (Builder $query) => $query->whereIn('classes.id', $classes->pluck('id')))
            ->count();

        $attendances = ClassAttendance::query()
            ->where('tutor_id', $user->id)
            ->where('attendance_date', '>=', now()->subDays(6)->toDateString())
            ->get(['status', 'attendance_date']);
        $hadir = $attendances->where('status', 'Hadir')->count();

        $materials = Material::query()->where('user_id', $user->id)->get(['id', 'type', 'title', 'status', 'published_at']);
        $published = $materials->where('status', Material::STATUS_PUBLISHED);
        $drafts = $materials->where('status', Material::STATUS_DRAFT);

        $schedules = $this->tutorSchedules($user, $semester);
        $sessionsToday = $schedules->where('day_of_week', now()->dayOfWeekIso)->count();

        return [
            'stats' => [
                $this->stat(
                    'classes',
                    'Kelas Diajar',
                    $classes->count(),
                    $studentCount.' murid terdaftar',
                    route('tutor.classes.index', absolute: false),
                    'graduation-cap',
                ),
                $this->stat(
                    'attendance',
                    'Presensi 7 Hari',
                    $attendances->count(),
                    $attendances->isNotEmpty()
                        ? $hadir.' hadir dari '.$attendances->count().' catatan'
                        : 'Belum ada presensi tercatat',
                    route('tutor.attendance.index', absolute: false),
                    'clipboard-check',
                    $attendances->isEmpty() ? 'attention' : 'neutral',
                ),
                $this->stat(
                    'materials',
                    'Materi Terbit',
                    $published->count(),
                    $drafts->count().' draf belum terbit',
                    route('tutor.materials.index', absolute: false),
                    'book-open',
                ),
                $this->stat(
                    'sessions',
                    'Sesi Mengajar',
                    $schedules->count(),
                    $sessionsToday.' sesi hari ini',
                    route('tutor.schedules.index', absolute: false),
                    'calendar-days',
                ),
            ],
            'chart' => $this->trendChart(
                'Presensi Tercatat',
                $this->dailySeries($attendances->pluck('attendance_date'), 'catatan'),
                'catatan',
            ),
            'agenda' => $this->scheduleAgenda('Jadwal Mengajar', $schedules),
            'actions' => [
                $this->action('Presensi Kelas', route('tutor.attendance.index', absolute: false), 'clipboard-check'),
                $this->action('Jadwal Mengajar', route('tutor.schedules.index', absolute: false), 'calendar-days'),
                $this->action('Materi Belajar', route('tutor.materials.index', absolute: false), 'book-open'),
                $this->action('Kelas Saya', route('tutor.classes.index', absolute: false), 'layout-grid'),
            ],
            'panel' => [
                'title' => 'Kelas & Materi',
                'tabs' => [
                    [
                        'key' => 'kelas',
                        'label' => 'Kelas Saya',
                        'count' => $classes->count(),
                        'empty' => 'Belum ada kelas yang ditugaskan kepada Anda.',
                        'footer' => ['label' => 'Buka semua kelas', 'href' => route('tutor.classes.index', absolute: false)],
                        'items' => $classes
                            ->take(self::PANEL_ITEM_LIMIT)
                            ->map(fn (CourseClass $courseClass): array => $this->panelItem(
                                $courseClass->id,
                                $courseClass->name,
                                $courseClass->students_count.' murid · '.($courseClass->level ? 'Level '.$courseClass->level->value : 'Level belum diisi'),
                                null,
                                'neutral',
                                route('tutor.classes.students.index', $courseClass->id, absolute: false),
                            ))
                            ->values()
                            ->all(),
                    ],
                    [
                        'key' => 'materi',
                        'label' => 'Materi',
                        'count' => $materials->count(),
                        'empty' => 'Belum ada materi yang Anda unggah.',
                        'footer' => ['label' => 'Kelola materi', 'href' => route('tutor.materials.index', absolute: false)],
                        'items' => $materials
                            ->sortByDesc('id')
                            ->take(self::PANEL_ITEM_LIMIT)
                            ->map(fn (Material $material): array => $this->panelItem(
                                $material->id,
                                $material->title,
                                $material->type->label().' · '.($material->published_at?->format('d M Y') ?? 'Belum terbit'),
                                $material->status === Material::STATUS_PUBLISHED ? 'Terbit' : 'Draf',
                                $material->status === Material::STATUS_PUBLISHED ? 'success' : 'attention',
                                route('tutor.materials.edit', $material->id, absolute: false),
                            ))
                            ->values()
                            ->all(),
                    ],
                ],
            ],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Murid */
    /* ------------------------------------------------------------------ */

    /**
     * @return array<string, mixed>
     */
    private function studentDashboard(User $user): array
    {
        $semester = Semester::active()->first();

        $grades = StudentGrade::query()
            ->where('student_id', $user->id)
            ->with('courseClass:id,name')
            ->latest()
            ->get(['id', 'student_id', 'class_id', 'subject', 'score', 'grade', 'updated_at']);
        $scored = $grades->whereNotNull('score');
        $average = $scored->isNotEmpty() ? round((float) $scored->avg('score'), 1) : null;

        $materialsTotal = Material::query()->published()->count();
        $completed = MaterialProgress::query()
            ->where('user_id', $user->id)
            ->where('status', MaterialProgress::COMPLETED)
            ->whereHas('material', fn (Builder $query) => $query->published())
            ->count();
        $completedPercent = $materialsTotal > 0 ? (int) round($completed / $materialsTotal * 100) : 0;

        $attendances = ClassAttendance::query()
            ->where('student_id', $user->id)
            ->where('attendance_date', '>=', now()->subDays(29)->toDateString())
            ->get(['status']);
        $hadir = $attendances->where('status', 'Hadir')->count();
        $attendancePercent = $attendances->isNotEmpty()
            ? (int) round($hadir / $attendances->count() * 100)
            : null;

        $schedules = $this->studentSchedules($user, $semester);
        $enrolledClasses = $user->enrolledClasses()->get(['classes.id', 'classes.name']);

        return [
            'stats' => [
                $this->stat(
                    'classes',
                    'Kelas Diikuti',
                    $enrolledClasses->count(),
                    $enrolledClasses->isNotEmpty()
                        ? Str::limit($enrolledClasses->pluck('name')->take(2)->implode(' · '), 48)
                        : 'Belum terdaftar di kelas',
                    route('schedules.index', absolute: false),
                    'graduation-cap',
                ),
                $this->stat(
                    'average',
                    'Rata-rata Nilai',
                    $average ?? '—',
                    $scored->isNotEmpty() ? 'Dari '.$scored->count().' penilaian' : 'Belum ada nilai',
                    route('student.grades.index', absolute: false),
                    'award',
                    $scored->isEmpty() ? 'attention' : 'neutral',
                ),
                $this->stat(
                    'materials',
                    'Materi Selesai',
                    $completed.'/'.$materialsTotal,
                    $completedPercent.'% pustaka selesai',
                    route('materials.index', absolute: false),
                    'book-open',
                ),
                $this->stat(
                    'attendance',
                    'Kehadiran 30 Hari',
                    $attendancePercent !== null ? $attendancePercent.'%' : '—',
                    $attendances->isNotEmpty()
                        ? $hadir.' hadir dari '.$attendances->count().' catatan'
                        : 'Belum ada catatan kehadiran',
                    route('schedules.index', absolute: false),
                    'calendar-days',
                    $attendances->isEmpty() ? 'attention' : 'neutral',
                ),
            ],
            'chart' => $this->gradeChart($grades),
            'agenda' => $this->scheduleAgenda('Jadwal Belajar', $schedules),
            'actions' => [
                $this->action('Jadwal Belajar', route('schedules.index', absolute: false), 'calendar-days'),
                $this->action('Materi Belajar', route('materials.index', absolute: false), 'book-open'),
                $this->action('Nilai Saya', route('student.grades.index', absolute: false), 'award'),
                $this->action('Tes Level', route('tes-level.index', absolute: false), 'list-checks'),
                $this->action('Kritik & Saran', route('student.feedback.create', absolute: false), 'message-square'),
            ],
            'panel' => [
                'title' => 'Progres Belajar',
                'tabs' => [
                    [
                        'key' => 'nilai',
                        'label' => 'Nilai',
                        'count' => $grades->count(),
                        'empty' => 'Nilai akan muncul setelah tutor menyimpannya.',
                        'footer' => ['label' => 'Lihat semua nilai', 'href' => route('student.grades.index', absolute: false)],
                        'items' => $grades
                            ->take(self::PANEL_ITEM_LIMIT)
                            ->map(fn (StudentGrade $grade): array => $this->panelItem(
                                $grade->id,
                                $grade->subject,
                                ($grade->courseClass?->name ?? 'Kelas').' · '.$grade->updated_at->format('d M Y'),
                                $grade->score !== null ? $this->formatScore($grade->score) : 'Belum dinilai',
                                $grade->score !== null ? 'success' : 'neutral',
                                route('student.grades.index', absolute: false),
                            ))
                            ->values()
                            ->all(),
                    ],
                    [
                        'key' => 'materi',
                        'label' => 'Materi',
                        'count' => $materialsTotal,
                        'empty' => 'Belum ada materi terbit.',
                        'footer' => ['label' => 'Buka pustaka materi', 'href' => route('materials.index', absolute: false)],
                        'items' => Material::query()
                            ->published()
                            ->with(['progresses' => fn ($query) => $query->where('user_id', $user->id)])
                            ->latest('published_at')
                            ->latest('id')
                            ->limit(self::PANEL_ITEM_LIMIT)
                            ->get(['id', 'type', 'title', 'published_at'])
                            ->map(fn (Material $material): array => $this->panelItem(
                                $material->id,
                                $material->title,
                                $material->type->label().' · '.($material->published_at?->format('d M Y') ?? 'Baru'),
                                $this->progressLabel($material),
                                $material->progresses->first()?->status === MaterialProgress::COMPLETED ? 'success' : 'neutral',
                                route('materials.index', ['material' => $material->id], absolute: false),
                            ))
                            ->all(),
                    ],
                ],
            ],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Pembantu */
    /* ------------------------------------------------------------------ */

    /**
     * @return array<string, string|int>
     */
    private function stat(string $key, string $label, string|int|float $value, string $hint, string $href, string $icon, string $tone = 'neutral'): array
    {
        return [
            'key' => $key,
            'label' => $label,
            'value' => is_float($value) ? $this->formatScore($value) : $value,
            'hint' => $hint,
            'href' => $href,
            'icon' => $icon,
            'tone' => $tone,
        ];
    }

    /**
     * @return array<string, string>
     */
    private function action(string $label, string $href, string $icon): array
    {
        return ['label' => $label, 'href' => $href, 'icon' => $icon];
    }

    /**
     * @return array<string, mixed>
     */
    private function panelItem(int|string $id, string $title, string $meta, ?string $badge = null, string $tone = 'neutral', ?string $href = null): array
    {
        return [
            'id' => $id,
            'title' => $title,
            'meta' => $meta,
            'badge' => $badge,
            'tone' => $tone,
            'href' => $href,
        ];
    }

    /**
     * Titik bagan untuk 14 hari terakhir.
     *
     * @param  SupportCollection<int, Carbon|string>  $dates
     * @return array<int, array<string, string|int>>
     */
    private function dailySeries(SupportCollection $dates, string $unit): array
    {
        $start = now()->startOfDay()->subDays(self::TREND_DAYS - 1);
        $counts = $dates->groupBy(fn (Carbon|string $date): string => Carbon::parse($date)->toDateString())->map->count();

        return collect(range(0, self::TREND_DAYS - 1))
            ->map(function (int $offset) use ($start, $counts, $unit): array {
                $date = $start->copy()->addDays($offset);
                $value = (int) ($counts[$date->toDateString()] ?? 0);

                return [
                    'key' => $date->toDateString(),
                    'label' => $this->weekdayName($date).' '.$date->format('d/m'),
                    'value' => $value,
                    'detail' => $value.' '.$unit,
                ];
            })
            ->all();
    }

    /**
     * @param  array<int, array<string, string|int>>  $points
     * @return array<string, mixed>
     */
    private function trendChart(string $title, array $points, string $unit): array
    {
        return [
            'title' => $title,
            'unit' => $unit,
            'ranges' => [
                ['key' => '7', 'label' => '7 hari', 'points' => array_slice($points, -7)],
                ['key' => '14', 'label' => '14 hari', 'points' => $points],
            ],
        ];
    }

    /**
     * @param  Collection<int, StudentGrade>  $grades
     * @return array<string, mixed>
     */
    private function gradeChart(Collection $grades): array
    {
        $points = $grades
            ->whereNotNull('score')
            ->take(8)
            ->reverse()
            ->values()
            ->map(fn (StudentGrade $grade): array => [
                'key' => (string) $grade->id,
                'label' => Str::limit($grade->subject, 12),
                'value' => (int) round((float) $grade->score),
                'detail' => $grade->subject.($grade->grade ? ' · Predikat '.$grade->grade : ''),
            ])
            ->all();

        return [
            'title' => 'Nilai Terbaru',
            'unit' => 'nilai',
            'summary' => $points === [] ? 'Belum ada nilai' : count($points).' penilaian terbaru',
            'ranges' => [['key' => 'all', 'label' => 'Semua', 'points' => $points]],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function scheduleAgenda(string $title, Collection $schedules): array
    {
        $today = now()->dayOfWeekIso;

        return [
            'title' => $title,
            'today' => $today,
            'days' => collect(config('dubesia.days'))
                ->map(function (string $name, int $day) use ($schedules, $today): array {
                    $items = $schedules
                        ->where('day_of_week', $day)
                        ->sortBy('start_time')
                        ->map(fn (Schedule $schedule): array => [
                            'id' => $schedule->id,
                            'time' => substr($schedule->start_time, 0, 5).'–'.substr($schedule->end_time, 0, 5),
                            'title' => $schedule->title,
                            'meta' => collect([$schedule->class_name, $schedule->room?->name])->filter()->implode(' · '),
                        ])
                        ->values()
                        ->all();

                    return [
                        'day' => $day,
                        'name' => $name,
                        'is_today' => $day === $today,
                        'items' => $items,
                    ];
                })
                ->values()
                ->all(),
        ];
    }

    /**
     * @return Collection<int, Schedule>
     */
    private function tutorSchedules(User $user, ?Semester $semester): Collection
    {
        if (! $semester) {
            return new Collection;
        }

        return Schedule::query()
            ->where('semester_id', $semester->id)
            ->whereHas('instructor', fn (Builder $instructor) => $instructor->where(
                fn (Builder $match) => $match->where('user_id', $user->id)->orWhere('email', $user->email)
            ))
            ->with('room:id,name')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * @return Collection<int, Schedule>
     */
    private function studentSchedules(User $user, ?Semester $semester): Collection
    {
        if (! $semester) {
            return new Collection;
        }

        return Schedule::query()
            ->where('semester_id', $semester->id)
            ->whereHas('students', fn (Builder $student) => $student->where(
                fn (Builder $match) => $match->where('user_id', $user->id)->orWhere('email', $user->email)
            ))
            ->with('room:id,name')
            ->orderBy('start_time')
            ->get();
    }

    private function progressLabel(Material $material): string
    {
        return match ($material->progresses->first()?->status) {
            MaterialProgress::COMPLETED => 'Selesai',
            MaterialProgress::OPENED => 'Sedang dipelajari',
            default => 'Belum dibuka',
        };
    }

    private function formatScore(float|string $score): string
    {
        $value = (float) $score;

        return rtrim(rtrim(number_format($value, 1, ',', '.'), '0'), ',');
    }

    private function weekdayName(Carbon $date): string
    {
        return config('dubesia.days')[$date->dayOfWeekIso] ?? 'Minggu';
    }
}
