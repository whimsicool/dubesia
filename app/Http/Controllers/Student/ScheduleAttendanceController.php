<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ScheduleAttendanceController extends Controller
{
    /** Status presensi murid untuk satu pertemuan jadwal. */
    public function show(Request $request, Schedule $schedule): JsonResponse
    {
        $data = $request->validate(['date' => ['required', 'date_format:Y-m-d']]);
        $date = Carbon::createFromFormat('Y-m-d', $data['date']);

        $student = Student::where('user_id', $request->user()->id)->first();
        abort_unless($student, 403, 'Data murid tidak ditemukan.');
        abort_unless(
            $schedule->students()->where('students.id', $student->id)->exists(),
            403,
            'Jadwal ini bukan jadwal kelas Anda.'
        );
        abort_unless($this->scheduleOccursOn($schedule, $date), 422, 'Tanggal bukan tanggal pertemuan jadwal ini.');

        $attendance = Attendance::query()
            ->where('schedule_id', $schedule->id)
            ->where('student_id', $student->id)
            ->whereDate('date', $date->toDateString())
            ->first();

        return response()->json([
            'schedule' => [
                'id' => $schedule->id,
                'title' => $schedule->title,
                'class_name' => $schedule->class_name,
                'room' => $schedule->room?->name,
                'start_time' => substr((string) $schedule->start_time, 0, 5),
                'end_time' => substr((string) $schedule->end_time, 0, 5),
            ],
            'date' => $date->toDateString(),
            'status' => $attendance?->status?->value,
        ]);
    }

    private function scheduleOccursOn(Schedule $schedule, Carbon $date): bool
    {
        return $schedule->scheduled_date
            ? $schedule->scheduled_date->toDateString() === $date->toDateString()
            : (int) $schedule->day_of_week === $date->dayOfWeekIso;
    }
}
