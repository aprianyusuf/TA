<?php
namespace Database\Seeders;

use App\Models\LeaveType;
use App\Models\User;
use App\Service\Leave\LeaveRequestService;
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
            $monthDate        = Carbon::today()->startOfMonth()->subMonth($i);
            $pastYearMonths[] = [
                'month' => $monthDate->shortMonthName, // e.g. "Jan"
                'year'  => $monthDate->year,
                'start' => $monthDate->copy()->startOfMonth(),
                'end'   => $monthDate->copy()->endOfMonth(),
            ];
        }

        // Get all users (assuming the User model exists)
        $users = User::query()->with('organization')->get();

        // Initialize the leave request service
        $leaveService = new LeaveRequestService();

        // Loop through each user to generate leave requests
        foreach ($users as $user) {
            if ($user->organization->domain == 'mitrasaburaiproperti.com' ) {
                $this->createLeaveRequest($user, $pastYearMonths, $leaveService);
            }
        }
    }

    public function createLeaveRequest(User $user, $pastYearMonths, LeaveRequestService $leaveService)
    {
        // Retrieve leave types applicable to the user's organization
        $leaveTypes = LeaveType::where('organization_id', $user->organization_id)->get();

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
                        $validation = $leaveService->canApplyForLeave($user->id, $leaveType, $randomStart, $randomEnd);
                        if ($validation['valid']) {
                            $validatedDuration = $d;
                            break;
                        }
                    }

                    // If we found a valid duration, then insert the leave request.
                    if ($validatedDuration > 0) {
                        $finalEnd = Carbon::parse($randomStart)->addDays($validatedDuration - 1)->toDateString();
                        DB::table('leave_requests')->insert([
                            'id'            => Str::ulid(),
                            'user_id'       => $user->id,
                            'organization_id' => $user->organization_id,
                            'leave_type_id' => $leaveType->id,
                            'start_date'    => $randomStart,
                            'end_date'      => $finalEnd,
                            'days'          => $validatedDuration,
                            'status'        => 1, // Approved
                            'description'   => 'Seeded leave request',
                            'created_at'    => Carbon::now(),
                            'updated_at'    => Carbon::now(),
                        ]);
                    }
                }
            }
        }
    }
}
