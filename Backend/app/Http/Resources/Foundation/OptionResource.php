<?php

namespace App\Http\Resources\Foundation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            /** @example label */
            'label' => collect($this->resource)->get('label'),
            /** @example value */
            'value' => collect($this->resource)->get('value'),
        ];
    }
}
