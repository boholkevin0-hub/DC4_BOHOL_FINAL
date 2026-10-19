<?php

namespace Database\Factories;

use App\Models\DocumentRequest;
use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DocumentRequest>
 */
class DocumentRequestFactory extends Factory
{
    public function definition(): array
    {
        $documentType = DocumentType::firstOrCreate(
            ['name' => 'Transcript of Records'],
            ['description' => 'Official academic record.', 'is_active' => true]
        );

        return [
            'user_id' => User::factory(),
            'document_type_id' => $documentType->id,
            'student_name' => fake()->name(),
            'document_type' => $documentType->name,
            'purpose' => fake()->sentence(),
            'date_submitted' => fake()->date(),
            'status' => 'Pending',
        ];
    }
}
