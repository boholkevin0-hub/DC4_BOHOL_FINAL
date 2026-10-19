<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentRequestStatusHistory extends Model
{
    protected $fillable = [
        'document_request_id',
        'changed_by',
        'from_status',
        'to_status',
    ];

    public function documentRequest()
    {
        return $this->belongsTo(DocumentRequest::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
