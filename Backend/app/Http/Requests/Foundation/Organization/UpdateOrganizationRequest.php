<?php

namespace App\Http\Requests\Foundation\Organization;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            /** @example Asia/Jakarta */
            'timezone' => ['required', 'timezone:all'],
            'cutOffTimesheetStartDay' => ['required', 'integer', 'min:1', 'max:30'],
            'cutOffTimesheetEndDay' => ['required', 'integer', 'min:1', 'max:30'],
            /** @example string */
            'address' => ['required'],
            /** @example 08:00 */
            'workStartAt' => ['required', 'date_format:H:i'],
            /** @example 17:00 */
            'workEndAt' => ['required', 'date_format:H:i', 'after:workStartAt'],
        ];
    }
}
