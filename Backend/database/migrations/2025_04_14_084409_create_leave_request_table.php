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
        Schema::create('leave_requests', callback: function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->char('organization_id', 26)->index();
            $table->foreign('organization_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->char('user_id', 26)->index();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->char('leave_type_id', 26)->index();
            $table->foreign('leave_type_id')->references('id')->on('leave_types')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->integer(column: 'days')->default(0);
            $table->integer('status')->default(0); // 0: pending, 1: approved, 2: rejected, 3: cancelled
            $table->string('description')->nullable();
            $table->char('responded_by', 26)->nullable()->index();
            $table->foreign('responded_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
