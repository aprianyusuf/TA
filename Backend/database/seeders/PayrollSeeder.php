<?php
namespace Database\Seeders;

use App\Service\Payroll\PayrollPeriodService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PayrollSeeder extends Seeder
{
    public function run(): void
    {
        $organization         = DB::query()->from('organizations')->where('domain', 'mitrasaburaiproperti.com')->select()->first();
        $payrollPeriodService = new PayrollPeriodService();
        $payrollPeriod        = DB::table('payroll_periods')
            ->where('organization_id', $organization->id)
            ->get();
        foreach ($payrollPeriod as $period) {
            // Log::debug('Payroll Seeder: ' . $period->id,
            //     [
            //         'period_id'       => $period->id,
            //         'organization_id' => $organization->id,
            //     ]);
            $payrollPeriodService->generatePayrolls($organization->id, $period->id);
        }
    }
}
