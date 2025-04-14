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
        Schema::create('attendances', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->char('user_id', 26)->nullable();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            $table->char('organization_id', 26)->nullable()->index();
            $table->foreign('organization_id')->references('id')->on('organizations')->nullOnDelete();

            $table->tinyInteger('type')->default(1);
            $table->float('latitude', 6);
            $table->float('longitude', 6);

            $table->string('image');
            $table->text('note')->nullable();
            $table->timestamp('submitted_at')->default(now());

            $table->index(['user_id', 'organization_id']);

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
