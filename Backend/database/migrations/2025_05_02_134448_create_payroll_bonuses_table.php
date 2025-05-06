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
        Schema::create('payroll_bonuses', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->char('payroll_id', 26)->index();
            $table->foreign('payroll_id')->references('id')->on('payrolls')->cascadeOnDelete();
            $table->char('payroll_bonus_type_id', 26)->index();
            $table->foreign('payroll_bonus_type_id')->references('id')->on('payroll_bonus_types')->cascadeOnDelete();
            $table->char('employee_id', 26)->index();
            $table->foreign('employee_id')->references('id')->on('employees')->cascadeOnDelete();
            $table->decimal('value', 15, 2)->default(0);
            $table->string('currency')->default('IDR')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_bonuses');
    }
};
