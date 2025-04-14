<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->string('name');
            $table->string('domain');
            $table->longText('address');
            $table->string('timezone')->nullable();
            $table->float('timezone_offset', 2)->nullable();
            $table->tinyInteger('cut_off_timesheet_start_day')->nullable();
            $table->tinyInteger('cut_off_timesheet_end_day')->nullable();
            $table->time('work_start_at')->default('08:00');
            $table->time('work_end_at')->default('17:00');
            $table->string('created_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
