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
        Schema::create('users', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            $table->char('organization_id', 26)->nullable()->index();
            $table->foreign('organization_id')->references('id')->on('organizations')->nullOnDelete();

            $table->char('position_id', 26)->nullable();
            $table->foreign('position_id')->references('id')->on('positions')->nullOnDelete();
            
            $table->char('report_to_id', 26)->nullable();
            
            $table->string('timezone')->nullable();
            $table->float('timezone_offset', 2)->nullable();
            
            $table->boolean('is_admin_organization')->default(false);
            $table->timestamp('first_login_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
        });
        
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('report_to_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
