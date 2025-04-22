<?php

namespace App\Http\Requests\Leave;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use App\Service\Leave\LeaveRequestService;

class StoreLeaveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            /** @example 2025-02-12 */
            'startDate'   => ['required', 'date', 'date_format:Y-m-d', 'after:today', 'before_or_equal:endDate'],

            /** @example 2025-02-20 */
            'endDate'     => ['required', 'date', 'date_format:Y-m-d', 'after_or_equal:startDate'],

            /** @example annual */
            'leaveType'   => ['required', 'string'],

            /** @example string */
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator): void
    {
        $service = app(LeaveRequestService::class);

        $validator->after(function ($validator) use ($service) {
            $service->validateWorkingDays(
                $validator,
                $this->input('startDate'),
                $this->input('endDate')
            );
        });
    }
}
