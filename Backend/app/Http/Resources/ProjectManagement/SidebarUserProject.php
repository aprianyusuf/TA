<?php

namespace App\Http\Resources\ProjectManagement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SidebarUserProject extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => collect($this->resource)->get('id'),
            'name' => collect($this->resource)->get('name'),
            'color' => collect($this->resource)->get('color'),
            /** @var bool */
            'is_project_manager' => collect($this->resource)->get('is_project_manager'),
        ];
    }
}
