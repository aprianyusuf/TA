<?php
namespace Database\Seeders;

use App\Service\Payroll\PayrollService;
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
            ->where('users.organization_id', $organization->id)
            ->select('employees.*', 'users.organization_id')
            ->get();

        $payrollService = new PayrollService();
        $payrollPeriods = $payrollService->getPayrollPeriods($organization->id);

        foreach ($payrollPeriods as $payrollPeriod) {
            foreach ($employees as $employee) {
                $payroll = [
                    'id'                => Str::ulid(),
                    'employee_id'       => $employee->id,
                    'payroll_period_id' => $payrollPeriod->id,
                    'organization_id'   => $employee->organization_id,
                    'salary'            => $employee->salary,
                ];
                DB::table('payrolls')->insert($payroll);
            }
        }
    }
}
