<?php

namespace App\Models\Foundation;

use App\Models\Base\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Position extends Model
{
    use HasFactory;

    protected $table='positions';
    protected $fillable = [
        'name',
        'position_id',
        'organization_id',
        'delete_at',
    ];

    public function directReports()
    {
        return $this->hasMany(Position::class,'position_id','id');
    }

}
