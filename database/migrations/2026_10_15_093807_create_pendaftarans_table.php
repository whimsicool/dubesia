<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable()->unique()->after('name');
            }
            if (! Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('student')->after('password');
            }
            if (! Schema::hasColumn('users', 'is_active')) {
                // default true agar user lama (admin/tutor/student) tidak ikut nonaktif
                $table->boolean('is_active')->default(true)->after('role');
            }
        });

        Schema::create('pendaftarans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('nama_lengkap');
            $table->date('tanggal_lahir');
            $table->string('email');
            $table->string('no_whatsapp', 20);
            $table->text('alamat');
            $table->string('program');
            $table->text('pesan_motivasi')->nullable();
            $table->string('bukti_pembayaran');
            $table->unsignedInteger('biaya')->default(250000);
            $table->string('status')->default('menunggu_verifikasi');
            // dipakai fitur verifikasi Admin (branch berikutnya)
            $table->text('catatan_verifikasi')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pendaftarans');
    }
};