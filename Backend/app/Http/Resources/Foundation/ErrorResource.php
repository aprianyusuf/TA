<?php

namespace App\Http\Resources\Foundation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ErrorResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request)
    {
        return [
            /** @example error */
            'status' => $this->status,
            /** @example 400 */
            'code' => (int)$this->code,
            /** @example message */
            'message' => $this->message,
        ];
    }
}
