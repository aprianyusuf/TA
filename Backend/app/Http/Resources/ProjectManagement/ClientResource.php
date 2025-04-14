<?php

namespace App\Http\Resources\ProjectManagement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => collect($this->resource)->get('id'),
            'name' => collect($this->resource)->get('name'),

            'created_by' => collect($this->resource)->get('created_by'),
            'created_by_id' => collect($this->resource)->get('created_by_id'),

            $this->mergeWhen(collect($this->resource)->get('client_project_count') != null, [
                /** 
                 * @var int|null
                 * @example 1
                 * */
                'client_project_count' => collect($this->resource)->get('client_project_count'),
            ]),
        ];
    }
}
