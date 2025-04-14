<?php

namespace Database\Seeders;

use App\Middleware\PermissionConstant;
use App\Models\Foundation\Permission;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions =  array_column(PermissionConstant::cases(), 'value');

        $modules = [];
        foreach (collect($permissions)->map(fn($v) => explode("|", $v)[3])->unique()->toArray() as $permission) {
            array_push($modules, [
                'id' => Str::ulid(),
                'name' => join(" ", collect(explode("_", $permission))->transform(fn($v) => Str::ucfirst($v))->toArray()),
                'created_at' => now()
            ]);
        }

        DB::table('modules')->insert($modules);

        $insert = [];
        foreach ($permissions as $permission) {
            $p = explode("|", $permission);

            $type = DB::table('modules')->select('id')->where('name', join(" ", collect(explode("_", $p[3]))->map(fn($val) => Str::ucfirst($val))->toArray()))->first();
            $name = join(" ", collect(explode("_", $p[1]))->map(fn($val) => Str::ucfirst($val))->toArray());

            array_push($insert, [
                'id' => Str::ulid(),
                'code' => $p[0],
                'name' => $name,
                'module_id' => $type->id,
                'created_at' => now()
            ]);
        }

        DB::table('permissions')->insert($insert);
    }
}
