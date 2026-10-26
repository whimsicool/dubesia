<?php

namespace App\Http\Requests\Admin;

use App\Enums\RoomType;
use App\Models\Room;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Sequence 3.1.1 / 5.1.1: ValidasiDataRuang() */
class RoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    protected function prepareForValidation(): void
    {
        foreach (['name', 'location', 'platform'] as $field) {
            if (is_string($this->input($field))) {
                $this->merge([$field => trim($this->input($field)) ?: null]);
            }
        }
    }

    public function rules(): array
    {
        /** @var Room|null $room */
        $room = $this->route('room');

        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('rooms', 'name')->ignore($room?->id)],
            'type' => ['required', Rule::enum(RoomType::class)],
            'location' => ['nullable', 'required_unless:type,online', 'string', 'max:150'],
            'platform' => ['nullable', 'required_if:type,online', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama ruangan wajib diisi.',
            'name.unique' => 'Nama ruangan sudah dipakai. Gunakan nama lain.',
            'type.required' => 'Pilih jenis ruangan.',
            'type.enum' => 'Jenis ruangan tidak valid.',
            'location.required_unless' => 'Lokasi wajib diisi untuk ruang fisik / laboratorium.',
            'platform.required_if' => 'Platform wajib diisi untuk ruang online (mis. Zoom, Google Meet).',
            'capacity.required' => 'Kapasitas wajib diisi.',
            'capacity.min' => 'Kapasitas minimal 1.',
            'capacity.max' => 'Kapasitas maksimal 500.',
        ];
    }

    /** Kapasitas tidak boleh di bawah jumlah peserta jadwal terbesar yang memakai ruang ini. */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                /** @var Room|null $room */
                $room = $this->route('room');

                if (! $room || $validator->errors()->has('capacity')) {
                    return;
                }

                $largest = (int) $room->schedules()->withCount('students')->get()->max('students_count');

                if ((int) $this->input('capacity') < $largest) {
                    $validator->errors()->add(
                        'capacity',
                        "Kapasitas tidak boleh di bawah {$largest} — jumlah peserta pada jadwal terbesar yang memakai ruang ini."
                    );
                }
            },
        ];
    }

    /** Data bersih: lokasi/platform yang tidak relevan dengan jenisnya dikosongkan. */
    public function roomData(): array
    {
        $data = $this->validated();

        if ($data['type'] === RoomType::Online->value) {
            $data['location'] ??= null;
        } else {
            $data['platform'] = null;
        }

        return $data;
    }
}
