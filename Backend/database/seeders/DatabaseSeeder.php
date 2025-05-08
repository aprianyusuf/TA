<?php
namespace Database\Seeders;

use App\Models\Foundation\Organization;
use App\Models\Foundation\Permission;
use App\Models\User;
use Database\Seeders\ProjectManagement\ProjectSeeder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    protected $baseSalary = 5000000;
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (app()->isLocal()) {
            $this->call([
                PermissionSeeder::class,
            ]);

            $rdtOrganization = Organization::query()
                ->create([
                    'name'                        => 'Mitra Saburai Properti',
                    'domain'                      => 'mitrasaburaiproperti.com',
                    'address'                     => '',
                    'cut_off_timesheet_start_day' => 28,
                    'cut_off_timesheet_end_day'   => 27,
                    'timezone'                    => 'Asia/Jakarta',
                    'timezone_offset'             => 7,
                ]);

            $permissions = DB::table('permissions')->get()->transform(fn($v) => [
                'permission_id'   => $v->id,
                'organization_id' => $rdtOrganization->id,
            ]);
            DB::table('organization_permission')
                ->insert($permissions->toArray());

            $position = [
                ['id' => Str::ulid(), 'name' => 'Direktur', 'organization_id' => $rdtOrganization->id, 'position_id' => null],
                ['id' => Str::ulid(), 'name' => 'General Manager', 'organization_id' => $rdtOrganization->id, 'position_id' => 'Direktur'],
                ['id' => Str::ulid(), 'name' => 'HR', 'organization_id' => $rdtOrganization->id, 'position_id' => 'Direktur'],
                ['id' => Str::ulid(), 'name' => 'Manager Area', 'organization_id' => $rdtOrganization->id, 'position_id' => 'General Manager'],
                ['id' => Str::ulid(), 'name' => 'Manager Umum', 'organization_id' => $rdtOrganization->id, 'position_id' => 'General Manager'],
                ['id' => Str::ulid(), 'name' => 'Manager Marketing', 'organization_id' => $rdtOrganization->id, 'position_id' => 'General Manager'],
                ['id' => Str::ulid(), 'name' => 'Manager Keuangan', 'organization_id' => $rdtOrganization->id, 'position_id' => 'General Manager'],
                ['id' => Str::ulid(), 'name' => 'Staff Pemberkasan', 'organization_id' => $rdtOrganization->id, 'position_id' => 'Manager Umum'],
                ['id' => Str::ulid(), 'name' => 'Staff Perlengkapan', 'organization_id' => $rdtOrganization->id, 'position_id' => 'Manager Umum'],
                ['id' => Str::ulid(), 'name' => 'Staff Marketing', 'organization_id' => $rdtOrganization->id, 'position_id' => 'Manager Marketing'],
                ['id' => Str::ulid(), 'name' => 'Staff Keuangan', 'organization_id' => $rdtOrganization->id, 'position_id' => 'Manager Keuangan'],
                // ['id' => Str::ulid(), 'name' => 'CEO', 'organization_id' => $rdtOrganization->id, 'position_id' => null],
                // ['id' => Str::ulid(), 'name' => 'CTO', 'organization_id' => $rdtOrganization->id, 'position_id' => 'CEO'],
                // ['id' => Str::ulid(), 'name' => 'COO', 'organization_id' => $rdtOrganization->id, 'position_id' => 'CEO'],
                // ['id' => Str::ulid(), 'name' => 'HR', 'organization_id' => $rdtOrganization->id, 'position_id' => 'COO'],
                // ['id' => Str::ulid(), 'name' => 'Project Manager', 'organization_id' => $rdtOrganization->id, 'position_id' => 'CEO'],
                // ['id' => Str::ulid(), 'name' => 'Lead Software Engineer', 'organization_id' => $rdtOrganization->id, 'position_id' => 'CTO'],
                // ['id' => Str::ulid(), 'name' => 'Software Engineer', 'organization_id' => $rdtOrganization->id, 'position_id' => 'Lead Software Engineer'],
                // ['id' => Str::ulid(), 'name' => 'Business Development', 'organization_id' => $rdtOrganization->id, 'position_id' => 'Business Development'],
            ];

            foreach ($position as $p) {
                DB::table('positions')->insert(collect($p)->only('id', 'name', 'organization_id')->toArray());
            }

            $pos = DB::table('positions')->get();

            foreach ($position as $v) {
                DB::table('positions')
                    ->where('name', $v['name'])
                    ->update([
                        'position_id' => $pos->where('name', $v['position_id'])->first()?->id,
                    ]);
            }

            $users = [
                [
                    'first_name' => 'Zainal',
                    'last_name' => 'Arifin',
                    'position_id' => 'Direktur',
                    'report_to_id' => null,
                    'subordinates' => [
                        ['first_name' => 'Kris', 'last_name' => 'Susanto', 'position_id' => 'General Manager'],
                        ['first_name' => 'Aldo', 'last_name' => 'Moro', 'position_id' => 'HR']
                    ]
                ],
                [
                    'first_name' => 'Ahmad',
                    'last_name' => 'Sueb',
                    'position_id' => 'Manager Area',
                    'report_to_id' => 'Kris',
                    'subordinates'=>[]
                ],
                [
                    'first_name' => 'Andre Hartono',
                    'last_name' => 'Nugroho',
                    'position_id' => 'Manager Umum',
                    'report_to_id' => 'Kris',
                    'subordinates' => [
                        ['first_name' => 'Staff', 'last_name' => 'Permberkasan', 'position_id' => 'Staff Pemberkasan'],
                        ['first_name' => 'Staff', 'last_name' => 'Perlengkapan', 'position_id' => 'Staff Perlengkapan'],
                    ]
                ],
                [
                    'first_name' => 'Aldilla Dea',
                    'last_name' => 'Ananda',
                    'position_id' => 'Manager Marketing',
                    'report_to_id' => 'Kris',
                    'subordinates' => [
                        ['first_name' => 'Staff', 'last_name' => 'Marketing', 'position_id' => 'Staff Marketing'],
                    ]
                ],
                [
                    'first_name' => 'Noni',
                    'last_name' => 'Aprilia',
                    'position_id' => 'Manager Keuangan',
                    'report_to_id' => 'Kris',
                    'subordinates' => [
                        ['first_name' => 'Staff', 'last_name' => 'Keuangan', 'position_id' => 'Staff Keuangan'],
                    ]
                ],
            ];
            // $users = [
            //     [
            //         'first_name' => 'Deo',
            //         'last_name' => 'Alif',
            //         'position_id' => 'CEO',
            //         'report_to_id' => null,
            //         'subordinates' => [
            //             ['first_name' => 'Nur Muhammad', 'last_name' => 'Husein', 'position_id' => 'Project Manager']
            //         ]
            //     ],
            //     [
            //         'first_name' => 'Muhammad',
            //         'last_name' => 'Ikhbal',
            //         'position_id' => 'CTO',
            //         'report_to_id' => 'Deo',
            //         'subordinates' => [
            //             [
            //                 'first_name' => 'Ackyra',
            //                 'last_name' => 'Sibarani',
            //                 'position_id' => 'Lead Software Engineer',
            //                 'subordinates' => [
            //                     ['first_name' => 'Markus', 'last_name' => 'Togi', 'position_id' => 'Software Engineer']
            //                 ]
            //             ],
            //         ]
            //     ],
            //     [
            //         'first_name' => 'Abi',
            //         'last_name' => 'Rohmat',
            //         'position_id' => 'COO',
            //         'report_to_id' => 'Deo',
            //         'subordinates' => [
            //             ['first_name' => 'Chaswanah', 'last_name' => 'Aini', 'position_id' => 'Business Development'],
            //             ['first_name' => 'Aprian', 'last_name' => 'Yusuf', 'position_id' => 'HR']
            //         ]
            //     ],
            // ];

            $permissions = Permission::get();

            $i = 0;

            foreach ($users as $key => $user) {
                $newUser = User::create(collect($user)->only(['first_name', 'last_name'])->toArray() + [
                    'email'                 => formatNameToInitials($user['first_name'], $user['last_name']) . '@mitrasaburaiproperti.com',
                    'password'              => Hash::make('password'),
                    'organization_id'       => $rdtOrganization->id,
                    'is_admin_organization' => true,
                    'position_id'           => $pos->where('name', $user['position_id'])->first()->id,
                    'report_to_id'          => DB::table('users')->where('first_name', $user['report_to_id'])->first()?->id,
                ]);

                $i++;
                DB::table('employees')
                    ->insert([
                        'id'          => Str::ulid(),
                        'user_id'     => $newUser->id,
                        'employee_id' => 'RDT/202406' . str($i)->padLeft(3, '0'),
                        'salary'      => $this->baseSalary,
                    ]);

                DB::table('permission_position')
                    ->insert($permissions
                        ->map(function ($val) use ($newUser) {
                            return [
                                // 'id'    => Str::ulid(),
                                'permission_id' => $val->id,
                                'position_id' => $newUser->position_id
                            ];
                        })->toArray());

                $this->recursiveCreateSubordinate($user, $rdtOrganization->id, $permissions, $newUser->id, $i, $pos);
            }

            $this->call([
                OrganizationSeeder::class,
                ProjectSeeder::class,
                LeaveTypeSeeder::class,
                LeaveRequestSeeder::class,
                PayrollPeriodSeeder::class,
                PayrollBonusTypeSeeder::class,
                PayrollSeeder::class,
            ]);
        }
    }

    protected function recursiveCreateSubordinate($user, $orgId, $permissions, $superior, &$i, $pos): void
    {
        Log::info('Recursive Create Subordinates',
        [
            $user,
            $orgId,
            $permissions
        ]);
        foreach ($user['subordinates'] as $sub) {
            $subOrdinate = User::create(collect($sub)->only(['first_name', 'last_name'])->toArray() + [
                'email'                 => formatNameToInitials($sub['first_name'], $sub['last_name']) . '@mitrasaburaiproperti.com',
                'password'              => Hash::make('password'),
                'organization_id'       => $orgId,
                'is_admin_organization' => true,
                'position_id'           => $pos->where('name', $sub['position_id'])->first()->id,
                'report_to_id'          => $superior,
            ]);

            $i++;
            DB::table('employees')
                ->insert([
                    'id'          => Str::ulid(),
                    'user_id'     => $subOrdinate->id,
                    'employee_id' => 'RDT/202406' . str($i)->padLeft(3, '0'),
                    'salary'      => $this->baseSalary,
                ]);

            DB::table('permission_position')
                ->insert($permissions
                        ->map(function ($val) use ($subOrdinate) {
                            return [
                                'permission_id' => $val->id,
                                'position_id'   => $subOrdinate->position_id,
                            ];
                        })->toArray());

            if (array_key_exists('subordinates', $sub)) {
                $this->recursiveCreateSubordinate($sub, $orgId, $permissions, $subOrdinate->id, $i, $pos);
            }
        }
    }
}
