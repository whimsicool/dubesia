<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

#[Signature('dubesia:create-admin')]
#[Description('Buat admin tanpa seeder demo atau mengubah akun yang sudah ada')]
class CreateProductionAdmin extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = trim((string) $this->ask('Nama admin'));
        $email = strtolower(trim((string) $this->ask('Email admin')));
        $password = (string) $this->secret('Kata sandi (minimal 12 karakter)');
        $confirmation = (string) $this->secret('Ulangi kata sandi');
        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'password_confirmation' => $confirmation,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
        ]);
        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        (new User)->forceFill([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
            'status_akun' => 'aktif',
            'email_verified_at' => now(),
        ])->save();
        $this->info('Akun admin berhasil dibuat. Silakan masuk menggunakan email dan kata sandi yang Anda tentukan.');

        return self::SUCCESS;
    }
}
