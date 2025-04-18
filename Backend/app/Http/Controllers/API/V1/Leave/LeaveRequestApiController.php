<?php

namespace App\Http\Controllers\API\V1\Leave;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leave\StoreLeaveRequest as LeaveStoreLeaveRequest;
use App\Http\Resources\Leave\LeaveRequestResource;
use App\Models\LeaveType;
use App\Service\Leave\LeaveRequestService;
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
        // dd($data);
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
        $leaveRequest = $leaveRequestService->createLeaveRequest($request, 1);

        return $this->successResponse(data: $leaveRequest, message: 'Success create leave request');
    }
}
