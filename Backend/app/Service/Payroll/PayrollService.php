<?php
namespace App\Service\Payroll;

use App\Utils\Enums\PayrollBonusTypeEnum;
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

    public function getData(Request $request, string $payrollPeriodId = null, string $payrollId = null)
    {
        $auth = $request->decoded;

        $query = DB::table('payrolls as p')
            ->join('employees as e', 'e.id', '=', 'p.employee_id')
            ->join('users as u', 'u.id', '=', 'e.user_id')
            ->join('payroll_periods as pp', function (JoinClause $join) {
                $join->on('pp.id', '=', 'p.payroll_period_id')
                    ->join('organizations as o', 'o.id', '=', 'pp.organization_id');
            })
            ->when(!is_null($payrollPeriodId), function ($query) use ($payrollPeriodId) {
                $query->where('p.payroll_period_id', $payrollPeriodId);
            })
            ->when(!is_null($payrollId), function ($query) use ($payrollId) {
                $query->where('p.id', $payrollId);
            })
            ->when($request->get('employee_id'), function ($query) use ($request) {
                $query->where('e.id', $request->get('employee_id'));
            })
            ->select([
                'p.id',
                'p.salary',
                'p.created_at',
                'p.updated_at',
                'p.status',
                'p.bonus',
                'p.deduction',
                'p.net_pay',
                'p.currency',
                'p.payroll_period_id',
                'u.first_name',
                'u.last_name',
                'u.email',
                'o.name as organization_name',
                'o.id as organization_id',
                'e.id as employee_id',
                'e.salary as salary',
            ]);

        $count = $query->count('p.id');

        $data = $query
            ->skip(($request->get('page', 1) - 1) * $request->get('size', 10))
            ->limit($request->get('size', 10))
            ->get()
            ->map(function ($payroll) {
                $bonusQuery = DB::table('payroll_bonuses as pb')
                    ->join('payroll_bonus_types as pbt', 'pbt.id', '=', 'pb.payroll_bonus_type_id')
                    ->where('pb.payroll_id', $payroll->id);

                $payroll->bonuses = (clone $bonusQuery)
                    ->where('pbt.type', PayrollBonusTypeEnum::Bonus->value)
                    ->select(['pb.id', 'pb.value', 'pbt.name as type'])
                    ->get();

                $payroll->bonus_value = (clone $bonusQuery)
                    ->where('pbt.type', PayrollBonusTypeEnum::Bonus->value)
                    ->sum('pb.value');

                $payroll->deductions = (clone $bonusQuery)
                    ->where('pbt.type', PayrollBonusTypeEnum::Deduction->value)
                    ->select(['pb.id', 'pb.value', 'pbt.name as type'])
                    ->get();

                $payroll->deduction_value = (clone $bonusQuery)
                    ->where('pbt.type', PayrollBonusTypeEnum::Deduction->value)
                    ->sum('pb.value');

                $payroll->net_pay = $payroll->salary + $payroll->bonus_value - $payroll->deduction_value;

                return $payroll;
            });

        return [$data, $count];
    }

    public function getPayrollsByPeriod(Request $request)
    {
        $auth  = $request->decoded;
        $query = DB::table('payroll_periods as pp')
            ->join('payrolls as p', function (JoinClause $join) {
                $join->on('pp.id', '=', 'p.payroll_period_id')
                    ->join('employees as e', function (JoinClause $join) {
                        $join->on('e.id', '=', 'p.employee_id')
                            ->join('users as u', 'u.id', '=', 'e.user_id');
                    });
            })
            ->join('organizations as o', 'o.id', '=', 'pp.organization_id')
            ->where('pp.id', $request->get('period_id'))
            ->select([
                'p.id',
                'p.salary',
                'p.created_at',
                'p.updated_at',
                'p.status',
                'p.bonus',
                'p.deduction',
                'p.net_pay',
                'p.currency',
                'pp.start_at as period_start_at',
                'pp.end_at as period_end_at',
            ]);
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
            ->join('users as u', function (JoinClause $join) {
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
