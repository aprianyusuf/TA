<?php

use App\Utils\Enums\PayrollBonusTypeEnum;
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
        Schema::create('payroll_bonus_types', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->char('organization_id', 26)->index();
            $table->foreign('organization_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->string('name')->index();
            $table->string('description')->nullable();
            $table->string('value_fixed')->default(false);
            $table->decimal('value', 15, 2)->default(0);
            $table->string('currency')->default('IDR')->index();
            $table->unsignedTinyInteger('type')->default(PayrollBonusTypeEnum::Bonus)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_bonus_types');
    }
};
