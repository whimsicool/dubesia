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
        Schema::create('hasil_tes', function (Blueprint $table) {
            $table->id('id_hasil');
            $table->foreignId('id_murid')->constrained('users', 'id')->onDelete('cascade');
            $table->date('tanggal_tes');
            $table->string('nama_murid');
            $table->integer('jumlah_benar')->default(0);
            $table->integer('jumlah_salah')->default(0);
            $table->double('nilai_tes')->default(0);
            $table->string('level_kelas')->nullable(); // Beginner, Low Intermediate, Middle Intermediate, Upper Intermediate
            $table->string('status_hasil')->default('in_progress'); // in_progress, completed
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hasil_tes');
    }
};
