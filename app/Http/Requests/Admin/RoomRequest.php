<?php

namespace App\Http\Requests\Admin;

use App\Enums\RoomType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Formulir hanya punya satu isian "Lokasi / Platform". Ruang online menyimpan
     * isian itu ke kolom `platform`, ruang fisik/lab ke kolom `location`.
     */
    public function storageAttributes(): array
    {
        $data = $this->validated();
        $isOnline = $data['type'] === RoomType::Online->value;

        return [
            'name' => $data['name'],
            'type' => $data['type'],
            'capacity' => $data['capacity'],
            'location' => $isOnline ? null : $data['location'],
            'platform' => $isOnline ? $data['location'] : null,
        ];
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $isOnline = $this->input('type') === RoomType::Online->value;

        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('rooms', 'name')->ignore($this->route('room'))],
            'type' => ['required', Rule::enum(RoomType::class)],
            'capacity' => ['required', 'integer', 'min:1', 'max:1000'],
            'location' => ['required', 'string', $isOnline ? 'max:50' : 'max:150'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama ruangan wajib diisi.',
            'name.unique' => 'Nama ruangan sudah dipakai.',
            'type.required' => 'Pilih jenis ruangan.',
            'type.enum' => 'Jenis ruangan tidak dikenal.',
            'capacity.required' => 'Kapasitas wajib diisi.',
            'capacity.integer' => 'Kapasitas harus berupa angka.',
            'capacity.min' => 'Kapasitas minimal 1 peserta.',
            'capacity.max' => 'Kapasitas maksimal 1000 peserta.',
            'location.required' => 'Lokasi atau platform wajib diisi.',
            'location.max' => 'Nama lokasi atau platform terlalu panjang.',
        ];
    }
}
