<?php

namespace App\Http\Resources\Foundation;

use App\Utils\Enums\EmploymentTypeEnum;
use App\Utils\Enums\MaritalEnum;
use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $offsetInHours = null;

        if (collect($this->resource)->get('timezone') !== null) {
            $timezone = new DateTimeZone(collect($this->resource)->get('timezone'));
            $datetime = new DateTime('now', $timezone);

            $offsetInHours = $timezone->getOffset($datetime) / 60 / 60;
        }

        return [
            'id' => collect($this->resource)->get('id'),
            /** @var int */
            'employee_id' => collect($this->resource)->get('employee_id'),
            'name' => collect($this->resource)->get('first_name') . ' ' . collect($this->resource)->get('last_name'),
            'first_name' => collect($this->resource)->get('first_name'),
            'last_name' => collect($this->resource)->get('last_name'),
            'email' => collect($this->resource)->get('email'),
            'position' => collect($this->resource)->get('position'),
            /** @var int */
            'position_id' => collect($this->resource)->get('position_id'),
            'salary' => collect($this->resource)->get('salary'),

            $this->mergeWhen(collect($this->resource)->get('superior_first_name') != null, [
                'superior_name' => collect($this->resource)->get('superior_first_name') . ' '. collect($this->resource)->get('superior_last_name'),
                'superior_position' => collect($this->resource)->get('superior_position'),
            ]),

            $this->mergeWhen(collect($this->resource)?->get('timezone') != null, [
                'timezone' => collect($this->resource)?->get('timezone'),
            ]),
            $this->mergeWhen($offsetInHours != null, [
                /** @var float */
                'timezone_offset' => $offsetInHours,
            ]),
            $this->mergeWhen(collect($this->resource)?->get('marital') != null, [
                /** @var MaritalEnum */
                'marital' => collect($this->resource)?->get('marital'),
            ]),
            $this->mergeWhen(collect($this->resource)?->get('employment_type') != null, [
                /** @var EmploymentTypeEnum */
                'employment_type' => collect($this->resource)?->get('employment_type'),
            ]),
            $this->mergeWhen(collect($this->resource)?->get('religion') != null, [
                'religion' => collect($this->resource)?->get('religion'),
            ]),
            $this->mergeWhen(collect($this->resource)?->get('birth_at') != null, [
                /**
                 * @format date
                 * @example 2024-12-23
                 * */
                'birth_at' => collect($this->resource)?->get('birth_at'),
            ]),
            $this->mergeWhen(collect($this->resource)?->get('hired_start_at') != null, [
                /**
                 * @format date
                 * */
                'hired_start_at' => collect($this->resource)?->get('hired_start_at'),
            ]),
            $this->mergeWhen(collect($this->resource)?->get('hired_end_at') != null, [
                /**
                 * @format date
                 * */
                'hired_end_at' => collect($this->resource)?->get('hired_end_at'),
            ]),
            $this->mergeWhen(collect($this->resource)?->get('identity_number') != null, [
                /**
                 * @format date
                 * */
                'identity_number' => collect($this->resource)?->get('identity_number'),
            ]),
            $this->mergeWhen(collect($this->resource)?->get('report_to_id') != null, [
                /** @var int */
                'report_to_id' => collect($this->resource)?->get('report_to_id'),
            ]),
            $this->mergeWhen(collect($this->resource)?->get('parent') != null, [
                /** @var int */
                'parent' => collect($this->resource)?->get('parent'),
            ]),
        ];
    }
}
