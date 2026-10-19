<?php

namespace Tests\Feature;

use App\Models\DocumentRequest;
use App\Models\DocumentType;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DocumentPortalApiTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    private User $admin;

    private DocumentType $documentType;

    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::factory()->create(['role' => 'student']);
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->documentType = DocumentType::create([
            'name' => 'Transcript of Records',
            'description' => 'Official academic record.',
            'is_active' => true,
        ]);
    }

    public function test_api_requires_authentication_for_private_routes(): void
    {
        $this->getJson('/api/document-requests')->assertUnauthorized();
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_database_seeder_creates_demo_roles_types_and_sample_requests(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('users', ['email' => 'admin@school.test', 'role' => 'admin']);
        $this->assertDatabaseHas('users', ['email' => 'student@school.test', 'role' => 'student']);
        $this->assertDatabaseCount('document_requests', 25);
        $this->assertDatabaseCount('document_types', 6);
    }

    public function test_registration_creates_student_account_and_sanctum_token(): void
    {
        $this->postJson('/api/register', [
            'name' => 'New Student',
            'email' => 'new-student@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated()
            ->assertJsonPath('user.role', 'student')
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);
    }

    public function test_login_returns_token_and_logout_revokes_it(): void
    {
        $student = User::factory()->create([
            'email' => 'login@example.test',
            'password' => Hash::make('password123'),
            'role' => 'student',
        ]);

        $login = $this->postJson('/api/login', [
            'email' => $student->email,
            'password' => 'password123',
        ])->assertOk()->assertJsonPath('user.id', $student->id);

        $token = $login->json('token');
        $this->withToken($token)->getJson('/api/user')->assertOk()
            ->assertJsonPath('user.email', $student->email);
        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => (int) explode('|', $token)[0],
        ]);
        Auth::forgetGuards();
        $this->withToken($token)->getJson('/api/user')->assertUnauthorized();
    }

    public function test_student_can_create_and_list_own_paginated_requests(): void
    {
        DocumentRequest::factory()->count(12)->create([
            'user_id' => $this->student->id,
            'document_type_id' => $this->documentType->id,
            'document_type' => $this->documentType->name,
        ]);

        $this->actingAs($this->student, 'sanctum')
            ->getJson('/api/document-requests?per_page=5&search=Transcript')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonPath('meta.total', 12)
            ->assertJsonCount(5, 'data');

        $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/document-requests', [
                'student_name' => 'Jamie Rivera',
                'document_type_id' => $this->documentType->id,
                'purpose' => 'Scholarship application',
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'Pending')
            ->assertJsonPath('data.document_type', $this->documentType->name);
    }

    public function test_only_admin_can_change_status_or_delete_requests(): void
    {
        $request = DocumentRequest::factory()->create([
            'user_id' => $this->student->id,
            'document_type_id' => $this->documentType->id,
            'document_type' => $this->documentType->name,
        ]);

        $this->actingAs($this->student, 'sanctum')
            ->patchJson("/api/document-requests/{$request->id}/status", ['status' => 'Approved'])
            ->assertForbidden();

        $this->actingAs($this->student, 'sanctum')
            ->deleteJson("/api/document-requests/{$request->id}")
            ->assertForbidden();

        $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/document-requests/{$request->id}/status", ['status' => 'Approved'])
            ->assertOk()
            ->assertJsonPath('data.status', 'Approved');

        $this->assertDatabaseHas('document_request_status_histories', [
            'document_request_id' => $request->id,
            'from_status' => 'Pending',
            'to_status' => 'Approved',
            'changed_by' => $this->admin->id,
        ]);
    }

    public function test_student_cannot_manage_document_types_and_invalid_request_returns_field_errors(): void
    {
        $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/document-types', ['name' => 'New Type'])
            ->assertForbidden();

        $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/document-requests', [
                'student_name' => '',
                'document_type_id' => 99999,
                'purpose' => '',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['student_name', 'document_type_id', 'purpose']);
    }
}
