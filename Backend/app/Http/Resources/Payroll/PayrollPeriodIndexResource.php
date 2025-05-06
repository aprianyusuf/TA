<?php
namespace App\Http\Resources\Payroll;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollPeriodIndexResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'=> $this->id,
            'period_start_at'=> $this->period_start_at,
            'period_end_at'=> $this->period_end_at,
            'payroll_at'=> $this->payroll_at,
            'year'=> $this->year,
            'month'=> $this->month,
            'payroll_total'=> $this->payroll_total,
            'total_net_pay'=> $this->total_net_pay,
            'total_draft'=> $this->total_draft,
            'total_pending'=> $this->total_pending,
            'total_processing'=> $this->total_processing,
            'total_paid'=> $this->total_paid,
            'total_cancelled'=> $this->total_cancelled,
            'payrolls' => isset($this->payrolls) ? $this->payrolls : null,
        ];
    }
}
