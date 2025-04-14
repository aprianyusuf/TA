<?php

namespace App\Http\Controllers\API\V1\Leave;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leave\StoreAttendanceRequest;
use App\Http\Resources\Foundation\ErrorResource;
use App\Http\Resources\Leave\ClockInResource;
use App\Service\Leave\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AttendanceApiController extends Controller
{
    /**
     * Get Data Clock In/Out (Today)
     * 
     * Get Data Clock In/Out (Today)
     */
    public function clockInToday(Request $request, AttendanceService $attendanceService) {
        $data = $attendanceService->clockInToday($request);

        /**
         * @body array{status: string, code: int, data: ClockInResource[], count: int}
         */
        return $this->successResponse(data: ClockInResource::collection($data), optionalResponses: ['count' => $data->count()]);
    }

    /**
     * Post Data Clock In/Out (Today)
     * 
     * Post Data Clock In/Out (Today)
     */
    public function postClockInToday(StoreAttendanceRequest $request, AttendanceService $attendanceService)
    {
        $data = $attendanceService->postClockInToday($request);

        if (!$data) {
            /**
             * @status 400
             * 
             * @body ErrorResource
             */
            return $this->errorResponse('error when submit', Response::HTTP_BAD_REQUEST);
        }

        /**
         * @body array{message: string, code: int}
         */
        return $this->successResponse(message: 'Success Submit Clock In/Out', code: Response::HTTP_CREATED);
    }
}
