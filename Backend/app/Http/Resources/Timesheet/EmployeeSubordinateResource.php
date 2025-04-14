<?php

namespace App\Http\Resources\Timesheet;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeSubordinateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => collect($this->resource)->get('id'),
            'name' => collect($this->resource)->get('first_name') . ' ' . collect($this->resource)->get('last_name'),
            'position' => collect($this->resource)->get('position'),
            /** @var int */
            'pending_count' => collect($this->resource)->get('pending_count'),
        ];
    }
}
