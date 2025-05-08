<?php
namespace Database\Seeders;

use App\Models\LeaveType;
use App\Service\Leave\LeaveRequestService;
use App\Utils\Enums\LeaveRequestStatus;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LeaveRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prepare an array for the past 12 months
        $pastYearMonths = [];
        for ($i = 11; $i >= 0; $i--) {
            $monthDate        = Carbon::today()->startOfMonth()->subMonth($i + 3);
            $pastYearMonths[] = [
                'month' => $monthDate->shortMonthName, // e.g. "Jan"
                'year'  => $monthDate->year,
                'start' => $monthDate->copy()->startOfMonth(),
                'end'   => $monthDate->copy()->endOfMonth(),
            ];
        }

        $employees = DB::table('employees as e')
            ->join('users as u', 'u.id', '=', 'e.user_id')
            ->join('organizations as o', 'u.organization_id', '=', 'o.id')
            ->whereNotNull('u.organization_id')
            ->where('o.domain', '=', 'mitrasaburaiproperti.com')
            ->select([
                'e.id as id',
                'o.id as organization_id',
                'u.id as user_id',
                'u.first_name as first_name',
                'u.last_name as last_name',
                'o.domain as organization_domain',
            ])
            ->get();
        // Initialize the leave request service
        $leaveService = new LeaveRequestService();

        // Loop through each employee to generate leave requests
        foreach ($employees as $employee) {
            $this->createLeaveRequest($employee, $pastYearMonths, $leaveService);
        }
    }

    public function createLeaveRequest($employee, $pastYearMonths, LeaveRequestService $leaveService)
    {
        // Retrieve leave types applicable to the employee's organization
        $leaveTypes = LeaveType::where('organization_id', $employee->organization_id)->get();

        // Loop over each past month
        foreach ($pastYearMonths as $monthData) {
            $monthStart = $monthData['start'];
            $monthEnd   = $monthData['end'];

            // For each leave type, randomly generate 0 to 2 requests for that month
            foreach ($leaveTypes as $leaveType) {
                $numRequests = rand(0, 2);
                for ($i = 0; $i < $numRequests; $i++) {
                    // Pick a random day in the month as start date
                    $randomTimestamp = rand($monthStart->timestamp, $monthEnd->timestamp);
                    $randomStart     = Carbon::createFromTimestamp($randomTimestamp)->toDateString();

                    // Determine potential maximums:
                    // Use max_days_per_month if available, otherwise fallback to max_days.
                    // Also consider the general max_days as an overall ceiling.
                    $maxForMonth  = $leaveType->max_days_per_month ?? $leaveType->max_days;
                    $maxOverall   = $leaveType->max_days ?? 3;
                    $maxCandidate = $maxForMonth ? min($maxForMonth, $maxOverall) : $maxOverall;

                    // Choose an initial random duration between 1 and maxCandidate
                    $duration          = rand(1, $maxCandidate);
                    $validatedDuration = 0;

                    // Try reducing the duration if the request is not valid.
                    // We check from the randomly chosen duration down to 1.
                    for ($d = $duration; $d >= 1; $d--) {
                        $randomEnd  = Carbon::parse($randomStart)->addDays($d - 1)->toDateString();
                        $validation = $leaveService->canApplyForLeave($employee->user_id, $leaveType, $randomStart, $randomEnd);
                        if ($validation['valid']) {
                            $validatedDuration = $d;
                            break;
                        }
                    }

                    // If we found a valid duration, then insert the leave request.
                    if ($validatedDuration > 0) {
                        $finalEnd = Carbon::parse($randomStart)->addDays($validatedDuration - 1)->toDateString();
                        DB::table('leave_requests')->insert([
                            'id'              => Str::ulid(),
                            'employee_id'     => $employee->id,
                            'user_id'         => $employee->user_id,
                            'organization_id' => $employee->organization_id,
                            'leave_type_id'   => $leaveType->id,
                            'start_date'      => $randomStart,
                            'end_date'        => $finalEnd,
                            'days'            => $validatedDuration,
                            'status'          => LeaveRequestStatus::Approved,
                            'description'     => 'Seeded leave request',
                            'created_at'      => Carbon::now(),
                            'updated_at'      => Carbon::now(),
                        ]);
                    }
                }
            }
        }
    }
}
