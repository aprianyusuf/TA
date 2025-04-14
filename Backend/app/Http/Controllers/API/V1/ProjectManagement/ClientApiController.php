<?php

namespace App\Http\Controllers\API\V1\ProjectManagement;

use App\Http\Controllers\Controller;
use App\Http\Resources\Foundation\ErrorResource;
use App\Http\Resources\Foundation\OptionResource;
use App\Http\Resources\ProjectManagement\ClientProjectResource;
use App\Http\Resources\ProjectManagement\ClientProjectUserResource;
use App\Http\Resources\ProjectManagement\ClientResource;
use App\Service\ProjectManagement\ClientService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ClientApiController extends Controller
{
    public function __construct(
        protected ClientService $clientService
    ) {}

    /**
     * List Client
     * 
     * List all client
     */
    public function index(Request $request, ClientService $clientService)
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

        [$data, $count] = $clientService->get($request);

        /**
         * @status 200
         * @body array{status: string, code: int, data: ClientResource[], count: int}
         */
        return $this->successResponse(data: $data, optionalResponses: ['count' => $count]);
    }

    /**
     * Create a client
     */
    public function store(Request $request, ClientService $clientService)
    {
        $request->validate([
            /** @default RDT */
            'name' => ['required', 'string'],
        ]);

        $client = $clientService->createClient($request);

        /**
         * @status 200
         * @body array{status: string, code: int, data: ClientResource, message: string}
         */
        return $this->successResponse(data: $client, message: 'Success create client');
    }

    /**
     * Edit client
     */
    public function update(Request $request, string $id, ClientService $clientService)
    {
        $request->validate([
            /** @default RDT */
            'name' => ['required', 'string'],
        ]);

        $client = DB::query()
            ->from('clients')
            ->where('id', $id)
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->first(['id']);

        if ($client == null) {
            /**
             * Client not found or not eligible in organization permission
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('client not found', Response::HTTP_NOT_FOUND);
        }

        $client = $clientService->updateClient($request, $id);

        /**
         * @status 200
         * @body array{status: string, code: int, data: ClientResource, message: string}
         */
        return $this->successResponse(data: $client, message: 'Success edit client');
    }

    /**
     * Show Client
     */
    public function show(Request $request, string $id, ClientService $clientService)
    {
        $client = $clientService->showClient($request, $id);

        if ($client == null) {
            /**
             * Client not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('client not found', Response::HTTP_NOT_FOUND);
        }

        /**
         * @status 200
         * 
         * @body array{status: string, code: int, data: ClientResource}
         */
        return $this->successResponse(data: ClientResource::make($client));
    }

    /**
     * Delete Client
     */
    public function delete(Request $request, string $id, ClientService $clientService)
    {
        $client = DB::table('clients')
            ->select('id')
            ->where('id', $id)
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->first();

        if ($client == null) {
            /**
             * Client not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('client not found', Response::HTTP_NOT_FOUND);
        }

        $clientService->deleteClient($id);

        /**
         * @status 204
         * @body array{status: string, message: string}
         */
        return $this->successResponse(code: Response::HTTP_NO_CONTENT, message: 'Success delete client');
    }

    /**
     * List Client Project
     */
    public function projectByClient(Request $request, string $client, ClientService $clientService)
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

        [$data, $count] = $clientService->projectByClient($request, $client);

        /**
         * @status 200
         * @body array{status: string, code: int, data: ClientProjectResource[], count: int}
         */
        return $this->successResponse(data: $data, optionalResponses: ['count' => $count]);
    }

    /**
     * Create Client Project
     */
    public function createProjectByClient(Request $request, string $client, ClientService $clientService)
    {
        $request->validate([
            'name' => ['required', 'string'],
            'startDate' => ['required', 'date'],
            'endDate' => ['required', 'date', 'after:startDate'],
            'cutOffTimesheetStartDay' => ['nullable', 'integer', 'min:1', 'max:30'],
            'cutOffTimesheetEndDay' => ['nullable', 'integer', 'min:1', 'max:30'],
            'isRequiresProjectManagerApproval' => ['required', 'boolean'],
            'projectManagerId' => ['required', 'ulid'],
            'color' => ['required', 'string'],
        ]);

        $user = DB::table('users')
            ->select(['id'])
            ->where('id', $request->projectManagerId)
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->first();

        if ($user == null) {
            /**
             * Project manager not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('project manager not found', Response::HTTP_NOT_FOUND);
        }

        $c = DB::table('clients')
            ->select(['id'])
            ->where('id', $client)
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->first();

        if ($c == null) {
            /**
             * Client not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('client not found', Response::HTTP_NOT_FOUND);
        }

        $data = $clientService->createProjectByClient($request, $client);

        /**
         * @status 200
         * @body array{status: string, code: int, data: ClientProjectResource}
         */
        return $this->successResponse(data: $data, message: 'Success create project');
    }

    /**
     * Show Client Project
     */
    public function showProjectByClient(Request $request, string $client, string $id, ClientService $clientService)
    {
        $c = DB::table('clients')
            ->select(['id'])
            ->where('id', $client)
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->first();

        if ($c == null) {
            /**
             * Client not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('client not found', Response::HTTP_NOT_FOUND);
        }

        $clientProject = $clientService->showProjectByClient($request, $client, $id);

        if ($clientProject == null) {
            /**
             * Client not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('project not found', Response::HTTP_NOT_FOUND);
        }

        /**
         * @status 200
         * @body array{status: string, code: int, data: ClientProjectResource}
         */
        return $this->successResponse(data: ClientProjectResource::make($clientProject));
    }

    /**
     * Update Client Project
     */
    public function updateProjectByClient(Request $request, string $client, string $id, ClientService $clientService)
    {
        $request->validate([
            'name' => ['required', 'string'],
            'startDate' => ['required', 'date'],
            'endDate' => ['required', 'date', 'after:startDate'],
            'cutOffTimesheetStartDay' => ['nullable', 'integer', 'min:1', 'max:30'],
            'cutOffTimesheetEndDay' => ['nullable', 'integer', 'min:1', 'max:30'],
            'isRequiresProjectManagerApproval' => ['required', 'boolean'],
            'projectManagerId' => ['required', 'ulid'],
            'color' => ['required', 'string'],
        ]);

        $user = DB::table('users')
            ->select(['id'])
            ->where('id', $request->projectManagerId)
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->first();

        if ($user == null) {
            /**
             * Project manager not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('project manager not found', Response::HTTP_NOT_FOUND);
        }

        $c = DB::table('clients')
            ->select(['id'])
            ->where('id', $client)
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->first();

        if ($c == null) {
            /**
             * Client not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('client not found', Response::HTTP_NOT_FOUND);
        }

        $data = $clientService->updateProjectByClient($request, $client, $id);

        /**
         * @status 200
         * @body array{status: string, code: int, data: ClientProjectResource}
         */
        return $this->successResponse(data: $data, message: 'Success update project');
    }

    /**
     * Delete Client Project
     */
    public function deleteProjectByClient(Request $request, string $client, string $id, ClientService $clientService)
    {
        $c = DB::table('clients')
            ->select(['id'])
            ->where('id', $client)
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->first();

        if ($c == null) {
            /**
             * Client not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('client not found', Response::HTTP_NOT_FOUND);
        }

        $clientService->deleteProjectByClient($client, $id);

        /**
         * @status 204
         * @body array{status: string, message: string}
         */
        return $this->successResponse(code: Response::HTTP_NO_CONTENT, message: 'Success delete project');
    }

    /**
     * List Client Project User
     */
    public function clientProjectUser(Request $request, string $client, string $id, ClientService $clientService)
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

        [$data, $count] = $clientService->clientProjectUser($request, $client, $id);

        /**
         * @status 200
         * @body array{status: string, code: int, data: ClientProjectUserResource[], count: int}
         */
        return $this->successResponse(data: $data, optionalResponses: ['count' => $count]);
    }

    /**
     * Add Client Project User
     */
    public function createClientProjectUser(Request $request, string $client, string $id, ClientService $clientService)
    {
        $request->validate([
            'userId' => ['required', 'ulid'],
            'startDate' => ['required', 'date'],
            'endDate' => ['required', 'date', 'after:startDate'],
        ]);

        $user = DB::table('users as u')
            ->where('id', $request->userId)
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->first();

        if ($user == null) {
            /**
             * User not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('user not found', Response::HTTP_NOT_FOUND);
        }

        $data = $clientService->createClientProjectUser($request, $client, $id);

        /**
         * @status 200
         * @body array{status: string, code: int, data: ClientProjectUserResource, count: int}
         */
        return $this->successResponse(data: $data, message: 'Success add user');
    }

    /**
     * Update Client Project User
     */
    public function updateClientProjectUser(Request $request, string $client, string $project, string $id, ClientService $clientService)
    {
        $request->validate([
            'startDate' => ['required', 'date'],
            'endDate' => ['required', 'date', 'after:startDate'],
        ]);

        $p = $clientService->showProjectByClient($request, $client, $project);

        if ($p == null) {
            /**
             * Project not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('project not found', Response::HTTP_NOT_FOUND);
        }

        $data = $clientService->updateClientProjectUser($request, $client, $project, $id);

        /**
         * @status 200
         * @body array{status: string, data: ClientProjectUserResource, message: string}
         */
        return $this->successResponse(data: $data, message: 'Success edit user');
    }

    /**
     * Show Client Project User
     */
    public function showClientProjectUser(Request $request, string $client, string $project, string $id, ClientService $clientService)
    {
        $p = $clientService->showProjectByClient($request, $client, $project);

        if ($p == null) {
            /**
             * Project not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('project not found', Response::HTTP_NOT_FOUND);
        }

        $data = $clientService->showClientProjectUser($request, $client, $project, $id);

        if ($data === null) {
            /**
             * User not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('user not found', Response::HTTP_NOT_FOUND);
        }

        /**
         * @status 200
         * @body array{status: string, code: int, data: ClientProjectUserResource}
         */
        return $this->successResponse(data: ClientProjectUserResource::make($data));
    }

    /**
     * Delete Client Project User
     */
    public function deleteClientProjectUser(Request $request, string $client, string $project, string $id, ClientService $clientService)
    {
        $p = $clientService->showProjectByClient($request, $client, $project);

        if ($p == null) {
            /**
             * Project not found
             * 
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('project not found', Response::HTTP_NOT_FOUND);
        }

        $clientService->deleteClientProjectUser($project, $id);

        /**
         * @status 204
         * @body array{status: string, message: string}
         */
        return $this->successResponse(code: Response::HTTP_NO_CONTENT, message: 'Success delete user');
    }

    /**
     * Get Employee Project Option
     */
    public function getEmployeeProject(Request $request)
    {
        $request->validate([
            'startDateAt' => ['nullable', 'date']
        ]);

        /**
         * @status 200
         * @body array{status: string, code: int, data: OptionResource[]}
         */
        return $this->successResponse(data: $this->clientService->getEmployeeProject());
    }
}
