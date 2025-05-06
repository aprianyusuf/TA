<?php
namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PayrollPeriodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $organization   = DB::query()->from('organizations')->where('domain', 'mitrasaburaiproperti.com')->select()->first();
        $users          = DB::query()->from('users')->where('organization_id', $organization->id)->select()->get();
        $pastYearMonths = [];
        for ($i = 11; $i >= 0; $i--) {
            $monthDate        = Carbon::today()->startOfMonth()->subMonth($i);
            $pastYearMonths[] = [
                'month' => $monthDate->month, // e.g. "Jan"
                'year'  => $monthDate->year,
                'start' => $monthDate->copy()->startOfMonth(),
                'end'   => $monthDate->copy()->endOfMonth(),
            ];
        }
        foreach ($pastYearMonths as $pastYearMonth) {
            $payrollPeriod = [
                'id'              => Str::ulid(),
                'organization_id' => $organization->id,
                'year'            => $pastYearMonth['year'],
                'month'           => $pastYearMonth['month'],
                'start_at'        => $pastYearMonth['start'],
                'end_at'          => $pastYearMonth['end'],
                'payroll_at'      => now(),
            ];
            DB::table('payroll_periods')->insert($payrollPeriod);
        }
    }
}
