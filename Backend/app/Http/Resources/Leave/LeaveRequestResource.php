<?php
namespace App\Http\Resources\Leave;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Here, you can add custom attributes or modify the data before returning it.
        return [
            'id'         => $this->id,
            'user'       => [
                'id'=> $this->id,
                'name'=> $this->name,
            ],
            'leave_type' => [
                'id'   => $this->leaveType->id,
                'name'  => $this->leaveType->name,
            ],
            'start_date' => $this->start_date,
            'end_date'   => $this->end_date,
            'status'     => $this->status,
        ];
    }

}
