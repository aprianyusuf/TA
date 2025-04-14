<?php

namespace App\Http\Resources\Timesheet;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeTimesheetLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => collect($this->resource)->get('id'),
            'timesheet_id' => collect($this->resource)->get('timesheet_id'),
            'user_id' => collect($this->resource)->get('user_id'),
            'user' => collect($this->resource)->get('user'),
            /** @var int */
            'status' => collect($this->resource)->get('status'),
            'notes' => collect($this->resource)->get('notes'),
            /** @format date-time */
            'executed_at' => collect($this->resource)->get('executed_at'),
        ];
    }
}
