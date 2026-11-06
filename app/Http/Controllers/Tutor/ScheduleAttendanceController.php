<?php

namespace App\Http\Controllers\Tutor;

use App\Enums\AttendanceStatus;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Schedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleAttendanceController extends Controller
{
    public function history(Request $request): Response
    {
        $tutor = $request->user();
        $records = Attendance::query()
            ->whereHas('schedule', fn ($query) => $query->where('tutor_id', $tutor->id))
            // Jadwal bertanggal tetap hanya memiliki satu pertemuan. Abaikan
            // catatan presensi lama yang tersimpan pada tanggal lain sebelum
            // jadwal tersebut diubah menjadi tanggal tertentu.
            ->whereHas('schedule', fn ($query) => $query
                ->whereNull('scheduled_date')
                ->orWhereRaw('DATE(schedules.scheduled_date) = DATE(attendances.date)'))
            ->with([
                'student:id,name',
                'schedule:id,title,class_name,room_id,start_time,end_time',
                'schedule.room:id,name',
            ])
            ->orderByDesc('date')
            ->orderBy('schedule_id')
            ->get();

        $history = $records
            ->groupBy(fn (Attendance $record) => $record->date->toDateString().'|'.$record->schedule_id)
            ->map(function ($session) {
                $first = $session->first();
                $schedule = $first->schedule;

                return [
                    'date' => $first->date->toDateString(),
                    'schedule' => [
                        'id' => $schedule->id,
                        'title' => $schedule->title,
                        'class_name' => $schedule->class_name,
                        'room' => $schedule->room?->name,
                        'start_time' => substr((string) $schedule->start_time, 0, 5),
                        'end_time' => substr((string) $schedule->end_time, 0, 5),
                    ],
                    'counts' => [
                        'present' => $session->where('status', AttendanceStatus::Present)->count(),
                        'permit' => $session->where('status', AttendanceStatus::Permit)->count(),
                        'sick' => $session->where('status', AttendanceStatus::Sick)->count(),
                        'absent' => $session->where('status', AttendanceStatus::Absent)->count(),
                    ],
                    'students' => $session->map(fn (Attendance $record) => [
                        'id' => $record->student_id,
                        'name' => $record->student?->name ?? 'Murid',
                        'status' => $record->status?->value,
                    ])->values(),
                ];
            })
            ->values();

        return Inertia::render('Tutor/Attendance/Index', ['history' => $history]);
    }

    public function show(Request $request, Schedule $schedule): JsonResponse
    {
        $this->ensureAssignedTutor($request, $schedule);
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
            'students' => $students->map(fn ($student) => [
                'id' => $student->id,
                'name' => $student->name,
                'status' => $records->get($student->id)?->status?->value,
            ])->values(),
        ]);
    }

    public function store(Request $request, Schedule $schedule): JsonResponse
    {
        $this->ensureAssignedTutor($request, $schedule);
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'students' => ['required', 'array', 'min:1'],
            'students.*.id' => ['required', 'integer', 'distinct', 'exists:students,id'],
            'students.*.status' => ['required', Rule::enum(AttendanceStatus::class)],
        ]);
        $date = Carbon::createFromFormat('Y-m-d', $data['date']);
        abort_unless($this->scheduleOccursOn($schedule, $date), 422, 'Tanggal bukan tanggal pertemuan jadwal ini.');

        $rosterIds = $schedule->students()->pluck('students.id')->map(fn ($id) => (int) $id)->all();
        $submittedIds = collect($data['students'])->pluck('id')->map(fn ($id) => (int) $id)->all();
        abort_unless(
            array_diff($submittedIds, $rosterIds) === [] && array_diff($rosterIds, $submittedIds) === [],
            422,
            'Daftar murid tidak sesuai dengan anggota kelas jadwal.'
        );

        DB::transaction(function () use ($schedule, $date, $data): void {
            foreach ($data['students'] as $student) {
                // SQLite may store a cast date as `YYYY-MM-DD 00:00:00`, so an
                // equality lookup using only `YYYY-MM-DD` misses the existing row
                // and tries to insert a duplicate of the unique schedule/student/date.
                $attendance = Attendance::query()
                    ->where('schedule_id', $schedule->id)
                    ->where('student_id', $student['id'])
                    ->whereDate('date', $date->toDateString())
                    ->first();

                if ($attendance) {
                    $attendance->update(['status' => $student['status']]);

                    continue;
                }

                Attendance::create([
                    'schedule_id' => $schedule->id,
                    'student_id' => $student['id'],
                    'date' => $date->toDateString(),
                    'status' => $student['status'],
                ]);
            }
        });

        return response()->json(['message' => 'Presensi berhasil disimpan.']);
    }

    private function ensureAssignedTutor(Request $request, Schedule $schedule): void
    {
        abort_unless($request->user()?->isTutor(), 403);
        abort_unless((int) $schedule->tutor_id === $request->user()->id, 403);
    }

    private function scheduleOccursOn(Schedule $schedule, Carbon $date): bool
    {
        return $schedule->scheduled_date
            ? $schedule->scheduled_date->toDateString() === $date->toDateString()
            : (int) $schedule->day_of_week === $date->dayOfWeekIso;
    }
}
