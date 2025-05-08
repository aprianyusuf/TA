<?php
namespace App\Http\Resources\Payroll;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollBonusTypeIndexResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'name'                    => $this->name,
            'description'             => $this->description,
            'percentage'              => $this->percentage,
            'value'                   => $this->value,
            'value_fixed'             => $this->value_fixed,
            'is_paid_by_organization' => $this->is_paid_by_organization,
            'currency'                => $this->currency,
        ];
    }
}
