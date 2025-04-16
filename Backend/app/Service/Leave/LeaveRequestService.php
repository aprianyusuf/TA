<?php
namespace App\Service\Leave;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

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
        // dd($user['name']);
        $query = LeaveRequest::query()
            ->where('organization_id', $user['organization']['id'])
        ;

        if (! in_array($user['position']['name'], ['HR', 'CEO'])) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user['id'])
                    ->orWhereHas('user', function ($subQuery) use ($user) {
                        $subQuery->where('report_to_id', $user['id']);
                    });
            });
        }

        return $query
            ->search($request->search)
            ->filter($request->filter)
            ->sort($request->sort)
            ->with(['user', 'leaveType'])
            ->skip(($request->get('page', 1) - 1) * $request->get('size', 10))->limit($request->get('size', 10))
            ->get();
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
    public function getLeaveQuota(string $userId, $referenceDate = null): array
    {
        $referenceDate = $referenceDate ? Carbon::parse($referenceDate) : Carbon::now();
        $periodTypes   = ['year', 'month', 'week', 'quarter', 'half_year'];

        // Retrieve all leave types (you may filter by organization if needed)
        $leaveTypes = LeaveType::all();

        $result = [];

        foreach ($leaveTypes as $leaveType) {
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

            $result[] = [
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

}
