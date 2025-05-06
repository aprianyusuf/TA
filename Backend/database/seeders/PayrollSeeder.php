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
            // ->join('leave_requests as lr', 'lr.employee_id', '=', 'employees.id')
            ->where('users.organization_id', $organization->id)
            ->select('employees.*', 'users.organization_id')
            ->get()->map(function($employee){
                $employee->leave_requests = DB::table('leave_requests')
                    ->where('employee_id', $employee->id)
                    ->where('status', 1)
                    ->get();
                return $employee;
            });

        $payrollService = new PayrollService();
        $payrollPeriods = $payrollService->getPayrollPeriods($organization->id);

        foreach ($payrollPeriods as $payrollPeriod) {
            foreach ($employees as $employee) {
                $payroll = [
                    'id'                => Str::ulid(),
                    'employee_id'       => $employee->id,
                    'payroll_period_id' => $payrollPeriod->id,
                    'salary'            => $employee->salary,
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ];
                DB::table('payrolls')->insert($payroll);
            }
        }
    }
}
