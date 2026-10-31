<?php

namespace App\Http\Requests;

use App\Models\Pendaftaran;
use App\Models\User;
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
        $wa = preg_replace('/\D+/', '', (string) $this->no_whatsapp);
        $wa = preg_replace('/^(62|0)/', '', $wa);
        $this->merge(['no_whatsapp' => $wa]);
    }

    public function rules(): array
    {
        // Pengajuan yang ditolak dapat diajukan ulang memakai identitas yang sama.
        $rejectedUserId = User::query()
            ->where('email', $this->input('email'))
            ->whereHas('pendaftaran', fn ($query) => $query->where('status', Pendaftaran::STATUS_DITOLAK))
            ->value('id');

        $uniqueEmail = Rule::unique('users', 'email');
        $uniqueUsername = Rule::unique('users', 'username');
        if ($rejectedUserId) {
            $uniqueEmail->ignore($rejectedUserId);
            $uniqueUsername->ignore($rejectedUserId);
        }

        return [
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'tanggal_lahir' => ['required', 'date', 'before:today'],
            'email' => ['required', 'email:rfc', 'max:255', $uniqueEmail],
            'no_whatsapp' => ['required', 'regex:/^[0-9]{9,13}$/'],
            'alamat' => ['required', 'string', 'max:1000'],
            'username' => ['required', 'string', 'min:5', 'max:30', 'alpha_dash', $uniqueUsername],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'pesan_motivasi' => ['nullable', 'string', 'max:1000'],
            'program' => ['required', Rule::in(array_keys(Pendaftaran::PROGRAMS))],
            'bukti_pembayaran' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'setuju' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'email.unique' => 'Email sudah terdaftar.',
            'username.unique' => 'Username sudah digunakan.',
            'username.min' => 'Username minimal 5 karakter.',
            'username.alpha_dash' => 'Username hanya boleh huruf, angka, strip, dan underscore.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'no_whatsapp.regex' => 'Nomor WhatsApp tidak valid.',
            'bukti_pembayaran.mimes' => 'Bukti pembayaran harus berformat JPG, PNG, atau PDF.',
            'bukti_pembayaran.max' => 'Ukuran bukti pembayaran maksimal 2 MB.',
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
            'program' => 'Program kursus',
            'bukti_pembayaran' => 'Bukti pembayaran',
        ];
    }
}
