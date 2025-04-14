<?php

namespace App\Http\Controllers\API\V1\Timesheet;

use App\Http\Controllers\Controller;
use App\Http\Resources\Timesheet\EmployeeSubordinateResource;
use App\Http\Resources\Timesheet\EmployeeTimesheetDetailResource;
use App\Http\Resources\Timesheet\EmployeeTimesheetResource;
use App\Http\Resources\Timesheet\TimesheetConfigurationResource;
use App\Service\Timesheet\EmployeeTimesheetService;
use App\Utils\Constants\TimesheetApprovalStatus;
use App\Utils\Constants\TimesheetStatus;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EmployeeTimesheetApiController extends Controller
{
    public function __construct(
        protected Request $request,
        protected EmployeeTimesheetService $employeeTimesheetService
    ) {}

    /**
     * Get Employee Timesheet
     */
    public function getEmployeeTimesheet()
    {
        $data = $this->employeeTimesheetService->getEmployeeTimesheet($this->request->decoded->get('id'));

        /**
         * @status 200
         * @body array{status: string, code: int, data: EmployeeTimesheetResource[]}
         */
        return $this->successResponse(data: $data);
    }

    /**
     * Add Employee Timesheet
     */
    public function addEmployeeTimesheet(Request $request)
    {
        $request->validate([
            'clientProjectId'   => ['ulid', 'nullable'],
            'title'             => ['string', 'required'],
            /** @example Asia/Jakarta */
            'timezone'          => ['string', 'required', 'timezone:all'],
            /** 
             * @format date-time
             * */
            'startAt'           => ['date', 'required'],
            /** 
             * @format date-time
             * */
            'endAt'             => ['date', 'required', 'after:startAt'],
            'description'       => ['nullable'],
            'status'            => ['required', 'integer', Rule::enum(TimesheetStatus::class)->only([TimesheetStatus::DRAFT, TimesheetStatus::SUBMIT])]
        ]);

        // [ ] handle if user is filled clientProjectId and check startAt and endAt between active user project
        $data = $this->employeeTimesheetService->addEmployeeTimesheet();

        /**
         * @status 201
         * @body array{status: string, code: int, data: EmployeeTimesheetResource[], message: string}
         */
        return $this->successResponse(data: $data, message: 'Success add to timesheet', code: Response::HTTP_CREATED);
    }

    /**
     * Update Employee Timesheet
     */
    public function updateEmployeeTimesheet(Request $request, string $id)
    {
        $request->validate([
            'clientProjectId'   => ['ulid', 'nullable'],
            'title'             => ['string', 'required'],
            /** @example Asia/Jakarta */
            'timezone'          => ['string', 'required', 'timezone:all'],
            /** 
             * @format date-time
             * */
            'startAt'           => ['date', 'required'],
            /** 
             * @format date-time
             * */
            'endAt'             => ['date', 'required', 'after:startAt'],
            'description'       => ['nullable'],
            'status'            => ['required', 'integer', Rule::enum(TimesheetStatus::class)->only([TimesheetStatus::DRAFT, TimesheetStatus::SUBMIT])]
        ]);

        $data = $this->employeeTimesheetService->editEmployeeTimesheet($id);

        /**
         * @status 200
         * @body array{status: string, code: int, data: EmployeeTimesheetResource[], message: string}
         */
        return $this->successResponse(data: $data, message: 'Success edit timesheet');
    }

    /**
     * Show Employee Timesheet
     */
    public function showEmployeeTimesheet(string $id)
    {
        $data = $this->employeeTimesheetService->showEmployeeTimesheet($id);

        /**
         * @status 200
         * @body array{status: string, data: EmployeeTimesheetDetailResource}
         */
        return $this->successResponse(data: EmployeeTimesheetDetailResource::make($data));
    }

    /**
     * Get Employee Subordinate
     */
    public function getSubordinate()
    {
        $data = $this->employeeTimesheetService->getSubordinate();

        /**
         * @status 200
         * @body array{status: string, data: EmployeeSubordinateResource[]}
         */
        return $this->successResponse(data: EmployeeSubordinateResource::collection($data));
    }

    /**
     * Get Employee Timesheet by User
     */
    public function getEmployeeTimesheetByUser(string $id)
    {
        $checkSubordinate = $this->employeeTimesheetService->getSubordinate($id);

        if ($checkSubordinate->count() === 0) {
            return $this->errorResponse(message: "You don't have authorized", errorCode: Response::HTTP_UNAUTHORIZED);
        }

        $data = $this->employeeTimesheetService->getEmployeeTimesheetByUser($id);


        /**
         * @status 200
         * @body array{status: string, code: int, data: EmployeeTimesheetResource[]}
         */
        return $this->successResponse(data: $data);
    }

    /**
     * Update Employee Timesheet By Approval
     */
    public function updateEmployeeTimesheetByApproval(Request $request, string $id)
    {
        $request->validate([
            'timesheetId' => ['required', 'ulid'],
            'status' => ['required', Rule::enum(TimesheetApprovalStatus::class)->only([
                TimesheetApprovalStatus::APPROVED,
                TimesheetApprovalStatus::REVISED,
                TimesheetApprovalStatus::REJECTED,
            ])],
            'notes' => [
                function (string $attribute, mixed $value, Closure $fail) use ($request) {
                    if ($value === null && in_array($request->status, [TimesheetApprovalStatus::REVISED->value, TimesheetApprovalStatus::REJECTED->value])) {
                        $fail("{$attribute} is required when revise or reject.");
                    }
                }
            ]
        ]);

        $checkIsPending = DB::query()
            ->from('timesheet_approval')
            ->where('status', TimesheetApprovalStatus::PENDING->value)
            ->where('approval_id', $request->decoded->get('id'))
            ->where('id', $id)
            ->first('id');

        if ($checkIsPending === null) {
            /**
             * Approval not found
             * @status 404
             * @body ErrorResource
             */
            return $this->errorResponse('Approval not found', Response::HTTP_NOT_FOUND);
        }

        $data = $this->employeeTimesheetService->updateEmployeeTimesheetByApproval($id);

        /**
         * @status 200
         * @body array{status: string, code: int, data: EmployeeTimesheetResource[], message: string}
         */
        return $this->successResponse(data: $data, message: 'Success update timesheet');
    }

    /**
     * Timesheet Configuration
     */
    public function timesheetConfiguration()
    {
        $data = $this->employeeTimesheetService->timesheetConfiguration();

        /**
         * @status 200
         * @body array{status: string, code: int, data: TimesheetConfigurationResource}
         */
        return $this->successResponse(data: TimesheetConfigurationResource::make($data));
    }
}
