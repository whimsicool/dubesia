<?php

namespace App\Http\Requests;

use App\Models\Pendaftaran;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRegistrasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // halaman publik
    }

    protected function prepareForValidation(): void
    {
        // buang spasi/strip, dan awalan 0 atau 62 pada nomor WhatsApp
        $wa = trim((string) $this->no_whatsapp);
        if ($wa !== '' && preg_match('/^[0-9]+$/', $wa)) {
            $wa = preg_replace('/^(62|0)/', '', $wa);
        }

        $this->merge([
            'no_whatsapp' => $wa,
            'email' => strtolower(trim((string) $this->email)),
        ]);
    }

    public function rules(): array
    {
        return [
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'tanggal_lahir' => ['required', 'date', 'before:today', 'before_or_equal:2020-12-31'],
            'email' => ['required', 'email:rfc', 'regex:/^[^@\s]+@gmail\.com$/i', 'max:255', Rule::unique('users', 'email')],
            'no_whatsapp' => ['required', 'regex:/^[0-9]+$/'],
            'alamat' => ['required', 'string', 'max:1000'],
            'asal_institusi' => ['required', 'string', 'max:255'],
            'pesan_motivasi' => ['nullable', 'string', 'max:1000'],
            'program' => ['required', Rule::in(array_keys(Pendaftaran::PROGRAMS))],
            'setuju' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'email.email' => 'Format email tidak valid. Gunakan alamat Gmail, misalnya nama@gmail.com.',
            'email.regex' => 'Email harus menggunakan domain @gmail.com.',
            'email.max' => 'Alamat email maksimal 255 karakter.',
            'tanggal_lahir.before' => 'Tanggal lahir harus sebelum hari ini.',
            'tanggal_lahir.before_or_equal' => 'Tanggal lahir maksimal 31 Desember 2020.',
            'nama_lengkap.max' => 'Nama lengkap maksimal 255 karakter.',
            'asal_institusi.max' => 'Asal institusi maksimal 255 karakter.',
            'alamat.max' => 'Alamat maksimal 1.000 karakter.',
            'program.in' => 'Pilih salah satu program yang tersedia.',
            'no_whatsapp.regex' => 'Nomor WhatsApp hanya boleh berisi angka. Hapus huruf atau simbol yang dimasukkan.',
            'email.unique' => 'Email sudah terdaftar. Masuk untuk melihat status pendaftaran Anda.',
            'setuju.accepted' => 'Persetujuan wajib dicentang sebelum mendaftar.',
        ];
    }

    public function attributes(): array
    {
        return [
            'nama_lengkap' => 'Nama lengkap',
            'tanggal_lahir' => 'Tanggal lahir',
            'no_whatsapp' => 'Nomor WhatsApp',
            'alamat' => 'Alamat',
            'asal_institusi' => 'Asal institusi',
            'program' => 'Program kursus',
        ];
    }
}
