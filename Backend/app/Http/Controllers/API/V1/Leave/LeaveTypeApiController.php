<?php

namespace App\Http\Controllers\API\V1\Leave;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use App\Service\Leave\LeaveTypeService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LeaveTypeApiController extends Controller
{
    private LeaveTypeService $service;

    public function __construct(LeaveTypeService $leaveRequestService)
    {
        $this->service = $leaveRequestService;
    }

    public function index(Request $request)
    {
        [$data, $count] = $this->service->getLeaveType($request);

        /**
         * @body array{status: string, code: int, data: LeaveType[], count: int}
         */
        return $this->successResponse($data, optionalResponses: ['count' => $count]);
    }
}
