<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Rapikan data ruangan lama menjadi nomor ruang 1-8 dan dua tipe.
     * Referensi jadwal dipindahkan sebelum data ruangan lama yang duplikat dihapus.
     * Migration ini hanya mengubah data yang sudah ada; ruangan baru dibuat oleh seeder
     * atau oleh admin melalui menu Kelola Ruang.
     */
    public function up(): void
    {
        if (! Schema::hasTable('rooms')) {
            return;
        }

        $now = now();
        $rooms = [
            '1' => ['physical', null, ['Diplomatic Hall A', 'Ruang Merdeka 1']],
            '2' => ['physical', null, ['Ruang Garuda 3']],
            '3' => ['online', 'Zoom', ['Zoom Room 02', 'Zoom Room 03']],
            '4' => ['physical', null, ['Audiovisual Lab 2']],
            '5' => ['physical', null, ['Bahasa Timur B']],
            '6' => ['physical', null, ['Diplomatic Hall B']],
            '7' => ['physical', null, ['Digital Lab 1']],
            '8' => ['online', 'Zoom', ['Zoom Room 01']],
        ];

        foreach ($rooms as $number => [$type, $platform, $legacyNames]) {
            $target = DB::table('rooms')->where('name', $number)->first();

            foreach ($legacyNames as $legacyName) {
                $legacy = DB::table('rooms')->where('name', $legacyName)->first();
                if (! $legacy) {
                    continue;
                }

                if (! $target) {
                    DB::table('rooms')->where('id', $legacy->id)->update([
                        'name' => $number,
                        'type' => $type,
                        'platform' => $platform,
                        'location' => null,
                        'is_active' => true,
                        'updated_at' => $now,
                    ]);
                    $target = DB::table('rooms')->where('id', $legacy->id)->first();

                    continue;
                }

                if (Schema::hasTable('schedules')) {
                    DB::table('schedules')->where('room_id', $legacy->id)->update([
                        'room_id' => $target->id,
                        'updated_at' => $now,
                    ]);
                }

                DB::table('rooms')->where('id', $legacy->id)->delete();
            }

            if ($target) {
                DB::table('rooms')->where('id', $target->id)->update([
                    'type' => $type,
                    'platform' => $platform,
                    'location' => null,
                    'is_active' => true,
                    'updated_at' => $now,
                ]);
            }
        }

        // Lab tidak lagi menjadi tipe yang didukung; ubah data tersisa tanpa menghapus ruangan.
        DB::table('rooms')->where('type', 'lab')->update([
            'type' => 'physical',
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        // Normalisasi data ini tidak dibalik agar relasi jadwal dan data ruangan tetap aman.
    }
};
