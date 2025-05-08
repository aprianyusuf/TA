<?php

namespace App\Http\Controllers\API\V1\Leave;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leave\StoreLeaveRequest as LeaveStoreLeaveRequest;
use App\Http\Requests\Leave\UpdateLeaveRequest;
use App\Http\Resources\Leave\LeaveRequestResource;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use App\Service\Leave\LeaveRequestService;
use App\Utils\Enums\LeaveRequestStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Response;


class LeaveRequestApiController extends Controller
{
    private LeaveRequestService $service;
    public function __construct(LeaveRequestService $leaveRequestService)
    {
        $this->service = $leaveRequestService;
    }

    public function index(Request $request)
    {
        [$data, $count] = $this->service->getLeaveRequest($request);
        /**
         * @body array{status: string, code: int, data: LeaveRequestResource[], count: int}
         */
        return $this->successResponse(LeaveRequestResource::collection($data), optionalResponses: ['count' => $count]);
    }

    public function store(LeaveStoreLeaveRequest $request, LeaveRequestService $leaveRequestService)
    {
        $request->validated();

        $leaveTypes = LeaveType::where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->where('id', $request->leaveType)
            ->first();

        if ($leaveTypes == null) {
            /**
             * Leave type is not valid
             *
             * @status 400
             * @body ErrorResource
             */

            return $this->errorResponse('leaveType not found', Response::HTTP_NOT_FOUND);
        }


        $validation = $leaveRequestService->canApplyForLeave($request->decoded->get('id'), $leaveTypes, $request->startDate, $request->endDate);
        if (! $validation['valid']) {
            /**
             * Leave request are not allowed
             *
             * @status 406
             * @body ErrorResource
             */
            return $this->errorResponse($validation["message"], Response::HTTP_NOT_ACCEPTABLE);
        }

        // create count duration of workdays here
        $workingDays = $leaveRequestService->calculateWorkingDays(
            $request->input('startDate'),
            $request->input('endDate')
        );

        if ($workingDays > 30) {
            /**
             * Leave request are not allowed
             *
             * @status 406
             * @body ErrorResource
             */
            return $this->errorResponse("The leave period cannot exceed 30 working days.", Response::HTTP_NOT_ACCEPTABLE);
        }

        $leaveRequest = $leaveRequestService->createLeaveRequest($request, $workingDays);

        return $this->successResponse(data: $leaveRequest, message: 'Success create leave request');
    }

    public function approve(Request $request, string $leaveRequestId, LeaveRequestService $leaveRequestService)
    {
        $leaveRequest = LeaveRequest::where('id', $leaveRequestId)
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->where('status', LeaveRequestStatus::Pending)
            ->first();

        if ($leaveRequest == null) {
            /**
             * Leave request not found
             * @status 404
             *
             * @body ErrorResource
             */
            return $this->errorResponse('Leave request not found', Response::HTTP_NOT_FOUND);
        }

        $approver = User::find($request->decoded->get('id'));

        $hasPermission = $leaveRequestService->hasPermissionToActOnLeaveRequest($leaveRequest, $approver,);

        if (!$hasPermission) {
            /**
             * Approve action not allowed
             * @status 403
             *
             * @body ErrorResource
             */
            return $this->errorResponse('Permission denied', Response::HTTP_FORBIDDEN);
        }

        $approved = $leaveRequestService->approveLeaveRequest($leaveRequest, $request->decoded->get('id'));

        return $this->successResponse(data: $approved, message: 'Success approve leave request');
    }

    public function reject(Request $request, string $leaveRequestId, LeaveRequestService $leaveRequestService)
    {
        $leaveRequest = LeaveRequest::where('id', $leaveRequestId)
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->where('status', LeaveRequestStatus::Pending)
            ->first();

        if ($leaveRequest == null) {
            /**
             * Leave request not found
             * @status 404
             *
             * @body ErrorResource
             */
            return $this->errorResponse('Leave request not found', Response::HTTP_NOT_FOUND);
        }

        $approver = User::find($request->decoded->get('id'));

        $hasPermission = $leaveRequestService->hasPermissionToActOnLeaveRequest($leaveRequest, $approver);

        if (!$hasPermission) {
            /**
             * Approve action not allowed
             * @status 403
             *
             * @body ErrorResource
             */
            return $this->errorResponse('Permission denied', Response::HTTP_FORBIDDEN);
        }

        $rejected = $leaveRequestService->rejectLeaveRequest($leaveRequest, $request->decoded->get('id'));

        return $this->successResponse(data: $rejected, message: 'Success reject leave request');
    }
}
