<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TolakPendaftaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'catatan_verifikasi' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'catatan_verifikasi.required' => 'Catatan perbaikan wajib diisi.',
            'catatan_verifikasi.min'      => 'Catatan minimal 10 karakter.',
        ];
    }
}