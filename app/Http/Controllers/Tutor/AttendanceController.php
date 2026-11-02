<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttendanceRequest;
use App\Models\ClassAttendance;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
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
