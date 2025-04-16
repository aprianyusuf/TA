<?php
namespace App\Policies\Leave\LeaveRequest;

use App\Models\User;
use App\Models\LeaveRequest;
use Illuminate\Auth\Access\Response;

class ResponseLeaveRequestPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function before(User $user): Response|null
    {
        if ($user->directReports()->count() > 0) {
            return Response::allow();
        }
        return null;
    }
    
    /**
     * Determine whether the user can respond to the leave request.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\LeaveRequest  $leaveRequest
     * @return \Illuminate\Auth\Access\Response
     */
    public function responseLeaveRequest(User $user, LeaveRequest $leaveRequest): Response
    {
        $leaveRequest->load(
            [
                'user' => [
                    'reportTo',
                ],
            ]
        );
        return $leaveRequest->user->report_to_id === $user->id
            ? Response::allow()
            : Response::deny(
                'You do not have permission to respond to this leave request.'
            );
    }
}
