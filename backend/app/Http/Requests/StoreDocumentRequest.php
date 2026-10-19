<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'student_name' => ['required', 'string', 'max:255'],
            'document_type_id' => ['required', 'integer', 'exists:document_types,id'],
            'purpose' => ['required', 'string', 'max:2000'],
            'date_submitted' => ['sometimes', 'date'],
        ];
    }
}
