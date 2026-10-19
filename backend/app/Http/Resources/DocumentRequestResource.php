<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_name' => $this->student_name,
            'document_type' => $this->documentType?->name ?? $this->document_type,
            'document_type_id' => $this->document_type_id,
            'purpose' => $this->purpose,
            'date_submitted' => $this->date_submitted?->format('Y-m-d'),
            'status' => $this->status,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
