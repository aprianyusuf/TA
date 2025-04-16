<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Support\Str;
use App\Models\Foundation\Employee;
use App\Models\Foundation\Position;
use App\Models\Foundation\Organization;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

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
        'first_name',
        'last_name',
        'email',
        'password',
        'organization_id',
        'first_login_at',
        'last_login_at',
        'is_admin_organization',
        'position_id',
        'report_to_id',
        'timezone',
        'timezone_offset',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin_organization' => 'boolean',
        ];
    }

    public function organization(): BelongsTo {
        return $this->belongsTo(Organization::class, 'organization_id', 'id');
    }

    public function employee() : HasOne {
        return $this->hasOne(Employee::class, 'user_id', 'id');
    }

    public function directReports(): HasMany
    {
        return $this->hasMany(User::class, 'report_to_id', 'id');
    }

    public function reportTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'report_to_id', 'id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'position_id', 'id');
    }
}
