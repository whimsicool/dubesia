<?php

namespace App\Http\Requests;

use App\Models\Pendaftaran;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRegistrasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->pendaftaran?->status === Pendaftaran::STATUS_DITOLAK;
    }

    protected function prepareForValidation(): void
    {
        $wa = preg_replace('/\D+/', '', (string) $this->no_whatsapp);
        $wa = preg_replace('/^(62|0)/', '', $wa);
        $this->merge(['no_whatsapp' => $wa]);
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'tanggal_lahir' => ['required', 'date', 'before:today'],
            'email' => ['required', 'email:rfc', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'no_whatsapp' => ['required', 'regex:/^[0-9]{9,13}$/'],
            'alamat' => ['required', 'string', 'max:1000'],
            'username' => ['required', 'string', 'min:5', 'max:30', 'alpha_dash', Rule::unique('users', 'username')->ignore($userId)],
            'pesan_motivasi' => ['nullable', 'string', 'max:1000'],
            'program' => ['required', Rule::in(array_keys(Pendaftaran::PROGRAMS))],
            'bukti_pembayaran' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'setuju' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'email.unique' => 'Email sudah digunakan akun lain.',
            'username.unique' => 'Username sudah digunakan akun lain.',
            'username.min' => 'Username minimal 5 karakter.',
            'username.alpha_dash' => 'Username hanya boleh huruf, angka, strip, dan underscore.',
            'no_whatsapp.regex' => 'Nomor WhatsApp tidak valid.',
            'bukti_pembayaran.mimes' => 'Bukti pembayaran harus berformat JPG, PNG, atau PDF.',
            'bukti_pembayaran.max' => 'Ukuran bukti pembayaran maksimal 5 MB.',
            'setuju.accepted' => 'Persetujuan wajib dicentang.',
        ];
    }
}
