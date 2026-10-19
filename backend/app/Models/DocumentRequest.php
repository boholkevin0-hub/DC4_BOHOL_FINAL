<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_name',
        'document_type',
        'purpose',
        'date_submitted',
        'status',
        'user_id',
        'document_type_id',
    ];

    protected function casts(): array
    {
        return [
            'date_submitted' => 'date:Y-m-d',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(DocumentRequestStatusHistory::class);
    }
}
