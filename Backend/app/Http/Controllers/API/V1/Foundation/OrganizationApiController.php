<?php

namespace App\Http\Controllers\API\V1\Foundation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Foundation\Organization\StoreOrganizationRequest;
use App\Http\Requests\Foundation\Organization\UpdateOrganizationRequest;
use App\Http\Resources\Foundation\OrganizationResource;
use App\Http\Resources\Foundation\ErrorResource;
use App\Http\Resources\Foundation\PermissionResource;
use App\Models\Foundation\Organization;
use App\Service\Foundation\OrganizationService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class OrganizationApiController extends Controller
{
    /**
     * List Organization.
     *
     * List all organization.
     *
     */
    public function index(Request $request, OrganizationService $organizationService)
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
            'orderColumn' => ['string', 'nullable', Rule::in(['name', 'created_at', 'id'])],
            'orderBy' => ['nullable', 'string', Rule::in(['asc', 'desc'])],

            'filters' => ['array'],
            'filters.*.column' => ['string', Rule::in(['name', 'domain'])],
            'filters.*.condition' => ['string', Rule::in(['contains', 'equals'])],
            'filters.*.value' => ['string'],
        ]);

        [$data, $count] = $organizationService->get($request);

        /**
         * @body array{status: string, code: int, data: OrganizationResource[], count: int}
         */
        return $this->successResponse(data: OrganizationResource::collection($data), optionalResponses: ['count' => $count]);
    }

    /**
     * Create an organization.
     */
    public function store(StoreOrganizationRequest $request, OrganizationService $organizationService)
    {
        $organization = $organizationService->createOrganization($request);

        /**
         * @status 200
         *
         * @body array{status: string, code: int, message: string, data: OrganizationResource}
         */
        return $this->successResponse(data: OrganizationResource::make($organization), message: 'Success create organization');
    }

    /**
     * Update an organization
     *
     */
    public function update(UpdateOrganizationRequest $request, string $id, OrganizationService $organizationService)
    {
        $organization = Organization::query()->where('id', $id)->first();

        if ($organization == null) {

            /**
             * @status 404
             *
             * @body ErrorResource
             */
            return $this->errorResponse('organization not found', Response::HTTP_NOT_FOUND);
        }

        $organization = $organizationService->updateOrganization($request, $organization);

        /**
         * @status 200
         * @body array{status: string, code: int, message: string, data: OrganizationResource}
         */
        return $this->successResponse(data: $organization, message: 'Success update organization');
    }

    /**
     * Organization Permission
     *
     * Get all available permission from an organization
     */
    public function permissions(Request $request, OrganizationService $organizationService)
    {
        $request->validate([
            'search' => ['nullable']
        ]);

        [$permissions, $count] = $organizationService->permissions($request);

        /**
         * @status 200
         *
         * @body array{status: string, code: int, data: PermissionResource[], count: int}
         */
        return $this->successResponse(data: $permissions, optionalResponses: ['count' => $count]);
    }

    /**
     * Show Organization
     */
    public function show(string $id, OrganizationService $organizationService)
    {
        $organization = $organizationService->showOrganization($id);

        if ($organization == null) {
            /**
             * Organization not found
             *
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('organization not found', Response::HTTP_NOT_FOUND);
        }

        /**
         * @status 200
         *
         * @body array{status: string, code: int, data: OrganizationResource}
         */
        return $this->successResponse(data: OrganizationResource::make($organization));
    }

    /**
     * Delete organization
     */
    public function delete(string $id, OrganizationService $organizationService)
    {
        $organization = Organization::query()->where('id', $id)->first();

        if ($organization == null) {
            /**
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('organization not found', Response::HTTP_NOT_FOUND);
        }

        if ($organization->domain == 'mitrasaburaiproperti.com') {
            /**
             * @status 400
             *
             * @body ErrorResource
             */
            return $this->errorResponse('organization cannot be deleted', Response::HTTP_BAD_REQUEST);
        }

        $organizationService->deleteOrganization($organization);

        /**
         * @status 204
         * @body array{status: string, message: string}
         */
        return $this->successResponse(code: Response::HTTP_NO_CONTENT);
    }
}
