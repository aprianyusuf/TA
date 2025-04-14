<?php

namespace App\Models\Foundation;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Employee extends Model
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
        'user_id',
        'employee_id',
        'marital',
        'religion',
        'birth_at',
        'hired_start_at',  
        'hired_end_at',
        'identity_number',
    ];

    protected function casts(): array
    {
        return [
            'birth_at' => 'date',
            'hired_start_at' => 'date',
            'hired_end_at' => 'date',
        ];
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }
}
