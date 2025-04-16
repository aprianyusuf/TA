<?php
namespace App\Http\Controllers\API\V1\Leave;

use App\Http\Controllers\Controller;
use App\Http\Resources\Leave\LeaveRequestResource;
use App\Service\Leave\LeaveRequestService;
use Illuminate\Http\Request;

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
        // dd($data);
        /**
         * @body array{status: string, code: int, data: LeaveRequestResource[], count: int}
         */
        return $this->successResponse(LeaveRequestResource::collection($data), optionalResponses: ['count' => $data->count()]);
    }

}
