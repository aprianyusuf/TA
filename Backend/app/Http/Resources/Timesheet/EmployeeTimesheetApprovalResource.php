<?php

namespace App\Http\Resources\Timesheet;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeTimesheetApprovalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => collect($this->resource)->get('id'),
            'timesheet_id' => collect($this->resource)->get('timesheet_id'),
            /** @var int */
            'sort' => collect($this->resource)->get('sort'),
            /** @var int */
            'status' => collect($this->resource)->get('status'),
            'approval_id' => collect($this->resource)->get('approval_id'),
            'approval' => collect($this->resource)->get('approval'),
            /** @var boolean */
            'is_active' => collect($this->resource)->get('is_active'),
        ];
    }
}
