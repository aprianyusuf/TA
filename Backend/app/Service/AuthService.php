<?php

namespace App\Service;

use Carbon\Carbon;
use DateTimeImmutable;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Collection;

class AuthService
{

    public function getJwt(): ?Collection
    {
        if (empty($_SERVER['HTTP_AUTHORIZATION'])) {
            throw new AuthenticationException('Authorization header not found');
        }

        if (! preg_match('/Bearer\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
            throw new AuthenticationException('Token not found');
        }

        $jwt = $matches[1];
        if (!$jwt) {
            throw new AuthenticationException('Invalid token');
        }

        try {
            $decoded = JWT::decode($jwt, new Key(config('auth.JWT_PRIVATE_KEY'), config('auth.JWT_ALG')));
        } catch (Exception $e) {
            throw new AuthenticationException('Authentication token has expired or is not yet valid.');
        }

        $decoded = (array)$decoded;

        return toCollectionRecursive($decoded);
    }

    /**
     * Generate Token
     */
    public function generateToken(Collection $payload, ?Carbon $expiredAt = null): string
    {
        $issuedAt   = new DateTimeImmutable();
        $expire     = $issuedAt->modify('+' . config('auth.JWT_TTL') . ' ms')->getTimestamp();

        $data = [
            'iat'   => $issuedAt->getTimestamp(),
            'iss'   => config('app.url'),
            'exp'   => $expiredAt ? $expiredAt->getTimestamp() : $expire,
            'user'  => $payload,
            'aud'   => request()->getSchemeAndHttpHost(),
        ];

        return JWT::encode(
            $data,
            config('auth.JWT_PRIVATE_KEY'),
            config('auth.JWT_ALG')
        );
    }
}
