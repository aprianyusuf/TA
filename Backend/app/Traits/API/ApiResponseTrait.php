<?php

namespace App\Traits\API;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

trait ApiResponseTrait
{
    public function successResponse(AnonymousResourceCollection|Collection|Model|JsonResource|array|null $data = null, array $optionalResponses = null, bool $isOptionalResponseInData = false, string $message = null, int $code = Response::HTTP_OK)
    {
        $response = [
            'status'    =>  'success',
            'code'      =>  $code,
            'data'      =>  $data
        ];

        if ($message != null) {
            $response = array_merge($response, [
                'message' => $message
            ]);
        }

        if ($optionalResponses) {
            if ($isOptionalResponseInData) {
                $response['data'] = array_merge($response['data'], $optionalResponses);
            } else {
                $response = $this->addOptionalResponse($response, $optionalResponses);
            }
        }

        return $this->sendResponse($response, $code);
    }

    public function errorResponse(string $message, int $errorCode = Response::HTTP_BAD_REQUEST, array $optionalResponses = null, bool $isStrictCode = true)
    {
        $response = [
            'status'    => $this->errorStatus($errorCode),
            'code'      => $errorCode,
            'message'   => $message,
        ];

        if ($optionalResponses) {
            $response = $this->addOptionalResponse($response, $optionalResponses);
        }

        return $this->sendResponse($response, $isStrictCode ? $errorCode : Response::HTTP_OK);
    }

    public function addOptionalResponse(array $response, $optionalResponses)
    {
        foreach ($optionalResponses as $key => $value) {
            $response[$key] = $value;
        }
        return $response;
    }

    public function sendResponse($response, $code)
    {

        if (config('app.enable_query_log')) {
            $queries = DB::getQueryLog();

            foreach ($queries as $query) {
                $query = [
                    'sql' => Str::replaceArray('?', $query['bindings'], $query['query']),
                    'time' => $query['time'] . ' ms'
                ];

                if ((int)$query['time'] > 100) {
                    Log::warning([
                        'Endpoint'  => request()->route()->uri(),
                        'Method'    => request()->method(),
                        'Query'     => $query,
                    ]);
                }

                Log::info(['Query' => $query]);
            }

            Log::info([
                'Endpoint'          => request()->route()->uri(),
                'Method'            => request()->method(),
                'TotalQuery'        => count($queries),
                'TotalQueryInMs'    => collect($queries)->pluck('time')->reduce(function (float $prev, float $curr) {
                    return $prev + $curr;
                }, 0),
            ]);
        }

        return response()->json($response, $code);
    }

    public function errorStatus(int $errorCode)
    {
        return match ($errorCode) {
            Response::HTTP_FORBIDDEN => 'forbidden',
            Response::HTTP_NOT_FOUND => 'not found',
            Response::HTTP_INTERNAL_SERVER_ERROR => 'error',
            default => 'error'
        };
    }
}
