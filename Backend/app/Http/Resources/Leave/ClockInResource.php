<?php

namespace App\Http\Resources\Leave;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClockInResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => collect($this->resource)->get('id'),
            /** @var int */
            'type' => collect($this->resource)->get('type'),
            /** @type double */
            'latitude' => collect($this->resource)->get('latitude'),
            /** @type double */
            'longitude' => collect($this->resource)->get('longitude'),
            'image' => collect($this->resource)->get('image'),
            /** @var string|null */
            'note' => collect($this->resource)->get('note'),
            /** 
             * @format date-time
             * @example 2024-11-18 16:29:50
             * */
            'submitted_at' => collect($this->resource)->get('submitted_at'),
        ];
    }
}
