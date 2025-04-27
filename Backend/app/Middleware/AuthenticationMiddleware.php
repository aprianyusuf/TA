<?php

namespace App\Middleware;

use App\Service\AuthService;
use App\Traits\API\ApiResponseTrait;
use Closure;
use Exception;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuthenticationMiddleware
{
    use ApiResponseTrait;

    public function handle(Request $request, Closure $next)
    {
        if($request->is('telescope/*')) {
            return $next($request);
        }
        try {
            $user = (new AuthService)->getJwt();

            $request->merge([
                'decoded' => $user->get('user')
            ]);

            return $next($request);
        } catch (AuthenticationException $e) {
            /**
             * @status 401
             *
             * @response array{status: string, code: int, message: string}
             */
            Log::error($e->getMessage(), [
                'level' => 'ERROR',
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse($e->getMessage(), Response::HTTP_UNAUTHORIZED);
        } catch (Exception $e) {
            /**
             * @status 500
             *
             * @response array{status: string, code: int, message: string}
             */
            Log::error($e->getMessage(), [
                'level' => 'ERROR',
            ]);

            return $this->errorResponse('Internal server error', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
