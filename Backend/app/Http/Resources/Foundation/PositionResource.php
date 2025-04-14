<?php

namespace App\Http\Resources\Foundation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PositionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            /** @example 1 */
            'id' => collect($this->resource)->get('id'),
            /** @example Manager */
            'name' => collect($this->resource)->get('name'),
            /** 
             * @example 1
             * */
            'parent' => is_null(collect($this->resource)?->get('parent')) ? null : (int) collect($this->resource)?->get('parent'),
            /** @example CTO */
            'parent_name' => is_null(collect($this->resource)->get('parent_name')) ? null : collect($this->resource)->get('parent_name'),

            $this->mergeWhen(collect($this->resource)->get('user_count') != null, [
                /** 
                 * @var int|null
                 * @example 2 
                 * */
                'user_count' => collect($this->resource)->get('user_count'),
            ]),

            $this->mergeWhen(collect($this->resource)->get('permissions') != null, [
                /**
                 * @var array|null
                 */
                'permissions' => collect($this->resource)->get('permissions')?->toArray()
            ])
        ];
    }
}
