<?php

namespace App\Http\Requests\Admin;

use App\Models\ClassGroup;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Sequence 3.1.1 / 5.1.1: ValidasiDataKelas() */
class ClassGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        /** @var ClassGroup|null $classGroup */
        $classGroup = $this->route('classGroup');

        return [
            'name' => ['required', 'string', 'max:120', Rule::unique('class_groups', 'name')->ignore($classGroup?->id)],
            'level' => ['required', Rule::in(array_keys(config('dubesia.class_levels')))],
            'description' => ['nullable', 'string', 'max:1000'],
            'tutor_id' => ['required', 'integer', 'exists:instructors,id'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kelas wajib diisi.',
            'name.unique' => 'Nama kelas sudah dipakai. Gunakan nama lain.',
            'level.required' => 'Pilih level kelas.',
            'level.in' => 'Level tidak valid.',
            'tutor_id.required' => 'Pilih tutor untuk kelas ini.',
            'tutor_id.exists' => 'Tutor yang dipilih tidak ditemukan.',
            'capacity.min' => 'Kapasitas minimal 1 murid.',
        ];
    }

    /** Kapasitas baru tidak boleh lebih kecil dari jumlah murid yang sudah masuk. */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                /** @var ClassGroup|null $classGroup */
                $classGroup = $this->route('classGroup');
                $capacity = $this->input('capacity');

                if ($validator->errors()->isNotEmpty() || ! $classGroup || $capacity === null || $capacity === '') {
                    return;
                }

                $members = $classGroup->students()->count();
                if ((int) $capacity < $members) {
                    $validator->errors()->add('capacity', "Kapasitas tidak boleh lebih kecil dari jumlah murid saat ini ({$members}).");
                }
            },
        ];
    }
}
