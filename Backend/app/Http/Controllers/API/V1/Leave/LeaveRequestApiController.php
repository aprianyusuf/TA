<?php

namespace App\Http\Controllers\API\V1\Leave;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use App\Service\Leave\LeaveRequestService;
use App\Http\Resources\Leave\LeaveRequestResource;

class LeaveRequestApiController extends Controller
{
    private LeaveRequestService $service;
    public function __construct(LeaveRequestService $leaveRequestService)
    {
        $this->service = $leaveRequestService;
    }

    public function index(Request $request)
    {
        $data = $this->service->getLeaveRequest($request);

        /**
         * @body array{status: string, code: int, data: LeaveRequestResource[], count: int}
         */
        return $this->successResponse(LeaveRequestResource::collection($data), ['count' => $data->count()]);
    }
}
