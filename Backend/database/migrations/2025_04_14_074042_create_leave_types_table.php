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
        Schema::create('leave_types', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->char('organization_id', 26)->index();
            $table->foreign('organization_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            // Leave type can be used for multiple purposes, so we need to store the max days for each purpose
            // For example, sick leave can have different max days for different purposes
            // null means no limit
            // 0 means no leave remaining
            $table->integer('max_days')->nullable()->default(null);
            $table->integer('max_days_per_year')->nullable()->default(null);
            $table->integer('max_days_per_month')->nullable()->default(null);
            $table->integer('max_days_per_week')->nullable()->default(null);
            $table->integer('max_days_per_quarter')->nullable()->default(null);
            $table->integer('max_days_per_half_year')->nullable()->default(null);
            $table->boolean('is_paid')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(table: 'leave_types');
    }
};
