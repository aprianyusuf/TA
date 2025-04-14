<?php

namespace App\Http\Resources\Foundation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoginResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'timezone' => $this->timezone,
            'timezone_offset' => (float)$this->timezone_offset,
            'organization' => [
                'id' => $this->organization->id,
                'name' => $this->organization->name,
                'domain' => $this->organization->domain,
            ],
        ];
    }
}
