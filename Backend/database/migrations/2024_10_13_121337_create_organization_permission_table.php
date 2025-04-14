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
        Schema::create('organization_permission', function (Blueprint $table) {
            $table->char('organization_id', 26)->nullable()->index();
            $table->foreign('organization_id')->references('id')->on('organizations')->nullOnDelete();

            $table->char('permission_id', 26)->nullable();
            $table->foreign('permission_id')->references('id')->on('permissions')->nullOnDelete();

            $table->unique(['organization_id', 'permission_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_permission');
    }
};
