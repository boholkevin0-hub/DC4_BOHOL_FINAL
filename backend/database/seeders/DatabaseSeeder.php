<?php

namespace Database\Seeders;

use App\Models\DocumentRequest;
use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(['email' => 'admin@school.test'], [
            'name' => 'School Administrator',
            'password' => Hash::make('AdminPass123!'),
            'role' => 'admin',
        ]);
        $student = User::updateOrCreate(['email' => 'student@school.test'], [
            'name' => 'Jamie Rivera',
            'password' => Hash::make('StudentPass123!'),
            'role' => 'student',
        ]);

        $types = collect([
            ['Certificate of Enrollment', 'Proof of current enrollment.'],
            ['Transcript of Records', 'Official record of completed courses and grades.'],
            ['Certificate of Grades', 'Certified copy of grades for a selected term.'],
            ['Good Moral Certificate', 'Certificate of conduct issued by the school.'],
            ['Certificate of Graduation', 'Confirmation of graduation.'],
            ['Other', 'Other school documents approved by the registrar.'],
        ])->mapWithKeys(fn ($attributes) => [
            $attributes[0] => DocumentType::updateOrCreate(
                ['name' => $attributes[0]],
                ['description' => $attributes[1], 'is_active' => true]
            ),
        ]);

        $statuses = ['Pending', 'Approved', 'Processing', 'Ready for Release', 'Completed'];
        while (DocumentRequest::count() < 25) {
            $index = DocumentRequest::count();
            $type = $types->values()[$index % $types->count()];
            $status = $statuses[$index % count($statuses)];
            $documentRequest = DocumentRequest::create([
                'user_id' => $student->id,
                'document_type_id' => $type->id,
                'student_name' => fake()->name(),
                'document_type' => $type->name,
                'purpose' => fake()->randomElement([
                    'Scholarship application',
                    'Transfer to another institution',
                    'Employment application',
                    'Personal records',
                    'Graduate school application',
                ]),
                'date_submitted' => now()->subDays($index)->toDateString(),
                'status' => $status,
            ]);

            $documentRequest->statusHistory()->create([
                'changed_by' => $admin->id,
                'from_status' => null,
                'to_status' => $status,
            ]);
        }
    }
}
