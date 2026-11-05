<?php

namespace App\Http\Requests;

use App\Models\ClassAttendance;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'tutor';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'class_level' => ['required', Rule::in(User::CLASS_LEVELS)],
            'attendance_date' => ['required', 'date'],
            'students' => ['required', 'array', 'min:1'],
            'students.*.id' => [
                'required', 'integer', 'distinct',
                Rule::exists('users', 'id')
                    ->where('role', 'student')
                    ->where('class_level', $this->input('class_level')),
            ],
            'students.*.status' => ['required', Rule::in(ClassAttendance::STATUSES)],
            'students.*.notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'students.required' => 'Belum ada daftar murid untuk disimpan.',
            'students.*.status.required' => 'Pilih status untuk setiap murid.',
            'students.*.status.in' => 'Status presensi tidak valid.',
        ];
    }
}
