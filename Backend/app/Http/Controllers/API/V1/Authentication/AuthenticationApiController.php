<?php
namespace App\Http\Controllers\API\V1\Authentication;

use App\Http\Controllers\Controller;
use App\Http\Resources\Foundation\ErrorResource;
use App\Http\Resources\Foundation\LoginResource;
use App\Models\User;
use App\Service\AuthService;
use DateTime;
use DateTimeZone;
use Exception;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthenticationApiController extends Controller
{
    /**
     * @unauthenticated
     * Login
     */
    public function login(Request $request)
    {
        $request->validate([
            /**
             * @default muhammad.ikhbal@mitrasaburaiproperti.com
             * @example muhammad.ikhbal@mitrasaburaiproperti.com
             * */
            'email'    => ['required', 'email'],
            /** @default password */
            'password' => ['required'],
            /** @default Asia/Jakarta */
            'timezone' => ['required', 'timezone:all'],
        ]);

        $user = User::query()->where('email', $request->email)->first();

        if ($user == null) {
            /**
             * @status 401
             *
             * @body ErrorResource
             */
            return $this->errorResponse(__('The credentials provided does not match with our record.'), Response::HTTP_UNAUTHORIZED);
        }

        function customEncrypt($data)
        {
            $salt      = random_bytes(16);
            $encrypted = openssl_encrypt($salt . $data, config('auth.CRYPTO_ALG'), config('auth.CRYPTO_KEY'), OPENSSL_RAW_DATA, config('auth.CRYPTO_IV_KEY'));
            return base64_encode($salt . $encrypted);
        }

        if (! Hash::check($request->password, $user->password)) {
            /**
             * @status 401
             *
             * @body ErrorResource
             */
            return $this->errorResponse(__('The credentials provided does not match with our record.'), Response::HTTP_UNAUTHORIZED);
        }

        $user->load('organization', 'position');

        $timezone = new DateTimeZone($request->timezone);
        $datetime = new DateTime('now', $timezone);

        $offsetInHours = $timezone->getOffset($datetime) / 60 / 60;

        $payload = collect([
            'id'              => $user->id,
            'first_name'      => $user->first_name,
            'last_name'       => $user->last_name,
            'name'            => trim("{$user->first_name} {$user->last_name}"),
            'email'           => $user->email,
            'timezone'        => $request->timezone,
            'timezone_offset' => $offsetInHours,
            'position'        => collect([
                'id'   => $user->position->id,
                'name' => $user->position->name,
            ]),
            'permission'      => DB::table('permission_position as pp')
                ->join('permissions as p', 'pp.permission_id', 'p.id')
                ->join('users as u', function (JoinClause $join) use ($user) {
                    $join->on('pp.position_id', 'u.position_id')->where('u.id', $user->id);
                })
                ->join('positions as po', 'u.position_id', 'po.id')
                ->distinct()
                ->orderBy('p.code')
                ->pluck('p.code')
            // ->transform(fn($v) => customEncrypt($v))
                ->toArray(),
            'organization'    => collect([
                'id'              => $user->organization->id,
                'name'            => $user->organization->name,
                'domain'          => $user->organization->domain,
                'timezone'        => $user->organization->timezone,
                'timezone_offset' => (float) $user->organization->timezone_offset,
            ]),
        ]);

        $token        = (new AuthService)->generateToken(payload: $payload);
        $refreshToken = (new AuthService)->generateToken(payload: $payload->except(['permission', 'organization']), expiredAt: now()->addDays(rand(30, 45)));

        if ($user->first_login_at == null) {
            $user->first_login_at = now();
        }

        $user->last_login_at   = now();
        $user->timezone        = $request->timezone;
        $user->timezone_offset = $offsetInHours;

        $user->save();

        /**
         * @status 200
         *
         * @body array{data: array{user: LoginResource, token: string, refresh_token: string}, code: int, status: string}
         */
        return $this->successResponse(data: ['user' => LoginResource::make($user), 'token' => $token, 'refresh_token' => $refreshToken]);
    }

    /**
     * @unauthenticated
     * Refresh Token
     */
    public function refreshToken(Request $request)
    {
        $request->validate([
            /** @default string */
            'refreshToken' => ['required'],
            /** @default Asia/Jakarta */
            'timezone'     => ['required', 'timezone:all'],
        ]);

        try {
            $decoded = JWT::decode($request->refreshToken, new Key(config('auth.JWT_PRIVATE_KEY'), config('auth.JWT_ALG')));
        } catch (ExpiredException $e) {
            /**
             * Expired token
             * @status 403
             *
             * @body ErrorResource
             */
            return $this->errorResponse('Authentication token has expired or is not yet valid.', Response::HTTP_FORBIDDEN);
        } catch (Exception $e) {
            /**
             * Invalid token
             * @status 400
             *
             * @body ErrorResource
             */
            return $this->errorResponse('Invalid token', Response::HTTP_BAD_REQUEST);
        }

        $decoded = toCollectionRecursive((array) $decoded);

        $user = User::query()
            ->where('id', $decoded->get('user')->get('id'))
            ->first();

        if ($user == null) {
            /**
             * User not found
             * @status 404
             *
             * @body ErrorResource
             */
            return $this->errorResponse('User not found', Response::HTTP_NOT_FOUND);
        }

        $user->load('organization', 'position');

        $timezone = new DateTimeZone($request->timezone);
        $datetime = new DateTime('now', $timezone);

        $offsetInHours = $timezone->getOffset($datetime) / 60 / 60;

        $payload = collect([
            'id'              => $user->id,
            'first_name'      => $user->first_name,
            'last_name'       => $user->last_name,
            'name'            => trim("{$user->first_name} {$user->last_name}"),
            'email'           => $user->email,
            'timezone'        => $request->timezone,
            'timezone_offset' => $offsetInHours,
            'position'        => collect([
                'id'   => $user->position->id,
                'name' => $user->position->name,
            ]),
            'permission'      => DB::table('permission_position as pp')
                ->join('permissions as p', 'pp.permission_id', 'p.id')
                ->join('users as u', function (JoinClause $join) use ($user) {
                    $join->on('pp.position_id', 'u.position_id')->where('u.id', $user->id);
                })
                ->join('positions as po', 'u.position_id', 'po.id')
                ->distinct()
                ->orderBy('p.code')
                ->pluck('p.code')
            // ->transform(fn($v) => customEncrypt($v))
                ->toArray(),
            'organization'    => collect([
                'id'              => $user->organization->id,
                'name'            => $user->organization->name,
                'domain'          => $user->organization->domain,
                'timezone'        => $user->organization->timezone,
                'timezone_offset' => (float) $user->organization->timezone_offset,
            ]),
        ]);

        $token        = (new AuthService)->generateToken(payload: $payload);
        $refreshToken = (new AuthService)->generateToken(payload: $payload->except(['permission', 'organization']), expiredAt: now()->addDays(rand(30, 60)));

        $user->last_login_at   = now();
        $user->timezone        = $request->timezone;
        $user->timezone_offset = $offsetInHours;

        $user->save();

        /**
         * Success refresh token
         * @status 200
         *
         * @body array{data: array{user: LoginResource, token: string, refresh_token: string}, code: int, status: string}
         */
        return $this->successResponse(data: ['user' => LoginResource::make($user), 'token' => $token, 'refresh_token' => $refreshToken]);
    }

    /**
     * Change User
     */
    public function changeUser(Request $request)
    {
        $request->validate([
            'id'       => ['required'],
            'password' => ['required'],
        ]);

        if ($request->password !== config('app.enable_change_user_password')) {
            /**
             * Invalid credential
             * @status 401
             *
             * @body ErrorResource
             */
            return $this->errorResponse('Invalid credential', Response::HTTP_UNAUTHORIZED);
        }

        $user = User::query()
            ->where('id', $request->id)
            ->first();

        if ($user == null) {
            /**
             * User not found
             * @status 404
             *
             * @body ErrorResource
             */
            return $this->errorResponse('User not found', Response::HTTP_NOT_FOUND);
        }

        $user->load('organization', 'position');

        $payload = collect([
            'id'              => $user->id,
            'first_name'      => $user->first_name,
            'last_name'       => $user->last_name,
            'name'            => trim("{$user->first_name} {$user->last_name}"),
            'email'           => $user->email,
            'timezone'        => $request->timezone,
            'timezone_offset' => $user->timezone_offset,
            'position'        => collect([
                'id'   => $user->position->id,
                'name' => $user->position->name,
            ]),
            'permission'      => DB::table('permission_position as pp')
                ->join('permissions as p', 'pp.permission_id', 'p.id')
                ->join('users as u', function (JoinClause $join) use ($user) {
                    $join->on('pp.position_id', 'u.position_id')->where('u.id', $user->id);
                })
                ->join('positions as po', 'u.position_id', 'po.id')
                ->distinct()
                ->orderBy('p.code')
                ->pluck('p.code')
            // ->transform(fn($v) => customEncrypt($v))
                ->toArray(),
            'organization'    => collect([
                'id'              => $user->organization->id,
                'name'            => $user->organization->name,
                'domain'          => $user->organization->domain,
                'timezone'        => $user->organization->timezone,
                'timezone_offset' => (float) $user->organization->timezone_offset,
            ]),
        ]);

        $token        = (new AuthService)->generateToken(payload: $payload);
        $refreshToken = (new AuthService)->generateToken(payload: $payload->except(['permission', 'organization']), expiredAt: now()->addDays(rand(30, 60)));

        $user->last_login_at = now();

        $user->save();

        /**
         * Success refresh token
         * @status 200
         *
         * @body array{data: array{user: LoginResource, token: string, refresh_token: string}, code: int, status: string}
         */
        return $this->successResponse(data: ['user' => LoginResource::make($user), 'token' => $token, 'refresh_token' => $refreshToken]);
    }
}
