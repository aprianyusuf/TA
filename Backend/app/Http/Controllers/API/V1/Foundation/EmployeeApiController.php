<?php
namespace App\Http\Controllers\API\V1\Foundation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Foundation\Employee\StoreEmployeeRequest;
use App\Http\Resources\Foundation\EmployeeResource;
use App\Http\Resources\Foundation\ErrorResource;
use App\Http\Resources\Foundation\OptionResource;
use App\Models\Foundation\Employee;
use App\Service\Foundation\EmployeeService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class EmployeeApiController extends Controller
{
    public function __construct(
        protected Request $request,
        protected EmployeeService $employeeService
    ) {}

    /**
     * List Employee
     *
     * List all employee in organization
     */
    public function index(Request $request, EmployeeService $employeeService)
    {
        [$data, $count] = $employeeService->get($request);

        /**
         * List all employee in organization
         *
         * @status 200
         * @body array{status: string, code: int, data: EmployeeService[], count: int}
         */
        return $this->successResponse(data: EmployeeResource::collection($data), optionalResponses: ['count' => $count]);
    }

    /**
     * Hierarchical Employee
     *
     * Get employee by hierarchical
     */
    public function hierarchy(Request $request, EmployeeService $employeeService)
    {
        $data = $employeeService->hierarchy($request);

        /**
         * Hierarchical Organization
         *
         * @status 200
         * @body array{status: string, code: int, data: EmployeeService[]}
         */
        return $this->successResponse(data: EmployeeResource::collection($data));
    }

    /**
     * List Employee By Position
     *
     * List all employee by position
     */
    public function employeeByPosition(Request $request, EmployeeService $employeeService)
    {
        $request->validate([
            'positionId' => ['required', 'ulid'],
            'search'     => ['nullable'],
        ]);

        $data = $employeeService->employeeByPosition(organizationId: $request->decoded->get('organization')?->get('id'), positionId: $request->get('positionId'), search: $request->get('search', ''));

        /**
         * @status 200
         *
         * @body array{status: string, code: int, data: OptionResource[], count: int}
         */
        return $this->successResponse(data: $data, optionalResponses: ['count' => collect($data)->count()]);
    }

    /**
     * Create an employee
     *
     * Create new employee
     */
    public function store(StoreEmployeeRequest $request, EmployeeService $employeeService)
    {
        $isPositionValid = DB::query()
            ->from("positions")
            ->where("id", $request->positionId)
            ->where("organization_id", $request->decoded->get("organization")?->get("id"))
            ->first();

        if ($isPositionValid == null) {
            /**
             * Position is not valid
             *
             * @status 400
             * @body ErrorResource
             */

            return $this->errorResponse('position_id not found', Response::HTTP_NOT_FOUND);
        }

        $isSuperiorValid = $employeeService->employeeByPosition(organizationId: $request->decoded->get('organization')?->get('id'), positionId: $request->positionId);

        if (! is_null($request->reportToId) && ! collect($isSuperiorValid)->pluck("value")->contains($request->reportToId)) {
            /**
             * Superior is not valid
             *
             * @status 400
             * @body ErrorResource
             */

            return $this->errorResponse('report_to_id not found', Response::HTTP_NOT_FOUND);
        }

        $employee = $employeeService->createEmployee($request);

        /**
         * @status 200
         * @body array{status: string, code: int, data: EmployeeResource, message: string}
         */
        return $this->successResponse(data: EmployeeResource::make($employee), message: 'Success create employee');
    }

    /**
     * Show Employee
     */
    public function show(string $id, EmployeeService $employeeService)
    {
        $employee = $employeeService->showEmployee($id);

        if ($employee == null) {
            /**
             * Employee not found
             *
             * @status 400
             * @body ErrorResource
             */

            return $this->errorResponse('employee not found', Response::HTTP_NOT_FOUND);
        }

        /**
         * @status 200
         * @body array{status: string, code: int, data: EmployeeResource, message: string}
         */
        return $this->successResponse(data: EmployeeResource::make($employee));
    }

    /**
     * Update employee
     */
    public function update(StoreEmployeeRequest $request, string $id)
    {
        if ($request->reportToId == $id) {
            /**
             * Superior is not valid
             *
             * @status 400
             * @body ErrorResource
             */

            return $this->errorResponse("Superior can't reference to itself", Response::HTTP_BAD_REQUEST);
        }

        $isPositionValid = DB::query()
            ->from("positions")
            ->where("id", $request->positionId)
            ->where("organization_id", $request->decoded->get("organization")?->get("id"))
            ->first();

        if ($isPositionValid == null) {
            /**
             * Position is not valid
             *
             * @status 400
             * @body ErrorResource
             */

            return $this->errorResponse('position_id not found', Response::HTTP_NOT_FOUND);
        }

        $isSuperiorValid = $this->employeeService->employeeByPosition(organizationId: $request->decoded->get('organization')?->get('id'), positionId: $request->positionId);

        if (! is_null($request->reportToId) && ! collect($isSuperiorValid)->pluck("value")->contains($request->reportToId)) {
            /**
             * Superior is not valid
             *
             * @status 400
             * @body ErrorResource
             */

            return $this->errorResponse('report_to_id not found', Response::HTTP_NOT_FOUND);
        }

        $employee = $this->employeeService->update($id);

        /**
         * @status 200
         * @body array{status: string, code: int, data: EmployeeResource, message: string}
         */
        return $this->successResponse(data: EmployeeResource::make($employee), message: 'Success update employee');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function delete(string $id)
    {
        $user = DB::query()
            ->from('users')
            ->select('id')
            ->where('id', $id)
            ->where('organization_id', $this->request->decoded->get('organization')?->get('id'))
            ->whereNull('deleted_at')
            ->first();

        if ($user === null) {
            /**
             * Employee not found
             *
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('employee not found', Response::HTTP_NOT_FOUND);
        }

        $this->employeeService->delete($id);

        /**
         * @status 204
         * @body array{status: string, message: string}
         */
        return $this->successResponse(code: Response::HTTP_NO_CONTENT);
    }
}
