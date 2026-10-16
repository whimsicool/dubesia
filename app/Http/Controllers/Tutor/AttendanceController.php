<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttendanceRequest;
use App\Models\ClassAttendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'level' => ['nullable', Rule::in(User::CLASS_LEVELS)],
            'date' => ['nullable', 'date'],
        ]);

        $level = $filters['level'] ?? User::CLASS_LEVELS[0];
        $date = $filters['date'] ?? now()->toDateString();

        $students = User::query()
            ->where('role', 'student')
            ->where('class_level', $level)
            ->orderBy('name')
            ->get(['id', 'name', 'class_level']);

        $savedRecords = ClassAttendance::query()
            ->whereIn('student_id', $students->pluck('id'))
            ->whereDate('attendance_date', $date)
            ->get()
            ->keyBy('student_id');
        $hasSavedAttendance = $savedRecords->isNotEmpty();

        $historyDates = ClassAttendance::query()
            ->where('class_level', $level)
            ->select('attendance_date')
            ->distinct()
            ->orderByDesc('attendance_date')
            ->limit(10)
            ->pluck('attendance_date');

        $history = ClassAttendance::query()
            ->where('class_level', $level)
            ->whereIn('attendance_date', $historyDates)
            ->with('student:id,name')
            ->orderByDesc('attendance_date')
            ->get()
            ->groupBy(fn (ClassAttendance $record) => $record->attendance_date->toDateString())
            ->map(fn ($records, $recordDate) => [
                'date' => $recordDate,
                'total' => $records->count(),
                'hadir' => $records->where('status', 'Hadir')->count(),
                'izin' => $records->where('status', 'Izin')->count(),
                'sakit' => $records->where('status', 'Sakit')->count(),
                'alpa' => $records->where('status', 'Alpa')->count(),
                'students' => $records->map(fn (ClassAttendance $record) => [
                    'id' => $record->student_id,
                    'name' => $record->student?->name ?? 'Murid',
                    'status' => $record->status,
                    'notes' => $record->notes,
                ])->values(),
            ])
            ->values();

        return Inertia::render('Tutor/Attendance/Index', [
            'levels' => User::CLASS_LEVELS,
            'selectedLevel' => $level,
            'attendanceDate' => $date,
            'hasSavedAttendance' => $hasSavedAttendance,
            'history' => $history,
            'students' => $students->map(fn (User $student) => [
                'id' => $student->id,
                'name' => $student->name,
                'status' => $savedRecords->get($student->id)?->status,
                'notes' => $savedRecords->get($student->id)?->notes ?? '',
            ])->values(),
        ]);
    }

    public function store(StoreAttendanceRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $students = User::query()
            ->where('role', 'student')
            ->where('class_level', $data['class_level'])
            ->orderBy('id')
            ->get(['id']);

        $expectedIds = $students->pluck('id')->sort()->values()->all();
        $submittedIds = collect($data['students'])
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->sort()
            ->values()
            ->all();

        if ($expectedIds !== $submittedIds) {
            return back()->withErrors([
                'students' => 'Daftar murid berubah. Muat ulang halaman sebelum menyimpan.',
            ])->withInput();
        }

        if (ClassAttendance::query()
            ->where('class_level', $data['class_level'])
            ->whereDate('attendance_date', $data['attendance_date'])
            ->exists()) {
            return back()->withErrors([
                'students' => 'Presensi tanggal ini sudah tersimpan. Buka tanggalnya di riwayat untuk mengubah.',
            ])->withInput();
        }

        DB::transaction(function () use ($data, $request): void {
            foreach ($data['students'] as $student) {
                // SQLite can store a cast date as "YYYY-MM-DD 00:00:00".
                // Match by calendar date so editing an existing record updates it
                // instead of attempting a second insert under the unique index.
                $attendance = ClassAttendance::query()
                    ->where('student_id', $student['id'])
                    ->whereDate('attendance_date', $data['attendance_date'])
                    ->first();

                $attendance ??= new ClassAttendance([
                    'student_id' => $student['id'],
                    'attendance_date' => $data['attendance_date'],
                ]);

                $attendance->fill([
                    'tutor_id' => $request->user()->id,
                    'class_level' => $data['class_level'],
                    'status' => $student['status'],
                    'notes' => $student['notes'] ?? null,
                ])->save();
            }
        });

        return redirect()->route('tutor.attendance.index', [
            'level' => $data['class_level'],
            'date' => $data['attendance_date'],
        ])->with('success', 'Presensi berhasil disimpan.');
    }

    public function updateHistory(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'class_level' => ['required', Rule::in(User::CLASS_LEVELS)],
            'attendance_date' => ['required', 'date'],
            'students' => ['required', 'array', 'min:1'],
            'students.*.id' => ['required', 'integer', 'distinct'],
            'students.*.status' => ['required', Rule::in(ClassAttendance::STATUSES)],
            'students.*.notes' => ['nullable', 'string', 'max:500'],
        ]);

        $records = ClassAttendance::query()
            ->where('class_level', $data['class_level'])
            ->whereDate('attendance_date', $data['attendance_date'])
            ->get()
            ->keyBy('student_id');
        $submittedIds = collect($data['students'])
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->sort()
            ->values()
            ->all();

        if ($records->isEmpty() || $records->keys()->map(fn ($id) => (int) $id)->sort()->values()->all() !== $submittedIds) {
            return back()->withErrors([
                'students' => 'Data riwayat berubah. Muat ulang halaman sebelum menyimpan.',
            ]);
        }

        DB::transaction(function () use ($data, $records): void {
            foreach ($data['students'] as $student) {
                $record = $records->get($student['id']);
                $record->fill([
                    'status' => $student['status'],
                    'notes' => $student['notes'] ?? null,
                ])->save();
            }
        });

        return back()->with('success', 'Perubahan presensi berhasil disimpan.');
    }
}
