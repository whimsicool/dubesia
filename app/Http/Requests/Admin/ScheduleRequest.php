<?php

namespace App\Http\Requests\Admin;

use App\Models\CourseClass;
use App\Models\Instructor;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use App\Services\ScheduleConflictService;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
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
            'program_id' => $this->filled('program_id') ? $this->input('program_id') : null,
        ]);
    }

    public function rules(): array
    {
        $days = array_keys(config('dubesia.days'));

        return [
            'semester_id' => ['required', 'exists:semesters,id'],
            'program_id' => ['nullable', 'exists:programs,id'],
            // Kelas, tutor, dan murid dipilih dari data yang dikelola di Kelola Kelas dan Data Murid & Tutor.
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'tutor_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', User::ROLE_TUTOR)],
            'room_id' => ['required', 'exists:rooms,id'],
            'scheduled_date' => [$this->route('schedule') && ! $this->route('schedule')->scheduled_date ? 'nullable' : 'required', 'date_format:Y-m-d'],
            'day_of_week' => ['required', 'integer', 'in:'.implode(',', $days)],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['integer', 'distinct', Rule::exists('users', 'id')->where('role', User::ROLE_STUDENT)],
        ];
    }

    public function messages(): array
    {
        return [
            'semester_id.required' => 'Belum ada semester aktif. Aktifkan satu semester terlebih dahulu.',
            'class_id.required' => 'Pilih kelas.',
            'class_id.exists' => 'Kelas yang dipilih tidak ditemukan.',
            'tutor_id.required' => 'Pilih tutor.',
            'tutor_id.exists' => 'Tutor yang dipilih tidak ditemukan.',
            'room_id.required' => 'Pilih ruang / platform.',
            'scheduled_date.required' => 'Pilih tanggal jadwal.',
            'scheduled_date.date_format' => 'Format tanggal jadwal tidak valid.',
            'day_of_week.in' => 'Jadwal hanya dapat dibuat pada hari Senin sampai Sabtu.',
            'start_time.required' => 'Jam mulai wajib diisi.',
            'start_time.date_format' => 'Format jam mulai tidak valid (HH:MM).',
            'end_time.required' => 'Jam selesai wajib diisi.',
            'end_time.date_format' => 'Format jam selesai tidak valid (HH:MM).',
            'end_time.after' => 'Jam selesai harus setelah jam mulai.',
            'student_ids.*.exists' => 'Murid yang dipilih tidak ditemukan.',
        ];
    }

    /** Validasi lanjutan: kapasitas ruang dan deteksi bentrok (tutor / ruang / murid). */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $data = $validator->validated();
                $studentUserIds = array_map('intval', $data['student_ids'] ?? []);

                if (! empty($data['scheduled_date'])) {
                    $semester = Semester::find($data['semester_id']);
                    $date = Carbon::createFromFormat('Y-m-d', $data['scheduled_date']);

                    if ($semester && ($date->lt($semester->start_date) || $date->gt($semester->end_date))) {
                        $validator->errors()->add('scheduled_date', 'Tanggal jadwal harus berada dalam periode aktif.');

                        return;
                    }
                }

                $class = CourseClass::find($data['class_id']);

                if ($class && $class->capacity !== null && count($studentUserIds) > $class->capacity) {
                    $validator->errors()->add(
                        'student_ids',
                        sprintf('Jumlah murid (%d) melebihi kapasitas kelas %s (%d).', count($studentUserIds), $class->name, $class->capacity)
                    );
                }

                $room = Room::find($data['room_id']);
                if ($room && count($studentUserIds) > $room->capacity) {
                    $validator->errors()->add(
                        'student_ids',
                        sprintf('Jumlah peserta (%d) melebihi kapasitas %s (%d).', count($studentUserIds), $room->name, $room->capacity)
                    );
                }

                $conflicts = app(ScheduleConflictService::class)->check(
                    semesterId: (int) $data['semester_id'],
                    day: (int) $data['day_of_week'],
                    start: $data['start_time'],
                    end: $data['end_time'],
                    // Tutor pilihan pengguna dipetakan ke baris instruktur yang dipakai jadwal.
                    instructorId: Instructor::where('user_id', $data['tutor_id'])->value('id'),
                    roomId: (int) $data['room_id'],
                    studentIds: $this->parallelStudentIds($studentUserIds),
                    ignoreId: $this->route('schedule')?->id,
                    scheduledDate: $data['scheduled_date'] ?? null,
                );

                $fieldFor = ['instructor' => 'tutor_id', 'room' => 'room_id', 'students' => 'student_ids'];

                foreach ($conflicts->groupBy('type') as $type => $items) {
                    $validator->errors()->add($fieldFor[$type], $items->pluck('message')->implode(' '));
                }
            },
        ];
    }

    /**
     * Id baris `students` yang sudah tertaut ke murid terpilih. Murid belum punya baris
     * students sampai jadwal pertama disimpan, jadi mereka tidak dapat bentrok lebih dulu.
     *
     * @param  array<int, int>  $userIds
     * @return array<int, int>
     */
    private function parallelStudentIds(array $userIds): array
    {
        if ($userIds === []) {
            return [];
        }

        return Student::whereIn('user_id', $userIds)->pluck('id')->map(fn ($id) => (int) $id)->all();
    }
}
