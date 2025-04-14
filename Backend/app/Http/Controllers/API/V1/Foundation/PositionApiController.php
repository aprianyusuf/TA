<?php

namespace App\Http\Controllers\API\V1\Foundation;

use App\Http\Controllers\Controller;
use App\Http\Resources\Foundation\ErrorResource;
use App\Http\Resources\Foundation\PositionResource;
use App\Service\Foundation\PositionService;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PositionApiController extends Controller
{
    /**
     * List Position
     * 
     * List all position
     */
    public function index(Request $request, PositionService $positionService)
    {
        $request->validate([
            /**
             * @default 10
             */
            'size' => ['int'],
            /**
             * @default 1
             */
            'page' => ['int'],
            'search' => ['string', 'nullable'],
            'orderColumn' => ['string', 'nullable', Rule::in(['name', 'created_at', 'id'])],
            'orderBy' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ]);

        [$data, $count] = $positionService->get($request);

        /**
         * @status 200
         * @body array{status: string, code: int, data: PositionResource[], count: int}
         */
        return $this->successResponse(data: $data, optionalResponses: ['count' => $count]);
    }

    /**
     * Create a position
     * 
     * Create new position for an organization
     */
    public function store(Request $request, PositionService $positionService)
    {
        $request->validate([
            /** @default Manager */
            'name' => ['required', 'string'],
            /** @format string|null */
            'positionId' => ['nullable', 'ulid'],
            'permissions' => ['array', 'min:1', 'required'],
            // 'permission.*' => [Rule::in(DB::table())]
        ]);

        if (
            $request->positionId != null
        ) {
            $isPositionValid = DB::table('positions')->select('id')
                ->where('organization_id', $request->decoded->get('organization')?->get('id'))
                ->where('id', $request->positionId)
                ->get()->count();

            if ($isPositionValid == 0) {
                /**
                 * Position id not found in organization position
                 * 
                 * @status 404
                 * @body ErrorResource
                 */
                return $this->errorResponse('position_id not found', Response::HTTP_NOT_FOUND);
            }
        }

        // Check is permission valid permission in organization
        $organizationPermission = DB::table('permissions as p')
            ->join('organization_permission as op', function (JoinClause $join) use ($request) {
                $join->on('p.id', '=', 'op.permission_id')->where('op.organization_id', $request->decoded->get('organization')?->get('id'));
            })
            ->select([
                'p.code as code'
            ])
            ->groupBy('p.code')
            ->get()
            ->pluck('code');

        if (!collect($request->permissions)->every(function (string $value) use ($organizationPermission) {
            return $organizationPermission->contains($value);
        })) {
            /**
             * Permission not found or not eligible in organization permission
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('permission not found', Response::HTTP_NOT_FOUND);
        }

        $position = $positionService->createPosition($request);

        /**
         * @status 200
         * @body array{status: string, code: int, data: PositionResource, count: int, message: string}
         */
        return $this->successResponse(data: $position, message: 'Success create position');
    }

    /**
     * Show Position
     */
    public function show(Request $request, string $id, PositionService $positionService)
    {
        $position = DB::query()
            ->from('positions as p')
            ->select([
                'p.id as id',
                'p.name as name',
                'pp.id as parent',
                'pp.name as parent_name',
            ])
            ->join('positions as pp', 'p.position_id', '=', 'pp.id', 'left')
            ->where('p.id', $id)
            ->where('p.organization_id', $request->decoded->get('organization')?->get('id'))
            ->first();

        if ($position == null) {
            /**
             * Permission not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('permission not found', Response::HTTP_NOT_FOUND);
        }

        $position = $positionService->getPositionPermissions($request, collect($position));

        /**
         * @status 200
         * @body array{status: string, code: int, data: PositionResource, count: int, message: string}
         */
        return $this->successResponse(data: $position);
    }

    /**
     * Position Permission
     */
    public function permissions(Request $request, string $id, PositionService $positionService)
    {
        $position = DB::query()
            ->from('positions as p')
            ->select([
                'p.id as id',
                'p.name as name',
                'pp.id as parent',
                'pp.name as parent_name',
            ])
            ->join('positions as pp', 'p.position_id', '=', 'pp.id', 'left')
            ->where('p.id', $id)
            ->where('p.organization_id', $request->decoded->get('organization')?->get('id'))
            ->first();

        if ($position == null) {
            /**
             * Permission not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('permission not found', Response::HTTP_NOT_FOUND);
        }

        $position = $positionService->getPositionPermissions($request, collect($position));

        /**
         * @status 200
         * @body array{status: string, code: int, data: PositionResource, count: int, message: string}
         */
        return $this->successResponse(data: $position);
    }

    /**
     * Update a position
     * 
     * Update position
     */
    public function update(Request $request, string $id, PositionService $positionService)
    {
        $request->validate([
            /** @default Manager */
            'name' => ['required', 'string'],
            /** @format string|null */
            'positionId' => ['nullable', 'ulid'],
            'permissions' => ['array', 'min:1', 'required'],
        ]);

        $position = DB::table('positions')
            ->select('id')
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->get();

        if (!$position->contains('id', $id)) {
            /**
             * Position not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('position not found', Response::HTTP_NOT_FOUND);
        }

        if (
            $request->positionId != null && !$position->filter(fn($v) => $v->id != $id)->contains('id', $request->positionId)
        ) {
            /**
             * Position cannot reference to itself
             * 
             * @status 400
             * @body ErrorResource
             */
            return $this->errorResponse("superior position can't reference to itself", Response::HTTP_NOT_FOUND);
        }

        if (
            $request->positionId != null && !$position->filter(fn($v) => $v->id != $id)->contains('id', $request->positionId)
        ) {
            /**
             * Position id not found in organization position
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('position superior not found', Response::HTTP_NOT_FOUND);
        }

        // Check is permission valid permission in organization
        $organizationPermission = DB::table('permissions as p')
            ->join('organization_permission as op', function (JoinClause $join) use ($request) {
                $join->on('p.id', '=', 'op.permission_id')->where('op.organization_id', $request->decoded->get('organization')?->get('id'));
            })
            ->select([
                'p.code as code'
            ])
            ->groupBy('p.code')
            ->get()
            ->pluck('code');

        if (!collect($request->permissions)->every(function (string $value) use ($organizationPermission) {
            return $organizationPermission->contains($value);
        })) {
            /**
             * Permission not found or not eligible in organization permission
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('permission not found', Response::HTTP_NOT_FOUND);
        }

        $position = $positionService->updatePosition($request, $id);

        /**
         * @status 200
         * @body array{status: string, code: int, data: PositionResource, count: int, message: string}
         */
        return $this->successResponse(data: $position, message: 'Success update position');
    }

    /**
     * Delete Position
     */
    public function delete(Request $request, string $id, PositionService $positionService)
    {
        $position = DB::table('positions')
            ->select('id')
            ->where('id', $id)
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->get()
            ->count();

        if ($position == 0) {
            /**
             * Position not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('position not found', Response::HTTP_NOT_FOUND);
        }

        $positionService->deletePosition($id);

        /**
         * @status 204
         * @body array{status: string, message: string}
         */
        return $this->successResponse(code: Response::HTTP_NO_CONTENT);
    }
}
