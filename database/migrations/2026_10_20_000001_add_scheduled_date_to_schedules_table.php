<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->date('scheduled_date')->nullable()->after('day_of_week');
            $table->index(['semester_id', 'scheduled_date']);
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropIndex(['semester_id', 'scheduled_date']);
            $table->dropColumn('scheduled_date');
        });
    }
};
