<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Semester;
use App\Models\User;
use Carbon\Constants\UnitValue;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ScheduleViewController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $semester = Semester::active()->first();
        $schedules = collect();
        $options = ['programs' => [], 'instructors' => [], 'rooms' => []];
        $weekStart = $this->resolveWeekStart($request->query('week'));
        $filters = [
            'day' => $request->integer('day') ?: null,
            'program_id' => $request->integer('program_id') ?: null,
            'instructor_id' => $request->integer('instructor_id') ?: null,
            'room_id' => $request->integer('room_id') ?: null,
            'q' => trim((string) $request->query('q', '')) ?: null,
        ];

        if ($semester) {
            [$schedules, $options] = $this->loadScheduleData($semester, $user, $filters);
        }

        return Inertia::render('Schedules/Index', [
            'semester' => $semester ? [
                'name' => $semester->name,
                'start_date' => Carbon::parse($semester->start_date)->format('Y-m-d'),
                'end_date' => Carbon::parse($semester->end_date)->format('Y-m-d'),
            ] : null,
            'schedules' => $schedules,
            'week' => $this->weekData($weekStart, $semester),
            'filters' => $filters,
            'options' => $options,
            'audience' => $user->isTutor() ? 'tutor' : 'student',
            'routeName' => $user->isTutor() ? 'tutor.schedules.index' : 'schedules.index',
        ]);
    }

    private function loadScheduleData(Semester $semester, User $user, array $filters): array
    {
        $baseQuery = Schedule::query()->where('semester_id', $semester->id);

        if ($user->isTutor()) {
            $baseQuery->whereHas('instructor', fn ($instructor) => $instructor->where(function ($match) use ($user) {
                $match->where('user_id', $user->id)->orWhere('email', $user->email);
            }));
        } else {
            $baseQuery->whereHas('students', fn ($student) => $student->where(function ($match) use ($user) {
                $match->where('user_id', $user->id)->orWhere('email', $user->email);
            }));
        }

        $available = (clone $baseQuery)->with(['program:id,name,category', 'instructor:id,name', 'room:id,name'])->get();
        $options = [
            'programs' => $available->pluck('program')->filter()->unique('id')->sortBy('name')->values()->map(fn ($program) => [
                'id' => $program->id, 'name' => $program->name,
            ]),
            'instructors' => $available->pluck('instructor')->unique('id')->sortBy('name')->values()->map(fn ($instructor) => [
                'id' => $instructor->id, 'name' => $instructor->name,
            ]),
            'rooms' => $available->pluck('room')->unique('id')->sortBy('name')->values()->map(fn ($room) => [
                'id' => $room->id, 'name' => $room->name,
            ]),
        ];

        $query = clone $baseQuery;
        $this->applyFilters($query, $filters);
        $schedules = $query->with(['program:id,name,category', 'instructor:id,name', 'room:id,name,type,platform,capacity', 'students:id'])
            ->orderBy('day_of_week')->orderBy('start_time')->get()
            ->map(fn (Schedule $schedule) => $this->formatSchedule($schedule))->values();

        return [$schedules, $options];
    }

    private function applyFilters($query, array $filters): void
    {
        foreach (['day' => 'day_of_week', 'program_id' => 'program_id', 'instructor_id' => 'instructor_id', 'room_id' => 'room_id'] as $filter => $column) {
            if ($filters[$filter]) {
                $query->where($column, $filters[$filter]);
            }
        }

        if ($filters['q']) {
            $like = '%'.addcslashes($filters['q'], '%_\\').'%';
            $query->where(fn ($search) => $search
                ->where('title', 'like', $like)
                ->orWhere('class_name', 'like', $like)
                ->orWhereHas('program', fn ($program) => $program->where('name', 'like', $like))
                ->orWhereHas('instructor', fn ($instructor) => $instructor->where('name', 'like', $like))
                ->orWhereHas('room', fn ($room) => $room->where('name', 'like', $like)));
        }
    }

    private function formatSchedule(Schedule $schedule): array
    {
        return [
            'id' => $schedule->id,
            'title' => $schedule->title,
            'class_name' => $schedule->class_name,
            'day_of_week' => (int) $schedule->day_of_week,
            'scheduled_date' => $schedule->scheduled_date ? Carbon::parse($schedule->scheduled_date)->toDateString() : null,
            'day_name' => config('dubesia.days')[$schedule->day_of_week] ?? 'Hari tidak diketahui',
            'start_time' => substr($schedule->start_time, 0, 5),
            'end_time' => substr($schedule->end_time, 0, 5),
            'program' => $schedule->program ? [
                'name' => $schedule->program->name,
                'category' => $schedule->program->category->value,
            ] : null,
            'instructor' => ['name' => $schedule->instructor->name, 'initials' => $schedule->instructor->initials],
            'room' => [
                'name' => $schedule->room->name,
                'type' => $schedule->room->type->value,
                'platform' => $schedule->room->platform,
                'capacity' => $schedule->room->capacity,
            ],
            'participants' => $schedule->students->count(),
        ];
    }

    private function weekData(Carbon $weekStart, ?Semester $semester): array
    {
        return [
            'start' => $weekStart->toDateString(),
            'end' => $weekStart->copy()->addDays(5)->toDateString(),
            'prev' => $weekStart->copy()->subWeek()->toDateString(),
            'next' => $weekStart->copy()->addWeek()->toDateString(),
            'is_current' => $weekStart->equalTo(now()->startOfWeek(UnitValue::MONDAY)->startOfDay()),
            'today' => now()->toDateString(),
            'days' => collect(config('dubesia.days'))->map(function ($name, $day) use ($weekStart, $semester) {
                $date = $weekStart->copy()->addDays($day - 1);

                return [
                    'day' => (int) $day,
                    'name' => $name,
                    'date' => $date->toDateString(),
                    'in_semester' => $semester ? $date->between($semester->start_date, $semester->end_date) : false,
                ];
            })->values()->all(),
        ];
    }

    private function resolveWeekStart(mixed $week): Carbon
    {
        try {
            return Carbon::parse($week ?: 'now')->startOfWeek(UnitValue::MONDAY)->startOfDay();
        } catch (Throwable) {
            return Carbon::now()->startOfWeek(UnitValue::MONDAY)->startOfDay();
        }
    }
}
