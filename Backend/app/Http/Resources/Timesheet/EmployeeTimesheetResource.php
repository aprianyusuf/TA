<?php

namespace App\Http\Resources\Timesheet;

use App\Utils\Constants\TimesheetApprovalStatus;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeTimesheetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => collect($this->resource)->get('id'),
            'title' => collect($this->resource)->get('title'),
            'timezone' => collect($this->resource)->get('timezone'),
            'status' => collect($this->resource)->get('status'),
            'description' => collect($this->resource)->get('description'),
            /** @format date-time */
            'start' => Carbon::parse(collect($this->resource)->get('start'))->format('Y-m-d\TH:i:\00'),
            /** @format date-time */
            'end' => Carbon::parse(collect($this->resource)->get('end'))->format('Y-m-d\TH:i:\00'),

            $this->mergeWhen(collect($this->resource)->get('client_project_id') != null, [
                /** 
                 * @var string|null
                 * */
                'client_project_id' => collect($this->resource)->get('client_project_id'),
            ]),
            $this->mergeWhen(collect($this->resource)->get('client_project') != null, [
                'client_project' => collect($this->resource)->get('client_project'),
            ]),
            $this->mergeWhen(collect($this->resource)->get('project_color') != null, [
                'project_color' => collect($this->resource)->get('project_color'),
            ]),
            $this->mergeWhen(collect($this->resource)->get('client') != null, [
                'client' => collect($this->resource)->get('client'),
            ]),
            $this->mergeWhen(collect($this->resource)->get('approval_status') != null, [
                /** @var TimesheetApprovalStatus */
                'approval_status' => collect($this->resource)->get('approval_status'),
            ]),

            'calendar_id' => 'timesheet'
        ];
    }
}
