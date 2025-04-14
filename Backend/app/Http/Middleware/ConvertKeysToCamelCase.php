<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Str;

class ConvertKeysToCamelCase
{
    public function handle(Request $request, Closure $next): Response
    {
        if (config('app.enable_query_log'))
        {
            DB::enableQueryLog();
        }

        $request->query->replace($this->convertToCamelCase($request->query->all()));

        if ($request->isJson()) {
            $request->replace($this->convertToCamelCase($request->json()->all()));
        } else {
            $request->replace($this->convertToCamelCase($request->all()));
        }

        return $next($request);
    }

    private function convertToCamelCase(array $array)
    {
        $camelCaseArray = [];

        foreach ($array as $key => $value) {
            $newKey = Str::camel($key);

            if (is_array($value)) {
                $value = $this->convertToCamelCase($value);
            }

            $camelCaseArray[$newKey] = $value;
        }

        return $camelCaseArray;
    }
}
