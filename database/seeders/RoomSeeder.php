<?php

namespace Database\Seeders;

use App\Enums\RoomType;
use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /** Sepuluh ruang kelas: lima di lantai 1 dan lima di lantai 2. */
    public function run(): void
    {
        // name, location, capacity
        $definitions = [
            ['Ruang 1', 'Lantai 1', 24],
            ['Ruang 2', 'Lantai 1', 20],
            ['Ruang 3', 'Lantai 1', 30],
            ['Ruang 4', 'Lantai 1', 18],
            ['Ruang 5', 'Lantai 1', 16],
            ['Ruang 6', 'Lantai 2', 28],
            ['Ruang 7', 'Lantai 2', 12],
            ['Ruang 8', 'Lantai 2', 20],
            ['Ruang 9', 'Lantai 2', 24],
            ['Ruang 10', 'Lantai 2', 35],
        ];

        foreach ($definitions as [$name, $location, $capacity]) {
            Room::updateOrCreate(['name' => $name], [
                'type' => RoomType::Physical,
                'location' => $location,
                'platform' => null,
                'capacity' => $capacity,
                'is_active' => true,
            ]);
        }
    }
}
