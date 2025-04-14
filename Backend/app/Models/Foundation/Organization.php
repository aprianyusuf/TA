<?php

namespace App\Models\Foundation;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Organization extends Model
{
    use HasFactory, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::ulid();
            }
        });
    }

    protected $fillable = [
        'name',
        'domain',
        'address',
        'timezone',
        'timezone_offset',
        'work_start_at',
        'work_end_at',
        'cut_off_timesheet_start_day',
        'cut_off_timesheet_end_day',
        'address',
        'created_by',
    ];

    public function users(): HasMany {
        return $this->hasMany(User::class, 'organization_id', 'id');
    }
}
