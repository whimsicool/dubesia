<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pendaftarans', function (Blueprint $table) {
            if (! Schema::hasColumn('pendaftarans', 'asal_institusi')) {
                $table->string('asal_institusi')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('pendaftarans', function (Blueprint $table) {
            if (Schema::hasColumn('pendaftarans', 'asal_institusi')) {
                $table->dropColumn('asal_institusi');
            }
        });
    }
};
