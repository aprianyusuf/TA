<?php

namespace Database\Seeders;

use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class PayrollBonusTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $organizationId = DB::table('organizations')->where('domain', 'mitrasaburaiproperti.com')->first()->id;
        $payrollBonusTypes = [
            [
                'id' => Str::ulid(),
                'organization_id' => $organizationId,
                'name' => 'JHT',
                'description' => 'Jaminan Hari Tua',
                'percentage' => 3.7,
                'value_fixed' => false,
                'value' => null,
                'is_paid_by_organization' => true,
                'currency' => 'IDR',
                'type' => 1,
            ],
            [
                'id' => Str::ulid(),
                'organization_id' => $organizationId,
                'name' => 'JKK',
                'description' => 'Jaminan Kecelakaan Kerja',
                'percentage' => 0.24,
                'value_fixed' => false,
                'value' => null,
                'is_paid_by_organization' => true,
                'currency' => 'IDR',
                'type' => 1,
            ],
            [
                'id' => Str::ulid(),
                'organization_id' => $organizationId,
                'name' => 'JKM',
                'description' => 'Jaminan Kematian',
                'percentage' => 0.3,
                'value_fixed' => false,
                'value' => null,
                'is_paid_by_organization' => true,
                'currency' => 'IDR',
                'type' => 1,
            ],
            [
                'id' => Str::ulid(),
                'organization_id' => $organizationId,
                'name' => 'JP',
                'description' => 'Jaminan Pensiun',
                'percentage' => 2,
                'value_fixed' => false,
                'value' => null,
                'is_paid_by_organization' => true,
                'currency' => 'IDR',
                'type' => 1,
            ],
            [
                'id' => Str::ulid(),
                'organization_id' => $organizationId,
                'name' => 'KS',
                'description' => 'Kesehatan (BPJS Kesehatan)',
                'percentage' => 2,
                'value_fixed' => false,
                'value' => null,
                'is_paid_by_organization' => true,
                'currency' => 'IDR',
                'type' => 1,
            ],
        ];

        foreach ($payrollBonusTypes as $bonusType) {
            DB::table('payroll_bonus_types')->insert($bonusType);
        }
    }
}
