<?php

namespace App\Http\Resources\ProjectManagement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => collect($this->resource)->get('id'),
            'client_id' => collect($this->resource)->get('client_id'),
            'client' => collect($this->resource)->get('client'),
            'name' => collect($this->resource)->get('name'),
            'color' => collect($this->resource)->get('color'),
            /** @format boolean */
            'is_requires_project_manager_approval' => collect($this->resource)->get('is_requires_project_manager_approval'),
            /** 
             * @format date 
             * @example 2024-11-18
             * */
            'start_date_at' => collect($this->resource)->get('start_date_at'),
            /** 
             * @format date 
             * @example 2024-11-18
             * */
            'end_date_at' => collect($this->resource)->get('end_date_at'),

            $this->mergeWhen(collect($this->resource)->get('cut_off_timesheet_start_day') != null, [
                /** 
                 * @var int|null
                 * @example 25
                 * */
                'cut_off_timesheet_start_day' => collect($this->resource)->get('cut_off_timesheet_start_day'),
            ]),
            $this->mergeWhen(collect($this->resource)->get('cut_off_timesheet_end_day') != null, [
                /** 
                 * @var int|null
                 * @example 24
                 * */
                'cut_off_timesheet_end_day' => collect($this->resource)->get('cut_off_timesheet_end_day'),
            ]),

            'created_by' => collect($this->resource)->get('created_by'),
            'created_by_id' => collect($this->resource)->get('created_by_id'),

            'project_manager_id' => collect($this->resource)->get('project_manager_id'),
            'project_manager' => collect($this->resource)->get('project_manager'),
            'project_manager_email' => collect($this->resource)->get('project_manager_email'),
        ];
    }
}
