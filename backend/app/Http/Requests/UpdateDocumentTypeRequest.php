<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDocumentTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    public function rules(): array
    {
        $id = $this->route('document_type')?->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('document_types', 'name')->ignore($id)],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'required', 'boolean'],
        ];
    }
}
