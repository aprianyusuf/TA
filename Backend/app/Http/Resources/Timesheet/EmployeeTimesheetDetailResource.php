<?php

namespace App\Http\Resources\Timesheet;

use App\Http\Resources\ProjectManagement\ClientProjectResource;
use App\Http\Resources\ProjectManagement\ClientProjectUserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeTimesheetDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'timesheet' => EmployeeTimesheetResource::make(collect($this->resource)->get('timesheet')),
            'approval' => EmployeeTimesheetApprovalResource::collection(collect($this->resource)->get('approval')),
            'log_timesheet' => EmployeeTimesheetLogResource::collection(collect($this->resource)->get('log_timesheet')),
            
            $this->mergeWhen(collect($this->resource)->get('project'), [
                /** 
                 * @format ClientProjectResource|null
                 * */
                'project' => ClientProjectResource::make(collect($this->resource)->get('project'))
            ]),

            $this->mergeWhen(collect($this->resource)->get('project_user'), [
                /** 
                 * @format ClientProjectUserResource|null
                 * */
                'project_user' => ClientProjectUserResource::make(collect($this->resource)->get('project_user'))
            ]),
        ];
    }
}
