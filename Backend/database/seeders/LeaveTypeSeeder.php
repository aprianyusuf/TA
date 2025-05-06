<?php
namespace Database\Seeders;

use App\Models\Foundation\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LeaveTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $organizations = Organization::all();
        $leaveTypes    = [
            [
                'name'                   => 'Annual Leave',
                'description'            => 'Annual leave is a type of leave that allows employees to take time off from work for personal reasons, vacations, or other non-medical purposes.',
                'max_days'               => 30,
                'max_days_per_year'      => 30,
                'max_days_per_month'     => 3,
                'max_days_per_week'      => 1,
                'max_days_per_quarter'   => 7,
                'max_days_per_half_year' => 15,
            ],
            [
                'name'                   => 'Sick Leave',
                'description'            => 'Sick leave is a type of leave that allows employees to take time off from work due to illness or injury.',
                'max_days'               => 15,
                'max_days_per_year'      => 15,
                'max_days_per_month'     => 2,
                'max_days_per_week'      => 1,
                'max_days_per_quarter'   => 4,
                'max_days_per_half_year' => 8,
            ],
            [
                'name'                   => 'Casual Leave',
                'description'            => 'Casual leave is a type of leave that allows employees to take time off from work for personal reasons, emergencies, or other short-term needs.',
                'max_days'               => 10,
                'max_days_per_year'      => 10,
                'max_days_per_month'     => 1,
                'max_days_per_week'      => 1,
                'max_days_per_quarter'   => 3,
                'max_days_per_half_year' => 5,
            ],
            [
                'name'                 => 'Maternity Leave',
                'description'          => 'Casual leave is a type of leave that allows employees to take time off from work for maternity proccess.',
                'max_days'             => 90,
                'max_days_per_year'    => 90,
                'max_days_per_month'   => 30,
                'max_days_per_week'    => 7,
                'max_days_per_quarter' => 30,
            ],
            [
                'name'                 => 'Paternity Leave',
                'description'          => 'Paternity leave is a type of leave that allows employees to take time off from work for paternity proccess.',
                'max_days'             => 15,
                'max_days_per_year'    => 15,
                'max_days_per_month'   => 5,
                'max_days_per_week'    => 1,
                'max_days_per_quarter' => 7,
            ],
            [
                'name'        => 'Bereavement Leave',
                'description' => 'Bereavement leave is a type of leave that allows employees to take time off from work due to the death of a family member or loved one.',
                'max_days'    => 5,
            ],
            [
                'name'              => 'Unpaid Leave',
                'description'       => 'Unpaid leave is a type of leave that allows employees to take time off from work without pay.',
                'max_days'          => null,
                'max_days_per_year' => null,
                'is_paid'           => false,
            ],
        ];
        foreach ($organizations as $organization) {
            foreach ($leaveTypes as $leaveType) {
                $newLeaveType = array_merge($leaveType, [
                    'organization_id' => $organization->id,
                    'id'              => Str::ulid(),
                    'is_paid'         => $leaveType['is_paid'] ?? true,
                ]);
                DB::table('leave_types')->insert($newLeaveType);
            }
        }
    }
}
