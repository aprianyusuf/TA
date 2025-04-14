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
        Schema::create('project_setting', function (Blueprint $table) {
            $table->char('id', 26)->primary();

            $table->char('client_project_id', 26)->index();
            $table->foreign('client_project_id')->references('id')->on('client_projects')->cascadeOnDelete();

            $table->timestamps();
        });

        Schema::create('project_states', function (Blueprint $table) {
            $table->char('id', 26)->primary();

            $table->char('client_project_id', 26)->index();
            $table->foreign('client_project_id')->references('id')->on('client_projects')->cascadeOnDelete();

            $table->string('name');
            $table->tinyInteger('sort');
            $table->timestamps();
        });

        Schema::create('project_card_types', function (Blueprint $table) {
            $table->char('id', 26)->primary();

            $table->char('client_project_id', 26)->index();
            $table->foreign('client_project_id')->references('id')->on('client_projects')->cascadeOnDelete();

            $table->string('name');
            $table->text('description');

            $table->timestamps();
        });

        Schema::create('project_columns', function (Blueprint $table) {
            $table->char('id', 26)->primary();

            $table->char('client_project_id', 26)->index();
            $table->foreign('client_project_id')->references('id')->on('client_projects')->cascadeOnDelete();

            $table->string('name');
            $table->tinyInteger('sort');

            $table->timestamps();
        });

        Schema::create('project_modules', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->timestamps();
        });

        Schema::create('project_labels', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->timestamps();
        });

        Schema::create('project_cycles', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->timestamps();
        });

        Schema::create('project_cards', function (Blueprint $table) {
            $table->char('id', 26)->primary();

            $table->char('client_project_id', 26)->index();
            $table->foreign('client_project_id')->references('id')->on('client_projects')->cascadeOnDelete();

            $table->char('user_id', 26)->nullable()->index();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();

            $table->timestamps();
        });

        Schema::create('project_tasks', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->timestamps();
        });

        Schema::create('project_links', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->timestamps();
        });

        Schema::create('project_attachments', function (Blueprint $table) {
            $table->char('id', 26)->primary();
            $table->timestamps();
        });

        Schema::create('project_logs', function (Blueprint $table) {
            $table->char('id', 26)->primary();

            $table->char('user_id', 26)->nullable()->index();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();

            $table->char('project_card_id', 26)->index();
            $table->foreign('project_card_id')->references('id')->on('project_cards')->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_setting');
        Schema::dropIfExists('project_states');
        Schema::dropIfExists('project_card_types');
        Schema::dropIfExists('project_columns');
        Schema::dropIfExists('project_modules');
        Schema::dropIfExists('project_labels');
        Schema::dropIfExists('project_cycles');
        Schema::dropIfExists('project_cards');
        Schema::dropIfExists('project_tasks');
        Schema::dropIfExists('project_links');
        Schema::dropIfExists('project_attachments');
        Schema::dropIfExists('project_logs');
    }
};
