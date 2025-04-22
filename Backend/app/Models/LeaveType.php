<?php

namespace App\Models;

use App\Models\Base\Model;
use App\Traits\Model\HasQueryFeatures;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LeaveType extends Model
{
    /** @use HasFactory<\Database\Factories\LeaveTypeFactory> */
    use HasFactory, HasQueryFeatures;

    protected $fillable = [
        'id',
        'organization_id',
        'name',
        'description',
        'max_days',
        'max_days_per_year',
        'max_days_per_month',
        'max_days_per_week',
        'max_days_per_quarter',
        'max_days_per_half_year'
    ];
    protected $casts = [
        'id' => 'string',
        'organization_id' => 'string',
        'name' => 'string',
        'description' => 'string',
        'max_days' => 'integer',
        'max_days_per_year' => 'integer',
        'max_days_per_month' => 'integer',
        'max_days_per_week' => 'integer',
        'max_days_per_quarter' => 'integer',
        'max_days_per_half_year' => 'integer'
    ];
    protected $table = 'leave_types';
    protected $guarded = ['id'];
}
