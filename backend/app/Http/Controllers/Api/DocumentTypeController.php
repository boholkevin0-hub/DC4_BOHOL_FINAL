<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentTypeRequest;
use App\Http\Requests\UpdateDocumentTypeRequest;
use App\Http\Resources\DocumentTypeResource;
use App\Models\DocumentType;
use Illuminate\Http\Request;

class DocumentTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = DocumentType::query()->orderBy('name');
        if (! $request->user()->isAdmin()) {
            $query->where('is_active', true);
        }

        return DocumentTypeResource::collection($query->get());
    }

    public function store(StoreDocumentTypeRequest $request)
    {
        return (new DocumentTypeResource(DocumentType::create($request->validated())))
            ->response()->setStatusCode(201);
    }

    public function show(Request $request, DocumentType $documentType)
    {
        abort_unless($request->user()->isAdmin() || $documentType->is_active, 404);

        return new DocumentTypeResource($documentType);
    }

    public function update(UpdateDocumentTypeRequest $request, DocumentType $documentType)
    {
        $documentType->update($request->validated());

        return new DocumentTypeResource($documentType->fresh());
    }

    public function destroy(Request $request, DocumentType $documentType)
    {
        abort_unless($request->user()->isAdmin(), 403, 'Only administrators may delete document types.');
        abort_if($documentType->documentRequests()->exists(), 422, 'A document type already used by a request cannot be deleted. Deactivate it instead.');
        $documentType->delete();

        return response()->noContent();
    }
}
