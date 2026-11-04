<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class PasswordBaruMail extends Mailable
{
    public function __construct(
        public User $pengguna,
        public string $password,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), 'Dubes Communications'),
            subject: 'Kata Sandi Baru Akun DUBESIA',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.password-baru');
    }
}
