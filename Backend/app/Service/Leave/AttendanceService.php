<?php

namespace App\Service\Leave;

use App\Http\Requests\Leave\StoreAttendanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AttendanceService
{
    public function clockInToday(Request $request)
    {
        return DB::query()
            ->from('attendances')
            ->select(['id', 'type', 'latitude', 'longitude', 'image', 'note', 'submitted_at'])
            ->where('organization_id', $request->decoded->get('organization')?->get('id'))
            ->where('user_id', $request->decoded->get('id'))
            ->whereDate('submitted_at', '=', now()->addMinutes($request->decoded->get('timezone_offset') * 60)->toDateString())
            ->orderByDesc('submitted_at')
            ->get();
    }

    public function postClockInToday(StoreAttendanceRequest $storeAttendanceRequest)
    {
        return DB::query()
            ->from('attendances')
            ->insert([
                'id'                => Str::ulid(),
                'user_id'           => $storeAttendanceRequest->decoded->get('id'),
                'organization_id'   => $storeAttendanceRequest->decoded->get('organization')?->get('id'),
                'type'              => $storeAttendanceRequest->type,
                'latitude'          => $storeAttendanceRequest->latitude,
                'longitude'         => $storeAttendanceRequest->longitude,
                'image'             => $storeAttendanceRequest->image,
                'note'              => $storeAttendanceRequest->note,
                'submitted_at'      => now()->addMinutes($storeAttendanceRequest->decoded->get('timezone_offset') * 60),
                'created_at'        => now()
            ]);
    }
}
