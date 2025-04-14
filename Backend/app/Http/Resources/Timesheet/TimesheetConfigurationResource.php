<?php

namespace App\Http\Resources\Timesheet;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimesheetConfigurationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            /** 
             * @format custom_datetime 
             * @example 08:00
             * */
            'work_start_at' => Carbon::parse(collect($this->resource)->get('work_start_at'))->format("H:i"),
            /** 
             * @format custom_datetime 
             * @example 17:00
             * */
            'work_end_at' => Carbon::parse(collect($this->resource)->get('work_end_at'))->format("H:i"),
        ];
    }
}
