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
        Schema::create('client_project_user', function (Blueprint $table) {
            $table->char('user_id', 26)->nullable();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();

            $table->char('client_project_id', 26)->nullable();
            $table->foreign('client_project_id')->references('id')->on('client_projects')->nullOnDelete();

            $table->date('start_date_at');
            $table->date('end_date_at');

            $table->boolean('is_favorite')->default(false);
            $table->timestamp('last_visited')->nullable();

            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'client_project_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_project_user');
    }
};
