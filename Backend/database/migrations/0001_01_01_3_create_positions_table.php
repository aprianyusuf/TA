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
        Schema::create('positions', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->string('name');

            $table->char('position_id', 26)->nullable();
            
            $table->char('organization_id', 26)->nullable()->index();
            $table->foreign('organization_id')->references('id')->on('organizations')->nullOnDelete();

            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('permission_position', function (Blueprint $table) {
            $table->char('permission_id', 26)->nullable();
            $table->foreign('permission_id')->references('id')->on('permissions')->nullOnDelete();
            
            $table->char('position_id', 26)->nullable();
            $table->foreign('position_id')->references('id')->on('positions')->nullOnDelete();

            $table->unique(['permission_id', 'position_id']);
        });

        Schema::table('positions', function (Blueprint $table) {
            $table->foreign('position_id')->references('id')->on('positions')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('positions');

        Schema::dropIfExists('permission_position');
    }
};
