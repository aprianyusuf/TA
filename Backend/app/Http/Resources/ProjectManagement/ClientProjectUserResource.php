<?php

namespace App\Http\Resources\ProjectManagement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientProjectUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user_id' => collect($this->resource)->get('user_id'),
            'client_project_id' => collect($this->resource)->get('client_project_id'),
            'user_full_name' => collect($this->resource)->get('user_full_name'),
            'client_project_name' => collect($this->resource)->get('client_project_name'),

            /** 
             * @format date 
             * @example 2024-11-18
             * */
            'start_date_at' => collect($this->resource)->get('start_date_at'),
            /** 
             * @format date 
             * @example 2024-11-18
             * */
            'end_date_at' => collect($this->resource)->get('end_date_at'),

            /** @var boolean */
            'is_active' => collect($this->resource)->get('is_active'),
        ];
    }
}
