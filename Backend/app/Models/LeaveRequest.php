<?php

namespace App\Models;

use App\Models\Base\Model;
use App\Traits\Model\HasQueryFeatures;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LeaveRequest extends Model
{
    /** @use HasFactory<\Database\Factories\UserLeaveFactory> */
    use HasFactory, HasQueryFeatures;

    protected $searchable = [
        'id',
        'user_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'status',
        'reason',
        'response_by',
        'response_at',
    ];
    protected $sortable = [
        'id',
        'user_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'status',
        'reason',
        'response_by',
        'response_at',
    ];

    protected $filterable = [
        'id',
        'user_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'status',
        'reason',
        'response_by',
        'response_at',
    ];

    protected $table = 'leave_requests';
    protected $fillable = [
        'user_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'status',
        'reason',
        'response_by',
        'response_at',
    ];
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'response_at' => 'datetime',
    ];

    protected $with = [
        'user',
        'leaveType',
    ];

    public function user()
    {
        return $this->belongsTo(User::class,'user_id', 'id');
    }

    public function responder()
    {
        return $this->belongsTo(User::class,'responded_by', 'id');
    }
    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class,'leave_type_id', 'id');
    }
}
