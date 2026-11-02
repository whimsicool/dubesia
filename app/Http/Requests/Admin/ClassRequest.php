<?php

namespace App\Http\Requests\Admin;

use App\Enums\ClassLevel;
use App\Models\User;
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
        ];
    }
}
