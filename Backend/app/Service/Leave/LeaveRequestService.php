<?php
namespace App\Service\Leave;

use App\Http\Requests\Leave\StoreLeaveRequest;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use App\Utils\Enums\LeaveRequestStatus;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Validator;

class LeaveRequestService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getLeaveRequest(Request $request)
    {
        $user = $request->decoded;

        $query = LeaveRequest::query()
            ->where('organization_id', $user['organization']['id']);

        if (! in_array($user['position']['name'], ['HR', 'Direktur'])) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user['id'])
                // ->orWhereHas('user', function ($subQuery) use ($user) {
                //     $subQuery->where('report_to_id', $user['id']);
                // })
                ;
            });
        }

        $query = $query
            ->search($request->search)
            ->filter($request->filter)
            ->sort($request->sort)
            ->orderBy('status', 'asc')
            ->orderBy('updated_at', 'desc');

        $count = $query->count('id');

        $data = $query
            ->with(['user', 'leaveType'])
            ->skip(($request->get('page', 1) - 1) * $request->get('size', 10))
            ->limit($request->get('size', 10))
            ->get();

        return [$data, $count];
    }

    /**
     * Calculate period boundaries based on a given date and period type.
     *
     * @param  Carbon|string  $date       Reference date
     * @param  string         $periodType 'year', 'month', 'week', 'quarter', 'half_year'
     * @return array                      ['start' => Carbon, 'end' => Carbon]
     */
    protected function getPeriodBoundaries($date, string $periodType): array
    {
        $date = $date instanceof Carbon ? $date : Carbon::parse($date);

        switch ($periodType) {
            case 'year':
                return [
                    'start' => $date->copy()->startOfYear(),
                    'end'   => $date->copy()->endOfYear(),
                ];
            case 'month':
                return [
                    'start' => $date->copy()->startOfMonth(),
                    'end'   => $date->copy()->endOfMonth(),
                ];
            case 'week':
                return [
                    'start' => $date->copy()->startOfWeek(),
                    'end'   => $date->copy()->endOfWeek(),
                ];
            case 'quarter':
                return [
                    'start' => $date->copy()->startOfQuarter(),
                    'end'   => $date->copy()->endOfQuarter(),
                ];
            case 'half_year':
                // First half: Jan-Jun, second: Jul-Dec
                if ((int) $date->format('n') <= 6) {
                    return [
                        'start' => Carbon::createFromDate($date->year, 1, 1),
                        'end'   => Carbon::createFromDate($date->year, 6, 30),
                    ];
                }
                return [
                    'start' => Carbon::createFromDate($date->year, 7, 1),
                    'end'   => Carbon::createFromDate($date->year, 12, 31),
                ];
            default:
                throw new \InvalidArgumentException("Unsupported period type: $periodType");
        }
    }

    /**
     * Get the number of leave days used by a user for a given leave type between two dates.
     *
     * @param  string       $userId
     * @param  string       $leaveTypeId
     * @param  Carbon       $startDate
     * @param  Carbon       $endDate
     * @return int
     */
    protected function getUsedLeaveDays(string $userId, string $leaveTypeId, Carbon $startDate, Carbon $endDate): int
    {
        // Only count approved leave requests (status 1 is approved)
        return (int) LeaveRequest::where('user_id', $userId)
            ->where('leave_type_id', $leaveTypeId)
            ->where('status', 1)
            ->whereBetween('start_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('days');
    }

    /**
     * Calculate remaining quota given the maximum allowed days and used days.
     *
     * @param  int|null $maxDays   Max allowed days (can be null for unlimited)
     * @param  int      $usedDays
     * @return int|null           Remaining days (null if unlimited)
     */
    protected function calculateRemainingQuota(?int $maxDays, int $usedDays): ?int
    {
        if (is_null($maxDays)) {
            return null;
        }
        $remaining = $maxDays - $usedDays;
        return ($remaining < 0) ? 0 : $remaining;
    }

    /**
     * Get leave quotas for a user across all leave types.
     *
     * Returns an array where each element contains:
     * - leave_type: the leave type model
     * - used_quota: array per period type
     * - remaining_quota: array per period type
     *
     * @param  string  $userId
     * @param  Carbon|string|null $referenceDate Optional, default now
     * @return array
     */
    public function getLeaveQuota(string $userId, $leaveType, $referenceDate = null): array
    {
        if (! $leaveType instanceof LeaveType) {
            $leaveType = LeaveType::find($leaveType);
        }
        $referenceDate  = $referenceDate ? Carbon::parse($referenceDate) : Carbon::now();
        $periodTypes    = ['year', 'month', 'week', 'quarter', 'half_year'];
        $usedQuota      = [];
        $remainingQuota = [];

        foreach ($periodTypes as $period) {
            $boundaries = $this->getPeriodBoundaries($referenceDate, $period);
            $used       = $this->getUsedLeaveDays($userId, $leaveType->id, $boundaries['start'], $boundaries['end']);
            $maxField   = $this->getMaxFieldForPeriod($period);
            $maxAllowed = $leaveType->{$maxField} ?? $leaveType->max_days;

            $usedQuota[$period]      = $used;
            $remainingQuota[$period] = $this->calculateRemainingQuota($maxAllowed, $used);
        }

        return [
            'used_quota'      => $usedQuota,
            'remaining_quota' => $remainingQuota,
        ];
    }

    public function getAllLeaveQuota(string $userId, $referenceDate = null): array
    {
        $leaveTypes = LeaveType::all();
        $result     = [];

        foreach ($leaveTypes as $leaveType) {
            [$usedQuota, $remainingQuota] = $this->getLeaveQuota($userId, $leaveType, $referenceDate);
            $result[]                     = [
                'leave_type'      => $leaveType,
                'used_quota'      => $usedQuota,
                'remaining_quota' => $remainingQuota,
            ];
        }

        return $result;
    }

    /**
     * Validate whether a leave request can be applied.
     *
     * Returns an array with:
     *  - valid: boolean
     *  - message: string|null error message if not valid
     *
     * @param  string       $userId
     * @param  LeaveType    $leaveType
     * @param  string       $startDate
     * @param  string       $endDate
     * @return array
     */
    public function canApplyForLeave(string $userId, LeaveType $leaveType, string $startDate, string $endDate): array
    {
        $requestedDays = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;
        $periodTypes   = ['year', 'month', 'week', 'quarter', 'half_year'];
        $referenceDate = Carbon::parse($startDate);
        $errors        = [];

        foreach ($periodTypes as $period) {
            $boundaries = $this->getPeriodBoundaries($referenceDate, $period);
            $used       = $this->getUsedLeaveDays($userId, $leaveType->id, $boundaries['start'], $boundaries['end']);
            $maxField   = $this->getMaxFieldForPeriod($period);
            $maxAllowed = $leaveType->{$maxField} ?? $leaveType->max_days;

            if (! is_null($maxAllowed) && ($used + $requestedDays) > $maxAllowed) {
                $errors[] = "Exceeds {$period} limit: used {$used}, requested {$requestedDays}, allowed {$maxAllowed}.";
            }
        }

        return [
            'valid'   => empty($errors),
            'message' => empty($errors) ? null : implode(' ', $errors),
        ];
    }

    protected function getMaxFieldForPeriod(string $period): string
    {
        return match ($period) {
            'year' => 'max_days_per_year',
            'month' => 'max_days_per_month',
            'week' => 'max_days_per_week',
            'quarter' => 'max_days_per_quarter',
            'half_year' => 'max_days_per_half_year',
            default => 'max_days',
        };
    }

    public function createLeaveRequest(StoreLeaveRequest $request, int $duration)
    {
        $employee = DB::table('employees')
            ->where('user_id', $request->decoded->get('id'))
            ->first();
        $leaveRequest = LeaveRequest::query()->create([
            'id'              => Str::ulid(),
            'user_id'         => $request->decoded->get('id'),
            'employee_id'     => $employee->id,
            'organization_id' => $request->decoded->get("organization")?->get("id"),
            'leave_type_id'   => $request->leaveType,
            'start_date'      => $request->startDate,
            'end_date'        => $request->endDate,
            'days'            => $duration,
            'status'          => LeaveRequestStatus::Pending,
            'description'     => $request->description,
            'created_at'      => now(),
        ]);

        return $this->showLeaveRequest($leaveRequest->id);
    }

    public function showLeaveRequest(string $id): ?LeaveRequest
    {
        return LeaveRequest::query()->where("id", $id)->first();
    }

    public function calculateWorkingDays(string $startDate, string $endDate): int
    {
        $start = Carbon::parse($startDate);
        $end   = Carbon::parse($endDate);

        $workingDays = 0;
        $current     = $start->copy();

        while ($current->lte($end)) {
            if (! $current->isWeekend()) {
                $workingDays++;
            }
            $current->addDay();
        }

        return $workingDays;
    }

    public function validateWorkingDays(Validator $validator, string $startDate, string $endDate): void
    {
        $workingDays = $this->calculateWorkingDays($startDate, $endDate);

        if ($workingDays > 30) {
            $validator->errors()->add('endDate', 'The leave period cannot exceed 30 working days.');
        }
    }

    public function approveLeaveRequest(LeaveRequest $leaveRequest, string $approverId)
    {
        return DB::transaction(function () use ($leaveRequest, $approverId) {
            $leaveRequest->update([
                'status'       => LeaveRequestStatus::Approved,
                'responded_by' => $approverId,
                'responded_at' => Carbon::now(),
                'updated_at'   => Carbon::now(),
            ]);

            return $leaveRequest;
        });
    }

    public function rejectLeaveRequest(LeaveRequest $leaveRequest, string $approverId)
    {
        return DB::transaction(function () use ($leaveRequest, $approverId) {
            $leaveRequest->update([
                'status'       => LeaveRequestStatus::Rejected,
                'responded_by' => $approverId,
                'responded_at' => Carbon::now(),
                'updated_at'   => Carbon::now(),
            ]);

            return $leaveRequest;
        });
    }

    public function hasPermissionToActOnLeaveRequest(LeaveRequest $leaveRequest, User $user)
    {
        $validPositions   = ['HR', 'CEO'];
        $approverPosition = $user ? $user->position : null;

        // Log::debug('Leave Acceptance Permission check',
        //     [
        //         $approverPosition,
        //         $leaveRequest->user_id,
        //         $user->id, $validPositions, in_array($approverPosition, $validPositions),
        //     ]);

        if (in_array($approverPosition->name, $validPositions)) {
            return true;
        }

        if ($user->id === User::find($leaveRequest->user_id)->report_to_id) {
            return true;
        }

        return false;
    }
}
