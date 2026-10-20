<?php

namespace App\Http\Requests\Admin;

use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Services\ScheduleConflictService;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Throwable;

class ScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /** Semester diambil dari server (jadwal yang diedit tetap di semester aslinya, jadwal baru di semester aktif). */
    protected function prepareForValidation(): void
    {
        /** @var Schedule|null $existing */
        $existing = $this->route('schedule');
        $day = $existing?->day_of_week;

        if ($this->filled('scheduled_date')) {
            try {
                $day = Carbon::createFromFormat('Y-m-d', $this->input('scheduled_date'))->dayOfWeekIso;
            } catch (Throwable) {
                // Biarkan validasi format tanggal menangani masukan yang tidak valid.
            }
        }

        $this->merge([
            'semester_id' => $existing?->semester_id ?? Semester::active()->value('id'),
            'day_of_week' => $day,
            // Field kelas/batch tidak lagi ditampilkan; judul jadwal menjadi nama kelas.
            'class_name' => $this->input('title'),
            'program_id' => $this->filled('program_id') ? $this->input('program_id') : null,
        ]);
    }

    public function rules(): array
    {
        $days = array_keys(config('dubesia.days'));

        return [
            'semester_id' => ['required', 'exists:semesters,id'],
            'program_id' => ['nullable', 'exists:programs,id'],
            'instructor_id' => ['required', 'exists:instructors,id'],
            'room_id' => ['required', 'exists:rooms,id'],
            'title' => ['required', 'string', 'max:150'],
            'class_name' => ['required', 'string', 'max:120'],
            'scheduled_date' => [$this->route('schedule') && ! $this->route('schedule')->scheduled_date ? 'nullable' : 'required', 'date_format:Y-m-d'],
            'day_of_week' => ['required', 'integer', 'in:'.implode(',', $days)],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['integer', 'distinct', 'exists:students,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'semester_id.required' => 'Belum ada semester aktif. Aktifkan satu semester terlebih dahulu.',
            'instructor_id.required' => 'Pilih instruktur.',
            'room_id.required' => 'Pilih ruang / platform.',
            'title.required' => 'Judul sesi wajib diisi.',
            'class_name.required' => 'Nama kelas / batch wajib diisi.',
            'scheduled_date.required' => 'Pilih tanggal jadwal.',
            'scheduled_date.date_format' => 'Format tanggal jadwal tidak valid.',
            'day_of_week.in' => 'Jadwal hanya dapat dibuat pada hari Senin sampai Sabtu.',
            'start_time.required' => 'Jam mulai wajib diisi.',
            'start_time.date_format' => 'Format jam mulai tidak valid (HH:MM).',
            'end_time.required' => 'Jam selesai wajib diisi.',
            'end_time.date_format' => 'Format jam selesai tidak valid (HH:MM).',
            'end_time.after' => 'Jam selesai harus setelah jam mulai.',
        ];
    }

    /** Validasi lanjutan: kapasitas ruang dan deteksi bentrok (instruktur / ruang / murid). */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $data = $validator->validated();
                $studentIds = array_map('intval', $data['student_ids'] ?? []);

                if (! empty($data['scheduled_date'])) {
                    $semester = Semester::find($data['semester_id']);
                    $date = Carbon::createFromFormat('Y-m-d', $data['scheduled_date']);

                    if ($semester && ($date->lt($semester->start_date) || $date->gt($semester->end_date))) {
                        $validator->errors()->add('scheduled_date', 'Tanggal jadwal harus berada dalam periode aktif.');
                        return;
                    }
                }

                $room = Room::find($data['room_id']);
                if ($room && count($studentIds) > $room->capacity) {
                    $validator->errors()->add(
                        'student_ids',
                        sprintf('Jumlah peserta (%d) melebihi kapasitas %s (%d).', count($studentIds), $room->name, $room->capacity)
                    );
                }

                $conflicts = app(ScheduleConflictService::class)->check(
                    semesterId: (int) $data['semester_id'],
                    day: (int) $data['day_of_week'],
                    start: $data['start_time'],
                    end: $data['end_time'],
                    instructorId: (int) $data['instructor_id'],
                    roomId: (int) $data['room_id'],
                    studentIds: $studentIds,
                    ignoreId: $this->route('schedule')?->id,
                    scheduledDate: $data['scheduled_date'] ?? null,
                );

                $fieldFor = ['instructor' => 'instructor_id', 'room' => 'room_id', 'students' => 'student_ids'];

                foreach ($conflicts->groupBy('type') as $type => $items) {
                    $validator->errors()->add($fieldFor[$type], $items->pluck('message')->implode(' '));
                }
            },
        ];
    }
}
