<?php
namespace App\Service\Payroll;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Utils\Enums\PayrollStatusEnum;
use Illuminate\Database\Query\JoinClause;

class PayrollPeriodService
{
    protected PayrollService $payrollService;
    /**
     * Create a new class instance.
     */
    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function getData(Request $request, $payrollPeriodId = null)
    {
        $auth = $request->decoded;

        $statusCounts = $this->generateStatusCountExpressions();

        $query = DB::table('payroll_periods as pp')
            ->leftJoin('payrolls as p', fn($join) => $join->on('pp.id', '=', 'p.payroll_period_id'))
            ->leftJoin('employees as e', 'e.id', '=', 'p.employee_id')
            ->where('pp.organization_id', $auth['organization']['id'])
            ->when($payrollPeriodId, fn($q) => $q->where('pp.id', $payrollPeriodId))
            ->groupBy('pp.id', 'pp.start_at', 'pp.end_at', 'pp.payroll_at', 'pp.year', 'pp.month')
            ->select(array_merge([
                'pp.id',
                'pp.start_at as period_start_at',
                'pp.end_at as period_end_at',
                'pp.payroll_at',
                'pp.year',
                'pp.month',
                DB::raw('COUNT(p.id) as payroll_total'),
                DB::raw('SUM(p.net_pay) as total_net_pay'),
            ], $statusCounts));
        $count = $query->count();
        $data  = $query
            ->when(is_null($payrollPeriodId), function ($subQuery) use ($request) {
                $subQuery->skip(($request->get('page', 1) - 1) * $request->get('size', 10))
                    ->limit($request->get('size', 10));
            })
            ->get();
        Log::debug('Payroll Periods', [
            'query' => $query->toSql(),
            'bindings' => $query->getBindings(),
        ]);
        return [$data, $count];
    }

    private function generateStatusCountExpressions(): array
    {
        $expressions = [];

        foreach (PayrollStatusEnum::cases() as $status) {
            $alias         = 'total_' . strtolower($status->name);
            $expressions[] = DB::raw("SUM(CASE WHEN p.status = {$status->value} THEN 1 ELSE 0 END) as {$alias}");
        }

        return $expressions;
    }

    public function store(Request $request)
    {
        $auth = $request->decoded;
        $id   = Str::ulid();

        Log::debug('Payroll Period Store', [
            'request' => $request->all(),
        ]);

        DB::table('payroll_periods')->insert([
            'id'              => $id,
            'organization_id' => $request->decoded['organization']['id'],
            'year'            => $request->year,
            'month'           => $request->month,
            'start_at'        => $request->start_at,
            'end_at'          => $request->end_at,
            'payroll_at'      => $request->payroll_at,
        ]);

        if (! is_null($request->is_generate_payroll) && $request->is_generate_payroll) {
            $this->payrollService->generatePayrolls($auth['organization']['id'], $request, $id);
        }

        return DB::table('payroll_periods')->where('id', $id)->first();
    }

    public function delete($payrollPeriodId)
    {
        return DB::table('payroll_periods')->where('id', $payrollPeriodId)->delete();
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

    public function generatePayrolls($organizationId, Request $request, $payrollPeriodId = null)
    {
        if ($payrollPeriodId) {
            $payrollPeriod = $this->getCurrentPayrollPeriod($organizationId);
            if (! $payrollPeriod) {
                $payrollPeriodId = $this->createNewPayrollPeriod($organizationId);
                $payrollPeriod   = DB::table('payroll_periods')
                    ->where('id', $payrollPeriodId)
                    ->first();
            }
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
