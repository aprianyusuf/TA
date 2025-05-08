<?php
namespace App\Http\Resources\Payroll;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollIndexResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->first_name . ' ' . $this->last_name,
            'salary'            => $this->salary,
            'email'             => $this->email,
            'created_at'        => $this->created_at,
            'updated_at'        => $this->created_at,
            'organization_name' => $this->organization_name,
            'organization_id'   => $this->organization_id,
            'employee_id'       => $this->employee_id,
            'bonus'             => $this->bonus,
            'deduction'         => $this->deduction,
            'bonuses'           => $this->bonuses->map(function ($bonus) {
                return [
                    'id'         => $bonus->id,
                    'value'      => number_format($bonus->value, 2, '.', ''),
                    'percentage' => $bonus->percentage,
                    'name'       => $bonus->name,
                ];
            }),
            'deductions'        => $this->deductions->map(function ($deduction) {
                return [
                    'id'         => $deduction->id,
                    'value'      => number_format($deduction->value, 2, '.', ''),
                    'percentage' => $deduction->percentage,
                    'name'       => $deduction->name,
                ];
            }),
            'net_pay'           => number_format($this->net_pay, 2, '.', ''),
            'currency'          => $this->currency,
            'status'            => $this->status,
        ];
    }
}
