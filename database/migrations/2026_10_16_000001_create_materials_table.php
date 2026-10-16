<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Materi bersifat GENERAL: tidak ada relasi ke kelas / jadwal. Semua murid melihat semua materi terbit.
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // pengunggah (guru)

            $table->string('type', 20)->index();   // document | video | audio | slide | article | link
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('body')->nullable();  // isi teks (khusus tipe article)
            $table->string('topic', 100)->nullable()->index();
            $table->string('level', 20)->nullable(); // A1..C2, null = semua level

            $table->string('external_url', 2048)->nullable(); // tautan / video YouTube / Google Slides, dll.

            // Berkas yang diunggah (disimpan di disk privat, disajikan lewat route terotorisasi)
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_mime', 100)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();

            $table->unsignedSmallInteger('duration_minutes')->nullable(); // video / audio
            $table->unsignedSmallInteger('page_count')->nullable();       // dokumen / slide

            $table->boolean('is_featured')->default(false);
            $table->string('status', 20)->default('draft')->index();      // draft | published
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
        });

        // Progres belajar per murid per materi.
        Schema::create('material_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status', 20)->default('opened'); // opened | completed
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['material_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_progress');
        Schema::dropIfExists('materials');
    }
};
