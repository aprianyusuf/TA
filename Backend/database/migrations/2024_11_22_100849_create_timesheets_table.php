<?php

use App\Utils\Constants\TimesheetStatus;
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
        Schema::create('timesheets', function (Blueprint $table) {
            $table->char('id', 26)->primary();

            $table->char('user_id', 26)->nullable()->index();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();

            $table->char('client_project_id', 26)->nullable()->index();
            $table->foreign('client_project_id')->references('id')->on('client_projects')->nullOnDelete();

            $table->string('title');
            $table->string('timezone');
            $table->text('description')->nullable();
            $table->dateTime('start_at');
            $table->dateTime('end_at');

            $table->tinyInteger('status')->default(TimesheetStatus::DRAFT->value);
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timesheets');
    }
};
