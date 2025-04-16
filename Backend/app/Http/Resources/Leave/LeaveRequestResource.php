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
            'id'         => $this->id,              // Example: custom field
            'user'       => $this->user->name,      // Example: if you want to include the user's name instead of user ID
            'leave_type' => $this->leaveType->type, // If you want the leave type name instead of ID
            'start_date' => $this->start_date,
            'end_date'   => $this->end_date,
            'status'     => $this->status,
        ];
    }

}
