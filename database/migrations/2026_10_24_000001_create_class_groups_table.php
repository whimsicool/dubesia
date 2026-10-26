<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120)->unique();                 // contoh: "Diplomatic Speech Batch #4"
            $table->string('level', 10)->index();                  // A1 .. C2
            $table->text('description')->nullable();
            $table->foreignId('tutor_id')->nullable()->constrained('instructors')->nullOnDelete();
            $table->unsignedSmallInteger('capacity')->nullable();  // null = tanpa batas
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        // Keanggotaan murid pada kelas (relasi kelas <-> murid).
        Schema::create('class_group_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['class_group_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_group_student');
        Schema::dropIfExists('class_groups');
    }
};
