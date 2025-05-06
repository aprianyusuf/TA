<?php

use App\Utils\Enums\PayrollStatusEnum;
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
        Schema::create('payrolls', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->char('employee_id', 26)->index();
            $table->foreign('employee_id')->references('id')->on('employees')->cascadeOnDelete();
            $table->char('payroll_period_id',26)->index();
            $table->foreign('payroll_period_id')->references('id')->on('payroll_periods')->cascadeOnDelete();
            $table->dateTime('payroll_date')->index();
            $table->decimal('salary', 15, 2)->default(0);
            $table->decimal('bonus', 15, 2)->default(0);
            $table->decimal('deductions', 15, 2)->default(0);
            $table->decimal('net_pay', 15, 2)->default(0);
            $table->unsignedTinyInteger('status')->default(PayrollStatusEnum::Pending->value)->index();
            $table->string('currency')->default('IDR')->index();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
