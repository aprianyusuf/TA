<?php
namespace App\Service\Payroll;

use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PayrollService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getData(Request $request)
    {
        $auth  = $request->decoded;
        $query = DB::table('payrolls as p')
            ->join('employees as e', 'e.id', '=', 'p.employee_id')
            ->join('users as u', 'u.id', '=', 'e.user_id')
            ->join('payroll_periods as pp', function (JoinClause $join) {
                $join->on('pp.id', '=', 'p.payroll_period_id')
                    ->join('organizations as o', 'o.id','=', 'pp.organization_id');
            })
            ->when($request->get('period_id'), function ($query) use ($request) {
                $query->where('p.payroll_period_id', $request->get('period_id'));
            })
            ->when($request->get('employee_id'), function ($query) use ($request) {
                $query->where('e.id', $request->get('employee_id'));
            })
            ->select([
                'p.id',
                'p.salary',
                'p.created_at',
                'p.updated_at',
                'u.first_name as first_name',
                'u.last_name as last_name',
                'u.email as email',
                'o.name as organization_name',
                'o.id as organization_id',
                'e.id as employee_id',
                'e.salary as salary',
            ]);
        $count = $query->count('p.id');
        $data  = $query->get();

        return [$data, $count];
    }

    public function getPayrollPeriodQuery($organizationId)
    {
        return DB::table('payroll_periods')
            ->where('organization_id', $organizationId)
            ->orderBy('start_at', 'desc');
    }

    public function getCurrentPayrollPeriod($organizationId)
    {
        return $this->getPayrollPeriodQuery($organizationId)
            ->where('start_at', '<=', now())
            ->where('end_at', '>=', now())
            ->first();
    }

    public function getPayrollPeriods($organizationId)
    {
        return $this->getPayrollPeriodQuery($organizationId)->get();
    }

    public function createNewPayrollPeriod($organizationId)
    {
        $currentDate  = now();
        $startOfMonth = $currentDate->copy()->startOfMonth();
        $endOfMonth   = $currentDate->copy()->endOfMonth();
        $id           = Str::ulid();

        if (DB::table('payroll_periods')->insert([
            'id'              => $id,
            'organization_id' => $organizationId,
            'year'            => $currentDate->year,
            'month'           => $currentDate->month,
            'start_at'        => $startOfMonth,
            'end_at'          => $endOfMonth,
            'payroll_at'      => now()->addWeek(),
        ])) {
            return $id;
        }
        return null;
    }

    public function generatePayrolls($organizationId, Request $request)
    {
        $payrollPeriod = $this->getCurrentPayrollPeriod($organizationId);
        if (! $payrollPeriod) {
            $payrollPeriodId = $this->createNewPayrollPeriod($organizationId);
            $payrollPeriod   = DB::table('payroll_periods')
                ->where('id', $payrollPeriodId)
                ->first();
        }

        // Fetch employees who do NOT have payrolls assigned in the current payroll period
        $employees = DB::table('employees as e')
            ->join('users as u', function( JoinClause $join){
                $join->on('u.id', '=', 'e.user_id')
                    ->where('u.organization_id', '=', 'o.id');
            })
            ->leftJoin('payrolls as p', function ($join) use ($payrollPeriod) {
                $join->on('p.employee_id', '=', 'e.id')
                    ->where('p.payroll_period_id', '=', $payrollPeriod->id);
            })
            ->where('o.id', $organizationId)
            ->whereNull('p.id') // Ensures only employees who DON'T have payrolls
            ->select([
                'e.id as employee_id',
                'e.salary',
            ])
            ->get();

        // Insert payrolls for employees who haven't received any for this period
        foreach ($employees as $employee) {
            $id = Str::ulid();
            if (DB::table('payrolls')->insert([
                'id'                => $id,
                'employee_id'       => $employee->employee_id,
                'payroll_period_id' => $payrollPeriod->id,
                'salary'            => $employee->salary,
            ])) {
                $payroll = DB::table('payrolls')
                    ->where('id', $id)
                    ->first();
            }
        }
    }
}
