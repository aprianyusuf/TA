<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (config('app.enable_run_migration_store_procedures')) {
            $store_procedures = ['fn_get_users_position_in_hierarchy_pgsql.sql'];

            foreach ($store_procedures as $value) {
                $sql = file_get_contents(database_path("store-procedures/$value"));
                DB::unprepared($sql);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {}
};
