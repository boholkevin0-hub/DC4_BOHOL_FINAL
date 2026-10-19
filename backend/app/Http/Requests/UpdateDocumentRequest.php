<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $documentRequest = $this->route('document_request');

        return $this->user()?->isAdmin()
            || $documentRequest?->user_id === $this->user()?->id;
    }

    public function rules(): array
    {
        return [
            'student_name' => ['sometimes', 'required', 'string', 'max:255'],
            'document_type_id' => ['sometimes', 'required', 'integer', 'exists:document_types,id'],
            'purpose' => ['sometimes', 'required', 'string', 'max:2000'],
            'date_submitted' => ['sometimes', 'required', 'date'],
        ];
    }
}
