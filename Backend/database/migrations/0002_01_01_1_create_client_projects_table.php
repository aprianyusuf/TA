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
        Schema::create('client_projects', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->string('name');
            $table->date('start_date_at');
            $table->date('end_date_at');

            $table->string('color');
            $table->tinyInteger('cut_off_timesheet_start_day')->nullable();
            $table->tinyInteger('cut_off_timesheet_end_day')->nullable();

            $table->char('project_manager_id', 26)->nullable(true);
            $table->foreign('project_manager_id')->references('id')->on('users')->nullOnDelete();

            $table->char('client_id', 26)->nullable()->index();
            $table->foreign('client_id')->references('id')->on('clients')->nullOnDelete();

            $table->boolean('is_requires_project_manager_approval')->default(true);

            $table->char('created_by', 26)->nullable();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();

            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_projects');
    }
};
