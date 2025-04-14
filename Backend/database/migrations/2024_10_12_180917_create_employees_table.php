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
        Schema::create('employees', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->char('user_id', 26)->nullable();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->string('employee_id')->unique();
            $table->string('marital')->nullable();
            $table->string('religion')->nullable();
            $table->date('birth_at')->nullable();
            $table->string('employment_type')->nullable();
            $table->date('hired_start_at')->nullable();
            $table->date('hired_end_at')->nullable();
            $table->string('identity_number')->nullable();
            $table->time('work_start_at')->nullable();
            $table->time('work_end_at')->nullable();

            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
