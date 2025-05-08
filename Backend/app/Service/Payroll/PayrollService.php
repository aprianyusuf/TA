<?php

namespace App\Service\Payroll;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Utils\Enums\PayrollBonusTypeEnum;
use Illuminate\Database\Query\JoinClause;

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
            ->when(! is_null($payrollPeriodId), function ($query) use ($payrollPeriodId) {
                $query->where('p.payroll_period_id', $payrollPeriodId);
            })
            ->when(! is_null($payrollId), function ($query) use ($payrollId) {
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
                    ->where('pb.type', PayrollBonusTypeEnum::Bonus->value)
                    ->select(['pbt.id', 'pb.value', 'pbt.name'])
                    ->get();

                $payroll->bonus_value = (clone $bonusQuery)
                    ->where('pb.type', PayrollBonusTypeEnum::Bonus->value)
                    ->sum('pb.value');

                $payroll->deductions = (clone $bonusQuery)
                    ->where('pb.type', PayrollBonusTypeEnum::Deduction->value)
                    ->select(['pbt.id', 'pb.value', 'pbt.name'])
                    ->get();

                $payroll->deduction_value = (clone $bonusQuery)
                    ->where('pb.type', PayrollBonusTypeEnum::Deduction->value)
                    ->sum('pb.value');

                $payroll->net_pay = $payroll->salary + $payroll->bonus_value - $payroll->deduction_value;

                return $payroll;
            });
        Log::debug('PayrollService::getData', [
            'query'    => $query->toSql(),
            'bindings' => $query->getBindings(),
            'data'    => $data,
        ]);

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

    public function update(Request $request, string $payrollId)
    {
        DB::table('payrolls')
            ->where('id', $payrollId)
            ->update([
                // 'status'     => $request->get('status'),
                'updated_at' => now(),
            ]);

        DB::table('payroll_bonuses')
            ->where('payroll_id', $payrollId)
            ->delete();

        foreach ($request->get('bonuses') as $bonus) {
            DB::table('payroll_bonuses')->insert([
                'id'                    => Str::ulid(),
                'value'                 => $bonus['value'],
                'type'                  => PayrollBonusTypeEnum::Bonus->value,
                'payroll_bonus_type_id' => $bonus['id'],
                'payroll_id'            => $payrollId,
                'created_at'            => now(),
                'updated_at'            => now(),
            ]);
        }

        foreach ($request->get('deductions') as $deduction) {
            DB::table('payroll_bonuses')->insert([
                'id'                    => Str::ulid(),
                'value'                 => $deduction['value'],
                'type'                  => PayrollBonusTypeEnum::Deduction->value,
                'payroll_bonus_type_id' => $deduction['id'],
                'payroll_id'            => $payrollId,
                'created_at'            => now(),
                'updated_at'            => now(),
            ]);
        }
    }
}
