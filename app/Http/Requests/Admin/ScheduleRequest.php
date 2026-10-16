<?php

namespace App\Http\Requests\Admin;

use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Services\ScheduleConflictService;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

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

        $this->merge([
            'semester_id' => $existing?->semester_id ?? Semester::active()->value('id'),
        ]);
    }

    public function rules(): array
    {
        $days = array_keys(config('dubesia.days'));

        return [
            'semester_id' => ['required', 'exists:semesters,id'],
            'program_id' => ['required', 'exists:programs,id'],
            'instructor_id' => ['required', 'exists:instructors,id'],
            'room_id' => ['required', 'exists:rooms,id'],
            'title' => ['required', 'string', 'max:150'],
            'class_name' => ['required', 'string', 'max:120'],
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
            'program_id.required' => 'Pilih program studi.',
            'instructor_id.required' => 'Pilih instruktur.',
            'room_id.required' => 'Pilih ruang / platform.',
            'title.required' => 'Judul sesi wajib diisi.',
            'class_name.required' => 'Nama kelas / batch wajib diisi.',
            'day_of_week.required' => 'Pilih hari.',
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
                );

                $fieldFor = ['instructor' => 'instructor_id', 'room' => 'room_id', 'students' => 'student_ids'];

                foreach ($conflicts->groupBy('type') as $type => $items) {
                    $validator->errors()->add($fieldFor[$type], $items->pluck('message')->implode(' '));
                }
            },
        ];
    }
}
