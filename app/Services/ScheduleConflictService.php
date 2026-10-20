<?php

namespace App\Services;

use App\Http\Resources\ScheduleResource;
use App\Models\Schedule;
use Illuminate\Support\Collection;

/**
 * Deteksi bentrok jadwal. Dua sesi dianggap bentrok bila:
 *  - hari sama dan jamnya beririsan, DAN
 *  - instruktur sama, ATAU ruang sama, ATAU ada murid yang terdaftar di keduanya.
 */
class ScheduleConflictService
{
    /**
     * Cek bentrok untuk jadwal (baru / yang sedang diedit) terhadap jadwal lain di semester yang sama.
     *
     * @param  array<int>  $studentIds
     * @return Collection<int, array{type: string, schedule_id: int, message: string}>
     */
    public function check(
        int $semesterId,
        int $day,
        string $start,
        string $end,
        ?int $instructorId = null,
        ?int $roomId = null,
        array $studentIds = [],
        ?int $ignoreId = null,
        ?string $scheduledDate = null,
    ): Collection {
        $start = $this->normalize($start);
        $end = $this->normalize($end);

        if ($end <= $start) {
            return collect();
        }

        $students = collect($studentIds)->map(fn ($id) => (int) $id);

        $others = Schedule::query()
            ->with(['instructor:id,name', 'room:id,name', 'students:id'])
            ->where('semester_id', $semesterId)
            ->where('day_of_week', $day)
            ->when($scheduledDate, fn ($query) => $query->where(fn ($dates) => $dates
                ->whereNull('scheduled_date')
                ->orWhereDate('scheduled_date', $scheduledDate)))
            ->overlapping($start, $end)
            ->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))
            ->orderBy('start_time')
            ->get();

        $conflicts = collect();

        foreach ($others as $other) {
            $when = sprintf('"%s" (%s–%s)', $other->title, substr($other->start_time, 0, 5), substr($other->end_time, 0, 5));

            foreach ($this->reasons($instructorId, $roomId, $students, $other) as $type => $detail) {
                $message = match ($type) {
                    'instructor' => "Instruktur {$detail} sudah mengajar {$when}.",
                    'room' => "Ruang {$detail} sudah dipakai {$when}.",
                    'students' => "{$detail} murid terpilih sudah terdaftar di {$when}.",
                };

                $conflicts->push(['type' => $type, 'schedule_id' => $other->id, 'message' => $message]);
            }
        }

        return $conflicts;
    }

    /**
     * Audit seluruh jadwal pada satu semester. Mengembalikan pasangan sesi yang bentrok.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function audit(int $semesterId): Collection
    {
        $schedules = Schedule::query()
            ->with(['program:id,name,category', 'instructor:id,name', 'room:id,name,type,platform,capacity', 'students:id'])
            ->where('semester_id', $semesterId)
            ->orderBy('scheduled_date')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        $pairs = collect();

        foreach ($schedules->groupBy('day_of_week') as $day => $items) {
            $items = $items->values();

            for ($i = 0; $i < $items->count(); $i++) {
                for ($j = $i + 1; $j < $items->count(); $j++) {
                    $a = $items[$i];
                    $b = $items[$j];

                    if ($a->scheduled_date && $b->scheduled_date && ! $a->scheduled_date->isSameDay($b->scheduled_date)) {
                        continue;
                    }

                    // Terurut berdasarkan jam mulai: jika B mulai setelah A selesai, sisanya pasti tidak beririsan.
                    if ($b->start_time >= $a->end_time) {
                        break;
                    }

                    $reasons = $this->reasons(
                        (int) $a->instructor_id,
                        (int) $a->room_id,
                        $a->students->pluck('id')->map(fn ($id) => (int) $id),
                        $b,
                    );

                    if (empty($reasons)) {
                        continue;
                    }

                    $pairs->push([
                        'day_of_week' => (int) $a->day_of_week,
                        'reasons' => collect($reasons)->map(fn ($detail, $type) => match ($type) {
                            'instructor' => "Instruktur sama: {$detail}",
                            'room' => "Ruang sama: {$detail}",
                            'students' => "{$detail} murid sama",
                        })->values()->all(),
                        'a' => ScheduleResource::make($a)->resolve(),
                        'b' => ScheduleResource::make($b)->resolve(),
                    ]);
                }
            }
        }

        return $pairs;
    }

    /**
     * Alasan bentrok antara sebuah sesi (instruktur/ruang/murid) dan sesi lain.
     * Return: ['instructor' => nama, 'room' => nama, 'students' => jumlah] (hanya yang bentrok).
     *
     * @param  Collection<int, int>  $studentIds
     * @return array<string, string|int>
     */
    private function reasons(?int $instructorId, ?int $roomId, Collection $studentIds, Schedule $other): array
    {
        $reasons = [];

        if ($instructorId && (int) $other->instructor_id === $instructorId) {
            $reasons['instructor'] = $other->instructor->name;
        }

        if ($roomId && (int) $other->room_id === $roomId) {
            $reasons['room'] = $other->room->name;
        }

        $shared = $other->students->pluck('id')->map(fn ($id) => (int) $id)->intersect($studentIds)->count();

        if ($shared > 0) {
            $reasons['students'] = $shared;
        }

        return $reasons;
    }

    /** "8:30" / "08:30" / "08:30:00" => "08:30:00" (penting agar perbandingan string/time konsisten). */
    private function normalize(string $time): string
    {
        $parts = explode(':', $time) + [0, 0, 0];

        return sprintf('%02d:%02d:%02d', (int) $parts[0], (int) $parts[1], (int) $parts[2]);
    }
}
