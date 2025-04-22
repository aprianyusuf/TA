<?php

namespace App\Service\Leave;

use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LeaveTypeService
{
    private LeaveRequestService $leaveRequestService;
    /**
     * Create a new class instance.
     */
    public function __construct(LeaveRequestService $leaveRequestService)
    {
        $this->leaveRequestService = $leaveRequestService;
    }

    public function getLeaveType(Request $request)
    {
        $user = $request->decoded;

        $query = LeaveType::query()
            ->where('organization_id', $user['organization']['id']);

        $query = $query
            ->search($request->search)
            ->filter($request->filter)
            ->sort($request->sort);

        $count = $query->count('id');

        $data = $query
            ->skip(($request->get('page', 1) - 1) * $request->get('size', 10))
            ->limit($request->get('size', 10))
            ->get();
        $data->map(function ($item) use ($user) {
            $leaveQuota = $this->leaveRequestService->getLeaveQuota($user['id'], $item->id);
            $item->leaveQuota = $leaveQuota;
        });

        return [$data, $count];
    }
}
