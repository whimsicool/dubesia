<?php

namespace App\Http\Requests\Manage;

use App\Enums\MaterialType;
use App\Models\Material;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class MaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Material|null $material */
        $material = $this->route('material');

        return $material
            ? Gate::allows('update', $material)
            : Gate::allows('create', Material::class);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_featured' => $this->boolean('is_featured'),
        ]);
    }

    public function materialType(): ?MaterialType
    {
        return MaterialType::tryFrom((string) $this->input('type'));
    }

    public function rules(): array
    {
        $type = $this->materialType();

        $fileRules = $type?->usesFile()
            ? ['nullable', 'file', 'max:'.config('dubesia.materials.max_upload_kb'), 'mimes:'.implode(',', $type->allowedExtensions())]
            : ['prohibited'];

        return [
            'type' => ['required', Rule::enum(MaterialType::class)],
            'title' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:600'],
            'topic' => ['nullable', 'string', 'max:100'],
            'level' => ['nullable', 'string', Rule::in(config('dubesia.materials.levels'))],
            'status' => ['required', Rule::in([Material::STATUS_DRAFT, Material::STATUS_PUBLISHED])],
            'is_featured' => ['boolean'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:6000'],
            'page_count' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'body' => [$type === MaterialType::Article ? 'required' : 'nullable', 'string', 'max:200000'],
            'external_url' => [$type === MaterialType::Link ? 'required' : 'nullable', 'url:http,https', 'max:2048'],
            'file' => $fileRules,
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Pilih jenis materi.',
            'title.required' => 'Judul materi wajib diisi.',
            'body.required' => 'Isi artikel wajib diisi.',
            'external_url.required' => 'Tautan wajib diisi.',
            'external_url.url' => 'Tautan harus berupa URL http:// atau https:// yang valid.',
            'file.max' => 'Ukuran berkas melebihi batas unggah ('.round(config('dubesia.materials.max_upload_kb') / 1024).' MB).',
            'file.mimes' => 'Format berkas tidak didukung untuk jenis materi ini.',
            'file.uploaded' => 'Berkas gagal diunggah. Ukuran kemungkinan melebihi batas server (upload_max_filesize / post_max_size).',
            'file.prohibited' => 'Jenis materi ini tidak menerima berkas unggahan.',
            'level.in' => 'Level tidak valid.',
        ];
    }

    /** Materi berbasis berkas wajib punya berkas ATAU tautan (embed). */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $type = $this->materialType();
                if (! $type?->usesFile()) {
                    return;
                }

                /** @var Material|null $existing */
                $existing = $this->route('material');
                $hasExistingFile = $existing?->hasFile() && $existing->type->usesFile();

                if (! $this->hasFile('file') && blank($this->input('external_url')) && ! $hasExistingFile) {
                    $validator->errors()->add('file', 'Unggah berkas atau isi tautan materi.');
                }
            },
        ];
    }
}
