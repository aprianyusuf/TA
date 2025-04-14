<?php

use App\Utils\Constants\TimesheetApprovalStatus;
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
        Schema::create('timesheet_approval_log', function (Blueprint $table) {
            $table->char('id', 26)->primary();

            $table->char('user_id', 26)->nullable()->index();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();

            $table->char('timesheet_id', 26)->nullable()->index();
            $table->foreign('timesheet_id')->references('id')->on('timesheets')->nullOnDelete();

            $table->tinyInteger('status')->default(TimesheetApprovalStatus::PENDING->value);
            $table->longText('notes')->nullable();
            $table->dateTime('executed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timesheet_approval_log');
    }
};
