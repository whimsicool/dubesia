<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Jadwal kini menunjuk akun tutor (users.role = tutor) langsung.
     * Tabel `instructors` tidak dipakai lagi karena semua pengajar adalah tutor.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('schedules', 'instructor_id')) {
            return;
        }

        Schema::table('schedules', function (Blueprint $table) {
            $table->foreignId('tutor_id')->nullable()->after('class_id');
        });

        $instructors = Schema::hasTable('instructors')
            ? DB::table('instructors')->get()->keyBy('id')
            : collect();

        foreach (DB::table('schedules')->orderBy('id')->get(['id', 'instructor_id']) as $schedule) {
            $instructor = $instructors->get($schedule->instructor_id);

            if (! $instructor) {
                continue;
            }

            DB::table('schedules')->where('id', $schedule->id)->update([
                'tutor_id' => $this->tutorUserId($instructor),
            ]);
        }

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropForeign(['instructor_id']);
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropIndex(['instructor_id', 'day_of_week']);
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn('instructor_id');
        });

        if (DB::getDriverName() !== 'sqlite') {
            Schema::table('schedules', function (Blueprint $table) {
                $table->foreign('tutor_id')->references('id')->on('users')->restrictOnDelete();
            });
        }

        Schema::dropIfExists('instructors');
    }

    /**
     * Kembalikan kolom lama agar rollback tetap mungkin. Data tutor disalin kembali.
     */
    public function down(): void
    {
        if (Schema::hasColumn('schedules', 'instructor_id')) {
            return;
        }

        Schema::create('instructors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->foreignId('instructor_id')->nullable()->after('class_id');
        });

        foreach (DB::table('schedules')->whereNotNull('tutor_id')->get(['id', 'tutor_id']) as $schedule) {
            $tutor = DB::table('users')->where('id', $schedule->tutor_id)->first();

            if (! $tutor) {
                continue;
            }

            $instructorId = DB::table('instructors')->insertGetId([
                'user_id' => $tutor->id,
                'name' => $tutor->name,
                'email' => $tutor->email,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('schedules')->where('id', $schedule->id)->update(['instructor_id' => $instructorId]);
        }

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn('tutor_id');
        });
    }

    /** Akun tutor untuk instruktur lama; akun baru dibuat bila belum ada. */
    private function tutorUserId(object $instructor): int
    {
        if ($instructor->user_id) {
            $linked = DB::table('users')->where('id', $instructor->user_id)->first();

            if ($linked) {
                return (int) $linked->id;
            }
        }

        $email = $instructor->email ?: Str::slug($instructor->name, '.').'@dubesia.id';
        $existing = DB::table('users')->where('email', $email)->first();

        if ($existing) {
            return (int) $existing->id;
        }

        return (int) DB::table('users')->insertGetId([
            'name' => $instructor->name,
            'email' => $email,
            'password' => Hash::make(Str::random(40)),
            'role' => 'tutor',
            'is_active' => true,
            'status_akun' => 'aktif',
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
