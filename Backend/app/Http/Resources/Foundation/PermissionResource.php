<?php

namespace App\Http\Resources\Foundation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => collect($this->resource)->get('id'),
            'code' => collect($this->resource)->get('code'),
            'name' => collect($this->resource)->get('name'),

            $this->mergeWhen(collect($this->resource)->get('module') != null, [
                'module' => (int)collect($this->resource)->get('module')
            ]),
            $this->mergeWhen(collect($this->resource)->get('module_name') != null, [
                'module_name' => collect($this->resource)->get('module_name')
            ]),

            $this->mergeWhen(collect($this->resource)->get('description') != null, [
                'description' => is_null(collect($this->resource)->get('description')) ? null : collect($this->resource)->get('description')
            ]),
        ];
    }
}
