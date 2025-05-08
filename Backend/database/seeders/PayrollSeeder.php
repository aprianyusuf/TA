<?php
namespace Database\Seeders;

use App\Service\Payroll\PayrollPeriodService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PayrollSeeder extends Seeder
{
    public function run(): void
    {
        $organization = DB::table('organizations')
            ->where('domain', 'mitrasaburaiproperti.com')
            ->first();
        $payrollPeriodService = new PayrollPeriodService();
        $payrollPeriod        = DB::table('payroll_periods')
            ->where('organization_id', $organization->id)
            ->get();
        foreach ($payrollPeriod as $period) {
            $payrollPeriodService->generatePayrolls($organization->id, $period->id);
        }
    }
}
