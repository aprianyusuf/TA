<?php
namespace Database\Seeders;

use App\Service\Payroll\PayrollPeriodService;
use App\Utils\Enums\PayrollBonusTypeEnum;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PayrollSeeder extends Seeder
{
    public function run(): void
    {
        $organization = DB::table('organizations')
            ->where('domain', 'mitrasaburaiproperti.com')
            ->first();

        $employees = DB::table('employees')
            ->join('users', 'users.id', '=', 'employees.user_id')
        // ->join('leave_requests as lr', 'lr.employee_id', '=', 'employees.id')
            ->where('users.organization_id', $organization->id)
            ->select('employees.*', 'users.organization_id')
            ->get()->map(function ($employee) {
            $employee->leave_requests = DB::table('leave_requests')
                ->where('employee_id', $employee->id)
                ->where('status', 1)
                ->get();
            return $employee;
        });

        $payrollService    = new PayrollPeriodService();
        $payrollPeriods    = $payrollService->getPayrollPeriods($organization->id);
        $payrollBonusTypes = DB::table('payroll_bonus_types')
            ->where('organization_id', $organization->id)
            ->get();

        foreach ($payrollPeriods as $payrollPeriod) {
            foreach ($employees as $employee) {
                $payrollId = Str::ulid();
                $payroll   = [
                    'id'                => $payrollId,
                    'employee_id'       => $employee->id,
                    'payroll_period_id' => $payrollPeriod->id,
                    'salary'            => $employee->salary,
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ];
                DB::table('payrolls')->insert($payroll);
                $payroll = DB::table('payrolls')->where('id', $payrollId)->first();
                foreach ($payrollBonusTypes as $bonusType) {
                    $totalBonusValue     = 0;
                    $totalDeductionValue = 0;
                    foreach ($payrollBonusTypes as $bonusType) {
                        $bonusvalue = $bonusType->percentage * $employee->salary / 100;
                        DB::table('payroll_bonuses')->insert([
                            'id'                    => Str::ulid(),
                            'payroll_id'            => $payroll->id,
                            'payroll_bonus_type_id' => $bonusType->id,
                            'value'                 => $bonusvalue,
                            'type'                  => PayrollBonusTypeEnum::Bonus->value,
                        ]);
                        $deductionValue = $bonusType->percentage * $employee->salary / 100;
                        DB::table('payroll_bonuses')->insert([
                            'id'                    => Str::ulid(),
                            'payroll_id'            => $payroll->id,
                            'payroll_bonus_type_id' => $bonusType->id,
                            'value'                 => $deductionValue,
                            'type'                  => PayrollBonusTypeEnum::Deduction->value,
                        ]);
                        $totalBonusValue += $bonusvalue;
                        $totalDeductionValue += $deductionValue;
                    }
                    DB::table('payrolls')
                        ->where('id', $payrollId)
                        ->update([
                            'bonus'     => $totalBonusValue,
                            'deduction' => $totalDeductionValue,
                            'net_pay'   => $payroll->salary + $totalBonusValue - $totalDeductionValue,
                        ]);

                }

            }
        }
    }
}
