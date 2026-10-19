<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use App\Models\DocumentType;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $query = DocumentRequest::query();
        if (! $request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json([
            'total_requests' => (clone $query)->count(),
            'pending_requests' => (clone $query)->where('status', 'Pending')->count(),
            'in_progress_requests' => (clone $query)->whereIn('status', ['Approved', 'Processing'])->count(),
            'ready_requests' => (clone $query)->where('status', 'Ready for Release')->count(),
            'document_types' => DocumentType::where('is_active', true)->count(),
        ]);
    }
}
