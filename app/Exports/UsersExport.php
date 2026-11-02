<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class UsersExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(
        private Builder $query
    ) {}

    public function query(): Builder
    {
        return $this->query;
    }

    public function headings(): array
    {
        return [
            'No.',
            'Nama Lengkap',
            'Email',
            'Nomor HP',
            'NIP',
            'Peran',
            'Status Akun',
            'Tanggal Dibuat',
        ];
    }

    public function map($user): array
    {
        return [
            $user->id,
            $user->name,
            $user->email,
            $user->no_hp ?? '-',
            $user->nip ?? '-',
            match ($user->role) {
                User::ROLE_STUDENT => 'Murid',
                User::ROLE_TUTOR => 'Tutor',
                default => ucfirst($user->role),
            },
            $user->status_akun ?? '-',
            $user->created_at?->format('d-m-Y H:i') ?? '-',
        ];
    }
}