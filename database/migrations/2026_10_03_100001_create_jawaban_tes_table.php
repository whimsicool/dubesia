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
        Schema::create('jawaban_tes', function (Blueprint $table) {
            $table->id('id_jawaban');
            $table->foreignId('id_murid')->constrained('users', 'id')->onDelete('cascade');
            $table->string('kode_soal');
            $table->char('jawaban_murid', 1)->nullable(); // A, B, C, D atau null (belum dijawab)
            $table->boolean('status_tandai')->default(false); // Tandai ragu-ragu
            $table->timestamps();

            $table->foreign('kode_soal')->references('kode_soal')->on('soal_tes')->onDelete('cascade');
            $table->unique(['id_murid', 'kode_soal']); // Satu murid hanya punya satu jawaban per soal
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jawaban_tes');
    }
};
