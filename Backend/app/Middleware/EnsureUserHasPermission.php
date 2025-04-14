<?php

namespace App\Middleware;

use App\Traits\API\ApiResponseTrait;
use Closure;
use Exception;
use Illuminate\Http\Request;

class EnsureUserHasPermission
{
    use ApiResponseTrait;

    public function handle(Request $request, Closure $next, ...$permission)
    {
        try {
            $user = $request->decoded;

            function customDecrypt($data)
            {
                $data = base64_decode($data);
                $_ = substr($data, 0, 16);
                $encryptedData = substr($data, 16);
                
                $decryptedDataWithSalt = openssl_decrypt($encryptedData, config('auth.CRYPTO_ALG'), config('auth.CRYPTO_KEY'), OPENSSL_RAW_DATA, config('auth.CRYPTO_IV_KEY'));

                if ($decryptedDataWithSalt === false) {
                    throw new Exception("Token invalid");
                }

                return substr($decryptedDataWithSalt, 16);
            }

            $decryptedPermission = $user?->get('permission');
            // ?->transform(fn($v) => customDecrypt($v));

            if ($decryptedPermission?->intersect(collect($permission))?->isNotEmpty()) {
                return $next($request);
            } else {
                /**
                 * @status 400
                 * 
                 * @response array{status: string, code: int, message: string}
                 */
                return $this->errorResponse('not found', 404);
            }
        } catch (Exception $e) {
            /**
             * @status 500
             * 
             * @response array{status: string, code: int, message: string}
             */
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}
