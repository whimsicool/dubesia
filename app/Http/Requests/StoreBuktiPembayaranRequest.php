<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBuktiPembayaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->pendaftaran !== null;
    }

    public function rules(): array
    {
        return [
            'bukti_pembayaran' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'bukti_pembayaran.required' => 'Pilih berkas bukti pembayaran terlebih dahulu.',
            'bukti_pembayaran.mimes' => 'Bukti pembayaran harus berformat JPG, PNG, atau PDF.',
            'bukti_pembayaran.max' => 'Ukuran bukti pembayaran maksimal 5 MB.',
        ];
    }

    public function attributes(): array
    {
        return [
            'bukti_pembayaran' => 'Bukti pembayaran',
        ];
    }
}
