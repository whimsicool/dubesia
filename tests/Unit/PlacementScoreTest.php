<?php

namespace Tests\Unit;

use App\Models\HasilTes;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class PlacementScoreTest extends TestCase
{
    #[DataProvider('scores')]
    public function test_score_is_a_percentage_rounded_to_two_decimals(int $correct, int $total, float $expected): void
    {
        $this->assertSame($expected, HasilTes::hitungNilaiTes($correct, $total));
    }

    public static function scores(): array
    {
        return [
            'no questions' => [0, 0, 0.0],
            'no correct answers' => [0, 40, 0.0],
            'all correct' => [40, 40, 100.0],
            'partial score' => [31, 40, 77.5],
            'rounding' => [1, 3, 33.33],
        ];
    }
}
