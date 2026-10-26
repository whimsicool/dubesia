<?php

namespace App\Http\Requests\Admin;

use App\Enums\ClassLevel;
use App\Models\CourseClass;
use App\Models\User;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120', Rule::unique('classes', 'name')->ignore($this->route('courseClass'))],
            'level' => ['required', Rule::enum(ClassLevel::class)],
            'tutor_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', User::ROLE_TUTOR)],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama kelas wajib diisi.',
            'name.unique' => 'Nama kelas sudah dipakai. Tambahkan nomor batch agar berbeda.',
            'level.required' => 'Pilih level kelas.',
            'level.enum' => 'Level kelas tidak dikenal.',
            'tutor_id.required' => 'Pilih tutor pengampu.',
            'tutor_id.exists' => 'Tutor yang dipilih tidak ditemukan.',
            'capacity.integer' => 'Kapasitas harus berupa angka.',
            'capacity.min' => 'Kapasitas minimal 1 murid.',
            'capacity.max' => 'Kapasitas maksimal 1000 murid.',
        ];
    }

    /** Kapasitas baru tidak boleh lebih kecil dari murid yang sudah tergabung. */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $courseClass = $this->route('courseClass');

                if (! $courseClass instanceof CourseClass || $validator->errors()->has('capacity')) {
                    return;
                }

                $capacity = $this->input('capacity');

                if ($capacity === null || $capacity === '') {
                    return;
                }

                $enrolled = $courseClass->students()->count();

                if ((int) $capacity < $enrolled) {
                    $validator->errors()->add(
                        'capacity',
                        sprintf('Kapasitas tidak boleh lebih kecil dari jumlah murid saat ini (%d).', $enrolled)
                    );
                }
            },
        ];
    }
}
