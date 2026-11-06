<?php

namespace App\Services;

use App\Models\Schedule;
use Illuminate\Support\Collection;

/**
 * Deteksi bentrok jadwal. Dua sesi dianggap bentrok bila:
 *  - hari sama dan jamnya beririsan, DAN
 *  - tutor sama, ATAU ruang sama, ATAU ada murid yang terdaftar di keduanya.
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
        ?int $tutorId = null,
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
            ->with(['tutor:id,name', 'room:id,name', 'students:id'])
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

            foreach ($this->reasons($tutorId, $roomId, $students, $other) as $type => $detail) {
                $message = match ($type) {
                    'tutor' => "Tutor {$detail} sudah mengajar {$when}.",
                    'room' => "Ruang {$detail} sudah dipakai {$when}.",
                    'students' => "{$detail} murid terpilih sudah terdaftar di {$when}.",
                };

                $conflicts->push(['type' => $type, 'schedule_id' => $other->id, 'message' => $message]);
            }
        }

        return $conflicts;
    }

    /**
     * Alasan bentrok antara sebuah sesi (tutor/ruang/murid) dan sesi lain.
     * Return: ['tutor' => nama, 'room' => nama, 'students' => jumlah] (hanya yang bentrok).
     *
     * @param  Collection<int, int>  $studentIds
     * @return array<string, string|int>
     */
    private function reasons(?int $tutorId, ?int $roomId, Collection $studentIds, Schedule $other): array
    {
        $reasons = [];

        if ($tutorId && (int) $other->tutor_id === $tutorId) {
            $reasons['tutor'] = $other->tutor->name;
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
