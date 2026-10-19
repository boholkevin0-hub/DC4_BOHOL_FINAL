<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Http\Requests\UpdateDocumentRequestStatus;
use App\Http\Resources\DocumentRequestResource;
use App\Models\DocumentRequest as StudentDocumentRequest;
use App\Models\DocumentRequestStatusHistory;
use App\Models\DocumentType;
use Illuminate\Http\Request;

class DocumentRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = StudentDocumentRequest::with(['user:id,name', 'documentType:id,name'])
            ->when(! $request->user()->isAdmin(), fn ($query) => $query->where('user_id', $request->user()->id))
            ->when($request->filled('search'), function ($query) use ($request) {
                $term = $request->string('search')->toString();
                $query->where(function ($query) use ($term) {
                    $query->where('student_name', 'like', "%{$term}%")
                        ->orWhere('purpose', 'like', "%{$term}%")
                        ->orWhereHas('documentType', fn ($query) => $query->where('name', 'like', "%{$term}%"));
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('document_type_id'), fn ($query) => $query->where('document_type_id', $request->integer('document_type_id')))
            ->latest();

        return DocumentRequestResource::collection(
            $query->paginate(min(max($request->integer('per_page', 10), 1), 100))
        );
    }

    public function store(StoreDocumentRequest $request)
    {
        $validated = $request->validated();
        $type = DocumentType::findOrFail($validated['document_type_id']);
        abort_unless($type->is_active, 422, 'This document type is not currently available.');

        $documentRequest = StudentDocumentRequest::create([
            ...$validated,
            'document_type' => $type->name,
            'date_submitted' => $validated['date_submitted'] ?? now()->toDateString(),
            'status' => 'Pending',
            'user_id' => $request->user()->id,
        ]);

        DocumentRequestStatusHistory::create([
            'document_request_id' => $documentRequest->id,
            'changed_by' => $request->user()->id,
            'from_status' => null,
            'to_status' => 'Pending',
        ]);

        return (new DocumentRequestResource($documentRequest->load(['user:id,name', 'documentType:id,name'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, StudentDocumentRequest $documentRequest)
    {
        $this->authorizeRequestAccess($request, $documentRequest);

        return new DocumentRequestResource($documentRequest->load(['user:id,name', 'documentType:id,name']));
    }

    public function update(UpdateDocumentRequest $request, StudentDocumentRequest $documentRequest)
    {
        $validated = $request->validated();
        if (isset($validated['document_type_id'])) {
            $type = DocumentType::findOrFail($validated['document_type_id']);
            abort_unless($type->is_active || $documentRequest->document_type_id === $type->id, 422, 'This document type is not currently available.');
            $validated['document_type'] = $type->name;
        }

        $documentRequest->update($validated);

        return new DocumentRequestResource($documentRequest->fresh()->load(['user:id,name', 'documentType:id,name']));
    }

    public function updateStatus(UpdateDocumentRequestStatus $request, StudentDocumentRequest $documentRequest)
    {
        $fromStatus = $documentRequest->status;
        $toStatus = $request->validated('status');
        $documentRequest->update(['status' => $toStatus]);

        if ($fromStatus !== $toStatus) {
            DocumentRequestStatusHistory::create([
                'document_request_id' => $documentRequest->id,
                'changed_by' => $request->user()->id,
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
            ]);
        }

        return new DocumentRequestResource($documentRequest->fresh()->load(['user:id,name', 'documentType:id,name']));
    }

    public function destroy(Request $request, StudentDocumentRequest $documentRequest)
    {
        abort_unless($request->user()->isAdmin(), 403, 'Only administrators may delete document requests.');
        $documentRequest->delete();

        return response()->noContent();
    }

    private function authorizeRequestAccess(Request $request, StudentDocumentRequest $documentRequest): void
    {
        abort_unless(
            $request->user()->isAdmin() || $documentRequest->user_id === $request->user()->id,
            403,
            'You are not authorized to access this request.'
        );
    }
}
