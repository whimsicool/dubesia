<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('semester_id')->constrained()->cascadeOnDelete();
            $table->foreignId('program_id')->constrained()->restrictOnDelete();
            $table->foreignId('instructor_id')->constrained()->restrictOnDelete();
            $table->foreignId('room_id')->constrained()->restrictOnDelete();

            $table->string('title');        // judul sesi, mis. "Diplomatic Speech & Rhetoric"
            $table->string('class_name');   // kelas / batch, mis. "Diplomatic Speech Batch #4"

            // Jadwal mingguan berulang selama semester: 1 = Senin ... 7 = Minggu
            $table->unsignedTinyInteger('day_of_week');
            $table->time('start_time');
            $table->time('end_time');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['semester_id', 'day_of_week']);
            $table->index(['instructor_id', 'day_of_week']);
            $table->index(['room_id', 'day_of_week']);
        });

        // Pendaftaran murid ke sebuah jadwal. Hapus jadwal => pendaftaran ikut terhapus (cascade).
        Schema::create('schedule_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['schedule_id', 'student_id']);
        });

        // Presensi per pertemuan. Hapus jadwal => presensi ikut terhapus (cascade).
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('status', 10)->default('present'); // present | permit | sick | absent
            $table->timestamps();

            $table->unique(['schedule_id', 'student_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('schedule_student');
        Schema::dropIfExists('schedules');
    }
};
