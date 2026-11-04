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
        $userId = $this->user()->id;

        return [
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'tanggal_lahir' => ['required', 'date', 'before:today'],
            'email' => ['required', 'email:rfc', 'regex:/^[^@\s]+@gmail\.com$/i', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'no_whatsapp' => ['required', 'regex:/^[0-9]+$/'],
            'alamat' => ['required', 'string', 'max:1000'],
            'asal_institusi' => ['required', 'string', 'max:255'],
            'pendidikan_terakhir' => ['required', Rule::in(Pendaftaran::PENDIDIKAN_TERAKHIR)],
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
            'email.email' => 'Format email tidak valid. Gunakan alamat Gmail, misalnya nama@gmail.com.',
            'email.regex' => 'Email harus menggunakan domain @gmail.com.',
            'email.max' => 'Alamat email maksimal 255 karakter.',
            'tanggal_lahir.before' => 'Tanggal lahir harus sebelum hari ini.',
            'nama_lengkap.max' => 'Nama lengkap maksimal 255 karakter.',
            'asal_institusi.max' => 'Asal institusi maksimal 255 karakter.',
            'alamat.max' => 'Alamat maksimal 1.000 karakter.',
            'program.in' => 'Pilih salah satu program yang tersedia.',
            'pendidikan_terakhir.in' => 'Pilih salah satu jenjang pendidikan yang tersedia.',
            'no_whatsapp.regex' => 'Nomor WhatsApp hanya boleh berisi angka. Hapus huruf atau simbol yang dimasukkan.',
            'email.unique' => 'Email sudah digunakan akun lain.',
            'bukti_pembayaran.mimes' => 'Bukti pembayaran harus berformat JPG, PNG, atau PDF.',
            'bukti_pembayaran.max' => 'Ukuran bukti pembayaran maksimal 5 MB.',
            'setuju.accepted' => 'Persetujuan wajib dicentang.',
        ];
    }
}
