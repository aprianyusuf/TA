<?php

namespace App\Http\Resources\Foundation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => collect($this->resource)->get('id'),
            /** @example Mitra Saburai Properti */
            'name' => collect($this->resource)->get('name'),
            /** @example mitrasaburaiproperti.com */
            'domain' => collect($this->resource)->get('domain'),
            /** @example Asia/Jakarta */
            'timezone' => collect($this->resource)->get('timezone'),
            /** @format real */
            'timezone_offset' => collect($this->resource)->get('timezone_offset'),

            /** @format custom_datetime */
            'work_start_at' => collect($this->resource)->get('work_start_at'),
            /** @format custom_datetime */
            'work_end_at' => collect($this->resource)->get('work_end_at'),
            /**
             * @var int|null
             * */
            'cut_off_timesheet_start_day' => collect($this->resource)->get('cut_off_timesheet_start_day'),
            /** @var int|null */
            'cut_off_timesheet_end_day' => collect($this->resource)->get('cut_off_timesheet_end_day'),
            /** @example Jl. Gambir No 1 */
            'address' => collect($this->resource)->get('address'),

            $this->mergeWhen(collect($this->resource)?->get('created_by') != null, [
                /**
                 * @example admin
                 * */
                'created_by' => collect($this->resource)?->get('created_by'),
            ]),

            $this->mergeWhen(collect($this->resource)->get('user') != null, [
                'user' => UserResource::make(collect($this->resource)->get('user'))
            ]),

            $this->mergeWhen(collect($this->resource)->get('employee') != null, [
                'employee' => EmployeeResource::make(collect($this->resource)->get('employee'))
            ])
        ];
    }
}
