<?php

namespace App\Http\Requests\Foundation\Employee;

use App\Utils\Enums\EmploymentTypeEnum;
use App\Utils\Enums\MaritalEnum;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'firstName' => ['required'],
            'lastName' => ['required'],
            'positionId' => ['required', 'ulid'],
            'reportToId' => ['nullable', 'ulid'],
            'employeeId' => ['nullable'],
            'marital' => ['required', Rule::enum(MaritalEnum::class)],
            'religion' => ['required'],
            'employmentType' => ['required', Rule::enum(EmploymentTypeEnum::class)],
            /** 
             * @format date
             * @example 2024-12-23
             * */
            'birthAt' => ['required', 'date'],
            /** 
             * @format date
             * @example 2024-12-23
             * */
            'hiredStartAt' => ['required', 'date'],
            /** 
             * @format date
             * @example 2024-12-23
             * */
            'hiredEndAt' => [
                Rule::requiredIf(in_array($this->employmentType, array_filter(array_column(EmploymentTypeEnum::cases(), 'value'), function ($value) {
                    return $value != EmploymentTypeEnum::Permanent->value;
                }))),
                function (string $attribute, mixed $value, Closure $fail) {
                    $employmentType = collect(array_column(EmploymentTypeEnum::cases(), 'value'))
                        ->filter(function (string $value) {
                            return $value != EmploymentTypeEnum::Permanent->value;
                        });

                    if (
                        $employmentType->contains($this->employmentType) &&
                        $value == null
                    ) {
                        $fail("{$attribute} is required if employment type is one of {$employmentType->join(', ', ' or ')}");
                    }
                },
            ],
            'identityNumber' => ['required'],
        ];
    }
}
