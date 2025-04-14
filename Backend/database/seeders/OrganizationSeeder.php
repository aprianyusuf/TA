<?php

namespace Database\Seeders;

use App\Models\Foundation\Employee;
use App\Models\Foundation\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 0; $i < 2; $i++) {
            $organizations = Organization::factory()->count(100)
                ->make()
                ->toArray();
            DB::table('organizations')->insert($organizations);

            $organizations = DB::query()->from('organizations')->select(['id', 'domain'])
                ->orderBy('id')
                ->offset(($i * 100) + 1)
                ->limit(100)
                ->get();

            foreach ($organizations as $organization) {
                $organization_permission = DB::table('permissions')
                    ->where('module_id', '<>', 1)
                    ->get()
                    ->transform(fn($v) => [
                        'organization_id' => $organization->id,
                        'permission_id' => $v->id
                    ])
                    ->toArray();

                DB::table('organization_permission')
                    ->insert($organization_permission);

                $position = [
                    ['id' => Str::ulid(), 'name' => 'CEO', 'organization_id' => $organization->id, 'position_id' => null],
                ];

                DB::table('positions')->insert($position);

                $position_id = DB::query()->from('positions')->where('organization_id', $organization->id)->where('name', 'CEO')->first('id')->id;
                $position = [
                    ['id' => Str::ulid(), 'name' => 'CTO', 'organization_id' => $organization->id, 'position_id' => $position_id],
                    ['id' => Str::ulid(), 'name' => 'COO', 'organization_id' => $organization->id, 'position_id' => $position_id],
                ];

                DB::table('positions')->insert($position);

                $positions = DB::table('positions')->select(['id', 'name'])->where('organization_id', $organization->id)->get();

                $permission_position = array();
                foreach ($positions as $key => $value) {
                    $permission_position = array_merge($permission_position, collect($organization_permission)->transform(fn($v) => [
                        'position_id' => $value->id,
                        'permission_id' => $v['permission_id']
                    ])->toArray());
                }

                DB::table('permission_position')
                    ->insert($permission_position);

                foreach ($positions as $key => $value) {
                    User::factory()
                        ->count(1)
                        ->state(function (array $_) use ($organization, $value, $positions, $key) {
                            return [
                                'email' => strtolower($value->name) . '+' . explode('.', $organization->domain)[0] . ".{$organization->id}" . '@' . $organization->domain,
                                'is_admin_organization' => true,
                                'organization_id' => $organization->id,
                                'position_id' => $value->id,
                                'report_to_id' => $key != 0 ? User::query()->where('organization_id', $organization->id)->where('position_id', $positions->first()->id)->first('id')->id : null,
                            ];
                        })
                        ->has(
                            Employee::factory()
                                ->count(1)
                        )
                        ->create();
                }
            }
        }
    }
}
