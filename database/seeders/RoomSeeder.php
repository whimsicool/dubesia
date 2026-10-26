<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

/** Melengkapi lokasi ruang dari ScheduleSeeder + dua ruang contoh yang belum dipakai jadwal. */
class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            'Diplomatic Hall A' => 'Gedung Utama, Lantai 1',
            'Diplomatic Hall B' => 'Gedung Utama, Lantai 1',
            'Audiovisual Lab 2' => 'Gedung Utama, Lantai 2',
            'Digital Lab 1' => 'Gedung Utama, Lantai 2',
            'Ruang Garuda 3' => 'Gedung Timur, Lantai 3',
            'Bahasa Timur B' => 'Gedung Timur, Lantai 2',
            'Ruang Merdeka 1' => 'Gedung Timur, Lantai 1',
        ];

        foreach ($locations as $name => $location) {
            Room::where('name', $name)->whereNull('location')->update(['location' => $location]);
        }

        Room::updateOrCreate(['name' => 'Google Meet Room 01'], ['type' => 'online', 'platform' => 'Google Meet', 'location' => null, 'capacity' => 50, 'is_active' => true]);
        Room::updateOrCreate(['name' => 'Ruang Serbaguna (Renovasi)'], ['type' => 'physical', 'platform' => null, 'location' => 'Gedung Barat, Lantai 1', 'capacity' => 40, 'is_active' => false]);
    }
}
